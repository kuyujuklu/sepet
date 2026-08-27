import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePreviewOrderMutation } from "../api/ordersApi/ordersApi";

// The authoritative price of a basket.
//
// POST /api/client/orders/preview takes the same body as creating an order and
// answers with what the server would charge: items_price, delivery_price,
// free_delivery_price, min_order_price, total_price, the ids of anything on
// the stop list, and can_be_ordered. The checkout screen used to add all of
// that up itself with `shared/utils/basket.js` and nothing checked the server
// agreed - which now matters, because an order under the pub's minimum is
// refused with a 400 rather than accepted.
//
// The local arithmetic stays as the fallback the callers show while this is in
// flight or when it failed (offline).

// A stepper on the basket screen can fire five taps in a second and each one
// changes the body; without this every tap would be its own round trip.
const PREVIEW_DEBOUNCE_MS = 350;
export const useOrderPreview = ({
  pubID,
  basket,
  coords,
  paymentType,
  town,
  fullAddress,
  enabled = true,
}) => {
  const [previewOrder] = usePreviewOrderMutation();

  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const dishes = useMemo(
    () =>
      Object.entries(basket || {})
        .filter(([, item]) => +item?.count > 0)
        .map(([dishID, item]) => ({ dishID, count: +item.count })),
    [basket],
  );

  // What the server's answer actually depends on: the lines, the pub and the
  // point the delivery price is calculated from. Re-typing a phone number
  // must not re-price the basket.
  const previewKey = useMemo(
    () =>
      JSON.stringify({
        pubID,
        lat: coords?.lat,
        lng: coords?.lng,
        dishes: dishes.map((dish) => [dish.dishID, dish.count]),
      }),
    [pubID, coords?.lat, coords?.lng, dishes],
  );

  const latestKey = useRef(null);

  const run = useCallback(async () => {
    if (!enabled || !pubID || dishes.length === 0) {
      setPreview(null);
      return;
    }

    const key = previewKey;
    latestKey.current = key;

    setIsLoading(true);

    try {
      const response = await previewOrder({
        order: {
          pubID,
          dishes,
          town,
          fullAddress,
          paymentType,
          lat: coords?.lat,
          lng: coords?.lng,
        },
      }).unwrap();

      // A slower earlier request must not overwrite a newer answer
      if (latestKey.current !== key) return;

      setPreview(response?.preview ?? null);
      setError(null);
    } catch (e) {
      if (latestKey.current !== key) return;

      // Offline or a server error: the caller falls back to the local sum
      setPreview(null);
      setError(e);
    } finally {
      if (latestKey.current === key) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey, enabled, pubID, town, fullAddress, paymentType]);

  useEffect(() => {
    const timeout = setTimeout(run, PREVIEW_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [run]);

  return {
    preview,
    isLoading,
    error,
    refresh: run,
    // Ids of the lines the server will not take: sold out, hidden or gone
    unavailableDishIDs: preview?.unavailable_dish_ids ?? [],
    // False only when the server said so - an unanswered preview must not
    // block a checkout that would have gone through
    canBeOrdered: preview ? !!preview.can_be_ordered : true,
  };
};

import { computeBasketSubtotal } from "./dish";

// The server's own message for a delivery order under the pub's minimum
// (ordererrors.ErrOrderIsBelowMinimumPrice, answered with HTTP 400).
const BELOW_MINIMUM_ERROR = "order is below the minimum order price of the pub";

// Why these rules live on the client at all: the web menu orders anonymously
// through POST /api/orders, and the authoritative pricing endpoint
// (POST /api/client/orders/preview) is behind the client role, so there is
// nothing to ask. Every rule below therefore mirrors orderservice.CreateOrder
// one for one:
//
//  - the items total includes the pub's commission, and both thresholds are
//    compared against that commission-inclusive number (the server compares
//    against `dishesTotalPrice`);
//  - delivery is free at `items >= threshold` - note >=, not >;
//  - a delivery order under `shipping_min_order_price` is refused outright.
//
// The server stays the authority: it prices the order again on submit and
// answers with items_price / delivery_price / total_price, which is what the
// receipt shows. This only keeps the checkout from promising a total the
// server would disagree with.
export const priceBasket = ({ pub, basketDishes, pubDishes, commission }) => {
  const itemsPrice = computeBasketSubtotal(basketDishes, pubDishes, commission);

  // Zone-based delivery pricing is resolved server-side from lat/lng and
  // doesn't depend on whether the pub happens to be open right now.
  // null/undefined means genuinely unresolved (an address outside every
  // zone) - the only case with no real price to show.
  const hasDeliveryPrice =
    pub?.shipping_price !== null && pub?.shipping_price !== undefined;
  const zoneDeliveryPrice = hasDeliveryPrice ? +pub.shipping_price : 0;

  const freeDeliveryThreshold = +pub?.shipping_free_delivery_price || 0;
  const isDeliveryFree =
    freeDeliveryThreshold > 0 && freeDeliveryThreshold <= itemsPrice;

  const deliveryPrice = isDeliveryFree ? 0 : zoneDeliveryPrice;

  const minOrderPrice = +pub?.shipping_min_order_price || 0;
  const isBelowMinimum = minOrderPrice > 0 && itemsPrice < minOrderPrice;

  return {
    itemsPrice,
    hasDeliveryPrice,
    // What delivery to this address costs before the free-delivery rule; the
    // checkout strikes it through when the rule applies.
    zoneDeliveryPrice,
    deliveryPrice,
    totalPrice: itemsPrice + deliveryPrice,

    freeDeliveryThreshold,
    isDeliveryFree,
    // How much more is needed to stop paying for delivery - 0 once the
    // threshold is reached, or when the pub has no free delivery at all.
    missingForFreeDelivery:
      freeDeliveryThreshold > 0 && !isDeliveryFree
        ? freeDeliveryThreshold - itemsPrice
        : 0,

    minOrderPrice,
    isBelowMinimum,
    missingForMinimum: isBelowMinimum ? minOrderPrice - itemsPrice : 0,
  };
};

// The basket races the pub's own settings: a minimum raised while someone was
// choosing still lands as a 400 on submit, so the refusal is recognised here
// and shown as the specific reason rather than the generic failure banner.
export const isBelowMinimumError = (error) =>
  error?.data?.err === BELOW_MINIMUM_ERROR;

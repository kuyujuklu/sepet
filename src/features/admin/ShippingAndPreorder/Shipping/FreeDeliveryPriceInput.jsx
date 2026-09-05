import { Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import BlackSpinner from "../../../../components/loaders/BlackSpinner";
import { useTranslation } from "react-i18next";
import { useSetShippingFreeDeliveryPricesMutation } from "../../../../api/pub/pub";

// Same shapes-driven ordering as DeliveryPriceInput.jsx, so the two rows
// line up zone-for-zone instead of each sorting by its own price map's key
// order (see the comment there for why that mattered).
const FreeDeliveryPriceInput = ({
  companyID,
  pubID,
  deliveryPrices,
  shapes,
}) => {
  const { t } = useTranslation();
  const [localDeliveryPrices, setLocalDeliveryPrices] = useState({});

  const shapeIDs = useMemo(
    () => (shapes ?? []).map((shape) => shape.shape_id),
    [shapes]
  );

  const shapeColors = useMemo(
    () =>
      (shapes ?? []).reduce((acc, shape) => {
        acc[shape.shape_id] = shape.color;
        return acc;
      }, {}),
    [shapes]
  );

  // 0/unset both mean "no free-delivery threshold configured" (see
  // getAmountLeftForFreeDelivery on the client) - shown as an empty field
  // with a "Недоступно" placeholder rather than a literal "0", which reads
  // like a real (if odd) price instead of "not offered".
  const savedPrices = useMemo(() => {
    const prices = {};
    shapeIDs.forEach((shapeID) => {
      prices[shapeID] = deliveryPrices?.[shapeID] || "";
    });
    return prices;
  }, [deliveryPrices, shapeIDs]);

  useEffect(() => {
    setLocalDeliveryPrices({ ...savedPrices });
  }, [savedPrices]);

  const [setDeliveryPrices, { isLoading }] =
    useSetShippingFreeDeliveryPricesMutation();

  const pricesHasChanged = useMemo(() => {
    return shapeIDs.some(
      (shapeID) =>
        `${localDeliveryPrices[shapeID] ?? ""}` !==
        `${savedPrices[shapeID] ?? ""}`
    );
  }, [localDeliveryPrices, savedPrices, shapeIDs]);

  const saveInputs = () => {
    const numberPrices = {};
    shapeIDs.forEach((shapeID) => {
      numberPrices[shapeID] = +(localDeliveryPrices[shapeID] || 0);
    });

    setDeliveryPrices({ companyID, pubID, prices: numberPrices });
  };

  const setLocalPrice = (shape_id, value) => {
    if (isNaN(+value)) {
      return;
    }
    setLocalDeliveryPrices((prev) => ({
      ...prev,
      [shape_id]: value,
    }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 w-full gap-x-8 gap-y-4">
      {shapeIDs.map((shape_id, index) => (
        <div className="flex items-center gap-2" key={shape_id}>
          <span
            className="inline-block rounded-full flex-shrink-0"
            style={{
              width: 12,
              height: 12,
              backgroundColor: shapeColors[shape_id] || "#9ca3af",
            }}
          />
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {t("admin.admin_panel.shipping.shipping_map.zone_label", {
              number: index + 1,
            })}
          </span>
          <input
            value={localDeliveryPrices[shape_id] ?? ""}
            onChange={(e) => setLocalPrice(shape_id, e.target.value)}
            placeholder={t(
              "admin.admin_panel.shipping.shipping_free_delivery_prices.input_placeholder"
            )}
            style={{
              width: 70,
              height: 28,
              borderColor: shapeColors[shape_id] || "#d1d5db",
              borderWidth: 2,
            }}
            className="py-1 px-2 border shadow-sm rounded-md font-medium text-gray-800"
          />{" "}
          <span className="text-sm text-gray-600">Lei</span>
        </div>
      ))}
      {pricesHasChanged && (
        <Button
          variant="contained"
          sx={{
            color: "white",
            bgcolor: "#3b82f6",
            fontSize: ".7rem",
            fontWeight: "medium",
            padding: ".2rem 1rem",
            borderRadius: "10px",
            width: "fit-content%",
            ":hover": {
              bgcolor: "#2563eb",
            },
          }}
          onClick={saveInputs}
        >
          <span>
            {isLoading ? (
              <BlackSpinner />
            ) : (
              t("admin.admin_panel.shipping.shipping_time.save")
            )}
          </span>
        </Button>
      )}
    </div>
  );
};

export default FreeDeliveryPriceInput;

import { Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import BlackSpinner from "../../../../components/loaders/BlackSpinner";
import { useTranslation } from "react-i18next";
import { useSetShippingMinOrderPricesMutation } from "../../../../api/pub/pub";

// The smallest order the pub takes, per shipping shape. 0 means no minimum.
// Unlike the delivery prices this one is keyed off the shapes rather than off
// the saved prices, so a pub that has never set a minimum still gets an input
// for every zone it draws.
const MinOrderPriceInput = ({ companyID, pubID, minOrderPrices, shapes }) => {
  const { t } = useTranslation();
  const [localPrices, setLocalPrices] = useState({});

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

  const savedPrices = useMemo(() => {
    const prices = {};
    shapeIDs.forEach((shapeID) => {
      prices[shapeID] = minOrderPrices?.[shapeID] ?? 0;
    });

    return prices;
  }, [minOrderPrices, shapeIDs]);

  useEffect(() => {
    setLocalPrices({ ...savedPrices });
  }, [savedPrices]);

  const [setMinOrderPrices, { isLoading }] =
    useSetShippingMinOrderPricesMutation();

  const pricesHasChanged = useMemo(() => {
    return shapeIDs.some(
      (shapeID) => +(localPrices[shapeID] ?? 0) !== +(savedPrices[shapeID] ?? 0)
    );
  }, [localPrices, savedPrices, shapeIDs]);

  const saveInputs = () => {
    const numberPrices = {};
    shapeIDs.forEach((shapeID) => {
      numberPrices[shapeID] = +(localPrices[shapeID] ?? 0);
    });

    setMinOrderPrices({ companyID, pubID, prices: numberPrices });
  };

  const setLocalPrice = (shapeID, value) => {
    if (isNaN(+value)) {
      return;
    }

    setLocalPrices((prev) => ({
      ...prev,
      [shapeID]: value,
    }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 w-full gap-x-8 gap-y-4">
      {shapeIDs.map((shapeID, index) => (
        <div className="flex items-center gap-2" key={shapeID}>
          <span
            className="inline-block rounded-full flex-shrink-0"
            style={{
              width: 12,
              height: 12,
              backgroundColor: shapeColors[shapeID] || "#9ca3af",
            }}
          />
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {t("admin.admin_panel.shipping.shipping_map.zone_label", {
              number: index + 1,
            })}
          </span>
          <input
            value={localPrices[shapeID] ?? ""}
            onChange={(e) => setLocalPrice(shapeID, e.target.value)}
            placeholder={t(
              "admin.admin_panel.shipping.shipping_price.input_placeholder"
            )}
            style={{
              width: 70,
              height: 28,
              borderColor: shapeColors[shapeID] || "#d1d5db",
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
            width: "fit-content",
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

export default MinOrderPriceInput;

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
    <div className="grid grid-cols-3 w-fit gap-x-10 gap-y-5">
      {shapeIDs.map((shapeID) => (
        <div className="flex gap-2" key={shapeID}>
          <input
            value={localPrices[shapeID] ?? ""}
            onChange={(e) => setLocalPrice(shapeID, e.target.value)}
            placeholder={t(
              "admin.admin_panel.shipping.shipping_price.input_placeholder"
            )}
            style={{
              width: 70,
              height: 20,
              color: shapeColors[shapeID],
              borderColor: shapeColors[shapeID],
            }}
            className="py-2 px-2 border shadow-2xl rounded-md"
          />{" "}
          <span className="mr-3">Lei</span>
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

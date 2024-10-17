import { Button } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import BlackSpinner from "../../../../components/loaders/BlackSpinner";
import { useTranslation } from "react-i18next";
import { useSetShippingPricesMutation } from "../../../../api/pub/pub";

const DeliveryPriceInput = ({
  companyID,
  pubID,
  deliveryPrices,
  shapeColors,
}) => {
  const { t } = useTranslation();
  const [localDeliveryPrices, setLocalDeliveryPrices] = useState({});

  useEffect(() => {
    if (!deliveryPrices) return;
    setLocalDeliveryPrices({ ...deliveryPrices });
  }, [deliveryPrices]);

  const [setDeliveryPrices, { data, error, isLoading }] =
    useSetShippingPricesMutation();

  const pricesHasChanged = useMemo(() => {
    return (
      JSON.stringify(deliveryPrices) !== JSON.stringify(localDeliveryPrices)
    );
  }, [deliveryPrices, localDeliveryPrices]);

  const saveInputs = () => {
    const numberPrices = { ...localDeliveryPrices };
    const shape_ids = Object.keys(localDeliveryPrices);

    shape_ids.forEach(
      (shape_id) => (numberPrices[shape_id] = +numberPrices[shape_id])
    );

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
    <div className="grid grid-cols-3 w-fit gap-x-10 gap-y-5">
      {Object.keys(deliveryPrices ?? {})?.map((shape_id) => (
        <div 
          className="flex gap-2"
          key={shape_id}
        >
          <input
            value={localDeliveryPrices[shape_id] ?? ""}
            onChange={(e) => setLocalPrice(shape_id, e.target.value)}
            placeholder={t(
              "admin.admin_panel.shipping.shipping_price.input_placeholder"
            )}
            style={{
              width: 70,
              height: 20,
              color: shapeColors[shape_id],
              borderColor: shapeColors[shape_id],
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

export default DeliveryPriceInput;

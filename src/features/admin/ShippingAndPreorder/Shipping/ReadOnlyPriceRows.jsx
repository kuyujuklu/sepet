import { useTranslation } from "react-i18next";

// Plain display version of DeliveryPriceInput/FreeDeliveryPriceInput for a
// pub whose delivery is network-managed (see Inputs.jsx) - same shapes-
// driven zone order/coloring so it lines up with the editable version a
// superadmin sees, just no input/save affordances.
const ReadOnlyPriceRows = ({ prices, shapes, unit = "Lei" }) => {
  const { t } = useTranslation();

  const shapeIDs = (shapes ?? []).map((shape) => shape.shape_id);
  const shapeColors = (shapes ?? []).reduce((acc, shape) => {
    acc[shape.shape_id] = shape.color;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-2.5">
      {shapeIDs.map((shapeID, index) => (
        <div key={shapeID} className="flex items-center gap-2.5">
          <span
            className="inline-block rounded-full flex-shrink-0"
            style={{ width: 9, height: 9, backgroundColor: shapeColors[shapeID] || "#9ca3af" }}
          />
          <span className="text-[13px] text-muted">
            {t("admin.admin_panel.shipping.shipping_map.zone_label", { number: index + 1 })}
          </span>
          <span className="ml-auto text-[13.5px] font-semibold text-ink tabular-nums">
            {prices?.[shapeID] ?? 0} {unit}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ReadOnlyPriceRows;

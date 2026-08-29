import Image from "next/image";
import Popup from "@/app/shared-components/Popup/Popup";
import { addCommissionToPrice } from "../../../../../utils/dish";

const ACCENT = "#2D7DD2";
const SECONDARY = "#123527";

// Tap-to-enlarge for a dish's photo - the list thumbnail stays compact for
// scanning, this is where a client actually gets a close look before
// deciding. Reuses the shared Popup (backdrop click / × already wired up)
// and duplicates the row's own price/stepper so the enlarged view is a
// useful stop, not a dead end you have to close before you can act.
const DishPhotoLightbox = ({
  dish,
  currency,
  hasSale,
  smallestPrice,
  commission,
  dishAmount,
  onIncrease,
  onDecrease,
  onClose,
}) => {
  return (
    <Popup opened closeCallback={onClose} contentStyle={{ padding: 0, overflow: "hidden" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", background: SECONDARY }}>
        <Image
          src={`/api-static/images/dishes/${dish.image_file_name}`}
          alt={dish.name}
          fill
          sizes="(max-width: 500px) 95vw, 500px"
          style={{ objectFit: "cover" }}
        />
      </div>

      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#1c2733", lineHeight: 1.3 }}>
          {dish.name}
        </span>
        {dish.ingredients && (
          <span style={{ fontSize: 13, color: "#78838d", lineHeight: 1.4 }}>
            {dish.ingredients}
          </span>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 17, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            {hasSale && (
              <span style={{ color: "#b0b8bf", textDecoration: "line-through", fontWeight: 500, fontSize: 14 }}>
                {addCommissionToPrice(dish?.price, commission)}&nbsp;{currency}
              </span>
            )}
            <span style={{ color: hasSale ? "#d24545" : "#1c2733" }}>
              {addCommissionToPrice(smallestPrice, commission)}&nbsp;{currency}
            </span>
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            {dishAmount > 0 && (
              <button
                onClick={onDecrease}
                style={{ width: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${ACCENT}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14" /></svg>
              </button>
            )}
            {dishAmount > 0 && (
              <span style={{ fontSize: 15, fontWeight: 700, color: "#1c2733", minWidth: 12, textAlign: "center" }}>
                {dishAmount}
              </span>
            )}
            <button
              onClick={onIncrease}
              style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          </div>
        </div>
      </div>
    </Popup>
  );
};

export default DishPhotoLightbox;

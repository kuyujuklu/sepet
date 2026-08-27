import Link from "next/link";
import { useTranslation } from "react-i18next";
import { getPubWorkHours } from "../../utils/pub";
import { convertMinsToTime } from "../../utils/time";
import { getPubSectionOverride, sectionIds } from "../../utils/sections";

const sectionLabels = {
  [sectionIds.food]: "Еда",
  [sectionIds.flowers]: "Цветы",
  [sectionIds.groceries]: "Продукты",
};

const PubCard = ({ pub }) => {
  const { i18n } = useTranslation();

  const workHours = getPubWorkHours(pub);
  const isOpen = workHours.isDeliveryAvailable;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const statusLabel = isOpen
    ? null
    : currentMinutes < workHours.shippingWorkStart
      ? `Откроется в ${convertMinsToTime(workHours.shippingWorkStart)}`
      : "Закрыто";

  const hasRating = !isNaN(+pub?.rating) && +pub?.rating > 0;
  const hasFreeDelivery = !isNaN(+pub?.shipping_free_delivery_price) && +pub?.shipping_free_delivery_price > 0;
  const sectionLabel = sectionLabels[getPubSectionOverride(pub?.id) ?? sectionIds.food];
  const distanceKm = typeof pub?.distance === "number" ? (pub.distance / 1000).toFixed(1) : null;

  return (
    <Link
      href={`/${i18n.language ?? "ru"}/pub/${pub?.url_name}`}
      style={{
        background: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(28,39,51,0.05)",
        border: "1px solid #e7ebef",
        display: "flex",
        flexDirection: "column",
        opacity: isOpen ? 1 : 0.72,
      }}
    >
      <div
        style={{
          position: "relative",
          height: 132,
          background: pub?.bg_image_file_name
            ? `url(/api-static/images/pubs/bgs/${pub.bg_image_file_name}) center/cover`
            : "#123527",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)" }} />

        {!isOpen && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(20,26,33,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ background: "rgba(255,255,255,0.94)", color: "#1c2733", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 999 }}>
              {statusLabel}
            </span>
          </div>
        )}

        <span style={{ position: "absolute", top: 10, left: 10, background: "rgba(255,255,255,0.92)", color: "#44403c", fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 999 }}>
          {sectionLabel}
        </span>

        {hasFreeDelivery && (
          <span style={{ position: "absolute", top: 10, right: 10, background: "#2D7DD2", color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "4px 8px", borderRadius: 999 }}>
            БЕСПЛАТНАЯ ДОСТАВКА
          </span>
        )}

        <span style={{ position: "absolute", left: 14, bottom: 12, color: "#fff", fontSize: 17, fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}>
          {pub?.name}
        </span>
      </div>

      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {hasRating ? (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1c2733" }}>{(+pub.rating).toFixed(1)}</span>
            </div>
          ) : (
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1E6FBF", background: "#e8f1fb", padding: "2px 8px", borderRadius: 999 }}>Новое место</span>
          )}
          {distanceKm && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#78838d" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3" /><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7Z" /></svg>
              <span style={{ fontSize: 12 }}>{distanceKm}&nbsp;км</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {pub?.shipping?.shipping_time_from != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#78838d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              <span style={{ fontSize: 12.5, color: "#526070" }}>
                {pub.shipping.shipping_time_from}–{pub.shipping.shipping_time_to}&nbsp;мин
              </span>
            </div>
          )}
          {pub?.shipping_price != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#78838d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18.5" cy="17.5" r="3.5" /><circle cx="5.5" cy="17.5" r="3.5" /><path d="M15 6a1 1 0 0 0-1-1h-4" /><path d="M12 17.5V14l-3-3 4-3 2 3h2" /></svg>
              <span style={{ fontSize: 12.5, color: "#526070" }}>{Math.floor(pub.shipping_price)}&nbsp;лей</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PubCard;

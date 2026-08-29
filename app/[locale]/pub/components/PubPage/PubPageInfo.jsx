import { getPubWorkHours } from "../../../../utils/pub";
import { convertMinsToTime } from "../../../../utils/time";

const ACCENT = "#2D7DD2";

const PubPageInfo = ({ pub, t }) => {
  const workHours = getPubWorkHours(pub);
  const isOpen = workHours.isDeliveryAvailable;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const statusLabel = isOpen
    ? `Работает до ${convertMinsToTime(workHours.shippingWorkEnd)}`
    : currentMinutes < workHours.shippingWorkStart
      ? `Откроется в ${convertMinsToTime(workHours.shippingWorkStart)}`
      : "Закрыто";

  const hasRating = !isNaN(+pub?.rating) && +pub?.rating > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1c2733", letterSpacing: "-0.01em" }}>
        {pub.name}
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", fontSize: 12.5, color: "#78838d" }}>
        {hasRating && (
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            <span style={{ color: "#1c2733", fontWeight: 600 }}>{(+pub.rating).toFixed(1)}</span>
          </span>
        )}
        {pub?.shipping?.shipping_time_from != null && (
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#78838d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            {pub.shipping.shipping_time_from}–{pub.shipping.shipping_time_to}&nbsp;мин
          </span>
        )}
        <span style={{ fontWeight: isOpen ? 500 : 700, color: isOpen ? "#78838d" : ACCENT }}>{statusLabel}</span>
      </div>

      {pub.address && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#526070" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
          <span>{pub.address}</span>
        </div>
      )}

      {pub.wifi_password && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#526070" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
          <span>{t("client.pub_info.wifi_password")}: {pub.wifi_password}</span>
        </div>
      )}

      {pub.additional_info && (
        <div style={{ fontSize: 13, color: "#526070", lineHeight: 1.5 }}>
          {pub.additional_info}
        </div>
      )}
    </div>
  );
};

export default PubPageInfo;

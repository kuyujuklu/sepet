// The flyer-inspired banner: real contact channels + a real QR code to the
// app link (via api.qrserver.com - no key needed, matches the "onelink" URL
// already used by the header's download button), sitting above the
// functional listing below it.
const APP_LINK = "https://onelink.to/ey3df3";
const QR_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&color=18-53-39&bgcolor=255-255-255&data=${encodeURIComponent(APP_LINK)}`;

const msgIconStyle = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.14)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const Hero = () => {
  return (
    <div
      style={{
        background: "linear-gradient(120deg, #123527 0%, #3F6254 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "46px 32px 42px",
          display: "flex",
          alignItems: "center",
          gap: 44,
          flexWrap: "wrap",
          position: "relative",
        }}
      >
        <div style={{ flex: "1 1 440px", display: "flex", flexDirection: "column", gap: 16 }}>
          <span
            style={{
              width: "fit-content",
              background: "rgba(255,255,255,0.12)",
              color: "#8fbde8",
              fontSize: 12.5,
              fontWeight: 700,
              letterSpacing: "0.02em",
              padding: "6px 13px",
              borderRadius: 999,
            }}
          >
            35+ ЗАВЕДЕНИЙ · ОДНА ДОСТАВКА
          </span>

          <h1
            style={{
              margin: 0,
              fontSize: 33,
              fontWeight: 800,
              lineHeight: 1.18,
              color: "#fff",
              letterSpacing: "-0.01em",
              maxWidth: 520,
            }}
          >
            Голодны? Нужны цветы? Забыли продукты?
          </h1>

          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "rgba(255,255,255,0.72)", maxWidth: 460 }}>
            Соберите заказ за пару минут — привезём за 15. Лучшие заведения юга Молдовы уже ждут в одном приложении.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", marginTop: 4 }}>
            <a
              href="tel:+37360549995"
              style={{ display: "flex", alignItems: "center", gap: 9, color: "#fff", fontSize: 18, fontWeight: 700 }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#2D7DD2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
              </span>
              0&nbsp;60&nbsp;54&nbsp;99&nbsp;95
            </a>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <a href="https://wa.me/37360549995" style={msgIconStyle} aria-label="WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </a>
              <a href="https://t.me/AlternativeGE" style={msgIconStyle} aria-label="Telegram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-11 11"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>
              </a>
              <a href="viber://chat?number=%2B37360549995" style={msgIconStyle} aria-label="Viber">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="3"/><path d="M9 6h6"/><path d="M9 18h.01"/></svg>
              </a>
              <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)", marginLeft: 2 }}>WhatsApp · Telegram · Viber</span>
            </div>
          </div>
        </div>

        {/* QR only makes sense on a screen someone else's phone can scan -
            hidden on mobile widths, where it would just be a phone showing a
            QR code for the same phone to scan. */}
        <a
          href={APP_LINK}
          className="hidden sm:flex"
          style={{
            flex: "0 0 208px",
            background: "#fff",
            borderRadius: 22,
            padding: 20,
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 18px 40px -14px rgba(0,0,0,0.35)",
          }}
        >
          <img src={QR_SRC} width={152} height={152} alt="QR-код на приложение Sepet" style={{ borderRadius: 8 }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#526070", textAlign: "center", lineHeight: 1.4 }}>
            Наведите камеру телефона —<br />откроется приложение Sepet
          </span>
        </a>

        {/* Mobile equivalent: a direct "open the app" promo instead of a QR
            code nobody on this device could scan. */}
        <a
          href={APP_LINK}
          className="flex sm:hidden"
          style={{
            width: "100%",
            background: "#fff",
            borderRadius: 20,
            padding: "16px 18px",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 12px 30px -14px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ width: 50, height: 50, borderRadius: 14, background: "#e8f1fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <img src="/images/png/bird.png" width={28} height={28} alt="Sepet" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: "#1c2733" }}>Приложение Sepet</span>
            <span style={{ fontSize: 12, color: "#78838d" }}>Заказывайте в один тап, следите за доставкой</span>
          </div>
          <span style={{ background: "#2D7DD2", color: "#fff", fontSize: 13, fontWeight: 600, padding: "9px 14px", borderRadius: 10, whiteSpace: "nowrap", flexShrink: 0 }}>
            Открыть
          </span>
        </a>
      </div>
    </div>
  );
};

export default Hero;

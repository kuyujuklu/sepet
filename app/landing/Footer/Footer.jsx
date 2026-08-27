"use client"
import Link from "next/link"

const linkStyle = { fontSize: 13.5, color: "rgba(255,255,255,0.8)" }
const labelStyle = { fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }
const socialIconStyle = { width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }

const Footer = () => {
  return (
    <footer style={{ background: "#123527" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 32px 28px", display: "grid", gap: 32 }} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/images/png/bird.png" width={28} height={28} alt="Sepet" />
            <span style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>sepet.md</span>
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "rgba(255,255,255,0.62)", margin: 0, maxWidth: 260 }}>
            Сервис доставки еды, цветов и продуктов по югу Молдовы. Более 35 заведений уже работают с нами.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <a href="tel:+37360549995" style={socialIconStyle} aria-label="Телефон">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>
            </a>
            <a href="https://wa.me/37360549995" style={socialIconStyle} aria-label="WhatsApp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
            </a>
            <a href="https://t.me/AlternativeGE" style={socialIconStyle} aria-label="Telegram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-11 11" /><path d="m22 2-7 20-4-9-9-4Z" /></svg>
            </a>
            <a href="https://instagram.com/sepet.md" style={socialIconStyle} aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></svg>
            </a>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <span style={labelStyle}>Компания</span>
          <Link href="https://sepet.md/admin/company" style={linkStyle}>Для заведений</Link>
          <Link href="https://sepet.md/courier" style={linkStyle}>Для курьеров</Link>
          <Link href="https://jivo.chat/jlF5Cg69We" style={linkStyle}>Поддержка</Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <span style={labelStyle}>Контакты</span>
          <a href="tel:+37360549995" style={linkStyle}>0 60 54 99 95</a>
          <a href="mailto:mdsandex@gmail.com" style={linkStyle}>mdsandex@gmail.com</a>
          <a href="https://t.me/AlternativeGE" style={linkStyle}>Telegram · @AlternativeGE</a>
          <a href="https://instagram.com/sepet.md" style={linkStyle}>Instagram · @Sepet.md</a>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={labelStyle}>Приложение Sepet</span>
          <p style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.62)", margin: 0 }}>
            Заказывайте быстрее и следите за доставкой в реальном времени.
          </p>
          <a
            href="https://onelink.to/ey3df3"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#2D7DD2", color: "#fff", padding: "10px 16px", borderRadius: 11, fontSize: 13.5, fontWeight: 600, width: "fit-content" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" /></svg>
            Открыть в приложении
          </a>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "18px 32px", maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>© 2026 Sepet.md — все права защищены</span>
        <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>Чадыр-Лунга · Комрат · Тараклия</span>
      </div>
    </footer>
  );
};

export default Footer;

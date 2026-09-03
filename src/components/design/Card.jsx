// Shared presentational primitives for the admin panel's redesign - card
// surface, section label, and the "coming soon" badge/placeholder pattern.
// Intentionally small and generic so later screens (menu editor, shipping,
// pub settings...) can reuse the same building blocks as this one design
// gets rolled out further, per the brand tokens registered in
// tailwind.config.js (brand/ink/muted/soon/status.*).
import { useTranslation } from "react-i18next";

// `row` is a prop, not a className, so it can't lose a flex-direction
// cascade fight against the base `flex-col` - two Tailwind utility classes
// targeting the same property resolve by stylesheet generation order, not
// by which one appears later in the class string, so passing "flex-row" in
// `className` is not reliable here.
export const Card = ({ children, className = "", style = {}, row = false }) => (
  <div
    className={`bg-white rounded-2xl border gap-3.5 p-4.5 ${className}`}
    style={{
      borderColor: "#e4e9ee",
      boxShadow: "0 1px 2px rgba(20,30,45,.04)",
      padding: 18,
      display: "flex",
      flexDirection: row ? "row" : "column",
      alignItems: row ? "center" : "stretch",
      justifyContent: row ? "space-between" : "flex-start",
      ...style,
    }}
  >
    {children}
  </div>
);

export const SectionLabel = ({ children, className = "", color = "#94a3b0" }) => (
  <div className={`text-[12px] font-semibold tracking-wide uppercase ${className}`} style={{ color }}>
    {children}
  </div>
);

export const SoonChip = () => {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center h-5 px-2 rounded-full bg-soon-tint text-soon text-[10.5px] font-bold uppercase tracking-wide flex-shrink-0">
      {t("admin.admin_panel.order_page.soon.label")}
    </span>
  );
};

export const LockedBadge = ({ children }) => (
  <span className="inline-flex items-center gap-1 h-[22px] px-2.5 rounded-full bg-[#e9ecf0] text-muted text-[10.5px] font-bold flex-shrink-0">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#526070" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
    {children}
  </span>
);

export const LockedCard = ({ children, label, className = "" }) => (
  <div
    className={`rounded-2xl flex flex-col gap-3.5 p-4.5 ${className}`}
    style={{ background: "#f7f8fa", border: "1px solid #e4e9ee", padding: 18 }}
  >
    {label && (
      <div className="flex items-center justify-between">
        <SectionLabel>{label}</SectionLabel>
        <LockedBadge>Только чтение</LockedBadge>
      </div>
    )}
    {children}
  </div>
);

// A single "label: value" line for compact read-only facts - several of
// these belong in one LockedCard rather than each getting its own card, when
// there isn't enough behind each one to justify a whole section.
export const StatusRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3">
    {label && <span className="text-[13px] text-muted">{label}</span>}
    <span className="text-[13.5px] font-semibold text-ink ml-auto">{value}</span>
  </div>
);

export const SoonCard = ({ icon: Icon, title, desc }) => (
  <div
    className="rounded-2xl flex items-center gap-3 px-4 py-3.5 opacity-[.78]"
    style={{ border: "1.5px dashed #cfe0f5", background: "#fbfcfe" }}
  >
    {Icon && <Icon stroke="#8b7cf6" className="flex-shrink-0" />}
    <div className="flex-grow min-w-0">
      <div className="text-[14px] font-semibold text-ink">{title}</div>
      {desc && <div className="text-[12.5px] text-muted mt-0.5">{desc}</div>}
    </div>
    <SoonChip />
  </div>
);

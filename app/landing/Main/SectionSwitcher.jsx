import { sectionIds } from "../../utils/sections";

const buttons = [
  {
    id: sectionIds.food,
    label: "Еда",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
    ),
  },
  {
    id: sectionIds.flowers,
    label: "Цветы",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2.6"/><path d="M12 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3Z"/><path d="M12 22a3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3Z"/><path d="M2 12a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3Z"/><path d="M22 12a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3Z"/><path d="M12 17v5"/></svg>
    ),
  },
  {
    id: sectionIds.groceries,
    label: "Продукты",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.5 2.5h3l3 13h11l3-8h-15"/></svg>
    ),
  },
];

const SectionSwitcher = ({ activeSection, setActiveSection }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "#fff",
        border: "1px solid #e7ebef",
        borderRadius: 16,
        padding: 6,
        overflowX: "auto",
        maxWidth: "100%",
      }}
    >
      {buttons.map((b) => {
        const on = b.id === activeSection;
        return (
          <button
            key={b.id}
            onClick={() => setActiveSection(b.id)}
            style={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              gap: 6,
              border: "none",
              borderRadius: 12,
              padding: "9px 13px",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              background: on ? "#2D7DD2" : "transparent",
              color: on ? "#fff" : "#78838d",
              cursor: "pointer",
            }}
          >
            {b.icon}
            <span>{b.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SectionSwitcher;

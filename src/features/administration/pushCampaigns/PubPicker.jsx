import { useMemo, useState } from "react";
import { useGetAllPubsQuery } from "@/api/admin/admin";
import { PinIcon } from "./icons";

// Shared by the deep-link "Заведение" target and the "Клиенты заведения"
// audience segment - both just need "pick one pub", styled as the same
// collapsed pill (selected) / search list (picking) pair.
const PubPicker = ({ selectedPubID, onSelect, subtitle }) => {
  const { data } = useGetAllPubsQuery();
  const pubs = useMemo(() => data?.pubs ?? [], [data]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(!selectedPubID);

  const selectedPub = pubs.find((p) => p.id === selectedPubID);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pubs;
    return pubs.filter((p) => p.name?.toLowerCase().includes(q));
  }, [pubs, search]);

  if (!expanded && selectedPub) {
    return (
      <div
        className="flex items-center gap-2.5"
        style={{ border: "1.5px solid #cfe0f5", background: "#e8f1fb", borderRadius: 12, padding: "9px 12px" }}
      >
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 30, height: 30, borderRadius: 9, background: "#fff", color: "#2D7DD2" }}
        >
          <PinIcon width={16} height={16} />
        </div>
        <div className="flex-grow min-w-0">
          <div className="truncate" style={{ fontSize: 13.5, fontWeight: 600, color: "#1c2733" }}>
            {selectedPub.name}
          </div>
          {subtitle && (
            <div className="truncate" style={{ fontSize: 11.5, color: "#526070" }}>
              {subtitle}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          style={{ fontSize: 12, fontWeight: 600, color: "#2D7DD2", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
        >
          Изменить
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: 6 }}>
      <input
        type="text"
        placeholder="Найти заведение..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", border: "1.5px solid #e4e9ee", borderRadius: 12, padding: "10px 13px", fontSize: 13.5, outline: "none", fontFamily: "inherit" }}
      />
      <div style={{ maxHeight: 190, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
        {filtered.slice(0, 40).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              onSelect(p.id);
              setExpanded(false);
              setSearch("");
            }}
            className="flex items-center gap-2 text-left"
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "none",
              background: selectedPubID === p.id ? "#e8f1fb" : "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <PinIcon width={13} height={13} style={{ color: "#94a3b0", flexShrink: 0 }} />
            <span className="truncate" style={{ fontSize: 13, color: "#1c2733" }}>
              {p.name}
            </span>
          </button>
        ))}
        {filtered.length === 0 && <div style={{ fontSize: 12.5, color: "#94a3b0", padding: "8px 10px" }}>Ничего не найдено</div>}
      </div>
    </div>
  );
};

export default PubPicker;

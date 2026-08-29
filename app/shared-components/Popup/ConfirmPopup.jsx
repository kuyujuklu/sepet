import Popup from "./Popup";

const ACCENT = "#2D7DD2";
const DANGER = "#c2444c";

// Generic yes/no confirmation, built on the shared Popup so every
// destructive action in the app (removing a basket item, clearing the
// basket) asks the same way instead of each screen inventing its own.
const ConfirmPopup = ({
  opened,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger = true,
}) => {
  return (
    <Popup opened={opened} closeCallback={onCancel} contentStyle={{ padding: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 6 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1c2733" }}>{title}</span>
          {message && (
            <span style={{ fontSize: 13.5, color: "#78838d", lineHeight: 1.45 }}>{message}</span>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: "11px 14px", borderRadius: 12, border: "1.5px solid #e7ebef", background: "#fff", color: "#526070", fontSize: 14, fontWeight: 600 }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, padding: "11px 14px", borderRadius: 12, border: "none", background: danger ? DANGER : ACCENT, color: "#fff", fontSize: 14, fontWeight: 700 }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default ConfirmPopup;

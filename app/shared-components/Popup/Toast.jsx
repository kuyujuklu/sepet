"use client"

// A brief, non-blocking notice - unlike ConfirmPopup/Popup this never
// requires a click to dismiss, so showing it can't itself become a barrier.
// Purely presentational: the caller owns visibility and its own auto-hide
// timer (see Dish.jsx / Bestsellers.jsx for the "closed pub" use of this).
const Toast = ({ message, visible }) => {
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 24,
        transform: `translateX(-50%) translateY(${visible ? "0px" : "10px"})`,
        maxWidth: "92vw",
        width: 380,
        background: "#1c2733",
        color: "#fff",
        fontSize: 13.5,
        lineHeight: 1.45,
        padding: "13px 16px",
        borderRadius: 14,
        boxShadow: "0 16px 40px -12px rgba(0,0,0,0.45)",
        zIndex: 300,
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
        transition: "opacity 220ms ease, transform 220ms ease",
      }}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
};

export default Toast;

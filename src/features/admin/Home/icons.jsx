// Small stroke-based icon set for the home dashboard, matching the
// order-detail/shipping screens' convention: inline SVG, viewBox 0 0 24 24,
// 1.8-2 stroke weight, inherits currentColor unless a stroke is given.

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const ChevronDownIcon = (props) => (
  <svg {...base} width={14} height={14} strokeWidth={2} {...props}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const ChevronRightIcon = (props) => (
  <svg {...base} width={16} height={16} strokeWidth={2} {...props}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const TrendUpIcon = (props) => (
  <svg {...base} width={12} height={12} strokeWidth={2.5} {...props}>
    <path d="M18 15l-6-6-6 6" />
  </svg>
);

export const TrendDownIcon = (props) => (
  <svg {...base} width={12} height={12} strokeWidth={2.5} {...props}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const AlertIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
    <path d="M10.29 3.86l-8.18 14.18A2 2 0 0 0 4 21h16a2 2 0 0 0 1.89-2.96L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>
);

// Delivery order line in the recent-orders list
export const DeliveryIcon = (props) => (
  <svg {...base} width={14} height={14} strokeWidth={2} {...props}>
    <path d="M3 8l9-4.5 9 4.5-9 4.5-9-4.5z" />
    <path d="M3 8v8l9 4.5 9-4.5V8" />
    <path d="M12 12.5v8" />
  </svg>
);

// In-place ("на месте") order line in the recent-orders list - a receipt,
// echoing the "Предчек" wording from the (not-yet-built) POS design.
export const InPlaceIcon = (props) => (
  <svg {...base} width={14} height={14} strokeWidth={1.8} {...props}>
    <path d="M6 2h12v18l-3-2-3 2-3-2-3 2z" />
    <path d="M9 7h6M9 11h6" />
  </svg>
);

export const MenuGridIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const DeliveryFlagIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <path d="M3 11l19-9-9 19-2-8z" />
  </svg>
);

export const OrdersBoxIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <path d="M6 9V2h12v7" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

export const HouseIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

export const LogoutIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const SettingsGearIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

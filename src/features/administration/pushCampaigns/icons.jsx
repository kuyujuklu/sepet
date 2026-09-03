// Stroke icon set for the push campaign composer/history, matching the
// vocabulary already established in admin/Orders/OrderInfo/icons.jsx
// (viewBox 0 0 24 24, ~1.8-2 stroke, round caps).
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const BellIcon = (props) => (
  <svg {...base} width={14} height={14} {...props}>
    <path d="M12 3a1 1 0 0 1 1 1v1.06A6 6 0 0 1 18 11v3.5c0 1 .4 1.96 1.1 2.66l.4.4a1 1 0 0 1-.7 1.7H5.2a1 1 0 0 1-.7-1.7l.4-.4A3.76 3.76 0 0 0 6 14.5V11a6 6 0 0 1 5-5.92V4a1 1 0 0 1 1-1z" />
    <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
  </svg>
);

export const PinIcon = (props) => (
  <svg {...base} width={14} height={14} {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const OrderIcon = (props) => (
  <svg {...base} width={14} height={14} {...props}>
    <path d="M3 11l19-9-9 19-2-8z" />
  </svg>
);

export const DishIcon = (props) => (
  <svg {...base} width={14} height={14} {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export const ScreenIcon = (props) => (
  <svg {...base} width={14} height={14} {...props}>
    <rect x="6" y="2" width="12" height="20" rx="2" />
    <path d="M11 18h2" />
  </svg>
);

export const LinkIcon = (props) => (
  <svg {...base} width={14} height={14} {...props}>
    <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.5 1.5" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.5-1.5" />
  </svg>
);

export const RepeatIcon = (props) => (
  <svg {...base} width={14} height={14} {...props}>
    <path d="M17 2l4 4-4 4" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <path d="M7 22l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

export const SendIcon = (props) => (
  <svg {...base} width={17} height={17} {...props}>
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4z" />
  </svg>
);

export const PeopleIcon = (props) => (
  <svg {...base} width={15} height={15} {...props}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 19a6.5 6.5 0 0 1 13 0" />
    <circle cx="17" cy="8" r="2.6" opacity=".55" />
    <path d="M15.5 12a5.2 5.2 0 0 1 6 6.6" opacity=".55" />
  </svg>
);

export const PersonCheckIcon = (props) => (
  <svg {...base} width={15} height={15} {...props}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    <path d="M9 12.5l2 2 4-4" stroke="#1a9e6b" />
  </svg>
);

export const ChevronDownIcon = (props) => (
  <svg {...base} width={13} height={13} strokeWidth={2.2} {...props}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

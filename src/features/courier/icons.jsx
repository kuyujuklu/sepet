// Stroke-based icon set for the courier screens, matching the admin panel's
// order-detail redesign vocabulary (viewBox 0 0 24 24, ~1.8-2 stroke,
// round caps/joins, currentColor) - see
// admin/Orders/OrderInfo/icons.jsx, whose Phone/Pin/Cash/Message/Check/
// CourierMap paths are reused verbatim below.

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const PhoneIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <path d="M20.5 16.9v2.5a1.8 1.8 0 0 1-2 1.8 17.7 17.7 0 0 1-7.7-2.7 17.4 17.4 0 0 1-5.4-5.4A17.7 17.7 0 0 1 2.7 5.4 1.8 1.8 0 0 1 4.5 3.4H7a1.8 1.8 0 0 1 1.8 1.5c.1 1 .3 1.9.7 2.8a1.8 1.8 0 0 1-.4 1.9L8 10.7a14 14 0 0 0 5.3 5.3l1.1-1.1a1.8 1.8 0 0 1 1.9-.4c.9.4 1.8.6 2.8.7a1.8 1.8 0 0 1 1.5 1.8z" />
  </svg>
);

export const PinIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const CashIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

export const CardIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

export const MessageIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const CheckIcon = (props) => (
  <svg {...base} width={18} height={18} stroke="#fff" strokeWidth={2} {...props}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const CourierMapIcon = (props) => (
  <svg {...base} width={20} height={20} {...props}>
    <path d="M3 11l19-9-9 19-2-8z" />
  </svg>
);

export const ClockIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

export const PackageIcon = (props) => (
  <svg {...base} width={21} height={21} {...props}>
    <path d="M21 8l-9-5-9 5 9 5 9-5z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

export const UserIcon = (props) => (
  <svg {...base} width={21} height={21} {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
  </svg>
);

export const LogoutIcon = (props) => (
  <svg {...base} width={16} height={16} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const PencilIcon = (props) => (
  <svg {...base} width={15} height={15} {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

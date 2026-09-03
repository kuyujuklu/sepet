// Small stroke icon set for the auth pages, matching the vocabulary in
// admin/Orders/OrderInfo/icons.jsx (viewBox 0 0 24 24, 1.8 stroke, round caps).
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const EyeIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <path d="M17.94 17.94A10.9 10.9 0 0 1 12 20c-7 0-11-8-11-8a19 19 0 0 1 5.06-5.94M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.6 18.6 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </svg>
);

export const MailIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <rect x="2" y="4" width="20" height="16" rx="2.5" />
    <path d="M2.5 5.5L12 13l9.5-7.5" />
  </svg>
);

export const LockIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <rect x="4" y="10.5" width="16" height="9.5" rx="2" />
    <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
  </svg>
);

export const UserIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20.2a7.5 7.5 0 0 1 15 0" />
  </svg>
);

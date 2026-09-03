const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const NetworkIcon = (props) => (
  <svg {...base} width={20} height={20} {...props}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const CalendarPauseIcon = (props) => (
  <svg {...base} width={20} height={20} {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <path d="M9.5 15l2 2 3.5-3.5" />
  </svg>
);

export const SearchIcon = (props) => (
  <svg {...base} width={20} height={20} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const SplitIcon = (props) => (
  <svg {...base} width={20} height={20} {...props}>
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

export const PlusIcon = (props) => (
  <svg {...base} width={16} height={16} strokeWidth={2.2} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

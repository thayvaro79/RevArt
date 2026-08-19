function Svg({ children, ...props }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function DashboardIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="12" width="8" height="9" rx="1.5" />
      <rect x="3" y="15" width="8" height="6" rx="1.5" />
    </Svg>
  );
}

export function VehiclesIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 16.5V12l2.2-5A2 2 0 0 1 7.1 5.5h9.8a2 2 0 0 1 1.9 1.5l2.2 5v4.5" />
      <path d="M3 16.5h18v2a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1" />
      <path d="M6.5 17.5v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2" />
      <circle cx="7" cy="16.5" r="1.6" />
      <circle cx="17" cy="16.5" r="1.6" />
    </Svg>
  );
}

export function InquiriesIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5 12 13l8.5-6.5" />
    </Svg>
  );
}

export function ContentIcon(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </Svg>
  );
}

export function SettingsIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H4.5a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 6.15 8.5a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10.5A1.7 1.7 0 0 0 11.54 2.6V2.5a2 2 0 1 1 4 0v.09c0 .66.4 1.26 1.04 1.56.65.28 1.4.14 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09c.3.64.9 1.04 1.56 1.04h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.04Z" />
    </Svg>
  );
}

export function LocationsIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </Svg>
  );
}

export function TeamMembersIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="8.5" r="2.3" />
      <path d="M15.5 14.2c2.6.4 4.5 2.6 4.5 5.3" />
    </Svg>
  );
}

export function PlusIcon(props) {
  return (
    <Svg {...props} strokeWidth="2.2">
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function MoreIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function ScanIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 8V6a2 2 0 0 1 2-2h2M18 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M6 20H4a2 2 0 0 1-2-2v-2" />
      <path d="M4 12h16" />
    </Svg>
  );
}

export function KeyboardIcon(props) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" />
    </Svg>
  );
}

export function PencilIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="M13.5 8 16 10.5" />
    </Svg>
  );
}

export function UsersIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="8.5" r="2.3" />
      <path d="M15.5 14.2c2.6.4 4.5 2.6 4.5 5.3" />
    </Svg>
  );
}

export function LogoutIcon(props) {
  return (
    <Svg {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Svg>
  );
}

export function CloseIcon(props) {
  return (
    <Svg {...props} strokeWidth="2">
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function CameraIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 8h2.5L8 5.5h8L17.5 8H20a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 20H4a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 4 8Z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </Svg>
  );
}

export function ImagesIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M3 12.5 6.5 9l3.5 3.5L14 8l3 3" />
      <path d="M21 8v10a2 2 0 0 1-2 2H8" />
    </Svg>
  );
}

export function TrashIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
      <path d="M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7" />
      <path d="M10 11v6M14 11v6" />
    </Svg>
  );
}

export function StarIcon({ filled, ...props }) {
  return (
    <Svg {...props} fill={filled ? "currentColor" : "none"}>
      <path d="m12 3 2.6 5.6 6.1.6-4.6 4.2 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.2 6.1-.6Z" />
    </Svg>
  );
}

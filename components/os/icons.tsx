/* Jeu d'icônes dessiné pour le site (trait de 1,6 px, style Fluent). */

const PATHS = {
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></>,
  terminal: <><path d="m5 8 4 4-4 4" /><path d="M12 16h7" /><rect x="2" y="3" width="20" height="18" rx="2.5" /></>,
  folder: <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.2a2 2 0 0 1 1.5.7l1.1 1.3h7.2A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />,
  apps: <><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></>,
  mail: <><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="m3 7 8.1 5.4a1.6 1.6 0 0 0 1.8 0L21 7" /></>,
  scale: <><path d="M12 3v18M7 21h10M5 7h14M5 7l-2.5 6a3.2 3.2 0 0 0 5 0zM19 7l2.5 6a3.2 3.2 0 0 1-5 0z" /><path d="M12 5.5 7 7M12 5.5 17 7" /></>,
  download: <><path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5" /><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" /></>,
  external: <><path d="M14 4h6v6M20 4l-8.5 8.5" /><path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>,
  github: <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />,
  linkedin: <><rect x="2.5" y="2.5" width="19" height="19" rx="3" /><path d="M7 10v7M7 7v.01M11.5 17v-4a2.5 2.5 0 0 1 5 0v4M11.5 10v7" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>,
  sun: <><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" /></>,
  moon: <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11" />,
  volume: <><path d="M11 5 6.5 9H3v6h3.5L11 19z" /><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18.5 6.5a7.5 7.5 0 0 1 0 11" /></>,
  mute: <><path d="M11 5 6.5 9H3v6h3.5L11 19z" /><path d="m16 10 5 4M21 10l-5 4" /></>,
  wifi: <><path d="M2.5 9a15 15 0 0 1 19 0M5.5 12.5a10.5 10.5 0 0 1 13 0M8.5 16a6 6 0 0 1 7 0" /><circle cx="12" cy="19.5" r=".8" fill="currentColor" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  list: <path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  home: <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18" /></>,
  cube: <><path d="m12 2.5 8.5 4.75v9.5L12 21.5l-8.5-4.75v-9.5z" /><path d="m3.5 7.25 8.5 4.75 8.5-4.75M12 12v9.5" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  play: <path d="M7 4.5v15l12-7.5z" />,
  power: <><path d="M12 3v9" /><path d="M6.5 6.5a8 8 0 1 0 11 0" /></>,
  reset: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
  file: <><path d="M14 2.5H7A2.5 2.5 0 0 0 4.5 5v14A2.5 2.5 0 0 0 7 21.5h10a2.5 2.5 0 0 0 2.5-2.5V8z" /><path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h5" /></>,
  help: <><circle cx="12" cy="12" r="9.5" /><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4" /><circle cx="12" cy="17.6" r=".6" fill="currentColor" /></>,
  hand: <><path d="M7.5 12.5V6a1.5 1.5 0 0 1 3 0v5M10.5 11V4.5a1.5 1.5 0 0 1 3 0V11M13.5 11V5.5a1.5 1.5 0 0 1 3 0V12M16.5 12V8.5a1.5 1.5 0 0 1 3 0v5.5a7 7 0 0 1-7 7h-1a6.5 6.5 0 0 1-5.4-2.9L3.7 14a1.6 1.6 0 0 1 2.5-2l1.3 1.5" /></>,
  heart: <path d="M12 20.5s-8-4.6-8-10.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 8 2.3c0 5.6-8 10.2-8 10.2z" />,
  school: <><path d="m2.5 9 9.5-4.5L21.5 9 12 13.5z" /><path d="M6.5 11v5c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-5M21.5 9v5" /></>,
  tool: <path d="M14.7 6.3a4 4 0 0 0-5.2 5.2l-6.2 6.2a1.8 1.8 0 0 0 2.5 2.5l6.2-6.2a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.5-.4-.4-2.5z" />,
  leaf: <><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" /><path d="M5 19c3-4 6-7 10-9" /></>,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  back: <path d="M19 12H5m5-5-5 5 5 5" />,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24" width={size} height={size} className={className}
      fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

import SidebarTab from './SidebarTab.jsx';

// Stylized icons (inline SVG so we don't need image assets).
const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1Z" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2L5 6l-2 3.4 2 1.5a7.2 7.2 0 0 0 0 2.4l-2 1.5 2 3.4 2.4-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
    </svg>
  ),
  addons: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10 3h4v3a2 2 0 1 0 4 0V3h3v4h-3a2 2 0 1 0 0 4h3v4h-3a2 2 0 1 0 0 4v3h-4v-3a2 2 0 1 0-4 0v3H6v-4a2 2 0 1 0 0-4H3v-4h3a2 2 0 1 0 0-4H3V3h3v3a2 2 0 1 0 4 0Z" />
    </svg>
  ),
  news: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 5h13v14H4z" />
      <path d="M17 8h3v9a2 2 0 0 1-2 2h-1" />
      <path d="M7 9h7M7 12h7M7 15h5" />
    </svg>
  ),
};

export default function Sidebar({ items, active, onSelect }) {
  return (
    <nav className="w-28 shrink-0 bg-ink-800/80 border-r border-black/70 flex flex-col py-3 gap-2 m-auto">
      {items.map((item) => (
        <SidebarTab
          key={item.key}
          label={item.label}
          icon={ICONS[item.key]}
          active={item.key === active}
          onClick={() => onSelect(item.key)}
        />
      ))}
    </nav>
  );
}

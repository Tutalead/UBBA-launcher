export default function SidebarTab({ label, icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group relative mx-2 py-3 flex flex-col items-center gap-1 transition',
        'border border-black/60 rounded-sm',
        active
          ? 'bg-brass-500/20 text-brass-300 shadow-plate'
          : 'bg-ink-700/60 text-bone-300 hover:bg-ink-600/80 hover:text-bone-100',
      ].join(' ')}
    >
      <span className="w-7 h-7 block">{icon}</span>
      <span className="gothic text-[11px] leading-tight">{label}</span>
      {active && (
        <span className="absolute -right-[1px] top-1 bottom-1 w-[3px] bg-rust-500" />
      )}
    </button>
  );
}

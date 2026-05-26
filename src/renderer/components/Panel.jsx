import ToggleSwitch from './ToggleSwitch.jsx';

// A vertical "console panel" with an optional toggle in the header.
// Used for the three configuration panels on the Addons page.
export default function Panel({
  title,
  subtitle,
  children,
  toggleable = false,
  toggleValue = false,
  onToggle,
  className = '',
}) {
  return (
    <section className={['plate flex flex-col p-3 gap-2 min-w-0', className].join(' ')}>
      <header className="flex items-center justify-between border-b border-black/60 pb-2">
        <span className="gothic uppercase text-xs tracking-widest text-bone-300">
          {title}
        </span>
        {toggleable && (
          <ToggleSwitch checked={toggleValue} onChange={onToggle} label={title} />
        )}
      </header>
      {subtitle && (
        <p className="text-[11px] text-bone-400 leading-snug">{subtitle}</p>
      )}
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}

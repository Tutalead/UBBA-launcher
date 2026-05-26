import { useWindowState } from '../state/useWindowState.js';

// Custom titlebar: the bar itself is draggable; the icon buttons opt out of
// the drag region via the `no-drag` class so they can receive clicks.
export default function TitleBar({ title = 'UBBA LAUNCHER by NinjaCat' }) {
  const { close } = useWindowState();

  return (
    <div
      className="h-8 shrink-0 flex items-center justify-between bg-ink-900/95 border-b border-black/70 select-none"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center gap-2 px-3">
        <span className="gothic text-[11px] tracking-[0.25em] text-brass-300">
          {title}
        </span>
      </div>

      <div className="flex items-stretch" style={{ WebkitAppRegion: 'no-drag' }}>
        <TitleButton onClick={close} aria-label="Close" danger>
          <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="m2.5 2.5 7 7m0-7-7 7" />
          </svg>
        </TitleButton>
      </div>
    </div>
  );
}

function TitleButton({ children, danger = false, ...rest }) {
  return (
    <button
      type="button"
      className={[
        'w-11 h-8 flex items-center justify-center text-bone-300 transition',
        danger ? 'hover:bg-rust-600 hover:text-bone-100' : 'hover:bg-ink-700 hover:text-bone-100',
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}

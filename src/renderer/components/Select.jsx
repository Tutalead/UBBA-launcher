import { useEffect, useRef, useState } from 'react';

export default function Select({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const normalizedOptions = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option
  );
  const selected = normalizedOptions.find((option) => option.value === value) || normalizedOptions[0];

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  function selectOption(option) {
    onChange?.(option.value);
    setOpen(false);
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((isOpen) => !isOpen);
    }
  }

  return (
    <div className="block">
      {label && (
        <span className="block gothic uppercase text-[10px] tracking-widest text-bone-400 mb-1">
          {label}
        </span>
      )}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          className="w-full h-9 flex items-center justify-between gap-3 bg-ink-900/95 border border-brass-500/60 text-bone-200 text-sm px-3 shadow-plate hover:border-brass-400 focus:outline-none focus:border-brass-300"
          onClick={() => setOpen((isOpen) => !isOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span>{selected?.label}</span>
          <span className={`w-2 h-2 border-r border-b border-brass-300 shrink-0 transition-transform ${open ? 'rotate-[225deg] translate-y-0.5' : 'rotate-45 -translate-y-0.5'}`} />
        </button>
        {open && (
          <div
            role="listbox"
            className="absolute top-full left-0 right-0 z-50 mt-1 py-1 bg-ink-900 border border-brass-500/70 shadow-xl"
          >
            {normalizedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  option.value === value
                    ? 'bg-rust-button/35 text-brass-200'
                    : 'text-bone-300 hover:bg-white/5 hover:text-bone-100'
                }`}
                onClick={() => selectOption(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

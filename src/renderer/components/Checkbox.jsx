export default function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-bone-200">
      <span
        className={[
          'w-4 h-4 inline-flex items-center justify-center border border-black/70',
          checked ? 'bg-emerald-700/80' : 'bg-ink-900',
        ].join(' ')}
      >
        {checked && (
          <svg viewBox="0 0 16 16" className="w-3 h-3 text-bone-100" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8.5 6.5 12 13 5" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      {label}
    </label>
  );
}

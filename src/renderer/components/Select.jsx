export default function Select({ label, value, options, onChange }) {
  return (
    <label className="block">
      {label && (
        <span className="block gothic uppercase text-[10px] tracking-widest text-bone-400 mb-1">
          {label}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-ink-900 border border-black/70 text-bone-200 text-sm px-2 py-1.5 rounded-sm shadow-plate focus:outline-none focus:border-brass-500/60"
      >
        {options.map((o) =>
          typeof o === 'string' ? (
            <option key={o} value={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value}>{o.label}</option>
          )
        )}
      </select>
    </label>
  );
}

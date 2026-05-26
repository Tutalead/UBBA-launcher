export default function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={[
        'relative w-10 h-5 rounded-full border border-black/70 transition',
        checked ? 'bg-emerald-700/80' : 'bg-ink-900',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-[1px] w-4 h-4 rounded-full bg-bone-200 shadow transition-[left]',
          checked ? 'left-[21px]' : 'left-[1px]',
        ].join(' ')}
      />
    </button>
  );
}

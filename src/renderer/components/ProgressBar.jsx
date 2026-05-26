export default function ProgressBar({ value = 0, max = 100, label }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full">
      <div className="relative h-3 w-full bg-ink-900 border border-black/70 shadow-plate overflow-hidden rounded-sm">
        <div
          className="h-full bg-rust-button transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
        {label && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] gothic tracking-widest text-bone-100 drop-shadow">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RightRail({ appVersion }) {
  return (
    <aside className="w-12 shrink-0 bg-ink-800/80 border-l border-black/70 flex flex-col items-center justify-between py-4">
      <div className="flex flex-col items-center gap-6">
        <div
          className="gothic text-xs text-bone-300 whitespace-nowrap"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Latest News: UBBA v1.2 Patched
        </div>
      </div>
      <div className="text-[10px] text-bone-400 leading-tight text-center px-1">
        <div>Launcher</div>
        <div>v{appVersion || '—'}</div>
      </div>
    </aside>
  );
}

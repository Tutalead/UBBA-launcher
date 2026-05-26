export default function RightRail({ appVersion }) {
  return (
    <aside className="w-12 shrink-0 border-l border-white/5 flex flex-col items-center justify-between py-4">
      <div />
      <div className="text-[10px] text-bone-400 leading-tight text-center px-1">
        <div>Launcher</div>
        <div>v{appVersion || '—'}</div>
      </div>
    </aside>
  );
}

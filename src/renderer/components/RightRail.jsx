export default function RightRail({ appVersion }) {
  return (
    <aside className="w-12 shrink-0 border-l border-white/5 flex flex-col items-center justify-between py-4" style={{background: 'linear-gradient(to left, rgba(20,8,3,0.72) 0%, rgba(20,8,3,0.45) 100%)'}}>
      <div />
      <div className="text-[10px] text-bone-400 leading-tight text-center px-1">
        <div>Launcher</div>
        <div>v{appVersion || '—'}</div>
      </div>
    </aside>
  );
}

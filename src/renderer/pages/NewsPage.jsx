import Panel from '../components/Panel.jsx';

const ENTRIES = [
  {
    date: '2026-05-20',
    title: 'UBBA v1.2 Patched',
    body: 'Balance pass on all factions, two new maps, multiplayer matchmaking fixes.',
  },
  {
    date: '2026-04-30',
    title: 'Unification Mod 1.95.1',
    body: 'Compatibility update with the latest Dawn of War patch.',
  },
];

export default function NewsPage() {
  return (
    <div className="h-full flex flex-col gap-3">
      <h2 className="gothic uppercase text-sm tracking-[0.25em] text-bone-200">News</h2>
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-3">
        {ENTRIES.map((e) => (
          <Panel key={e.title} title={e.date}>
            <h3 className="gothic uppercase text-brass-300 text-sm tracking-widest pt-1">
              {e.title}
            </h3>
            <p className="text-bone-300 text-sm mt-1">{e.body}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}

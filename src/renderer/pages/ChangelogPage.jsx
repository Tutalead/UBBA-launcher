import { useEffect, useState } from 'react';
import Panel from '../components/Panel';

export default function ChangelogPage() {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    window.ubba?.changelog.get()
      .then((result) => {
        if (result.error && !result.entries.length) {
          setError(result.error);
        } else {
          setEntries(result.entries);
        }
      })
      .catch((e) => setError(e?.message || 'Failed to load changelog.'));
  }, []);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="gothic uppercase text-[11px] tracking-widest text-bone-500">{error}</p>
      </div>
    );
  }

  if (!entries) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="gothic uppercase text-[11px] tracking-widest text-bone-500 animate-pulse">Loading…</p>
      </div>
    );
  }

  const current = entries[selected];

  return (
    <div className="h-full flex flex-col gap-3">
      <h2 className="gothic uppercase text-sm tracking-[0.25em] text-bone-200">Changelog</h2>
      <div className="flex flex-1 min-h-0 gap-3">
        {/* Version list */}
        <div className="w-36 shrink-0 flex flex-col gap-1 overflow-y-auto pr-1">
          {entries.map((entry, i) => (
            <button
              key={entry.version}
              type="button"
              onClick={() => setSelected(i)}
              className={`text-left px-3 py-2 border transition-colors gothic uppercase text-[11px] tracking-widest truncate
                ${i === selected
                  ? 'border-brass-400 bg-ink-800 text-brass-300'
                  : 'border-black/50 bg-ink-900/60 text-bone-400 hover:text-bone-200 hover:border-bone-600'
                }`}
            >
              <div>v{entry.version}</div>
              {entry.title !== entry.version && (
                <div className="text-[9px] normal-case tracking-normal opacity-70 truncate">{entry.title}</div>
              )}
            </button>
          ))}
        </div>

        {/* Entry details */}
        <Panel className="flex-1 min-h-0 overflow-y-auto" title={current.title}>
          <div className="flex flex-col gap-4">
            {current.date && (
              <div className="flex items-center gap-2 text-[11px] gothic uppercase tracking-widest text-bone-400">
                <span>Released:</span><span className="text-bone-200">{current.date}</span>
              </div>
            )}
            {current.pages && (
              <div className="flex items-center gap-2 text-[11px] gothic uppercase tracking-widest text-bone-400">
                <span>Pages:</span><span className="text-bone-200">{current.pages}</span>
              </div>
            )}
            {current.url
              ? (
                <button
                  type="button"
                  onClick={() => window.ubba.changelog.openUrl(current.url)}
                  className="self-start px-4 py-2 border border-brass-500 text-brass-300 hover:text-brass-100 hover:border-brass-300 gothic uppercase text-[11px] tracking-widest transition-colors"
                >
                  Open Changelog ↗
                </button>
              )
              : <p className="gothic uppercase text-[11px] tracking-widest text-bone-500">No changelog link available.</p>
            }
          </div>
        </Panel>
      </div>
    </div>
  );
}

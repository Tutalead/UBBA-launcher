import { useEffect, useState } from 'react';
import Panel from '../components/Panel';

// Minimal markdown → HTML renderer (handles the subset used in patch notes).
function renderMarkdown(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (/^###\s+/.test(line)) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h4 class="gothic uppercase text-[11px] tracking-widest text-brass-300 mt-3 mb-1">${line.replace(/^###\s+/, '')}</h4>`);
    } else if (/^##\s+/.test(line)) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h3 class="gothic uppercase text-sm tracking-widest text-bone-200 mt-4 mb-1">${line.replace(/^##\s+/, '')}</h3>`);
    } else if (/^#\s+/.test(line)) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h2 class="gothic uppercase tracking-widest text-base text-bone-100 mb-2">${line.replace(/^#\s+/, '')}</h2>`);
    } else if (/^-\s+/.test(line)) {
      if (!inList) { out.push('<ul class="list-disc list-inside space-y-0.5 text-bone-300 text-sm pl-2">'); inList = true; }
      out.push(`<li>${line.replace(/^-\s+/, '')}</li>`);
    } else if (line === '') {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push('<div class="h-1"></div>');
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<p class="text-bone-300 text-sm">${line}</p>`);
    }
  }
  if (inList) out.push('</ul>');
  return out.join('\n');
}

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

        {/* Patch notes content */}
        <Panel className="flex-1 min-h-0 overflow-y-auto" title={`v${current.version} — ${current.title}`}>
          {current.content
            ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(current.content) }} />
            : <p className="gothic uppercase text-[11px] tracking-widest text-bone-500">No patch notes available.</p>
          }
        </Panel>
      </div>
    </div>
  );
}

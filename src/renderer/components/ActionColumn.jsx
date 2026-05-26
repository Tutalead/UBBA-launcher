import { useState } from 'react';
import Button from '../components/Button.jsx';

// "PLAY GAME" + addon update side-by-side, anchored to the bottom of the main area.
export default function ActionColumn() {
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState(null);

  async function handlePlay() {
    if (launching) return;
    setError(null);
    setLaunching(true);
    try {
      const result = await window.ubba?.game?.launch();
      if (!result || result.ok === false) {
        setError(result?.error || 'Failed to launch game.');
      }
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div className="flex flex-row gap-4 items-stretch w-full">
      <div className="plate p-3 flex flex-col gap-2 flex-1 justify-center backdrop-blur-sm bg-ink-800/70">
        <span className="gothic uppercase text-[11px] tracking-widest text-bone-300">
          {error ? error : 'Update Addon'}
        </span>
        {/* Static placeholder until addon update logic is wired. */}
        <ProgressLabel value={85} />
      </div>
      <Button
        variant="primary"
        className="h-20 px-10 text-2xl leading-none shrink-0"
        disabled={launching}
        onClick={handlePlay}
      >
        {launching ? 'Launching…' : 'Play Game'}
      </Button>
    </div>
  );
}

function ProgressLabel({ value }) {
  return (
    <div className="relative h-4 w-full bg-ink-900 border border-black/70 shadow-plate overflow-hidden rounded-sm">
      <div
        className="h-full bg-rust-button"
        style={{ width: `${value}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[11px] gothic tracking-widest text-bone-100">
        {value}%
      </span>
    </div>
  );
}

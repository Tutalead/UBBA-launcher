import Button from './Button.jsx';
import ProgressBar from './ProgressBar.jsx';
import { useLauncherUpdate } from '../state/useLauncherUpdate.js';

// Slim banner that appears at the top whenever the launcher self-updater
// has something to report. Hidden while idle / up-to-date.
export default function LauncherUpdateBanner() {
  const { state, install } = useLauncherUpdate();

  if (state.stage === 'idle' || state.stage === 'up-to-date') return null;

  return (
    <div className="px-4 py-2 border-b border-black/70 bg-ink-800/90 flex items-center gap-3 text-sm">
      <span className="gothic uppercase text-[11px] tracking-widest text-brass-300">
        Launcher
      </span>
      <span className="text-bone-200 flex-1 truncate">{state.message}</span>
      {state.stage === 'downloading' && (
        <div className="w-40">
          <ProgressBar value={state.percent} />
        </div>
      )}
      {state.stage === 'downloaded' && (
        <Button variant="primary" size="sm" onClick={install}>
          Restart &amp; install
        </Button>
      )}
    </div>
  );
}

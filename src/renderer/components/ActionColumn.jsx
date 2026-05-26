import { useState } from 'react';
import Button from '../components/Button.jsx';
import { useModUpdate } from '../state/useModUpdate.js';
import { useLauncherUpdate } from '../state/useLauncherUpdate.js';

// "PLAY GAME" + addon update side-by-side, anchored to the bottom of the main area.
export default function ActionColumn() {
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState(null);
  const { state: mod, check: checkMod, update: updateMod } = useModUpdate();
  const { state: launcher, install: installLauncher } = useLauncherUpdate();

  const launcherNeedsAttention =
    launcher.stage === 'available' ||
    launcher.stage === 'downloading' ||
    launcher.stage === 'downloaded';

  const busyStages = ['checking', 'downloading', 'extracting', 'installing'];
  const modBusy = busyStages.includes(mod.stage);

  async function handlePlay() {
    if (launching) return;
    setLaunchError(null);
    setLaunching(true);
    try {
      const result = await window.ubba?.game?.launch();
      if (!result || result.ok === false) {
        setLaunchError(result?.error || 'Failed to launch game.');
      }
    } catch (e) {
      setLaunchError(e?.message || String(e));
    } finally {
      setLaunching(false);
    }
  }

  async function handleModClick() {
    if (modBusy) return;
    if (mod.hasUpdate) await updateMod();
    else await checkMod();
  }

  const label = launchError || mod.message || 'Update Addon';
  const progressStages = ['downloading', 'extracting', 'installing'];
  const progress = progressStages.includes(mod.stage)
    ? mod.percent || 0
    : modBusy
      ? 100
      : 0;
  const indeterminate = modBusy && !progressStages.includes(mod.stage);

  if (launcherNeedsAttention) {
    const isDownloading = launcher.stage === 'downloading';
    const isReady = launcher.stage === 'downloaded';
    return (
      <div className="flex flex-row gap-4 items-stretch w-full">
        <div className="plate p-3 flex flex-col gap-2 flex-1 justify-center backdrop-blur-sm bg-ink-800/70">
          <div className="flex items-center justify-between gap-3">
            <span className="gothic uppercase text-[11px] tracking-widest text-bone-300 truncate">
              {launcher.message}
            </span>
          </div>
          <ProgressLabel
            value={Math.round(launcher.percent || 0)}
            indeterminate={!isDownloading && !isReady}
          />
        </div>
        <Button
          variant="primary"
          className="h-20 w-40 text-2xl leading-none shrink-0"
          disabled={!isReady}
          onClick={isReady ? installLauncher : undefined}
        >
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-4 items-stretch w-full">
      <div className="plate p-3 flex flex-col gap-2 flex-1 justify-center backdrop-blur-sm bg-ink-800/70">
        <div className="flex items-center justify-between gap-3">
          <span className="gothic uppercase text-[11px] tracking-widest text-bone-300 truncate">
            {label}
          </span>
        </div>
        <ProgressLabel value={Math.round(progress)} indeterminate={indeterminate} />
      </div>
      <Button
        variant="primary"
        className="h-20 w-40 text-2xl leading-none shrink-0"
        disabled={launching || modBusy}
        onClick={mod.hasUpdate ? handleModClick : handlePlay}
      >
        {modBusy
          ? 'Updating…'
          : mod.hasUpdate
            ? 'Update'
            : launching
              ? 'Launching…'
              : 'Play Game'}
      </Button>
    </div>
  );
}

function ProgressLabel({ value, indeterminate }) {
  return (
    <div className="relative h-4 w-full bg-ink-900 border border-black/70 shadow-plate overflow-hidden rounded-sm">
      <div
        className={`h-full bg-rust-button ${indeterminate ? 'animate-pulse' : ''}`}
        style={{ width: `${value}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[11px] gothic tracking-widest text-bone-100">
        {indeterminate ? '…' : `${value}%`}
      </span>
    </div>
  );
}

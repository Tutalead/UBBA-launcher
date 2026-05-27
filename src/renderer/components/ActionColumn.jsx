import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button.jsx';
import { useModUpdate } from '../state/useModUpdate.js';
import { useLauncherUpdate } from '../state/useLauncherUpdate.js';

// "PLAY GAME" + addon update side-by-side, anchored to the bottom of the main area.
export default function ActionColumn() {
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState(null);
  const { state: mod, check: checkMod, update: updateMod, isInstalled } = useModUpdate();
  const { state: launcher, install: installLauncher } = useLauncherUpdate();
  const { t } = useTranslation();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  async function handleCheckUpdates() {
    setMenuOpen(false);
    await checkMod();
    await window.ubba?.launcher.check();
  }

  async function handleDeleteAddon() {
    setMenuOpen(false);
    if (!window.confirm(t('action.deleteConfirm'))) return;
    const result = await window.ubba?.mod.delete();
    if (result?.ok) {
      // Re-check so the UI reflects that the addon is no longer installed
      await checkMod();
    } else {
      setLaunchError(result?.error || t('action.deleteFailed'));
    }
  }

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
        setLaunchError(result?.error || t('action.failedToLaunch'));
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

  const label = launchError || mod.message || t('action.updateAddon');
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
          {isReady ? t('launcherBannerButton.restartInstall') : isDownloading ? t('launcherBannerButton.updating') : t('launcherBannerButton.update')}
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
        {modBusy && <ProgressLabel value={Math.round(progress)} indeterminate={indeterminate || (mod.stage === 'downloading' && mod.indeterminate)} />}
      </div>
      <div className="relative flex shrink-0 h-20" ref={menuRef}>
        <button
          type="button"
          className="h-full px-8 bg-rust-button text-bone-100 gothic uppercase tracking-widest border border-black/70 shadow-plate hover:brightness-110 active:brightness-95 transition select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-2xl leading-none"
          disabled={launching || modBusy}
          onClick={mod.hasUpdate ? handleModClick : handlePlay}
        >
          {modBusy
            ? t('action.updating')
            : mod.hasUpdate
              ? isInstalled ? t('action.update') : t('action.install')
              : launching
                ? t('action.launching')
                : t('action.play')}
        </button>
        <div className="w-px bg-black/40 self-stretch shrink-0" />
        <button
          type="button"
          className="h-full w-12 flex items-center justify-center bg-rust-button text-bone-100 border border-l-0 border-black/70 shadow-plate hover:brightness-110 active:brightness-95 transition select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          disabled={launching || modBusy}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="More options"
        >
          <GearIcon />
        </button>
        {menuOpen && (
          <div className="absolute bottom-full right-0 mb-1 min-w-[180px] bg-ink-800 border border-white/10 shadow-xl z-50 flex flex-col py-1">
            <MenuButton onClick={handleCheckUpdates}>{t('action.menuCheckUpdates')}</MenuButton>
            <div className="border-t border-white/10 my-1" />
            <MenuButton onClick={handleDeleteAddon} danger>{t('action.menuDeleteAddon')}</MenuButton>
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressLabel({ value, indeterminate }) {
  return (
    <div className="relative h-4 w-full bg-ink-900 border border-black/70 shadow-plate overflow-hidden rounded-sm">
      <div
        className={`h-full bg-rust-button ${indeterminate ? 'animate-pulse' : ''}`}
        style={{ width: indeterminate ? '100%' : `${value}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-[11px] gothic tracking-widest text-bone-100">
        {indeterminate ? '…' : `${value}%`}
      </span>
    </div>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-bone-100">
      <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.68.07-1.08s-.03-.73-.07-1.08l2.32-1.82c.21-.16.27-.46.13-.7l-2.2-3.81c-.13-.24-.42-.32-.66-.24l-2.74 1.1c-.57-.44-1.18-.81-1.86-1.08L14.21 2.1c-.05-.27-.28-.47-.56-.47h-3.3c-.28 0-.5.2-.55.47l-.42 2.9c-.68.27-1.3.64-1.86 1.08L4.72 5c-.24-.09-.53 0-.66.24L1.86 9.05c-.14.24-.08.54.13.7L4.3 11.5c-.04.35-.08.7-.08 1.08s.04.73.08 1.08L1.99 15.48c-.21.16-.27.46-.13.7l2.2 3.81c.13.24.42.32.66.24l2.74-1.1c.57.44 1.18.81 1.86 1.08l.42 2.9c.05.27.27.47.55.47h3.3c.28 0 .51-.2.56-.47l.42-2.9c.68-.27 1.29-.64 1.86-1.08l2.74 1.1c.24.09.53 0 .66-.24l2.2-3.81c.14-.24.08-.54-.13-.7l-2.32-1.82z"/>
    </svg>
  );
}

function MenuButton({ onClick, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-2 gothic uppercase text-[11px] tracking-widest transition-colors hover:bg-white/5 ${
        danger ? 'text-red-400 hover:text-red-300' : 'text-bone-200 hover:text-bone-100'
      }`}
    >
      {children}
    </button>
  );
}

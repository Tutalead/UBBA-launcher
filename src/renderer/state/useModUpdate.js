import { useEffect, useState } from 'react';

// React wrapper around the mod-updater IPC stream + status RPC.
// Mirrors the shape used by useLauncherUpdate so the UI stays consistent.
export function useModUpdate() {
  const [state, setState] = useState({
    stage: 'idle',
    message: '',
    percent: 0,
    indeterminate: false,
    installedVersion: null,
    latestVersion: null,
    hasUpdate: false,
  });

  // Pull initial status from main on mount.
  useEffect(() => {
    const api = window.ubba && window.ubba.mod;
    if (!api) return;
    api.status().then((s) => {
      setState((prev) => ({
        ...prev,
        installedVersion: s.installedVersion,
        latestVersion: s.latestVersion,
        hasUpdate: !!s.hasUpdate,
        message: s.installedVersion
          ? `Installed addon v${s.installedVersion}`
          : 'Addon not installed',
      }));
    }).catch(() => {});
  }, []);

  // Subscribe to the live event stream.
  useEffect(() => {
    const api = window.ubba && window.ubba.mod;
    if (!api) return undefined;
    const off = api.onEvent((evt) => {
      setState((s) => {
        switch (evt.stage) {
          case 'checking':
            return { ...s, stage: 'checking', message: 'Checking mod updates…', percent: 0 };
          case 'available':
            return {
              ...s,
              stage: 'available',
              latestVersion: evt.version,
              hasUpdate: true,
              message: `Mod update available: v${evt.version}`,
              percent: 0,
            };
          case 'up-to-date':
            return {
              ...s,
              stage: 'up-to-date',
              latestVersion: evt.version,
              installedVersion: evt.version,
              hasUpdate: false,
              message: `Mod up to date (v${evt.version})`,
              percent: 100,
            };
          case 'downloading': {
            const unknownTotal = !evt.total || evt.total === 0;
            const pct = unknownTotal ? 0 : (evt.percent || 0);
            const mb = evt.transferred ? (evt.transferred / 1048576).toFixed(1) : '0';
            return {
              ...s,
              stage: 'downloading',
              percent: pct,
              indeterminate: unknownTotal,
              message: unknownTotal
                ? `Downloading mod v${evt.version}\u2026 ${mb} MB`
                : `Downloading mod v${evt.version}\u2026 ${pct.toFixed(1)}%`,
            };
          }
          case 'extracting': {
            const pct = typeof evt.percent === 'number' ? evt.percent : 0;
            return {
              ...s,
              stage: 'extracting',
              percent: pct,
              message: `Extracting mod files… ${pct.toFixed(1)}%`,
            };
          }
          case 'installing': {
            const pct = typeof evt.percent === 'number' ? evt.percent : 0;
            return {
              ...s,
              stage: 'installing',
              percent: pct,
              message: `Installing mod files… ${pct.toFixed(1)}%`,
            };
          }
          case 'installed':
            return {
              ...s,
              stage: 'installed',
              installedVersion: evt.version,
              latestVersion: evt.version,
              hasUpdate: false,
              percent: 100,
              message: `Mod v${evt.version} installed`,
            };
          case 'error':
            return { ...s, stage: 'error', message: 'Mod update error: ' + evt.message };
          case 'idle':
            return { ...s, stage: 'idle', installedVersion: null, hasUpdate: false, percent: 0, message: evt.message || '' };
          default:
            return s;
        }
      });
    });
    return off;
  }, []);

  return {
    state,
    check: () => window.ubba?.mod.check(),
    update: () => window.ubba?.mod.update(),
    isInstalled: !!state.installedVersion,
  };
}

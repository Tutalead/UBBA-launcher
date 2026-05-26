import { useEffect, useState } from 'react';

// Wraps the launcher self-update IPC stream into a React-friendly state.
// Safe to call from any component; subscribes once via the preload bridge.
export function useLauncherUpdate() {
  const [state, setState] = useState({
    stage: 'idle',
    message: '',
    percent: 0,
    version: null,
  });

  useEffect(() => {
    const api = window.ubba && window.ubba.launcher;
    if (!api) return undefined;

    const off = api.onEvent((evt) => {
      switch (evt.stage) {
        case 'checking':
          setState({ stage: 'checking', message: 'Checking for updates…', percent: 0, version: null });
          break;
        case 'available':
          setState({ stage: 'available', message: `Update available: v${evt.version}`, percent: 0, version: evt.version });
          break;
        case 'up-to-date':
          setState({ stage: 'up-to-date', message: `Launcher up to date (v${evt.version})`, percent: 100, version: evt.version });
          break;
        case 'downloading':
          setState((s) => ({
            ...s,
            stage: 'downloading',
            percent: evt.percent || 0,
            message: `Downloading update… ${(evt.percent || 0).toFixed(1)}%`,
          }));
          break;
        case 'downloaded':
          setState({ stage: 'downloaded', message: `Update v${evt.version} ready to install`, percent: 100, version: evt.version });
          break;
        case 'error':
          setState((s) => ({ ...s, stage: 'error', message: 'Update error: ' + evt.message }));
          break;
        default:
          break;
      }
    });
    return off;
  }, []);

  return {
    state,
    check: () => window.ubba?.launcher.check(),
    install: () => window.ubba?.launcher.quitAndInstall(),
  };
}

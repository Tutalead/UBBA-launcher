// Preload bridge. Exposes a minimal API to the renderer via `window.ubba`.
// Renderer has NO direct access to Node, Electron, or IPC.

'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// NOTE: This preload runs in a sandbox (see BrowserWindow webPreferences),
// so it can only require Electron built-ins — not project files. The channel
// names below MUST stay in sync with src/shared/ipc-channels.js.
const CH = Object.freeze({
  LAUNCHER_CHECK: 'launcher:check-update',
  LAUNCHER_DOWNLOAD: 'launcher:download-update',
  LAUNCHER_QUIT_AND_INSTALL: 'launcher:quit-and-install',
  LAUNCHER_EVENT: 'launcher:event',
  MOD_CHECK: 'mod:check-update',
  MOD_UPDATE: 'mod:install-update',
  MOD_DELETE: 'mod:delete',
  MOD_STATUS: 'mod:get-status',
  MOD_EVENT: 'mod:event',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_TOGGLE_MAXIMIZE: 'window:toggle-maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_STATE: 'window:state',
  GAME_LAUNCH: 'game:launch',
  APP_GET_VERSION: 'app:get-version',
  APP_OPEN_LOGS: 'app:open-logs',
  CHANGELOG_GET: 'changelog:get',
  OPEN_URL: 'app:open-url',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_BROWSE_DIR: 'settings:browse-dir',
});

function on(channel, listener) {
  const wrapped = (_event, payload) => listener(payload);
  ipcRenderer.on(channel, wrapped);
  return () => ipcRenderer.removeListener(channel, wrapped);
}

const api = {
  app: {
    getVersion: () => ipcRenderer.invoke(CH.APP_GET_VERSION),
    openLogs: () => ipcRenderer.invoke(CH.APP_OPEN_LOGS),
  },
  launcher: {
    check: () => ipcRenderer.invoke(CH.LAUNCHER_CHECK),
    download: () => ipcRenderer.invoke(CH.LAUNCHER_DOWNLOAD),
    quitAndInstall: () => ipcRenderer.invoke(CH.LAUNCHER_QUIT_AND_INSTALL),
    onEvent: (cb) => on(CH.LAUNCHER_EVENT, cb),
  },
  mod: {
    check: () => ipcRenderer.invoke(CH.MOD_CHECK),
    update: () => ipcRenderer.invoke(CH.MOD_UPDATE),
    status: () => ipcRenderer.invoke(CH.MOD_STATUS),
    delete: () => ipcRenderer.invoke(CH.MOD_DELETE),
    onEvent: (cb) => on(CH.MOD_EVENT, cb),
  },
  window: {
    minimize: () => ipcRenderer.invoke(CH.WINDOW_MINIMIZE),
    toggleMaximize: () => ipcRenderer.invoke(CH.WINDOW_TOGGLE_MAXIMIZE),
    close: () => ipcRenderer.invoke(CH.WINDOW_CLOSE),
    onStateChange: (cb) => on(CH.WINDOW_STATE, cb),
  },
  game: {
    launch: () => ipcRenderer.invoke(CH.GAME_LAUNCH),
  },
  changelog: {
    get: () => ipcRenderer.invoke(CH.CHANGELOG_GET),
    openUrl: (url) => ipcRenderer.invoke(CH.OPEN_URL, url),
  },
  settings: {
    get: () => ipcRenderer.invoke(CH.SETTINGS_GET),
    set: (data) => ipcRenderer.invoke(CH.SETTINGS_SET, data),
    browseDir: (mode) => ipcRenderer.invoke(CH.SETTINGS_BROWSE_DIR, mode),
  },
};

contextBridge.exposeInMainWorld('ubba', api);

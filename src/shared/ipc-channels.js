// Single source of truth for IPC channel names. Used by both the main
// process and the preload script.

'use strict';

module.exports = Object.freeze({
  // Launcher (self) update
  LAUNCHER_CHECK: 'launcher:check-update',
  LAUNCHER_DOWNLOAD: 'launcher:download-update',
  LAUNCHER_QUIT_AND_INSTALL: 'launcher:quit-and-install',
  LAUNCHER_EVENT: 'launcher:event', // main -> renderer status stream

  // Mod (addon) update
  MOD_CHECK: 'mod:check-update',
  MOD_UPDATE: 'mod:install-update',
  MOD_STATUS: 'mod:get-status',
  MOD_EVENT: 'mod:event', // main -> renderer status stream

  // Window controls (custom titlebar)
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_TOGGLE_MAXIMIZE: 'window:toggle-maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_STATE: 'window:state', // main -> renderer { isMaximized }

  // Game
  GAME_LAUNCH: 'game:launch',

  // Misc
  APP_GET_VERSION: 'app:get-version',
  APP_OPEN_LOGS: 'app:open-logs',
});

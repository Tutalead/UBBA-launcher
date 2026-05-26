// Centralized runtime configuration for the launcher.
// Override via environment variables for dev/staging/prod.

'use strict';

const ENV = process.env.UBBA_ENV || 'production';

const config = {
  env: ENV,

  // Launcher self-update feed (consumed by electron-updater).
  // electron-builder's `publish` block in package.json also drives this,
  // but we expose values here for diagnostics / overrides.
  launcherUpdate: {
    provider: 'generic',
    url: process.env.UBBA_LAUNCHER_FEED || 'https://updates.example.com/launcher',
    channel: process.env.UBBA_LAUNCHER_CHANNEL || 'latest',
    autoDownload: true,
    autoInstallOnAppQuit: true,
    checkIntervalMs: 30 * 60 * 1000, // 30 min
  },

  // Game launch settings.
  game: {
    // Executable name expected to live in the Dawn of War install directory
    // (the parent of the launcher's app folder).
    executable: 'W40k.exe',
    // Mod to load via the engine's -modname switch.
    modName: 'UBBA',
    // Skip the Relic/THQ intro movies on startup.
    skipIntro: true,
    // Extra command-line arguments appended after the standard switches.
    extraArgs: [],
  },

  // Window settings.
  window: {
    width: 1100,
    height: 680,
    minWidth: 900,
    minHeight: 560,
    frame: true,
  },
};

module.exports = config;

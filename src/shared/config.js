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

  // Mod (addon) update settings. The launcher polls the GitHub repo for
  // releases and installs the listed entries from the release tarball into
  // the Dawn of War install directory.
  modUpdate: {
    owner: process.env.UBBA_MOD_OWNER || 'Tutalead',
    repo: process.env.UBBA_MOD_REPO || 'UBBA-PUBLIC',
    // Optional GitHub token (avoids the unauthenticated 60 req/hr limit).
    token: process.env.UBBA_MOD_TOKEN || '',
    // Entries (relative to the repo root) that are part of the mod and must
    // be replaced on every update. Anything else in the repo is ignored.
    entries: ['UBBA.module', 'UBBA', 'addon_data', 'UBBA_data'],
    // Path (relative to the game install dir) of the version marker file
    // shipped inside the mod. Used to detect the installed version and
    // whether the mod is installed at all. Expected format:
    //   version=3.1.3
    versionFile: 'UBBA_data/version.md',
    // How often to poll for new releases.
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

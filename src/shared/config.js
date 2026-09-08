// Centralized runtime configuration for the launcher.
// Override via environment variables for dev/staging/prod.

'use strict';

const ENV = process.env.UBBA_ENV || 'production';

const config = {
  env: ENV,

  // Launcher self-update settings. The actual feed (GitHub Releases) is
  // baked into `app-update.yml` at build time from package.json `build.publish`.
  // Values here only control runtime behaviour of `electron-updater`.
  launcherUpdate: {
    channel: process.env.UBBA_LAUNCHER_CHANNEL || 'latest',
    autoDownload: true,
    autoInstallOnAppQuit: true,
    checkIntervalMs: 30 * 60 * 1000, // 30 min
  },

  // Mod (addon) update settings. The launcher polls the GitHub repo for
  // releases and installs profile-specific entries from the release tarball
  // into the Dawn of War install directory.
  modUpdate: {
    defaultMode: 'ubba',
    // Optional GitHub token (avoids the unauthenticated 60 req/hr limit).
    token: process.env.UBBA_MOD_TOKEN || '',
    profiles: {
      ubba: {
        owner: process.env.UBBA_MOD_OWNER || 'Tutalead',
        repo: process.env.UBBA_MOD_REPO || 'UBBA-PUBLIC',
        entries: ['UBBA.module', 'UBBA', 'addon_data', 'UBBA_data'],
        versionFile: 'UBBA_data/version.md',
      },
      'ubba-dev': {
        owner: process.env.UBBA_DEV_MOD_OWNER || 'Tutalead',
        repo: process.env.UBBA_DEV_MOD_REPO || 'UBBA-DEV-PUBLIC',
        entries: ['UBBADEV.module', 'UBBA-DEV', 'UBBA-DEV_data'],
        versionFile: 'UBBA-DEV_data/version.md',
      },
    },
    // How often to poll for new releases.
    checkIntervalMs: 30 * 60 * 1000, // 30 min
  },

  // Changelog settings.
  changelog: {
    defaultMode: 'ubba',
    profiles: {
      ubba: {
        // Path relative to the game install dir where changelog files live.
        dir: 'UBBA_data/changelogs',
        // Index file listing all versions.
        index: 'changelog.md',
      },
      'ubba-dev': {
        dir: 'UBBA-DEV_data/changelogs',
        index: 'changelog.md',
      },
    },
  },

  // Game launch settings.
  game: {
    // Executable name expected to live in the Dawn of War install directory
    // (the parent of the launcher's app folder).
    executable: 'W40k.exe',
    // Fallback mod name loaded via the engine's -modname switch.
    modName: 'UBBA',
    // Per-mode modname override based on selected mode in launcher settings.
    modNameByMode: {
      ubba: 'UBBA',
      'ubba-dev': 'UBBA-DEV',
    },
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

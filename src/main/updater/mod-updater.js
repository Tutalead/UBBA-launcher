// Mod (addon) updater. Polls the configured GitHub repo for releases and
// installs the listed entries from the release zipball into the Dawn of War
// install directory. Emits a normalized 'event' stream the renderer can
// render the same way it renders launcher self-update events.

'use strict';

const { EventEmitter } = require('events');
const fsp = require('fs/promises');
const path = require('path');

const { findGameDir } = require('../game-launcher');
const { fetchLatestRelease } = require('./lib/github');
const { parseVersionFile, compareVersions } = require('./lib/versions');
const { installRelease } = require('./mod-installer');

class ModUpdater extends EventEmitter {
  constructor({ config, gameConfig, log }) {
    super();
    this.config = config;
    this.gameConfig = gameConfig;
    this.log = log.scope ? log.scope('mod-updater') : log;
    this._busy = false;
    this._latest = null; // last release info from GitHub
  }

  _emit(stage, data = {}) {
    this.emit('event', { stage, ...data, ts: Date.now() });
  }

  // ---------- public API ----------

  startAutoCheck() {
    this.check().catch((e) => this.log.warn('initial mod check failed', e));
    this._timer = setInterval(
      () => this.check().catch(() => {}),
      this.config.checkIntervalMs
    );
  }

  stopAutoCheck() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
  }

  async status() {
    const installed = await this._readInstalled();
    return {
      installed: installed.installed,
      installedVersion: installed.version || null,
      installedTag: null,
      latestVersion: this._latest ? this._latest.version : null,
      latestTag: this._latest ? this._latest.tag : null,
      hasUpdate: this._hasUpdate(installed),
    };
  }

  async check() {
    this._emit('checking');
    try {
      const latest = await fetchLatestRelease(this.config);
      this._latest = latest;
      const installed = await this._readInstalled();
      if (this._hasUpdate(installed)) {
        this._emit('available', {
          version: latest.version,
          tag: latest.tag,
          installedVersion: installed.version || null,
        });
      } else {
        this._emit('up-to-date', { version: latest.version, tag: latest.tag });
      }
      return latest;
    } catch (err) {
      this._emit('error', { message: err.message || String(err) });
      throw err;
    }
  }

  async update() {
    if (this._busy) return { ok: false, error: 'Mod update already in progress.' };
    this._busy = true;
    try {
      const latest = this._latest || (await fetchLatestRelease(this.config));
      this._latest = latest;

      const gameDir = findGameDir(this.gameConfig.executable);
      if (!gameDir) {
        throw new Error(
          `Cannot install mod: ${this.gameConfig.executable} not found near the launcher.`
        );
      }

      this._emit('downloading', { percent: 0, version: latest.version });
      await installRelease({
        release: latest,
        gameDir,
        entries: this.config.entries,
        token: this.config.token,
        log: this.log,
        onDownload: (p) =>
          this._emit('downloading', { ...p, version: latest.version }),
        onExtract: (p) =>
          this._emit('extracting', { ...p, version: latest.version }),
        onInstall: (p) =>
          this._emit('installing', { ...p, version: latest.version }),
      });

      this._emit('installed', { version: latest.version, tag: latest.tag });
      return { ok: true, version: latest.version };
    } catch (err) {
      this.log.error('mod update failed', err);
      this._emit('error', { message: err.message || String(err) });
      return { ok: false, error: err.message || String(err) };
    } finally {
      this._busy = false;
    }
  }

  // ---------- internals ----------

  // The mod is considered installed when the configured version file exists
  // on disk. The file lives inside the mod itself (e.g. UBBA_data/version.md)
  // so deleting the mod folder removes the marker too.
  _hasUpdate(installed) {
    if (!this._latest) return false;
    if (!installed.installed) return true;
    if (!installed.version) return true;
    return compareVersions(installed.version, this._latest.version) < 0;
  }

  async _readInstalled() {
    const gameDir = findGameDir(this.gameConfig.executable);
    if (!gameDir) return { installed: false, version: null, reason: 'no-game-dir' };
    const filePath = path.join(gameDir, this.config.versionFile);
    try {
      const raw = await fsp.readFile(filePath, 'utf8');
      const version = parseVersionFile(raw);
      if (!version) return { installed: true, version: null, reason: 'no-version-key' };
      return { installed: true, version };
    } catch {
      return { installed: false, version: null, reason: 'no-version-file' };
    }
  }
}

module.exports = ModUpdater;

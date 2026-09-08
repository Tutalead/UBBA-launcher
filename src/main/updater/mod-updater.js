// Mod (addon) updater. Polls the configured GitHub repo for releases and
// installs the listed entries from the release zipball into the Dawn of War
// install directory. Emits a normalized 'event' stream the renderer can
// render the same way it renders launcher self-update events.

'use strict';

const { EventEmitter } = require('events');
const fsp = require('fs/promises');
const path = require('path');

const { findGameDir } = require('../game-launcher');
const { getSettings } = require('../settings');
const { fetchLatestRelease } = require('./lib/github');
const { parseVersionFile, compareVersions } = require('./lib/versions');
const { installRelease } = require('./mod-installer');

function sanitizeErrorForUi(err) {
  const raw = err && err.message ? String(err.message) : String(err || 'Unknown error');
  const statusMatch = /\((\d{3})\)/.exec(raw);
  const statusCode = statusMatch ? statusMatch[1] : null;
  const noUrls = raw.replace(/https?:\/\/\S+/gi, '').replace(/\s+/g, ' ').trim();

  if (statusCode === '404' && /releases\/latest/i.test(raw)) {
    return 'No GitHub release found for the selected mod (404).';
  }
  if (statusCode === '403' && /api\.github\.com/i.test(raw)) {
    return 'GitHub API rate limit reached (403). Add UBBA_MOD_TOKEN to increase limits.';
  }
  if (/ENOTFOUND|EAI_AGAIN|ECONNRESET|ETIMEDOUT|network/i.test(raw)) {
    return 'Network error while checking mod updates.';
  }
  if (noUrls) return noUrls;
  return 'Mod update failed.';
}

class ModUpdater extends EventEmitter {
  constructor({ config, gameConfig, log }) {
    super();
    this.config = config;
    this.gameConfig = gameConfig;
    this.log = log.scope ? log.scope('mod-updater') : log;
    this._busy = false;
    this._latestByMode = Object.create(null); // mode -> last release info from GitHub
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
    const mode = this._getSelectedMode();
    const profile = this._getProfile(mode);
    const latest = this._latestByMode[mode] || null;
    const installed = await this._readInstalled(profile);
    return {
      mode,
      installed: installed.installed,
      installedVersion: installed.version || null,
      installedTag: null,
      latestVersion: latest ? latest.version : null,
      latestTag: latest ? latest.tag : null,
      hasUpdate: this._hasUpdate(installed, latest),
    };
  }

  async check() {
    const mode = this._getSelectedMode();
    const profile = this._getProfile(mode);
    this._emit('checking', { mode });
    try {
      const latest = await fetchLatestRelease({
        owner: profile.owner,
        repo: profile.repo,
        token: profile.token || this.config.token,
      });
      this._latestByMode[mode] = latest;
      const installed = await this._readInstalled(profile);
      if (this._hasUpdate(installed, latest)) {
        this._emit('available', {
          mode,
          version: latest.version,
          tag: latest.tag,
          installedVersion: installed.version || null,
        });
      } else {
        this._emit('up-to-date', { mode, version: latest.version, tag: latest.tag });
      }
      return latest;
    } catch (err) {
      const safeMessage = sanitizeErrorForUi(err);
      this._emit('error', { mode, message: safeMessage });
      throw err;
    }
  }

  async update() {
    if (this._busy) return { ok: false, error: 'Mod update already in progress.' };
    this._busy = true;
    try {
      const mode = this._getSelectedMode();
      const profile = this._getProfile(mode);
      const latest =
        this._latestByMode[mode] ||
        (await fetchLatestRelease({
          owner: profile.owner,
          repo: profile.repo,
          token: profile.token || this.config.token,
        }));
      this._latestByMode[mode] = latest;

      const gameDir = findGameDir(this.gameConfig.executable);
      if (!gameDir) {
        throw new Error(
          `Cannot install mod: ${this.gameConfig.executable} not found near the launcher.`
        );
      }

      this._emit('downloading', { mode, percent: 0, version: latest.version });
      await installRelease({
        release: latest,
        gameDir,
        entries: profile.entries,
        token: profile.token || this.config.token,
        log: this.log,
        onDownload: (p) =>
          this._emit('downloading', { ...p, mode, version: latest.version }),
        onExtract: (p) =>
          this._emit('extracting', { ...p, mode, version: latest.version }),
        onInstall: (p) =>
          this._emit('installing', { ...p, mode, version: latest.version }),
      });

      this._emit('installed', { mode, version: latest.version, tag: latest.tag });
      return { ok: true, mode, version: latest.version };
    } catch (err) {
      this.log.error('mod update failed', err);
      const safeMessage = sanitizeErrorForUi(err);
      this._emit('error', { message: safeMessage });
      return { ok: false, error: safeMessage };
    } finally {
      this._busy = false;
    }
  }

  async delete() {
    if (this._busy) return { ok: false, error: 'Mod update already in progress.' };
    const mode = this._getSelectedMode();
    const profile = this._getProfile(mode);
    const gameDir = findGameDir(this.gameConfig.executable);
    if (!gameDir) return { ok: false, error: 'Game directory not found.' };
    try {
      for (const entry of profile.entries) {
        await fsp.rm(path.join(gameDir, entry), { recursive: true, force: true });
      }
      this._emit('idle', { mode, message: 'Addon deleted.' });
      return { ok: true, mode };
    } catch (err) {
      return { ok: false, error: sanitizeErrorForUi(err) };
    }
  }

  // ---------- internals ----------

  // The mod is considered installed when the configured version file exists
  // on disk. The file lives inside the mod itself (e.g. UBBA_data/version.md)
  // so deleting the mod folder removes the marker too.
  _hasUpdate(installed, latest) {
    if (!latest) return false;
    if (!installed.installed) return true;
    if (!installed.version) return true;
    return compareVersions(installed.version, latest.version) < 0;
  }

  async _readInstalled(profile) {
    const gameDir = findGameDir(this.gameConfig.executable);
    if (!gameDir) return { installed: false, version: null, reason: 'no-game-dir' };
    const filePath = path.join(gameDir, profile.versionFile);
    try {
      const raw = await fsp.readFile(filePath, 'utf8');
      const version = parseVersionFile(raw);
      if (!version) return { installed: true, version: null, reason: 'no-version-key' };
      return { installed: true, version };
    } catch {
      return { installed: false, version: null, reason: 'no-version-file' };
    }
  }

  _getSelectedMode() {
    const configuredDefault = this.config.defaultMode || 'ubba';
    const selected = getSettings().selectedMod;
    const profiles = this._profiles();
    if (selected && profiles[selected]) return selected;
    return profiles[configuredDefault] ? configuredDefault : Object.keys(profiles)[0];
  }

  _profiles() {
    if (this.config.profiles && Object.keys(this.config.profiles).length) {
      return this.config.profiles;
    }
    const fallbackMode = this.config.defaultMode || 'ubba';
    return {
      [fallbackMode]: {
        owner: this.config.owner,
        repo: this.config.repo,
        entries: this.config.entries || [],
        versionFile: this.config.versionFile,
        token: this.config.token || '',
      },
    };
  }

  _getProfile(mode) {
    const profiles = this._profiles();
    const profile = profiles[mode];
    if (!profile) {
      throw new Error(`Unknown mod mode: ${mode}`);
    }
    if (!profile.owner || !profile.repo) {
      throw new Error(`Invalid mod profile configuration for mode: ${mode}`);
    }
    if (!profile.versionFile) {
      throw new Error(`Missing versionFile in mod profile: ${mode}`);
    }
    return profile;
  }
}

module.exports = ModUpdater;

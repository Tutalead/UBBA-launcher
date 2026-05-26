// Launcher self-update wrapper around `electron-updater`.
// Emits a normalized 'event' stream that the renderer can render directly.

'use strict';

const { EventEmitter } = require('events');
const { autoUpdater } = require('electron-updater');

class LauncherUpdater extends EventEmitter {
  constructor({ config, log }) {
    super();
    this.config = config;
    this.log = log.scope ? log.scope('launcher-updater') : log;

    autoUpdater.logger = this.log;
    autoUpdater.autoDownload = config.autoDownload;
    autoUpdater.autoInstallOnAppQuit = config.autoInstallOnAppQuit;
    autoUpdater.channel = config.channel;

    this._wireUpdaterEvents();
  }

  _emit(stage, data = {}) {
    this.emit('event', { stage, ...data, ts: Date.now() });
  }

  _wireUpdaterEvents() {
    autoUpdater.on('checking-for-update', () => this._emit('checking'));
    autoUpdater.on('update-available', (info) =>
      this._emit('available', { version: info.version, info })
    );
    autoUpdater.on('update-not-available', (info) =>
      this._emit('up-to-date', { version: info.version })
    );
    autoUpdater.on('download-progress', (p) =>
      this._emit('downloading', {
        percent: p.percent,
        bytesPerSecond: p.bytesPerSecond,
        transferred: p.transferred,
        total: p.total,
      })
    );
    autoUpdater.on('update-downloaded', (info) =>
      this._emit('downloaded', { version: info.version })
    );
    autoUpdater.on('error', (err) =>
      this._emit('error', { message: err && err.message ? err.message : String(err) })
    );
  }

  startAutoCheck() {
    this.check().catch((e) => this.log.warn('initial check failed', e));
    this._timer = setInterval(
      () => this.check().catch(() => {}),
      this.config.checkIntervalMs
    );
  }

  stopAutoCheck() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
  }

  async check() {
    try {
      const r = await autoUpdater.checkForUpdates();
      return r ? { version: r.updateInfo && r.updateInfo.version } : null;
    } catch (err) {
      this.log.error('check failed', err);
      throw err;
    }
  }

  async download() {
    return autoUpdater.downloadUpdate();
  }

  quitAndInstall() {
    // isSilent=false so installer UI appears; isForceRunAfter=true relaunches.
    autoUpdater.quitAndInstall(false, true);
  }
}

module.exports = LauncherUpdater;

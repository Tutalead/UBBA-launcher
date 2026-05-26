'use strict';

const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');

const config = require('../shared/config');
const CH = require('../shared/ipc-channels');
const { configureLogger, log } = require('../shared/logger');

const LauncherUpdater = require('./updater/launcher-updater');
const { launchGame } = require('./game-launcher');

// Single-instance lock.
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

configureLogger(app);

const DEV_URL = process.env.VITE_DEV_SERVER_URL;
const isDev = !!DEV_URL;

/** @type {BrowserWindow|null} */
let mainWindow = null;
/** @type {LauncherUpdater} */
let launcherUpdater;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: config.window.width,
    height: config.window.height,
    minWidth: config.window.minWidth,
    minHeight: config.window.minHeight,
    frame: false,                 // custom titlebar in renderer
    titleBarStyle: 'hidden',      // macOS: keep traffic-lights hidden too
    autoHideMenuBar: true,
    backgroundColor: '#0b0a09',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.setMenu(null);

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Notify renderer of maximize/unmaximize so the titlebar icon can swap.
  const sendState = () =>
    broadcast(CH.WINDOW_STATE, { isMaximized: mainWindow.isMaximized() });
  mainWindow.on('maximize', sendState);
  mainWindow.on('unmaximize', sendState);

  // Harden: route external URLs to the OS browser; block in-app navigation.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url).catch(() => {});
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (e, url) => {
    // Allow Vite HMR navigations during dev.
    if (isDev && url.startsWith(DEV_URL)) return;
    if (!url.startsWith('file://')) {
      e.preventDefault();
      shell.openExternal(url).catch(() => {});
    }
  });

  if (isDev) {
    log.info('Loading renderer from dev server:', DEV_URL);
    mainWindow.loadURL(DEV_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexHtml = path.join(
      __dirname,
      '..',
      '..',
      'dist-renderer',
      'index.html'
    );
    log.info('Loading renderer from file:', indexHtml);
    mainWindow.loadFile(indexHtml).catch((err) => {
      log.error('Failed to load renderer:', err);
    });
  }

  mainWindow.webContents.on(
    'did-fail-load',
    (_e, code, desc, url) => {
      log.error('did-fail-load', { code, desc, url });
    }
  );
}

function broadcast(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

function registerIpc() {
  ipcMain.handle(CH.LAUNCHER_CHECK, () => launcherUpdater.check());
  ipcMain.handle(CH.LAUNCHER_DOWNLOAD, () => launcherUpdater.download());
  ipcMain.handle(CH.LAUNCHER_QUIT_AND_INSTALL, () =>
    launcherUpdater.quitAndInstall()
  );
  ipcMain.handle(CH.APP_GET_VERSION, () => app.getVersion());
  ipcMain.handle(CH.APP_OPEN_LOGS, () => shell.openPath(app.getPath('logs')));

  ipcMain.handle(CH.GAME_LAUNCH, () => launchGame(config.game));

  // Window controls — driven from the custom titlebar.
  ipcMain.handle(CH.WINDOW_MINIMIZE, () => mainWindow && mainWindow.minimize());
  ipcMain.handle(CH.WINDOW_TOGGLE_MAXIMIZE, () => {
    if (!mainWindow) return false;
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
    return mainWindow.isMaximized();
  });
  ipcMain.handle(CH.WINDOW_CLOSE, () => mainWindow && mainWindow.close());
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.whenReady().then(() => {
  // Strip the default application menu globally too.
  Menu.setApplicationMenu(null);

  launcherUpdater = new LauncherUpdater({ config: config.launcherUpdate, log });
  registerIpc();
  createWindow();
  launcherUpdater.on('event', (e) => broadcast(CH.LAUNCHER_EVENT, e));
  // Self-update checks are skipped in dev — the unsigned dev build can't update itself.
  if (!isDev) launcherUpdater.startAutoCheck();
});

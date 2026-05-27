'use strict';

const { app } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const { log } = require('../shared/logger');
const { getSettings } = require('./settings');

// Resolve the mod install directory.
// Priority: 1) user-configured modDir from settings  2) auto-detect by finding
// the game executable near the launcher.
function findGameDir(executable) {
  const stored = getSettings().modDir;
  if (stored) return stored;

  const exeDir = app.isPackaged
    ? path.dirname(app.getPath('exe'))
    : path.resolve(app.getAppPath(), '..');

  const candidates = app.isPackaged
    ? [exeDir, path.resolve(exeDir, '..')]
    : [exeDir];

  for (const dir of candidates) {
    try {
      if (fs.existsSync(path.join(dir, executable))) return dir;
    } catch {
      // continue
    }
  }
  log.warn('[game] executable not found near launcher', { candidates, executable });
  return null;
}

function launchGame(gameConfig) {
  const { executable, modName, skipIntro = true, extraArgs = [] } = gameConfig;

  // Prefer the explicit exe path from settings; fall back to modDir + executable name.
  const settings = getSettings();
  let exePath = settings.gameExePath || null;
  let gameDir;
  if (exePath) {
    gameDir = path.dirname(exePath);
  } else {
    gameDir = findGameDir(executable);
    if (!gameDir) {
      const msg = `Could not locate ${executable}. Please set the game executable path in Settings.`;
      log.error('[game] ' + msg);
      return { ok: false, error: msg };
    }
    exePath = path.join(gameDir, executable);
  }

  const args = ['-modname', modName];
  if (skipIntro) args.push('-nomovies');
  args.push(...extraArgs);

  log.info('[game] launching', { exePath, args, cwd: gameDir });

  try {
    const child = spawn(exePath, args, {
      cwd: gameDir,
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    });
    child.on('error', (err) => log.error('[game] spawn error:', err));
    child.unref();
    return { ok: true, pid: child.pid, exePath, args };
  } catch (err) {
    log.error('[game] failed to launch:', err);
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
}

module.exports = { launchGame, findGameDir };

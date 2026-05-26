'use strict';

const { app } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const { log } = require('../shared/logger');

// Resolve the Dawn of War install directory.
// In dev the source lives at `<DoW>/UBBA-launcher/` so `../` is the game dir.
// In prod the NSIS installer puts the launcher in a sub-folder of the DoW
// directory (e.g. `<DoW>/UBBA Launcher/`), so we check the exe dir first
// and then its parent — whichever contains the game executable wins.
function findGameDir(executable) {
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

  const gameDir = findGameDir(executable);
  if (!gameDir) {
    const msg = `Could not locate ${executable} near the launcher.`;
    log.error('[game] ' + msg);
    return { ok: false, error: msg };
  }

  const exePath = path.join(gameDir, executable);
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

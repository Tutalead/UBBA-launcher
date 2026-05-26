'use strict';

const { app } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const { log } = require('../shared/logger');

// Resolve the Dawn of War install directory.
//   - In dev, the launcher source lives at `<DoW>/UBBA-launcher`, so the
//     game dir is the parent of the project (`..`).
//   - In prod, the packaged launcher is installed directly into the DoW
//     folder, so the game dir is the directory containing the launcher
//     executable (`.`).
// We still verify the executable is actually present at the chosen path
// and return null otherwise so callers can surface a clear error.
function findGameDir(executable) {
  const base = app.isPackaged
    ? path.dirname(app.getPath('exe'))                // prod: ./
    : path.resolve(app.getAppPath(), '..');           // dev:  ../
  try {
    if (fs.existsSync(path.join(base, executable))) return base;
  } catch {
    // fall through
  }
  log.warn('[game] executable not found at expected dir', { base, executable });
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

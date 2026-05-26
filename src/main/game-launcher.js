'use strict';

const { app } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const { log } = require('../shared/logger');

// Resolve the Dawn of War install directory by probing a few likely
// locations relative to the launcher. In dev the launcher lives at
// `<DoW>/UBBA-launcher`; once packaged it will be installed somewhere
// under the same `<DoW>` tree. We accept the first candidate that
// actually contains the game executable.
function findGameDir(executable) {
  const candidates = [
    path.resolve(app.getAppPath(), '..'),
    path.resolve(app.getAppPath(), '..', '..'),
    path.resolve(path.dirname(app.getPath('exe')), '..'),
    path.resolve(path.dirname(app.getPath('exe')), '..', '..'),
    path.resolve(__dirname, '..', '..', '..'),
  ];

  const seen = new Set();
  for (const dir of candidates) {
    if (seen.has(dir)) continue;
    seen.add(dir);
    try {
      if (fs.existsSync(path.join(dir, executable))) return dir;
    } catch {
      // ignore and continue probing
    }
  }
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

module.exports = { launchGame };

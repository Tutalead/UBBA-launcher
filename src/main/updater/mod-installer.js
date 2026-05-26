'use strict';

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const os = require('os');

const { downloadReleaseZip } = require('./lib/github');
const { extractZip } = require('./lib/zip');

async function withTempDir(prefix, fn) {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), prefix));
  try {
    return await fn(dir);
  } finally {
    fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function replacePath(src, dest) {
  await fsp.rm(dest, { recursive: true, force: true });
  await fsp.cp(src, dest, { recursive: true, force: true });
}

// Dawn of War's .module parser only accepts CRLF line endings. GitHub
// zipballs/asset zips store text with LF, so we normalize after copy.
async function normalizeCrlfFile(filePath) {
  const buf = await fsp.readFile(filePath);
  const text = buf.toString('utf8');
  const normalized = text.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
  if (normalized !== text) {
    await fsp.writeFile(filePath, normalized, 'utf8');
  }
}

async function normalizeModuleFiles(target) {
  let stat;
  try {
    stat = await fsp.stat(target);
  } catch {
    return;
  }
  if (stat.isFile()) {
    if (target.toLowerCase().endsWith('.module')) {
      await normalizeCrlfFile(target);
    }
    return;
  }
  if (!stat.isDirectory()) return;
  const items = await fsp.readdir(target, { withFileTypes: true });
  for (const item of items) {
    await normalizeModuleFiles(path.join(target, item.name));
  }
}

// Downloads + extracts a release zip and copies the configured entries into
// the game directory. Emits progress via the provided callbacks.
async function installRelease({
  release,
  gameDir,
  entries,
  token,
  log,
  onDownload,
  onExtract,
  onInstall,
}) {
  return withTempDir('ubba-mod-', async (tmpDir) => {
    const zipPath = path.join(tmpDir, 'release.zip');

    await downloadReleaseZip(release.zipUrl, zipPath, {
      token,
      onProgress: onDownload,
    });

    const extractDir = path.join(tmpDir, 'extracted');
    await fsp.mkdir(extractDir, { recursive: true });
    await extractZip(zipPath, extractDir, { onProgress: onExtract });

    // GitHub zipballs wrap everything in a single top-level directory.
    const rootEntries = await fsp.readdir(extractDir, { withFileTypes: true });
    const topDir = rootEntries.find((e) => e.isDirectory());
    const srcRoot = topDir ? path.join(extractDir, topDir.name) : extractDir;

    const total = entries.length || 1;
    let done = 0;
    for (const entry of entries) {
      const src = path.join(srcRoot, entry);
      const dest = path.join(gameDir, entry);
      if (!fs.existsSync(src)) {
        if (log) log.warn(`Skipping missing entry in release: ${entry}`);
      } else {
        await replacePath(src, dest);
        await normalizeModuleFiles(dest);
      }
      done += 1;
      if (onInstall) {
        onInstall({
          processed: done,
          total,
          percent: (done / total) * 100,
          entry,
        });
      }
    }
  });
}

module.exports = { installRelease };

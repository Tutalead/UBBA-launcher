'use strict';

const fsp = require('fs/promises');
const path = require('path');

// Parses the changelog index file into an array of version entries:
//   [{ title, date, pages, url }]
//
// Format:
//   ## UBBA Version 3.0.0 Changelog
//   date: 13/05/2026
//   pages: 109
//   url: https://...
function parseIndex(text) {
  const entries = [];
  const lines = text.split(/\r?\n/);
  let current = null;

  const flush = () => { if (current) entries.push(current); };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (/^##\s+/.test(line)) {
      flush();
      const title = line.replace(/^##\s+/, '').trim();
      const verMatch = title.match(/(\d+\.\d+\.\d+)/);
      current = { version: verMatch ? verMatch[1] : title, title, date: null, pages: null, url: null };
      continue;
    }
    if (!current) continue;

    const kv = /^(date|pages|url):\s*(.+)$/.exec(line);
    if (kv) current[kv[1]] = kv[2].trim();
  }
  flush();
  return entries;
}

async function getChangelog({ gameDir, changelogConfig }) {
  const indexPath = path.join(gameDir, changelogConfig.dir, changelogConfig.index);
  try {
    const text = await fsp.readFile(indexPath, 'utf8');
    return { entries: parseIndex(text) };
  } catch {
    return { entries: [], error: 'Changelog not found. Install or update the mod first.' };
  }
}

module.exports = { getChangelog };

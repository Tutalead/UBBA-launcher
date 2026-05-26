'use strict';

// 'release_v3.0.1' -> '3.0.1'; 'v1.2.3' -> '1.2.3'
function normalizeVersion(tag) {
  const m = /(\d+(?:\.\d+)+(?:[-+][\w.]+)?)/.exec(tag);
  return m ? m[1] : tag;
}

// Parses a `version.md`-style file. Accepts `version=3.1.3`, `version: 3.1.3`,
// or just a bare `3.1.3` on a non-blank line. Returns null if nothing usable.
function parseVersionFile(text) {
  if (!text) return null;
  const keyed = /^[ \t]*version[ \t]*[:=][ \t]*([^\r\n#]+)/im.exec(text);
  if (keyed) return normalizeVersion(keyed[1].trim());
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const m = /(\d+(?:\.\d+)+(?:[-+][\w.]+)?)/.exec(t);
    if (m) return m[1];
  }
  return null;
}

// Numeric semver compare (only the major.minor.patch... numeric prefix is
// considered; pre-release suffixes are ignored).
function compareVersions(a, b) {
  const pa = String(a).split(/[-+]/)[0].split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split(/[-+]/)[0].split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

module.exports = { normalizeVersion, parseVersionFile, compareVersions };

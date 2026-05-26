'use strict';

const extract = require('extract-zip');
const yauzl = require('yauzl');

function countZipEntries(zipPath) {
  return new Promise((resolve) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err || !zipfile) return resolve(0);
      resolve(zipfile.entryCount || 0);
      zipfile.close();
    });
  });
}

async function extractZip(zipPath, dir, { onProgress } = {}) {
  const total = await countZipEntries(zipPath);
  let processed = 0;
  await extract(zipPath, {
    dir,
    onEntry: (entry) => {
      processed += 1;
      if (onProgress) {
        onProgress({
          processed,
          total,
          percent: total ? (processed / total) * 100 : 0,
          entry: entry && entry.fileName,
        });
      }
    },
  });
}

module.exports = { countZipEntries, extractZip };

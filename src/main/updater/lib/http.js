'use strict';

const fs = require('fs');
const https = require('https');
const { URL } = require('url');

const USER_AGENT = 'UBBA-Launcher';

function httpGetBuffer(url, headers, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const doGet = (u, redirects) => {
      const parsed = new URL(u);
      const req = https.get(
        {
          host: parsed.host,
          path: parsed.pathname + parsed.search,
          headers: { ...headers },
        },
        (res) => {
          if (
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            if (redirects <= 0) return reject(new Error('Too many redirects'));
            res.resume();
            return doGet(new URL(res.headers.location, u).toString(), redirects - 1);
          }
          if (res.statusCode !== 200) {
            res.resume();
            return reject(new Error(`HTTP request failed (${res.statusCode}) ${u}`));
          }
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }
      );
      req.on('error', reject);
      req.end();
    };
    doGet(url, maxRedirects);
  });
}

async function httpGetJson(url, headers) {
  const buf = await httpGetBuffer(url, headers);
  try {
    return JSON.parse(buf.toString('utf8'));
  } catch (e) {
    throw new Error('Failed to parse JSON response: ' + e.message);
  }
}

function downloadToFile(url, destPath, { headers = {}, onProgress, maxRedirects = 5 } = {}) {
  return new Promise((resolve, reject) => {
    const doGet = (u, redirects) => {
      const parsed = new URL(u);
      const req = https.get(
        {
          host: parsed.host,
          path: parsed.pathname + parsed.search,
          headers,
        },
        (res) => {
          if (
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            if (redirects <= 0) return reject(new Error('Too many redirects'));
            res.resume();
            return doGet(new URL(res.headers.location, u).toString(), redirects - 1);
          }
          if (res.statusCode !== 200) {
            res.resume();
            return reject(new Error(`Download failed (${res.statusCode})`));
          }
          const total = Number(res.headers['content-length']) || 0;
          let transferred = 0;
          const out = fs.createWriteStream(destPath);
          res.on('data', (chunk) => {
            transferred += chunk.length;
            if (onProgress) {
              onProgress({
                transferred,
                total,
                percent: total ? (transferred / total) * 100 : 0,
              });
            }
          });
          res.pipe(out);
          out.on('finish', () => out.close((err) => (err ? reject(err) : resolve())));
          out.on('error', reject);
          res.on('error', reject);
        }
      );
      req.on('error', reject);
      req.end();
    };
    doGet(url, maxRedirects);
  });
}

module.exports = { USER_AGENT, httpGetBuffer, httpGetJson, downloadToFile };

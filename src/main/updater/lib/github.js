'use strict';

const { USER_AGENT, httpGetJson, downloadToFile } = require('./http');
const { normalizeVersion } = require('./versions');

function apiHeaders(token) {
  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function downloadHeaders(url, token) {
  const isApiAsset = /^https:\/\/api\.github\.com\/.+\/releases\/assets\//i.test(url);
  const headers = {
    'User-Agent': USER_AGENT,
    Accept: isApiAsset ? 'application/octet-stream' : '*/*',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchLatestRelease({ owner, repo, token }) {
  const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const json = await httpGetJson(url, apiHeaders(token));
  if (!json || !json.tag_name) throw new Error('GitHub returned no release tag.');
  const tag = json.tag_name;
  // Prefer an uploaded .zip asset; otherwise fall back to the zipball.
  const zipAsset =
    Array.isArray(json.assets) && json.assets.find((a) => /\.zip$/i.test(a.name));
  const zipUrl = zipAsset ? zipAsset.browser_download_url : json.zipball_url;
  return {
    tag,
    version: normalizeVersion(tag),
    name: json.name || tag,
    zipUrl,
    publishedAt: json.published_at,
    htmlUrl: json.html_url,
    body: json.body || '',
  };
}

function downloadReleaseZip(url, destPath, { token, onProgress } = {}) {
  return downloadToFile(url, destPath, {
    headers: downloadHeaders(url, token),
    onProgress,
  });
}

module.exports = { fetchLatestRelease, downloadReleaseZip };

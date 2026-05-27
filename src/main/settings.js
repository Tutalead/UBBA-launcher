'use strict';

const { app } = require('electron');
const path = require('path');
const fs = require('fs');

function getSettingsPath() {
  return path.join(app.getPath('userData'), 'launcher-settings.json');
}

function getSettings() {
  try {
    const raw = fs.readFileSync(getSettingsPath(), 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveSettings(data) {
  const current = getSettings();
  const merged = { ...current, ...data };
  fs.writeFileSync(getSettingsPath(), JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

module.exports = { getSettings, saveSettings };

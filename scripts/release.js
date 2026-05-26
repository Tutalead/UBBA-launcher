#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const bump = process.argv[2];
if (!['patch', 'minor', 'major'].includes(bump)) {
  console.error('Usage: node scripts/release.js [patch|minor|major]');
  process.exit(1);
}

const pkgPath = path.resolve(__dirname, '../package.json');

execSync(`npm version ${bump} --no-git-tag-version`, { stdio: 'inherit' });

const version = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;

execSync('git add package.json', { stdio: 'inherit' });
execSync(`git commit -m "chore: release v${version}"`, { stdio: 'inherit' });
execSync(`git tag v${version}`, { stdio: 'inherit' });
execSync('git push', { stdio: 'inherit' });
execSync(`git push origin v${version}`, { stdio: 'inherit' });

console.log(`Released v${version}`);

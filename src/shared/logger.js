'use strict';

const log = require('electron-log');
const path = require('path');

function configureLogger(app) {
  log.transports.file.resolvePathFn = () =>
    path.join(app.getPath('logs'), 'launcher.log');
  log.transports.file.level = 'info';
  log.transports.console.level = 'debug';
  // Capture unhandled errors.
  log.errorHandler.startCatching({ showDialog: false });
  return log;
}

module.exports = { configureLogger, log };

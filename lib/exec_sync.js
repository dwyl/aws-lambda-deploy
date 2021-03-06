'use strict';
const childProcess = require('child_process');

module.exports = (cmd) => {
  return childProcess.execSync(cmd, { encoding: 'utf8' });
};

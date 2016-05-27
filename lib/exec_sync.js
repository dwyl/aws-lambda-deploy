'use strict';
var child_process = require('child_process');

module.exports = (cmd) => {
  return child_process.execSync(cmd, { encoding: 'utf8' });
};

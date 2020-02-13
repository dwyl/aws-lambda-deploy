'use strict';
const fs = require('fs');
const mkdirSync = require('../lib/mkdirSync');
const utils = require('../lib/utils');
const basepath = utils.getBasepath();
const path = require('path');
const pkg = require(basepath + 'package.json');

function ensureEnv (filelist) {
  const env = path.join(basepath, '.env');
  const exists = fs.existsSync(env);
  if (!exists && filelist.indexOf('.env') > -1) {
    fs.writeFileSync(env, '');
  }
}

/**
 * copyfiles copies the desired files & folders into the destination directory
 * @param {Array} filelist - Optional list of files & folders to be copied over
 */
function copyfiles (filelist) {
  filelist = filelist || pkg.files_to_deploy;
  ensureEnv(filelist);
  const destination = utils.getTargetPath();
  mkdirSync(destination); // ensure that the /dist directory exists
  filelist.forEach(function (filepath) {
    const fd = basepath + filepath;
    const stat = fs.statSync(fd);
    if (stat && stat.isFile()) {
      const dest = destination + fd.replace(basepath, '');
      const contents = fs.readFileSync(fd, 'utf8');
      fs.writeFileSync(dest, contents); // write sync.
    } else { // the file descriptor is a directory so create it in the /dist
      const dir = fd.replace(basepath, '') + '/'; // dir path excluding basepath
      const destdir = destination + dir; // create the destination directory
      mkdirSync(destdir); // create the file before attempting to copy to it
      // read the list of files in the directory we want to copy
      const files = fs.readdirSync(fd);
      const filepaths = files.map(function (f) { return path.normalize(dir + f); });
      copyfiles(filepaths, destination); // recurse until complete
    }
  });
}

module.exports = copyfiles; // don't in-line this export its used recursively.

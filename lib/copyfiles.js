'use strict';
var fs = require('fs');
var mkdirSync = require('../lib/mkdirSync');
var utils = require('../lib/utils');
var basepath = utils.getBasepath();
var path = require('path');
var pkg = require(basepath + 'package.json');

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
  var babel;
  var babelOpts = false;
  try {
    babelOpts = JSON.parse(fs.readFileSync(basepath + '.babelrc'));
    babel = require('babel-core');
  } catch (e) {
    // console.log('No Babel!');
  }
  filelist = filelist || pkg['files_to_deploy'];
  ensureEnv(filelist);
  var destination = utils.getTargetPath();
  mkdirSync(destination); // ensure that the /dist directory exists
  filelist.forEach(function (filepath) {
    var fd = basepath + filepath;
    var stat = fs.statSync(fd);
    if (stat && stat.isFile()) {
      var dest = destination + fd.replace(basepath, '');
      var contents;
      if (!fd.match(/\.json/) && !fd.match(/\.env/) && babelOpts) { // only transpile ES6
        var transpiled = babel.transformFileSync(fd, babelOpts); // from .babelrc
        contents = transpiled.code;
      } else {
        contents = fs.readFileSync(fd, 'utf8');
      }
      fs.writeFileSync(dest, contents);               // write sync.
    } else { // the file descriptor is a directory so create it in the /dist
      var dir = fd.replace(basepath, '') + '/'; // dir path excluding basepath
      var destdir = destination + dir; // create the destination directory
      mkdirSync(destdir); // create the file before attempting to copy to it
      // read the list of files in the directory we want to copy
      var files = fs.readdirSync(fd);
      var filepaths = files.map(function (f) { return path.normalize(dir + f); });
      copyfiles(filepaths, destination); // recurse until complete
    }
  });
  return;
}

module.exports = copyfiles; // don't in-line this export its used recursively.

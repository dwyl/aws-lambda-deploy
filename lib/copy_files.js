'use strict';
var fs = require('fs');
var mkdir_sync = require('../lib/mkdir_sync');
var utils = require('../lib/utils');
var base_path = utils.get_base_path();
var path = require('path');
var pkg = require(base_path + 'package.json');

var babel;
var babelOpts = false;
try {
  babelOpts = JSON.parse(fs.readFileSync(base_path + '.babelrc'));
  babel = require('babel-core');
} catch (e) {
  // console.log('No Babel!');
}

/**
 * copy_files copies the desired files & folders into the destination directory
 * @param {Array} file_list - Optional list of files & folders to be copied over
 */
function copy_files (files_to_deploy) {
  files_to_deploy = files_to_deploy || pkg.files_to_deploy;
  // console.log('files_to_deploy : ', files_to_deploy);
  var destination = process.env.TMPDIR + 'dist/';

  mkdir_sync(destination); // ensure that the /dist directory exists

  files_to_deploy.forEach(function (file_path) {
    var fd = base_path + file_path;
    var stat = fs.statSync(fd);
    if (stat && stat.isFile()) {
      var dest = destination + fd.replace(base_path, '');
      var contents;
      if (fd.indexOf('.json') === -1 && babelOpts) {
        // only transpile if the project has a .babelrc
        process.env.BABEL_ENV = process.env.NODE_ENV = 'production';
        var transpiled = babel.transformFileSync(fd, babelOpts); // babel...
        // console.log(transpiled);
        contents = transpiled.code;
      } else {
        contents = fs.readFileSync(fd, 'utf8');
      }
      fs.writeFileSync(dest, contents);               // write sync.
      // console.log('copied file:', file_path, 'to', dest);
    } else { // the file descriptor is a directory so create it in the /dist
      var dir = fd.replace(base_path, '') + '/'; // dir path excluding base_path
      var dest_dir = destination + dir; // create the destination directory
      mkdir_sync(dest_dir); // create the file before attempting to copy to it
      // read the list of files in the directory we want to copy
      var files = fs.readdirSync(fd);
      var filepaths = files.map(function (f) { return path.normalize(dir + f); });
      copy_files(filepaths, destination); // recurse
    }
  });
  return;
}

module.exports = copy_files; // don't in-line this export its used recursively.

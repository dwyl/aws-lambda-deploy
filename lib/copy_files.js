'use strict';
var fs = require('fs');
var mkdir_sync = require('../lib/mkdir_sync');
var utils = require('../lib/utils');
var base_path = utils.get_base_path();
var path = require('path');
var pkg = require(base_path + 'package.json');
var babel = require('babel-core');

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
      if (fd.indexOf('.json') === -1) { // don't waste time transpiling JSON.
        process.env.BABEL_ENV = process.env.NODE_ENV = 'production';
        var opts = { 'presets': ['es2015'] };
        var transpiled = babel.transformFileSync(fd, opts); // babel...
        contents = transpiled.code;
      } else {
        contents = fs.readFileSync(fd);
      }
      fs.writeFileSync(dest, contents);               // write sync.
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

'use strict';
var fs = require('fs');
var mkdir_sync = require('../lib/mkdir_sync');
var utils = require('../lib/utils');
var base_path = utils.get_base_path();
var pkg = require(base_path + 'package.json');

function copy_files () {
  var dpl_config = pkg.dpl;
  var source = dpl_config.source || null; // path to source folder for copy files & folders from it
  var files_to_deploy = dpl_config.files_to_deploy;

  var destination = process.env.TMPDIR + 'dist/';
  mkdir_sync(destination); // ensure that the /dist directory exists

  copy_all_files(files_to_deploy);

  if (source) {
    var sourceDir = fs.readdirSync(source);
    copy_all_files(sourceDir, source);
  }

  /**
   * copy_all_files copies the desired files & folders into the destination directory
   * @param {Array} sdir - List of files & folders to be copied over
   * @param {String} source - Optional path to the folder to copy all content but ignore the source folder
   */
  function copy_all_files (sdir, source) {
    sdir.forEach(function (file) {
      var bath_source_path = base_path + (source || '');
      var fd = bath_source_path + file;
      var stat = fs.statSync(fd);

      if (stat && stat.isFile()) {
        var dest = destination + fd.replace(bath_source_path, '');
        fs.writeFileSync(dest, fs.readFileSync(fd)); // sync everywhere!!
      } else { // the file descriptor is a directory so create it in the /dist
        var dir = fd.replace(bath_source_path, '') + '/'; // directory path excluding base_path
        var dest_dir = destination + dir; // create the destination directory

        mkdir_sync(dest_dir); // create the file before attempting to copy to it

        // read the list of files in the directory we want to copy
        var files = fs.readdirSync(fd);
        var filepaths = files.map(function (f) { return dir + f; });

        copy_all_files(filepaths, source, destination);
      }
    });
  }
  return;
}

module.exports = copy_files;

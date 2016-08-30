'use strict';
var exec_sync = require('./exec_sync'); // fs.execSync only available in v.0.12+
var distpath = require('./utils').get_target_path();
var pkg = require(require('../lib/utils').getBasepath() + 'package.json');
var zip_file_path = process.env.TMPDIR + pkg.name + '.zip';

/**
 * zip does exactly what you expect: zip the /dist directory ready for prod
 * your lambda function.
 * @param {String} zip_file_path - full path to your zip file (where it will be)
 * @param {String} distpath - the path to your /dist directory where you
 * want the prod node_modules to be installed for packaging
 */
module.exports = function zip () {
  var start = process.cwd();               // get current working directory
  process.chdir(distpath);                // change to inside the /dist dir
  var cmd = 'zip -rq -X ' + zip_file_path + ' ./'; // create name.zip from cwd
  exec_sync(cmd);                          // execute command synchronously
  return process.chdir(start);             // change back to original directory
};

/**
 * unzip does exactly what you expect: unzip the zipped file
 * @param {String} zip_file_path - the full path to the zip file.
 * @param {String} distpath - the path to your /dist directory where you
 * want the prod node_modules to be installed for packaging
 */
module.exports.unzip = function unzip () {
  var cmd = 'unzip -q ' + zip_file_path + ' -d ' + process.env.TMPDIR + 'unzipped';
  return exec_sync(cmd);        // execute command synchronously
};

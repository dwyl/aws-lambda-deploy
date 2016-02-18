'use strict';
var exec_sync = require('./exec_sync');
// we can't use node's execSync because its only available in v.0.12+ ...
var path = require('path');

/**
 * zip does exactly what you expect: zip the /dist directory ready for prod
 * your lambda function.
 * @param {String} zip_file_path - full path to your zip file (where it will be)
 * @param {String} dist_path - the path to your /dist directory where you
 * want the prod node_modules to be installed for packaging
 */
function zip(zip_file_path, dist_path) {
  var start = process.cwd();            // get current working directory
  process.chdir(dist_path);                // change to parent of /dist directory
  // see: https://github.com/numo-labs/aws-lambda-deploy/issues/7
  var cmd = 'zip -rq -X ' + zip_file_path + ' ./'; // create name.zip from cwd
  exec_sync(cmd);                       // execute command synchronously
  process.chdir(start);                 // change back to original directory
  return;
}

module.exports = zip;

/**
 * unzip does exactly what you expect: unzip the zipped file
 * @param {String} zip_file_path - the full path to the zip file.
 * @param {String} dist_path - the path to your /dist directory where you
 * want the prod node_modules to be installed for packaging
 */
function unzip(zip_file_path, dist_path) {
  var cmd = 'unzip -q ' + zip_file_path + ' -d ' + dist_path; // unzip archive
  exec_sync(cmd);                             // execute command synchronously
  return;
}

module.exports.unzip = unzip;

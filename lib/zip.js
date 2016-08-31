'use strict';
var execSync = require('./exec_sync'); // fs.execSync only available in v.0.12+
var distpath = require('./utils').getTargetPath();
var pkg = require(require('../lib/utils').getBasepath() + 'package.json');
var path = require('path');
var zipfilepath = path.normalize(process.env.TMPDIR + pkg.name + '.zip');

/**
 * zip does exactly what you expect: zip the /dist directory ready for prod
 * your lambda function.
 * @param {String} zipfilepath - full path to your zip file (where it will be)
 * @param {String} distpath - the path to your /dist directory where you
 * want the prod node_modules to be installed for packaging
 */
module.exports = function zip () {
  var start = process.cwd();               // get current working directory
  process.chdir(distpath);                // change to inside the /dist dir
  var cmd = 'zip -rq -X ' + zipfilepath + ' ./'; // create name.zip from cwd
  execSync(cmd);                          // execute command synchronously
  return process.chdir(start);             // change back to original directory
};

/**
 * unzip does exactly what you expect: unzip the zipped file
 * @param {String} zipfilepath - the full path to the zip file.
 * @param {String} distpath - the path to your /dist directory where you
 * want the prod node_modules to be installed for packaging
 */
module.exports.unzip = function unzip () {
  var unzipped = path.normalize(process.env.TMPDIR + 'unzipped');
  var cmd = 'unzip -q ' + zipfilepath + ' -d ' + unzipped;
  return execSync(cmd);        // execute command synchronously
};

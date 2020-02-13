'use strict';
const execSync = require('./exec_sync'); // fs.execSync only available in v.0.12+
const distpath = require('./utils').getTargetPath();
const pkg = require(require('../lib/utils').getBasepath() + 'package.json');
const path = require('path');
const zipfilepath = path.normalize(process.env.TMPDIR + pkg.name + '.zip');

/**
 * zip does exactly what you expect: zip the /dist directory ready for prod
 * your lambda function.
 * @param {String} zipfilepath - full path to your zip file (where it will be)
 * @param {String} distpath - the path to your /dist directory where you
 * want the prod node_modules to be installed for packaging
 */
module.exports = function zip () {
  const start = process.cwd(); // get current working directory
  process.chdir(distpath); // change to inside the /dist dir
  const cmd = 'zip -rq -X ' + zipfilepath + ' ./'; // create name.zip from cwd
  execSync(cmd); // execute command synchronously
  return process.chdir(start); // change back to original directory
};

/**
 * unzip does exactly what you expect: unzip the zipped file
 * @param {String} zipfilepath - the full path to the zip file.
 * @param {String} distpath - the path to your /dist directory where you
 * want the prod node_modules to be installed for packaging
 */
module.exports.unzip = function unzip () {
  const unzipped = path.normalize(process.env.TMPDIR + 'unzipped');
  const cmd = 'unzip -q ' + zipfilepath + ' -d ' + unzipped;
  return execSync(cmd); // execute command synchronously
};

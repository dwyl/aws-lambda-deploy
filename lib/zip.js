'use strict';
var exec_sync = require('./exec_sync');
// we can't use node's execSync because its only available in v.0.12+ ...
var path = require('path');

/**
 * zip does exactly what you expect: zip the /dist directory ready for prod
 * your lambda function.
 * @param
 * @param {String} dist_path - the path to your /dist directory where you
 * want the prod node_modules to be installed for packaging
 */
function zip(zip_file_name, dist_path) {
  var start = process.cwd();            // get current working directory
  var dist, parts;
  if(dist_path.charAt(dist_path.length - 1) === '/') {
    parts = dist_path.slice(0, dist_path.length - 1).split('/');
  }
  else {
    parts = dist_path.split('/');  // split the dist_path into parts
  }
  var dist = parts[parts.length - 1]; // we only want the final directory
  var parent = path.resolve(dist_path + '/../'); // to avoid dir tree in zip
  process.chdir(parent);                // change to parent of /dist directory
  // see: https://github.com/numo-labs/aws-lambda-deploy/issues/7
  var cmd = 'zip -rq -X ' + zip_file_name + ' ' + dist; // create name.zip from /dist
  exec_sync(cmd);                       // execute command synchronously
  process.chdir(start);                 // change back to original directory
  return;
}

module.exports = zip;

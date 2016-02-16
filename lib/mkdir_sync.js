/**
 * create_dist has one job: to create a directory where all the
 * files & folders e.g: /lib & node_modules will be kept until zipping.
 */

var fs   = require('fs');

/**
 * mkdir_sync creates a directory synchronously as specified by the dir_path
 * @param dir_path {String} the path to where you want the /dist folder created
 * usage: mkdir_sync('/path/to/directory');
 */
function mkdir_sync(dir_path) {
  try {
    fs.mkdirSync(dir_path);                   // create the /dist directory
    return dir_path; // if the path is returned it succeeded.
  } catch(e) {
    // delete_dir_contents(dir_path);            // empty the /dist directory
    return e;
  }
}

module.exports = mkdir_sync; // main method

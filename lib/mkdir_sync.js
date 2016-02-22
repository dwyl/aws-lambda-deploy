'use strict';
/**
 * mkdir_sync creates a directory synchronously as specified by the dir_path
 * @param dir_path {String} the path to where you want the /dist folder created
 * usage: mkdir_sync('/path/to/directory');
 */
module.exports = function mkdir_sync (dir_path) {
  try {
    require('fs').mkdirSync(dir_path);   // create the /dist directory
    return dir_path; // if the path is returned it succeeded.
  } catch (e) {
    return e;
  }
};

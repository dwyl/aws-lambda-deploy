'use strict';
var path = require('path');
/**
 * mkdirSync creates a directory synchronously as specified by the dirpath
 * @param dirpath {String} the path to where you want the /dist folder created
 * usage: mkdirSync('/path/to/directory');
 */
module.exports = function mkdirSync (dirpath) {
  try {
    require('fs').mkdirSync(path.normalize(dirpath)); // create the /dist dir
    return dirpath; // if the path is returned it succeeded.
  } catch (e) {
    return e;
  }
};

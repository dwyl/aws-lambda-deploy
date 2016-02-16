/**
 * create_dist has one job: to create a /dist directory where all the
 * files & folders e.g: /lib & node_modules will be kept until zipping.
 */

var fs   = require('fs');
var path = require('path');


/**
 * delete the contents of /temp/dist so we can re-create it
 * @param dir_path {String} the path to the temporary /dist directory
 * @param remove_self {Boolean} delete the current folder if truthy.
 * we use this to clean up (or delete) the /dist directory at the end of deploy
 */
function delete_dir_contents(dir_path, remove_self) {
  try {
    var files = fs.readdirSync(dir_path);       // if not a dir this will fail
  }
  catch(e) {
    return;                                     // nothing else to do. so return
  }
  if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {    // loop through all files in dir
      var file_path = dir_path + '/' + files[i];
      // console.log('delete:',filePath);
      if (fs.statSync(file_path).isFile()) {
        fs.unlinkSync(file_path);                // delete the file
      }
      else {
        delete_dir_contents(file_path, true);    // recurse
      }
    }
  }
  if (remove_self) {               // at this point all the files are deleleted
    fs.rmdirSync(dir_path);        // so deleting the directory will work.
  }
};

/**
 * mkdir_sync creates a directory synchronously as specified by the dir_path
 * @param dir_path {String} the path to where you want the /dist folder created
 * usage: mkdir_sync('/path/to/directory');
 */
function mkdir_sync(dir_path) {
  try {
    fs.mkdirSync(dir_path);                   // create the /dist directory
    return dist_path; // if the path is returned it succeeded.
  } catch(e) {
    // delete_dir_contents(dir_path);            // empty the /dist directory
    return e;
  }
}

module.exports = mkdir_sync; // main method
module.exports.delete_dir_contents = delete_dir_contents; // exported for tests

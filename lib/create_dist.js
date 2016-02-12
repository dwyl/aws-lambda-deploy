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
 * mkdir_sync creates the /dist directory synchronously
 * @param dist_path {String} the path to where you want the /dist folder created
 * usate: mkdir_sync('/path/to/dist');
 */
function mkdir_sync(dist_path) {
  console.log(' >>>>>>> path:', dist_path);
  try {
    fs.mkdirSync(dist_path);                   // create the /dist directory
    return dist_path
  } catch(e) {
    console.log(e)
    // delete_dir_contents(dist_path);            // empty the /dist directory
    return e;
  }
}

module.exports = mkdir_sync; // main method
module.exports.delete_dir_contents = delete_dir_contents; // exported for tests

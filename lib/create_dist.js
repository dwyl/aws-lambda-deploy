/**
 * the purpose of create_dist is exclusively to create a dist file
 *
 */
console.log('TMPDIR:', process.env.TMPDIR);
var fs   = require('fs');
var path = require('path');
// fs.mkdir();

/**
 * delete the contents of /temp/dist so we can re-create it
 * @dir_path {String} the path to the temporary /dist directory
 * @remove_self {Boolean} delete the current folder if truthy.
 */
function delete_dir_contents(dir_path, remove_self) {
  try {
    var files = fs.readdirSync(dir_path); // if not a dir this will fail
  }
  catch(e) {
    return; // nothing else to do. so return.
  }
  if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {
      var filePath = dir_path + '/' + files[i];
      // console.log('delete:',filePath);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
      else {
        delete_dir_contents(filePath, true);
      }
    }
  }
  if (remove_self) {         // at this point all the files are deleleted
    fs.rmdirSync(dir_path);  // so deleting the directory will work.
  }
};

/**
 * mkdir_sync creates the /dist directory synchronously
 * dist_path {String} the path to where you want the /dist directory to be kept
 * callback {Function} called once the operation completes.
 * e.g: mkdir_sync('/path/to/dist', function(err, data) { ...  });
 */
function mkdir_sync(dist_path, callback) {
  try {
    fs.mkdirSync(dist_path);
    return dist_path
  } catch(e) {
    delete_dir_contents(dist_path);
    return e;
  }
}

module.exports = mkdir_sync; // main method
module.exports.delete_dir_contents = delete_dir_contents; // exported for tests

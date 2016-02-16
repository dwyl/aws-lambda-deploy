// The reason these utils are kept in /lib is so that we can track coverage
// and can re-factor them without fear of breaking our test suite
// I briefly considered splitting each util into its' own file, but felt it
// was over-kill for this first version. feel free to re-factor and PR.

var fs   = require('fs');
var path = require('path');

/**
 * get_base_dir determines the base directory of the project it is operating in
 * it makes two assumptions obout node.js projects: (a) the project's root will
 * always contain a package.json file and (b) if there is a node_modules folder
 * in the path, we have not yet reached the root of the project.
 * @param {String} start - the path of the starting directory (optional)
 */
function get_base_path(start) {
  start = start || process.cwd();
  var pos = start.indexOf('node_modules');
  var base = pos > -1 ? start.substring(0, pos-1) : start;
  return base + '/';
}

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
    return e;                                   // nothing else to do. so return
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
  else {
    return;
  }
};



module.exports = {
  get_base_path: get_base_path,
  delete_dir_contents: delete_dir_contents
}

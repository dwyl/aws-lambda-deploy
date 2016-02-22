'use strict';
var fs   = require('fs');
/**
 * get_base_dir determines the base directory of the project it is operating in
 * it makes two assumptions obout node.js projects: (a) the project's root will
 * always contain a package.json file and (b) if there is a node_modules folder
 * in the path, we have not yet reached the root of the project.
 * @param {String} start - the path of the starting directory (optional)
 */
function get_base_path (start) {
  start = start || process.cwd();
  var pos = start.indexOf('node_modules');
  var base = pos > -1 ? start.substring(0, pos-1) : start;
  return base + '/';
}
module.exports.get_base_path = get_base_path;

/**
 * delete the contents of /temp/dist so we can re-create it
 * @param dir_path {String} the path to the temporary /dist directory
 * @param remove_self {Boolean} delete the current folder if truthy.
 * we use this to clean up (or delete) the /dist directory at the end of deploy
 */
module.exports.delete_dir_contents = function delete_dir_contents (dir_path, remove_self) {
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

var exec_sync = require('../lib/exec_sync');
var _HASH; // this is a shell script; globals have
/**
 * get_git_hash reads the hash of the last git commit.
 */
function git_commit_hash () {
  if (!_HASH) {
    var start = process.cwd();              // get current working directory
    process.chdir(get_base_path());         // change to project root
    var cmd = 'git rev-parse HEAD';         // create name.zip from cwd
    var hash = exec_sync(cmd);              // execute command synchronously
    process.chdir(start);                   // change back to original directory
    _HASH = hash.replace('\n','');          // replace the newline
  }
  return _HASH;
}

module.exports.git_commit_hash = git_commit_hash;

var _URL; // Re-useable GLOBAL
/**
 * constructs the url so we can view the exact code commit in a browser
 */
function github_commit_url () {
  if (!_URL) {
    var pkg = require(get_base_path() + 'package.json');
    var hash = git_commit_hash();
    var url = pkg.repository.url.replace('git+', '').replace('.git', '');
    _URL = url + '/commit/' + hash;
  }
  return _URL;
}

module.exports.github_commit_url = github_commit_url;

/**
 * constructs the url so we can view the exact code commit in a browser
 */
module.exports.description = function description () {
  var pkg = require(get_base_path() + 'package.json');
  var hash = git_commit_hash();
  var url  = github_commit_url();
  return pkg.description + ' | ' + hash + ' | ' + url;
}

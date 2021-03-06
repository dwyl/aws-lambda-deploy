'use strict';
const fs = require('fs');
const path = require('path');
/**
 * get_base_dir determines the base directory of the project it is operating in
 * it makes two assumptions obout node.js projects: (a) the project's root will
 * always contain a package.json file and (b) if there is a node_modules folder
 * in the path, we have not yet reached the root of the project.
 * @param {String} start - the path of the starting directory (optional)
 */
function getBasepath (start) {
  start = start || process.cwd();
  const pos = start.indexOf('node_modules');
  const base = pos > -1 ? start.substring(0, pos - 1) : start;
  return base + '/';
}
module.exports.getBasepath = getBasepath;

/**
 * getTargetPath determines the target directory into which files are copied as
 * part of the deploy process.
 */
function getTargetPath () {
  return path.normalize(process.env.TMPDIR + 'dist/');
}
module.exports.getTargetPath = getTargetPath;

/**
 * delete the contents of /temp/dist so we can re-create it
 * @param dirpath {String} the path to the temporary /dist directory
 * @param removeSelf {Boolean} delete the current folder if truthy.
 * we use this to clean up (or delete) the /dist directory at the end of deploy
 */
function deleteDirContents (dirpath, removeSelf) {
  getFiles(dirpath).forEach((file) => {
    const filepath = path.resolve(dirpath, file);
    if (fs.statSync(filepath).isFile()) {
      fs.unlinkSync(filepath); // delete the file
    } else {
      deleteDirContents(filepath, true); // recurse
    }
  });
  if (removeSelf) { // at this point all the files are deleleted
    fs.rmdirSync(dirpath); // so deleting the directory will work.
  }
}

/**
 * getFiles gets the list of files in a directory.
 * @param dirpath {String} directory path.
 * @returns files {Array} containing the list of files.
 */
function getFiles (dirpath) {
  let files = [];
  try {
    files = fs.readdirSync(dirpath); // if not a dir this will fail
  } catch (e) {
    console.log(e);
  }
  return files;
}

module.exports.deleteDirContents = deleteDirContents;

/**
 * cleanUp deletes the /dist directory and lambda_name.zip so TMPDIR/ is clean
 */
module.exports.cleanUp = function cleanUp () {
  const pkg = require(getBasepath() + 'package.json');
  deleteDirContents(path.resolve(process.env.TMPDIR, 'dist/'), true); // delete /dist
  fs.unlinkSync(path.normalize(process.env.TMPDIR + pkg.name + '.zip'));
  // return;
};

const execSync = require('../lib/exec_sync');
let _HASH; // this is a shell script; globals have
/**
 * get_git_hash reads the hash of the last git commit.
 */
function gitcommithash () {
  if (!_HASH) {
    const start = process.cwd(); // get current working directory
    process.chdir(getBasepath()); // change to project root
    const cmd = 'git rev-parse HEAD'; // create name.zip from cwd
    const hash = execSync(cmd); // execute command synchronously
    process.chdir(start); // change back to original directory
    _HASH = hash.replace('\n', ''); // replace the newline
  }
  return _HASH;
}

module.exports.gitcommithash = gitcommithash;

let _URL; // Re-useable GLOBAL
/**
 * constructs the url so we can view the exact code commit in a browser
 */
function githubcommiturl () {
  if (!_URL) {
    const pkg = require(getBasepath() + 'package.json');
    const hash = gitcommithash();
    const url = pkg.repository.url.replace('git+', '').replace('.git', '');
    _URL = url + '/commit/' + hash;
  }
  return _URL;
}

module.exports.githubcommiturl = githubcommiturl;

/**
 * constructs the url so we can view the exact code commit in a browser
 */
module.exports.description = function description () {
  const pkg = require(getBasepath() + 'package.json');
  const url = githubcommiturl();
  return pkg.description + ' | ' + url;
};

/**
 * Export the environment variables as an .env file
 * no params and no return.
 */
module.exports.makeEnvFile = function makeEnvFile () {
  const env = Object.keys(process.env).map(function (k) {
    return 'export ' + k + '=' + process.env[k];
  }).join('\n');
  return fs.writeFileSync(path.normalize(getTargetPath() + '/.env'), env);
};

/**
 * functionName creates the lambda function name.
 * @param pkg {Object} the Object version of package.json
 * @return functionName {String} the lambda function name.
 */
module.exports.functionName = function functionName (pkg) {
  const version = pkg.version;
  return pkg.name + '-v' + version.substring(0, version.indexOf('.'));
}

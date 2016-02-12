var fs   = require('fs');
var path = require('path');
var mkdir = require('./create_dist');
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

module.exports.get_base_path = get_base_path;

/**
 * copy_files copies the desired files & folders into the /dist directory
 * @param {Array} file_list - the list of files & folders to be copied over
 * @param {String} dist - the path to the /dist directory (optional)
 */
function copy_files(file_list, destination) {
  console.log('file_list : ', file_list);
  destination = destination || process.env.TMPDIR + 'dist/';
  mkdir(destination); // ensure that the /dist directory exists

  var base_path = get_base_path();
  console.log('base_path : ',base_path);
  file_list.forEach(function(file_path){
    // check if the file or directory *exists*
    console.log('file_path:', file_path);
    var fd = base_path + file_path;
    console.log('fd:', fd);
    var stat = fs.statSync(fd);
    // console.log(stat);
    if (stat && stat.isFile()) {
      console.log(fd, ' is a file!')
      var dest = destination + fd.replace(base_path,'');
      console.log('COPYING', fd, ' TO: ', dest);
      // fs.createReadStream(fd).pipe(fs.createWriteStream(dest));
      var file = fs.readFileSync(fd);
      fs.writeFileSync(dest, file);
    }
    else { // is a directory
      console.log('DIRECTORY:', fd);
       // create the destination directory so we can put files into it
      var dir = fd.replace(base_path,''); // directory path excluding base_path
      var dest_dir = destination + dir
      console.log('CREATING:', dest_dir);
      mkdir(dest_dir); // create the file before attempting to copy to it
      // read the list of files in the directory we want to copy
      var files = fs.readdirSync(fd);
      var filepaths = files.map(function(f){return dir + f; });
      copy_files(filepaths, destination); // recurse
    }
  });
  return;
}

module.exports = copy_files;

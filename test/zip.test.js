'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');
var copy_files = require('../lib/copy_files');
var install_node_modules = require('../lib/install_node_modules');
var zip = require('../lib/zip');

describe('zip', function() {

  it(' all files in the /dist directory', function(done) {
    var dist_path = process.env.TMPDIR + 'dist/';
    var files_to_pack = ['package.json'];
    copy_files(files_to_pack, dist_path);
    install_node_modules(dist_path);

    var pkg_path = dist_path + 'package.json';
    console.log(pkg_path);
    var pkg = require(pkg_path);
    console.log('>>>> pkg.name:', pkg.name);

    var base_path = utils.get_base_path(); // get project root
    var zip_file_name = dist_path +'/'+ pkg.name + '.zip';

    console.log(zip_file_name);
    zip(zip_file_name, dist_path);
    var stat = fs.statSync(zip_file_name);
    console.log(stat);

    assert(stat.size > 1000000); // the zip is bigger than a megabyte!
    done();
  });

  it(' when dist_path does not end in a forwardslash...', function(done){
    var dist_path = process.env.TMPDIR + 'dist';
    var pkg = require(dist_path + '/package.json');
    var zip_file_name = dist_path +'/'+ pkg.name + '.zip';
    zip(zip_file_name, dist_path);
    var stat = fs.statSync(zip_file_name);
    // console.log(stat);
    assert(stat.size > 1000000); // same zip file.
    utils.delete_dir_contents(dist_path, true);  // cleanup for next test
    done();
  });

});

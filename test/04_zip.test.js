'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');
var copy_files = require('../lib/copy_files');
var install_node_modules = require('../lib/install_node_modules');
var zip = require('../lib/zip');

describe('upload', function() {

  it('upload the lambda function to S3', function(done) {
    var dist_path = process.env.TMPDIR + 'dist/';
    var files_to_pack = ['package.json', 'lib/', 'index.js'];
    copy_files(files_to_pack, dist_path);
    install_node_modules(dist_path);
    var pkg = require(dist_path + 'package.json');
    var base_path = utils.get_base_path(); // get project root
    var zip_file_name = dist_path + pkg.name + '.zip';

    zip(zip_file_name, dist_path);
    var stat = fs.statSync(zip_file_name);
    // console.log(stat);
    assert(stat.size > 1000000); // the zip is bigger than a megabyte!
    done();
  });


  it(' unzip the package and confirm the package.json is intact', function(done) {
    var dist_path = process.env.TMPDIR + 'dist/';
    var unzipped = path.resolve(__dirname + '/../') + '/unzipped';
    console.log('unzipped:', unzipped);
    var pkg = require(dist_path + '/package.json');
    var zip_file_name = dist_path + pkg.name + '.zip';
    zip.unzip(zip_file_name, unzipped);

    var unzipped_pkg = require(unzipped + '/package.json')
    assert.deepEqual(pkg, unzipped_pkg);
    // utils.delete_dir_contents(dist_path, true);  // cleanup for next test?
    utils.delete_dir_contents(unzipped, true);   // delete unzipped completely
    done();
  });
});

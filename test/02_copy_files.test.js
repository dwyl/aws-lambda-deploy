'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var copy_files = require('../lib/copy_files');
var utils = require('../lib/utils');
var base_path = utils.get_base_path();
var pkg = require(base_path + 'package.json');
var files_to_pack = pkg.files_to_pack;


describe('copy_files', function() {

  it('copies the package.json file to the /dist directory', function(done) {
     var dist_path = process.env.TMPDIR + 'dist/';
    copy_files();
    var exists = fs.statSync(dist_path + files_to_pack[0]);
    assert(exists);
    done();
  });

  it('copy the /lib directory (and all its files) to /dist', function(done) {
    copy_files();
    var file_path = process.env.TMPDIR + 'dist/lib/utils.js';
    var exists = fs.statSync(file_path);
    assert(exists);
    done();
  });

  it('delete /dist directory for next test', function(done) {
    var dist_path = process.env.TMPDIR + 'dist';
    var exists = false;
    try {
      utils.delete_dir_contents(dist_path, true); // completely remove /dist
      exists = fs.statSync(dist_path);
    } catch(e) {
      // console.log(e);
    }
    assert.equal(exists, false);
    done();
  });


});

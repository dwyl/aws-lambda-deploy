'use strict';
var assert = require('assert');
var fs = require('fs');
var copy_files = require('../lib/copy_files');
var utils = require('../lib/utils');
var base_path = utils.get_base_path();
var pkg = require(base_path + 'package.json');
// var files_to_deploy = pkg.files_to_deploy;

describe('copy_files', function () {
  it('copies all files_to_deploy to the /dist directory', function (done) {
    copy_files();
    var dist_pkg = require(process.env.TMPDIR + 'dist/package.json');
    assert.deepEqual(dist_pkg, pkg);
    // confirm that a nested file has been copied over:
    var file_path = process.env.TMPDIR + 'dist/lib/utils.js'; // nested
    var exists = fs.statSync(file_path);
    assert(exists);
    done();
  });

  it('delete /dist directory for next test', function (done) {
    var dist_path = process.env.TMPDIR + 'dist';
    var exists = false;
    try {
      utils.delete_dir_contents(dist_path, true); // completely remove /dist
      exists = fs.statSync(dist_path);
    } catch (e) {
      // console.log(e);
    }
    assert.equal(exists, false);
    done();
  });
});

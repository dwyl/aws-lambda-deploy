'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var copy_files = require('../lib/copy_files');

describe('copy_files', function() {

  it('copies the package.json file to the /dist directory', function(done) {
    var dist_path = process.env.TMPDIR + 'dist/';
    var files_to_pack = ['package.json'];
    copy_files(files_to_pack, dist_path);
    var file_path = dist_path + files_to_pack[0];
    console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ')
    console.log(file_path);
    var exists = fs.statSync(file_path);
    assert(exists);
    done();
  });

  it('copy index.js to /dist without specifying destination (default test)', function(done) {
    var files_to_pack = ['index.js'];
    copy_files(files_to_pack); // deliberately not passing destination as second arg.
    var dist_path = process.env.TMPDIR + 'dist/';
    var file_path = dist_path + files_to_pack[0];
    console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ')
    console.log(file_path);
    var exists = fs.statSync(file_path);
    assert(exists);
    done();
  });

  it('copy the /lib directory (and all its files) to /dist', function(done) {
    var dist_path = process.env.TMPDIR + 'dist/';
    var files_to_pack = ['lib/'];
    copy_files(files_to_pack, dist_path);
    var file_path = dist_path + 'lib/utils.js';
    console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ')
    console.log(file_path);
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

  it('copy Array of files & directories to /dist', function(done) {
    var dist_path = process.env.TMPDIR + 'dist/';
    var files_to_pack = ['package.json', 'index.js', 'lib/'];
    copy_files(files_to_pack, dist_path);
    var file_path = dist_path + 'lib/utils.js';
    console.log(' - - - - - - - - - - - - - - - - - - - - - - - - ')
    console.log(file_path);
    var exists = fs.statSync(file_path);
    assert(exists);
    done();
  });

});

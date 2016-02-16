'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');
var mkdir_sync = require('../lib/mkdir_sync');

describe('utils.get_base_path returns the root for your project', function() {

  it('get_base_path for the project with nested start', function(done) {
    var dir = path.resolve(__dirname + '/../node_modules/aws_sdk/node_modules/sax');
    var parent = path.resolve(__dirname + '/../') + '/';
    var base = utils.get_base_path(dir);
    // console.log('base:',base);
    assert.equal(base, parent);
    done();
  });

  it('get_base_path for the project without specifying start dir', function(done) {
    var parent = path.resolve(__dirname + '/../') + '/';
    var base = utils.get_base_path();
    // console.log('base:',base);
    assert.equal(base, parent);
    done();
  });

});


describe('utils.delete_dir_contents recursively delete directory contents', function() {

  it('delete existing /dist directory (if there is one)', function(done) {
    var dist_path = process.env.TMPDIR + 'dist';
    var exists = false;
    try {
      utils.delete_dir_contents(dist_path, true); // completely remove /dist
      exists = fs.statSync(dist_path);
    } catch(e) {
      // console.log(e);
    }
    // console.log('exist?', exists);
    assert.equal(exists, false);
    done();
  });

  it('create *NEW* /dist directory', function(done) {
    var dist_path = process.env.TMPDIR + 'dist';
    // console.log('>> dist_path:',dist_path);
    var res = mkdir_sync(dist_path); // sync
    
    assert.equal(dist_path, res, 'dist_path: '+dist_path);
    done();
  });

  it('attempt to re-create /dist directory again (try/catch branch test)', function(done) {
    var dist_path = process.env.TMPDIR + 'dist';
    // console.log('>> dist_path:',dist_path);
    var err = mkdir_sync(dist_path); // expect to return error
    // console.log(err);
    assert.equal(err.code, 'EEXIST', 'already exists.');
    done();
  });

  it('create a directory *inside* the /dist dir (so we can test deletion)', function(done) {
    var dir_path = process.env.TMPDIR + 'dist/node_modules'; // fake node_modules
    // console.log('node_modules path:',dir_path);
    var res = mkdir_sync(dir_path); // sync
    assert.equal(dir_path, res, 'node_modules folder created')
    done();
  });

  it('create files *inside* /dist and dist/node_modules dirs to test deletion', function(done) {
    var dist_path = process.env.TMPDIR + 'dist'; // temporary /dist directory
    var dir_path  = dist_path + '/node_modules'; // fake node_modules
    var file1 = dist_path+'/hello.txt'
    var file2 = dir_path+'/another.txt'
    fs.writeFileSync(file1, 'hello world');
    fs.writeFileSync(file2, 'hello world');
    var exists = false;
    try {
      exists = fs.statSync(file1);
      // console.log(exists);
    } catch(e) {
      console.log(e);
    }
    assert.equal(exists.size, 11, 'file created: '+ file1);
    done();
  });

  it('delete existing /dist directory and all its contents', function(done) {
    var dist_path = process.env.TMPDIR + 'dist';
    var exists = false;
    try {
      mkdir_sync.delete_dir_contents(dist_path, true); // sync
      exists = fs.statSync(dist_path);
    } catch(e) {
      // console.log(e);
    }
    assert.equal(exists, false);
    done();
  });

});
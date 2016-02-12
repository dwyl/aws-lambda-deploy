'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var copy_files = require('../lib/copy_files');

describe('Copy selected files from project to /dist', function() {

  it('get_base_path for the project with nested start', function(done) {
    var dir = path.resolve(__dirname + '/../node_modules/aws_sdk/node_modules/sax');
    var parent = path.resolve(__dirname + '/../') + '/';
    var base = copy_files.get_base_path(dir);
    // console.log('base:',base);
    assert.equal(base, parent);
    done();
  });

  it('get_base_path for the project without specifying start dir', function(done) {
    var parent = path.resolve(__dirname + '/../') + '/';
    var base = copy_files.get_base_path();
    // console.log('base:',base);
    assert.equal(base, parent);
    done();
  });



});

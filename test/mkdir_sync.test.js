'use strict';
var assert = require('assert');
var create_dist = require('../lib/mkdir_sync');
var utils = require('../lib/utils');
var fs = require('fs');
// create /dist directory to store all the files we are going to zip
describe('mkdir_sync', function() {

  it('delete existing /dist directory (if there is one - so we can test creation...)', function(done) {
    var dist_path = process.env.TMPDIR + 'dist';
    var exists = false;
    try {
      utils.delete_dir_contents(dist_path, true); // sync
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
    var res = create_dist(dist_path); // sync
    assert.equal(dist_path, res, 'dist_path: '+dist_path);
    done();
  });

});

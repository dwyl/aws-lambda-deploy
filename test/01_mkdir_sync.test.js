'use strict';
var assert = require('assert');
var mkdirSync = require('../lib/mkdirSync');
var utils = require('../lib/utils');
var fs = require('fs');
var path = require('path');
// create /dist directory to store all the files we are going to zip
describe('mkdirSync', function () {
  it('delete existing /dist directory (if there is one - so we can test creation...)', function (done) {
    var distpath = path.normalize(process.env.TMPDIR + '/dist/');
    var exists = false;
    try {
      utils.deleteDirContents(distpath, true); // sync
      exists = fs.statSync(distpath);
    } catch (e) {
      // console.log(e);
    }
    // console.log('exist?', exists);
    assert.equal(exists, false);
    done();
  });

  it('mkdirSync *NEW* /dist directory', function (done) {
    var distpath = path.normalize(process.env.TMPDIR + '/dist/');
    // console.log('>> distpath:',distpath);
    var res = mkdirSync(distpath); // sync
    assert.equal(distpath, res, 'distpath: ' + distpath);
    done();
  });
});

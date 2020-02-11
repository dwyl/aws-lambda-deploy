'use strict';
const assert = require('assert');
const mkdirSync = require('../lib/mkdirSync');
const utils = require('../lib/utils');
const fs = require('fs');
const path = require('path');
// create /dist directory to store all the files we are going to zip
describe('mkdirSync', function () {
  it('delete existing /dist directory (if there is one - so we can test creation...)', function (done) {
    const distpath = path.normalize(process.env.TMPDIR + '/dist/');
    let exists = false;
    try {
      utils.deleteDirContents(distpath, true); // sync
      exists = fs.statSync(distpath);
    } catch (e) {
      // console.log(e);
    }
    // console.log('exist?', exists);
    assert.strictEqual(exists, false);
    done();
  });

  it('mkdirSync *NEW* /dist directory', function (done) {
    const distpath = path.normalize(process.env.TMPDIR + '/dist/');
    // console.log('>> distpath:',distpath);
    const res = mkdirSync(distpath); // sync
    assert.strictEqual(distpath, res, 'distpath: ' + distpath);
    done();
  });
});

'use strict';
const test = require('tape');
const mkdirSync = require('../lib/mkdirSync');
const utils = require('../lib/utils');
const fs = require('fs');
const path = require('path');
// create /dist directory to store all the files we are going to zip
test('delete existing /dist dir if exists - to test mkdirSync', async function (t) {
  const distpath = path.normalize(process.env.TMPDIR + '/dist/');
  let exists = false;
  try {
    utils.deleteDirContents(distpath, true); // sync
    exists = fs.statSync(distpath);
  } catch (e) {
    // console.log(e);
  }
  // console.log('exist?', exists);
  t.equal(exists, false);
  t.end();
});

test('mkdirSync *NEW* /dist directory', async function (t) {
  const distpath = path.normalize(process.env.TMPDIR + '/dist/');
  // console.log('>> distpath:',distpath);
  const res = mkdirSync(distpath); // sync
  t.equal(distpath, res, 'distpath: ' + distpath);
  t.end();
});

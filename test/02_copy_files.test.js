'use strict';
const test = require('tape');
const fs = require('fs');
const path = require('path');
const copyfiles = require('../lib/copyfiles');
const utils = require('../lib/utils');
const basepath = utils.getBasepath();
const pkg = require(basepath + 'package.json');

// describe('copyfiles', () => {
test('copyfiles > copies all files_to_deploy to the /dist directory', (t) => {
  copyfiles();
  const distpkgpath = path.resolve(process.env.TMPDIR, 'dist/package.json');
  console.log('distpkgpath:', distpkgpath);
  const distpkg = require(distpkgpath);
  t.deepEqual(distpkg, pkg);
  // confirm that a nested file has been copied over:
  const utilspath = path.normalize(process.env.TMPDIR + 'dist/lib/utils.js'); // nested
  console.log('utilspath:', utilspath);
  const exists = fs.statSync(utilspath);
  t.ok(exists);
  try {
    utils.deleteDirContents(utils.getTargetPath(), true); // delete /dist
  } catch (e) {
    /* ignore */
  }
  t.end();
});

test('if no .env file is present', (t) => {
  let tmpfile;
  const env = path.join(basepath, '.env');
  if (fs.existsSync(env)) {
    tmpfile = fs.readFileSync(env, 'utf8');
    // delete the real .env file
    fs.unlinkSync(env);
  }
  copyfiles();
  t.equal(fs.readFileSync(env, 'utf8'), ''); // empty .env file

  // restore the real .env file
  fs.writeFileSync(env, tmpfile, 'utf8');
  t.end()
});

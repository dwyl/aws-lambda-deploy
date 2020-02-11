'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const copyfiles = require('../lib/copyfiles');
const utils = require('../lib/utils');
const basepath = utils.getBasepath();
const pkg = require(basepath + 'package.json');
// const files_to_deploy = pkg.files_to_deploy;

describe('copyfiles', () => {
  afterEach(() => {
    try {
      utils.deleteDirContents(utils.getTargetPath(), true); // completely remove /dist
    } catch (e) {
      /* ignore */
    }
  });
  it('copies all files_to_deploy to the /dist directory', (done) => {
    copyfiles();
    const distpkgpath = path.resolve(process.env.TMPDIR, 'dist/package.json');
    console.log('distpkgpath:', distpkgpath);
    const distpkg = require(distpkgpath);
    assert.deepStrictEqual(distpkg, pkg);
    // confirm that a nested file has been copied over:
    const utilspath = path.normalize(process.env.TMPDIR + 'dist/lib/utils.js'); // nested
    console.log('utilspath:', utilspath);
    const exists = fs.statSync(utilspath);
    assert(exists);
    done();
  });

  describe('if no .env file is present', () => {
    let tmpfile;
    const env = path.join(basepath, '.env');
    before(() => {
      if (fs.existsSync(env)) {
        tmpfile = fs.readFileSync(env, 'utf8');
        fs.unlinkSync(env);
      }
    });
    after(() => {
      fs.writeFileSync(env, tmpfile, 'utf8');
    });

    it('creates an empty .env', () => {
      copyfiles();
      assert.strictEqual(fs.readFileSync(env, 'utf8'), '');
    });
  });
});

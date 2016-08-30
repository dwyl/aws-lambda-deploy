'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const copyfiles = require('../lib/copyfiles');
const utils = require('../lib/utils');
const basepath = utils.getBasepath();
const pkg = require(basepath + 'package.json');
// var files_to_deploy = pkg.files_to_deploy;

describe('copyfiles', () => {
  afterEach(() => {
    try {
      utils.delete_dir_contents(utils.get_target_path(), true); // completely remove /dist
    } catch (e) {
      /* ignore */
    }
  });
  it('copies all files_to_deploy to the /dist directory', (done) => {
    copyfiles();
    var dist_pkg = require(process.env.TMPDIR + 'dist/package.json');
    assert.deepEqual(dist_pkg, pkg);
    // confirm that a nested file has been copied over:
    var file_path = process.env.TMPDIR + 'dist/lib/utils.js'; // nested
    var exists = fs.statSync(file_path);
    assert(exists);
    done();
  });

  describe('if no .env file is present', () => {
    var tmpfile;
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
      assert.equal(fs.readFileSync(env, 'utf8'), '');
    });
  });
});

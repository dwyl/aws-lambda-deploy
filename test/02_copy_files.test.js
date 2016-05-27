'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const copy_files = require('../lib/copy_files');
const utils = require('../lib/utils');
const base_path = utils.get_base_path();
const pkg = require(base_path + 'package.json');
// var files_to_deploy = pkg.files_to_deploy;

describe('copy_files', () => {
  afterEach(() => {
    try {
      utils.delete_dir_contents(utils.get_target_path(), true); // completely remove /dist
    } catch (e) {
      /* ignore */
    }
  });
  it('copies all files_to_deploy to the /dist directory', (done) => {
    copy_files();
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
    const env = path.join(base_path, '.env');
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
      copy_files();
      assert.equal(fs.readFileSync(env, 'utf8'), '');
    });
  });
});

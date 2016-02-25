'use strict';
var assert = require('assert');
var fs = require('fs');
var copy_files = require('../lib/copy_files');
var utils = require('../lib/utils');
var base_path = utils.get_base_path();
var pkg = require(base_path + 'package.json');
// var files_to_deploy = pkg.files_to_deploy;

describe('copy_files', function () {
  it('copies all files_to_deploy to the /dist directory', function (done) {
    copy_files();
    var dist_pkg = require(process.env.TMPDIR + 'dist/package.json');
    assert.deepEqual(dist_pkg, pkg);
    // confirm that a nested file has been copied over:
    var file_path = process.env.TMPDIR + 'dist/lib/utils.js'; // nested
    var exists = fs.statSync(file_path);
    assert(exists);
    // Regression test for: https://github.com/numo-labs/aws-lambda-deploy/issues/21
    file_path = process.env.TMPDIR + 'dist/lib/schema/index.js'; // deep-nested
    // check that an ES6 File has been transpiled when it is copied
    var babel_str = '_interopRequireDefault(obj)';
    var file_contents = fs.readFileSync(file_path).toString();
    assert(file_contents.indexOf(babel_str) > -1); // confirm transformed
    // require the babel-ified index.js and execute it:
    var handler = require(file_path).handler;
    var context = {};
    context.succeed = function (result) {
      assert.equal(result.message, base_path);
      done();
    };
    handler({}, context);
  });

  it('delete /dist directory for next test', function (done) {
    var dist_path = process.env.TMPDIR + 'dist';
    var exists = false;
    try {
      utils.delete_dir_contents(dist_path, true); // completely remove /dist
      exists = fs.statSync(dist_path);
    } catch (e) {
      // console.log(e);
    }
    assert.equal(exists, false);
    done();
  });
});


'use strict';
var fs = require('fs');
var assert = require('assert');
var decache = require('decache');
var utils = require('../lib/utils');
var base_path = utils.get_base_path()
var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION; // set your Environment Variables...
var lambda = new AWS.Lambda();
var FUNCTION_NAME; // GLOBAL used to delete the function.
var PKG = require(base_path + 'package.json');

describe('upload > testing lambda_timeout and lambda_memory', function () {
  before('Setup the package.json to have the optional settings', function (done) {
    var pkg = JSON.parse(JSON.stringify(PKG));
    pkg.lambda_memory = '512'; // 512 MB
    pkg.lambda_timeout = '42'; // 42 seconds
    // delete pkg.lambda_memory;
    // delete pkg.lambda_timeout;
    fs.writeFileSync(base_path + 'package.json', JSON.stringify(pkg, null, 2));
    done();
  });

  it('upload the lambda function to S3', function (done) {
    decache('../lib/upload');
    decache(base_path + 'package.json');
    decache('../lib/utils');
    decache('../lib/copy_files');

    var copy_files = require('../lib/copy_files');
    var install_node_modules = require('../lib/install_node_modules');
    var zip = require('../lib/zip');
    var utils = require('../lib/utils');
    var upload = require('../lib/upload');

    copy_files();
    install_node_modules();
    zip();
    upload(function (err, data) {
      assert(!err);
      console.log('Lambda Function CREATED:', data);
      FUNCTION_NAME = data.FunctionName;
      assert(data.CodeSize > 100000);
      // assert.equal(data.Timeout, 42);
      // assert.equal(data.MemorySize, 512);
      done();
    });
  });

  it('DELETE the Lambda Function from AWS so its clean', function (done) {
    lambda.deleteFunction({ FunctionName: FUNCTION_NAME }, function (err, data) {
      assert.equal(err, null);
      // restore the package.json to original state:
      fs.writeFileSync(base_path + 'package.json', JSON.stringify(PKG, null, 2));
      done();
    });
  });

  after('clean_up > DELETE the /dist folder and lambda.zip', function (done) {
    var pkg = require(base_path + 'package.json');
    utils.clean_up();
    var file_path = process.env.TMPDIR + pkg.name + '.zip';
    var exists = false;
    try {
      exists = fs.statSync(file_path); // the file should no longer exist
    } catch (e) {
    }
    assert.equal(exists, false); // .zip does not exist
    done();
  });
});

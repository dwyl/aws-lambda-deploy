'use strict';
var fs = require('fs');
var utils = require('../lib/utils');

var PKG = require(utils.get_base_path() + 'package.json');
var pkg = JSON.parse(JSON.stringify(PKG));
pkg.lambda_memory = 512; // 512 MB
pkg.lambda_timeout = 42; // 42 seconds
fs.writeFileSync(utils.get_base_path() + 'package.json', JSON.stringify(pkg, null, 2));

var decache = require('decache');
decache('../lib/upload');
decache(utils.get_base_path() + 'package.json');
decache('../lib/utils');
decache('../lib/copy_files');

var assert = require('assert');
var copy_files = require('../lib/copy_files');
var install_node_modules = require('../lib/install_node_modules');
var zip = require('../lib/zip');
var utils = require('../lib/utils');
// now that we've set the values in pacakge.json we can re-require upload
var upload = require('../lib/upload');

var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION; // set your Environment Variables...
var lambda = new AWS.Lambda();
var FUNCTION_NAME; // GLOBAL used to delete the function.

describe('upload > testing lambda_timeout and lambda_memory', function () {
  it('upload the lambda function to S3', function (done) {
    copy_files();
    install_node_modules();
    zip();
    upload(function (err, data) {
      assert(!err);
      console.log('Lambda Function CREATED:', data);
      FUNCTION_NAME = data.FunctionName;
      assert(data.CodeSize > 100000);
      assert.equal(data.Timeout, 42);
      assert.equal(data.MemorySize, 512);
      done();
    });
  });

  it('DELETE the Lambda Function from AWS so its clean', function (done) {
    lambda.deleteFunction({ FunctionName: FUNCTION_NAME }, function (err, data) {
      assert.equal(err, null);
      // restore the package.json to original state:
      fs.writeFileSync(utils.get_base_path() + 'package.json', JSON.stringify(PKG, null, 2));
      done();
    });
  });
});

describe('clean_up', function () {
  it('DELETE the /dist folder and lambda.zip', function (done) {
    var pkg = require(utils.get_base_path() + 'package.json');
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

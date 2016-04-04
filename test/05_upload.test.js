'use strict';
var assert = require('assert');
var copy_files = require('../lib/copy_files');
var install_node_modules = require('../lib/install_node_modules');
var zip = require('../lib/zip');
var upload = require('../lib/upload');
var utils = require('../lib/utils');
var fs = require('fs');

var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION; // set your Environment Variables...
var lambda = new AWS.Lambda();
var FUNCTION_NAME; // GLOBAL used to delete the function.

describe('upload', function () {
  it('upload the lambda function to S3', function (done) {
    copy_files();
    install_node_modules();
    zip();
    upload(function (err, data) {
      assert(!err);
      console.log('Lambda Function CREATED:', data);
      FUNCTION_NAME = data.FunctionName;
      assert(data.CodeSize > 100000);
      done();
    });
  });

  it('Call upload again to exercise the "updateFunctionCode" branch', function (done) {
    upload(function (err, data) {
      assert(!err);
      console.log('Lambda Function UPDATED:', data);
      assert(data.CodeSize > 100000);
      done();
    });
  });

  it('DELETE the Lambda Function from AWS so we can re-upload it', function (done) {
    lambda.deleteFunction({ FunctionName: FUNCTION_NAME }, function (err, data) {
      assert.equal(err, null);
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

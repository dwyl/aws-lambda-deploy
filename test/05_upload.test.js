'use strict';
const assert = require('assert');
const copyfiles = require('../lib/copyfiles');
const installnodemodules = require('../lib/install_node_modules');
const zip = require('../lib/zip');
const upload = require('../lib/upload');
const utils = require('../lib/utils');
const fs = require('fs');
const path = require('path');

const AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION; // set your Environment Variables...
const lambda = new AWS.Lambda();
const basepath = utils.getBasepath();
const PKG = require(basepath + 'package.json');
const FUNCTION_NAME = utils.functionName(PKG);

describe('upload', function () {

  it('upload the lambda function to S3', function (done) {
    copyfiles();
    installnodemodules();
    zip();
    upload(function (err, data) {
      console.log('- - - - - - - - - CREATE');
      console.log('err:', err);
      console.log('- - - - - - - - -');
      console.log('data:', data);
      assert.strictEqual(err, null);
      assert(data.CodeSize > 100000);
      assert.strictEqual(data.Timeout, 42);
      assert.strictEqual(data.MemorySize, 512);
      done();
    });
  });

  it('Call upload again to exercise the "updateFunctionCode" branch', function (done) {
    upload(function (err, data) {
      console.log('- - - - - - - - - UPDATE');
      console.log('err:', err);
      console.log('data:', data);
      assert.strictEqual(err, null);
      console.log('- - - - - - - - -');
      // console.log('Lambda Function UPDATED:', data);
      assert(data.CodeSize > 100000);
      done();
    });
  });

  it('DELETE the Lambda Function from AWS so we can re-upload it', function (done) {
    lambda.deleteFunction({ FunctionName: FUNCTION_NAME }, function (err, data) {
      console.log('- - - - - - - - - DELETE');
      console.log('err:', err);
      console.log('- - - - - - - - -');
      console.log('data:', data);
      assert.strictEqual(err, null);
      done();
    });
  });
});

describe('cleanUp', function () {
  it('DELETE the /dist folder and lambda.zip', function (done) {
    utils.cleanUp();
    const filepath = path.normalize(process.env.TMPDIR + PKG.name + '.zip');
    let exists = false;
    try {
      exists = fs.statSync(filepath); // the file should no longer exist
    } catch (e) {
    }
    assert.strictEqual(exists, false); // .zip does not exist
    done();
  });
});

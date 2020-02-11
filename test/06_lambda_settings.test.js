'use strict';
require('env2')('.env');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var copyfiles = require('../lib/copyfiles');
var installnodemodules = require('../lib/install_node_modules');
var zip = require('../lib/zip');
var upload = require('../lib/upload');
var utils = require('../lib/utils');

var basepath = utils.getBasepath();
var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION; // set your Environment Variables...
var lambda = new AWS.Lambda();
let pkg = require(path.resolve(basepath, 'package.json'));
const FUNCTION_NAME = utils.FunctionName(pkg);

describe('upload > testing lambda_timeout and lambda_memory', function () {
  it('exercise default values for lambda_memory & timeout', function (done) {
    // console.log('pkg: (before)', pkg);
    delete pkg.lambda_memory;
    delete pkg.lambda_timeout;
    // console.log('pkg: (after)', pkg);
    copyfiles();
    installnodemodules();
    zip();
    // pass in the modified pkg (with lambda_memory & lambda_timeout set)
    upload(pkg, function (err, data) {
      console.log('- - - - - - - - - CREATE (settings defaults)');
      console.log('err:', err);
      console.log('- - - - - - - - -');
      console.log('data:', data);
      assert(!err);
      assert(data.CodeSize > 100000);
      // these are the default values:
      assert.strictEqual(data.MemorySize, 128);
      assert.strictEqual(data.Timeout, 10);
      // now delete the function so we can do it all again!
      lambda.deleteFunction({ FunctionName: FUNCTION_NAME }, function (err, data) {
        assert.strictEqual(err, null);
        done();
      });
    });
  });

  it('Max the settings for lambda_memory & timeout', function (done) {
    pkg.lambda_memory = 1536; // 1.5 GB (the most you can have!)
    pkg.lambda_timeout = 300; // 300 seconds (max execution time)

    copyfiles();
    installnodemodules();
    zip();
    // pass in the modified pkg (with lambda_memory & lambda_timeout set)
    upload(pkg, function (err, data) {
      console.log('- - - - - - - - - CREATE (settings)');
      console.log('err:', err);
      console.log('- - - - - - - - -');
      console.log('data:', data);
      assert(!err);
      assert(data.CodeSize > 100000);
      // these are the default values:
      assert.strictEqual(data.MemorySize, 1536);
      assert.strictEqual(data.Timeout, 300);
      // delete it again!
      lambda.deleteFunction({ FunctionName: FUNCTION_NAME }, function (err, data) {
        assert.strictEqual(err, null);
        done();
      });
    });
  });

  after('cleanUp > restore package.json, DELETE the /dist folder and lambda.zip', function (done) {
    utils.cleanUp();
    var filepath = path.normalize(process.env.TMPDIR + pkg.name + '.zip');
    var exists = false;
    try {
      exists = fs.statSync(filepath); // the file should no longer exist
    } catch (e) {
    }
    assert.strictEqual(exists, false); // .zip does not exist
    done();
  });
});

'use strict';
require('env2')('.env');
const test = require('tape');
const fs = require('fs');
const path = require('path');
const copyfiles = require('../lib/copyfiles');
const installnodemodules = require('../lib/install_node_modules');
const zip = require('../lib/zip');
const upload = require('../lib/upload');
const utils = require('../lib/utils');

const basepath = utils.getBasepath();
const AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION; // set your Environment Variables...
const lambda = new AWS.Lambda();
let pkg = require(path.resolve(basepath, 'package.json'));
const FUNCTION_NAME = utils.functionName(pkg);

// describe('upload > testing lambda_timeout and lambda_memory', function () {
test('exercise default values for lambda_memory & timeout', async function (t) {
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
    t.equal(err, null, 'upload err: ' + err);
    t.ok(data.CodeSize > 1000000, 'data.CodeSize: ' + data.CodeSize);
    // these are the default values:
    t.equal(data.Timeout, 10, 'data.Timeout: ' + data.Timeout);
    t.equal(data.MemorySize, 128, 'data.MemorySize: ' + data.MemorySize);

    // now delete the function so we can do it all again!
    lambda.deleteFunction({ FunctionName: FUNCTION_NAME }, function (err, data) {
      t.equal(err, null, 'deleteFunction err: ' + err);
      t.end();
    });
  });
});

test('Max the settings for lambda_memory & timeout', async function (t) {
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
    t.equal(err, null, 'upload err: ' + err);
    t.ok(data.CodeSize > 1000000, 'data.CodeSize: ' + data.CodeSize);
    // values we defined above:
    t.equal(data.Timeout, 300, 'data.Timeout: ' + data.Timeout);
    t.equal(data.MemorySize, 1536, 'data.MemorySize: ' + data.MemorySize);

    // delete it again!
    lambda.deleteFunction({ FunctionName: FUNCTION_NAME }, function (err, data) {
      t.equal(err, null, 'deleteFunction err: ' + err);
      t.end();
    });
  });
});

test('cleanUp > restore package.json, DELETE /dist folder & lambda.zip', async function (t) {
  utils.cleanUp();
  const filepath = path.normalize(process.env.TMPDIR + pkg.name + '.zip');
  let exists = false;
  try {
    exists = fs.statSync(filepath); // the file should no longer exist
  } catch (e) {
  }
  t.equal(exists, false, 'zip does not exist'); // .zip does not exist
  t.end();
});

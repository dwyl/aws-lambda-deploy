'use strict';
const test = require('tape');
const copyfiles = require('../lib/copyfiles');
const installnodemodules = require('../lib/install_node_modules');
const zip = require('../lib/zip');
const upload = require('../lib/upload');
const utils = require('../lib/utils');
const fs = require('fs');
const path = require('path');

const AWS = require("@aws-sdk/client-lambda");
const lambda = new AWS.Lambda({ region: process.env.AWS_REGION });

const basepath = utils.getBasepath();
const PKG = require(basepath + 'package.json');
const FUNCTION_NAME = utils.functionName(PKG);

test('upload the lambda function to S3', async function (t) {
  copyfiles();
  installnodemodules();
  zip();
  upload(function (err, data) {
    console.log('- - - - - - - - - CREATE');
    console.log('err:', err);
    console.log('- - - - - - - - -');
    console.log('data:', data);
    t.equal(err, null, 'err: ' + err);
    // t.ok(data.CodeSize > 1000000, 'data.CodeSize: ' + data.CodeSize);
    t.equal(data.Timeout, 42, 'data.Timeout: ' + data.Timeout);
    t.equal(data.MemorySize, 512, 'data.MemorySize: ' + data.MemorySize);

    // Call upload again to exec "updateFunctionCode"
    // upload(function (err, data) {
    //   console.log('- - - - - - - - - UPDATE');
    //   console.log('err:', err);
    //   console.log('data:', data);
    //   t.equal(err, null, 'err: ' + err);
    //   console.log('- - - - - - - - -');
    //   // console.log('Lambda Function UPDATED:', data);
    //   t.ok(data.CodeSize > 1000000, 'data.CodeSize: ' + data.CodeSize);

      // DELETE Lambda Function so we can re-upload it
      lambda.deleteFunction({ FunctionName: FUNCTION_NAME }, function (err, data) {
        console.log('- - - - - - - - - DELETE');
        console.log('err:', err);
        console.log('- - - - - - - - -');
        console.log('data:', data);
        t.equal(err, null, 'err: ' + err);
        t.end();
      });
    // });
  });
});

test('DELETE the /dist folder and lambda.zip', async function (t) {
  utils.cleanUp();
  const filepath = path.normalize(process.env.TMPDIR + PKG.name + '.zip');
  let exists = false;
  try {
    exists = fs.statSync(filepath); // the file should no longer exist
  } catch (e) {
  }
  t.equal(exists, false, 'zip file does not exist'); // .zip does not exist
  t.end()
});

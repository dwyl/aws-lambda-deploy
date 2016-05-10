'use strict';
var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION; // set your Environment Variables...
var lambda = new AWS.Lambda();
var fs = require('fs');                     // so we can read the zip file
var utils = require('../lib/utils');
var base_path = utils.get_base_path();
var pkg = require(base_path + 'package.json');
console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ');
console.log('pkg.lambda_timeout:', pkg.lambda_timeout, ' | pkg.lambda_memory:', pkg.lambda_memory);
console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ');
var version = pkg.version;
var functionName = pkg.name + '-v' + version.substring(0, version.indexOf('.'));
var zip_file_path = process.env.TMPDIR + pkg.name + '.zip';
var assert = require('assert');

module.exports = function upload (callback) {
  lambda.getFunction({ FunctionName: functionName }, function (err, data) {
    if (err) { // if the function does not already exist we create it.
      var CREATE_PARAMS = { // parameters required to CREATE a lambda function
        Code: {
          ZipFile: fs.readFileSync(zip_file_path)
        },
        FunctionName: functionName,
        Description: utils.description(),
        Handler: 'index.handler',
        Role: process.env.AWS_IAM_ROLE,
        MemorySize: pkg.lambda_memory ? parseInt(pkg.lambda_memory, 10) : 128, // https://git.io/vwt5y
        Timeout: pkg.lambda_timeout ? parseInt(pkg.lambda_timeout, 10) : 10,// https://git.io/vrUhn
        Runtime: 'nodejs4.3' // github.com/numo-labs/aws-lambda-deploy/issues/33
      };
      lambda.createFunction(CREATE_PARAMS, callback);
    } else {    // otherwise update the *existing* lambda function:
      // console.log(' - - - - - - - - - - - - - - - lambda.getFunction > data:');
      // console.log(data);
      // console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
      var UPDATE_PARAMS = { // obviously they are different ... duh!
        FunctionName: functionName,
        ZipFile: fs.readFileSync(zip_file_path)
      }; // see: https://git.io/v2JTR
      var UPDATE_CONFIG = { // obviously they are different ... duh!
        FunctionName: functionName,
        Description: utils.description()
      }; // see: https://git.io/v2JTR
      lambda.updateFunctionConfiguration(UPDATE_CONFIG, function (err, data) {
        // console.log(err, data);
        assert(!err);
        lambda.updateFunctionCode(UPDATE_PARAMS, callback);
      });
    }
  });
};

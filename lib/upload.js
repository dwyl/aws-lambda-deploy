'use strict';
var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION; // set your Environment Variables...
var lambda = new AWS.Lambda();
var fs = require('fs');                     // so we can read the zip file
var assert = require('assert');
var utils = require('../lib/utils');
var basepath = utils.getBasepath();

/**
 * upload does exacatly what you expect: uploads your lambda as a .zip to AWS!
 * @param {Object} pkg - the package.json for the function you want to deploy
 * this allows us to have a multi-lambda GitHub Repo or to deploy several Lambdas
 * in one command by specifying the a different package.json for each of them.
 * @param {Function} callback - called once the Lambda has been uploaded
 */
module.exports = function upload (pkg, callback) {
  // if people don't specify the pkg we use the one at the root of their repo
  if (typeof pkg === 'function') {
    callback = pkg;
    pkg = require(basepath + 'package.json'); // require package of the project
  }
  var version = pkg.version;
  var functionName = pkg.name + '-v' + version.substring(0, version.indexOf('.'));
  var zipFilePath = require('path').normalize(process.env.TMPDIR + pkg.name + '.zip');

  lambda.getFunction({ FunctionName: functionName }, function (err, data) {
    if (err) { // if the function does not already exist we create it.
      var CREATE_PARAMS = { // parameters required to CREATE a lambda function
        Code: {
          ZipFile: fs.readFileSync(zipFilePath)
        },
        FunctionName: functionName,
        Description: utils.description(),
        Handler: 'index.handler',
        Role: process.env.AWS_IAM_ROLE,
        MemorySize: pkg.lambda_memory ? parseInt(pkg.lambda_memory, 10) : 128, // https://git.io/vwt5y
        Timeout: pkg.lambda_timeout ? parseInt(pkg.lambda_timeout, 10) : 10,   // https://git.io/vrUhn
        Runtime: 'nodejs4.3' // github.com/numo-labs/aws-lambda-deploy/issues/33
      };
      lambda.createFunction(CREATE_PARAMS, callback);
    } else {    // otherwise update the *existing* lambda function:
      var UPDATE_PARAMS = { // obviously they are different ... duh!
        FunctionName: functionName,
        ZipFile: fs.readFileSync(zipFilePath)
      }; // see: https://git.io/v2JTR
      var UPDATE_CONFIG = { // obviously they are different ... duh!
        FunctionName: functionName,
        Description: utils.description()
      }; // see: https://git.io/v2JTR
      lambda.updateFunctionConfiguration(UPDATE_CONFIG, function (err, data) {
        assert(!err);
        lambda.updateFunctionCode(UPDATE_PARAMS, callback);
      });
    }
  });
};

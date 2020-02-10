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
  if (typeof pkg === 'function') {
    callback = pkg; // if people don't specify pkg use package.json of project
    pkg = require(basepath + 'package.json'); // require package of the project
  }
  lambda.getFunction({ FunctionName: functionName(pkg) }, function (err, data) {
    if (err) { // if the function does not already exist we create it.
      lambda.createFunction(createParams(pkg), callback);
    } else {    // otherwise update the *existing* lambda function:
      updateFunction(pkg, callback);
    }
  });
};

function createParams (pkg) {
  return { // parameters required to CREATE a lambda function
    Code: {
      ZipFile: fs.readFileSync(zipFilePath(pkg))
    },
    FunctionName: functionName(pkg),
    Description: utils.description(),
    Handler: 'index.handler',
    Role: process.env.AWS_IAM_ROLE,
    MemorySize: pkg.lambda_memory ? parseInt(pkg.lambda_memory, 10) : 128, // https://git.io/vwt5y
    Timeout: pkg.lambda_timeout ? parseInt(pkg.lambda_timeout, 10) : 10,   // https://git.io/vrUhn
    Runtime: 'nodejs12.x' // github.com/dwyl/aws-lambda-deploy/issues/65
  };
}

function updateFunction (pkg, callback) {
  var UPDATE_PARAMS = { // obviously they are different ... duh!
    FunctionName: functionName(pkg),
    ZipFile: fs.readFileSync(zipFilePath(pkg))
  }; // see: https://git.io/v2JTR
  var UPDATE_CONFIG = { // obviously they are different ... duh!
    FunctionName: functionName(pkg),
    Description: utils.description()
  }; // see: https://git.io/v2JTR
  lambda.updateFunctionConfiguration(UPDATE_CONFIG, function (err, data) {
    console.log('err:', err);
    assert(!err);
    lambda.updateFunctionCode(UPDATE_PARAMS, callback);
  });
}

function functionName (pkg) {
  const version = pkg.version;
  return pkg.name + '-v' + version.substring(0, version.indexOf('.'));
}

function zipFilePath (pkg) {
  return require('path').normalize(process.env.TMPDIR + pkg.name + '.zip');
}

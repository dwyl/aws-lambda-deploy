'use strict';
const AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION; // set your Environment Variables...
const lambda = new AWS.Lambda();
const fs = require('fs'); // so we can read the zip file
const assert = require('assert');
const utils = require('../lib/utils');
const basepath = utils.getBasepath();

/**
 * upload does exactly what you expect: uploads your lambda as a .zip to AWS!
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
  const FUNCTION_NAME = utils.functionName(pkg);
  lambda.getFunction({ FunctionName: FUNCTION_NAME }, function (err, data) {
    if (err) { // if the function does not already exist we create it.
      return lambda.createFunction(createParams(pkg), callback);
    } else { // otherwise update the *existing* lambda function:
      return updateFunction(pkg, callback);
    }
  });
};

function createParams (pkg) {
  const FUNCTION_NAME = utils.functionName(pkg);
  return { // parameters required to CREATE a lambda function
    Code: {
      ZipFile: fs.readFileSync(zipFilePath(pkg))
    },
    FunctionName: FUNCTION_NAME,
    Description: utils.description(),
    Handler: 'index.handler',
    Role: process.env.AWS_IAM_ROLE,
    MemorySize: pkg.lambda_memory ? parseInt(pkg.lambda_memory, 10) : 512, // https://git.io/vwt5y
    Timeout: pkg.lambda_timeout ? parseInt(pkg.lambda_timeout, 10) : 42, // https://git.io/vrUhn
    Runtime: 'nodejs20.x' // github.com/dwyl/aws-lambda-deploy/issues/85 | 65
  };
}

function updateFunction (pkg, callback) {
  const FUNCTION_NAME = utils.functionName(pkg);
  const UPDATE_PARAMS = { // obviously they are different ... duh!
    FunctionName: FUNCTION_NAME,
    ZipFile: fs.readFileSync(zipFilePath(pkg))
  }; // see: https://git.io/v2JTR
  const UPDATE_CONFIG = { // obviously they are different ... duh!
    FunctionName: FUNCTION_NAME,
    Description: utils.description()
  }; // see: https://git.io/v2JTR
  lambda.updateFunctionConfiguration(UPDATE_CONFIG, function (err, data) {
    assert(!err);
    return lambda.updateFunctionCode(UPDATE_PARAMS, callback);
  });
}

function zipFilePath (pkg) {
  return require('path').normalize(process.env.TMPDIR + pkg.name + '.zip');
}

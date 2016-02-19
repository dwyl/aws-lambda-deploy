var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION; // set your Environment Variables...
var lambda = new AWS.Lambda();
var utils = require('../lib/utils');        // so we can get the base directory
var fs = require('fs');                     // so we can read the zip file
var path = require('path');
var base_path = utils.get_base_path();    // directory of project being deployed
var pkg = require(base_path + '/package.json');
var version = pkg.version;
var functionName = pkg.name + '-v' + version.substring(0, version.indexOf('.'));
var zip_file_name = pkg.name + '.zip';
var zip_file = fs.readFileSync(path.resolve(base_path + '/' + zip_file_name)); // Yes, SYNC!

var CREATE_PARAMS = { // parameters required to CREATE a lambda function
  Code: {
    ZipFile: zip_file
  },
  FunctionName: functionName,
  Handler: 'index.handler',
  Role: process.env.AWS_IAM_ROLE,
  Runtime: 'nodejs'
};

var UPDATE_PARAMS  = { // obviously they are different ... duh!
  FunctionName: functionName,
  ZipFile: zip_file
}; // see: https://git.io/v2JTR

module.exports = function upload(callback) {
  lambda.getFunction({ FunctionName: functionName }, function (err, data) {
    if (err) { // if the function does not already exist we create it.
      lambda.createFunction(CREATE_PARAMS, callback);
    }
    else {    // otherwise update the *existing* lambda function:
      lambda.updateFunctionCode(UPDATE_PARAMS, callback);
    }
  });
}

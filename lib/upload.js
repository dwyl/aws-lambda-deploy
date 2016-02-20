var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION; // set your Environment Variables...
var lambda = new AWS.Lambda();
var fs = require('fs');                     // so we can read the zip file
var base_path = require('../lib/utils').get_base_path();
var pkg = require(base_path + 'package.json');
var version = pkg.version;
var functionName = pkg.name + '-v' + version.substring(0, version.indexOf('.'));
console.log('- - - - - - - - - - - - - - - - - - - - - - -')
console.log('functionName:', functionName);
console.log('- - - - - - - - - - - - - - - - - - - - - - -')
var zip_file_path = process.env.TMPDIR + pkg.name + '.zip';

module.exports = function upload(callback) {
  lambda.getFunction({ FunctionName: functionName }, function (err, data) {
    if (err) { // if the function does not already exist we create it.
      var CREATE_PARAMS = { // parameters required to CREATE a lambda function
        Code: {
          ZipFile: fs.readFileSync(zip_file_path)
        },
        FunctionName: functionName,
        Handler: 'index.handler',
        Role: process.env.AWS_IAM_ROLE,
        Runtime: 'nodejs'
      };
      lambda.createFunction(CREATE_PARAMS, callback);
    }
    else {    // otherwise update the *existing* lambda function:
      var UPDATE_PARAMS  = { // obviously they are different ... duh!
        FunctionName: functionName,
        ZipFile: fs.readFileSync(zip_file_path)
      }; // see: https://git.io/v2JTR
      lambda.updateFunctionCode(UPDATE_PARAMS, callback);
    }
  });
}

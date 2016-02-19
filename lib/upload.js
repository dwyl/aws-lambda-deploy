var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION; // set your Environment Variables...
var lambda = new AWS.Lambda();
var fs = require('fs');                     // so we can read the zip file
var pkg = require(process.env.TMPDIR + 'dist/package.json'); // assumes dist
var version = pkg.version;
var functionName = pkg.name + '-v' + version.substring(0, version.indexOf('.'));
var zip_file_path = process.env.TMPDIR + pkg.name + '.zip';
var zip_file = fs.readFileSync(zip_file_path); // Yes, SYNC!

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

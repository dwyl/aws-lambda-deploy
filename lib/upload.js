var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION;
var lambda = new AWS.Lambda();
var utils = require('../lib/utils'); // so we can get the base directory
var fs = require('fs');
var path = require('path');
var base_path = utils.get_base_path(); // directory of project being deployed
var pkg = require(base_path + '/package.json');
console.log(pkg.name);


function getMajorVersion (version) {
  return version.substring(0, version.indexOf('.'));
}

var functionName = pkg.name + '-v' + getMajorVersion(pkg.version); // ?? not sure...

var zip_file_name = pkg.name + '.zip';
var zip_file = fs.readFileSync(base_path + '/' + zip_file_name); // SYNC!

var CREATE_PARAMS = { // parameters required to CREATE a lambda function
  Code: {
    ZipFile: zip_file
  },
  FunctionName: functionName,
  Handler: 'index.handler',
  Role: process.env.IAM_ROLE,
  Runtime: 'nodejs'
};

var UPDATE_PARAMS  = { // obviously they are different ... duh!
  FunctionName: functionName,
  ZipFile: zip_file
};


function createFunction () {
  lambda.createFunction(CREATE_PARAMS, function (err, data) {
    if (err) console.error(err);
    else {
      console.log('Function ' + functionName + ' has been created.');
    }
  });
}

function updateFunction () {

    lambda.updateFunctionCode(UPDATE_PARAMS, function (err, data) {
      if (err) console.error(err);
      else {
        console.log('Function ' + functionName + ' has been updated.');
        console.log(data);
        console.log('DONE!');
      }
    });
}

function upload(callback) {
  lambda.getFunction({ FunctionName: functionName }, function (err, data) {
    if (err) {
      console.log(err);
      console.log(data);
      createFunction();
    }
    else updateFunction();
  });
}

upload();

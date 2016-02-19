'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');
var copy_files = require('../lib/copy_files');
var install_node_modules = require('../lib/install_node_modules');
var zip = require('../lib/zip');
var upload = require('../lib/upload');

var AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION; // set your Environment Variables...
var lambda = new AWS.Lambda();

var FUNCTION_NAME; // GLOBAL used to delete the function.

describe('upload', function() {

  it('upload the lambda function to S3', function(done) {
    var dist_path = process.env.TMPDIR + 'dist/';
    var files_to_pack = ['package.json', 'lib/', 'index.js'];
    copy_files(files_to_pack, dist_path);
    install_node_modules(dist_path);
    var pkg = require(dist_path + 'package.json');
    var base_path = utils.get_base_path(); // get project root
    var zip_file_name = dist_path + pkg.name + '.zip';

    zip(zip_file_name, dist_path);
    var stat = fs.statSync(zip_file_name);
    // console.log(stat);
    assert(stat.size > 1000000); // the zip is bigger than a megabyte!


    upload(function(err, data){
      // console.log(err);
      console.log('Lambda Function CREATED:')
      console.log(data);
      FUNCTION_NAME = data.FunctionName;
      assert(data.CodeSize > 100000);
      done();
    });
  });

  it('Call upload again to exercise the "updateFunctionCode" branch', function(done) {
    upload(function(err, data){
      console.log('Lambda Function UPDATED:')
      console.log(data);
      assert(data.CodeSize > 100000);
      done();
    });
  });

  it('DELETE the Lambda Function from AWS so we can re-upload it', function(done) {
    lambda.deleteFunction({ FunctionName: FUNCTION_NAME }, function(err, data) {
      assert.equal(err, null);
      done();
    });
  });

});

var AWS = require('aws-sdk');
var gulp = require('gulp');
var babel = require('gulp-babel');
var zip = require('gulp-zip');
var install = require('gulp-install');
var runSequence = require('run-sequence');
var packageJson = require('./package.json');
var region = 'eu-west-1';
var fs = require('fs');

var functionName = packageJson.name + '-v' + getMajorVersion(packageJson.version);

function getMajorVersion (version) {
  return version.substring(0, version.indexOf('.'));
}

var outputName = packageJson.name + '.zip';

// var IAMRole = process.env.IAM_ROLE;

var filesToPack = ['./index.js', './lib/**/*.*'];

/**
 * Adds the project files to the archive folder.
 */
gulp.task('js', function () {
  return gulp.src(filesToPack, {base: './'})
     .pipe(babel({
       presets: ['es2015'],
       plugins: ['transform-runtime']
     }))
     .pipe(gulp.dest('dist/'));
});

/**
 * This task will copy all the required dependencies to
 * the dist folder.
 */
gulp.task('node-mods', function () {
  return gulp.src('./package.json')
    .pipe(gulp.dest('dist/'))
    .pipe(install({production: true}));
});

/**
 * Create an archive based on the dest folder.
 */
gulp.task('zip', function () {
  return gulp.src(['dist/**/*'])
    .pipe(zip(outputName))
    .pipe(gulp.dest('./'));
});

/**
 *  update or create the lambda functon
 */
gulp.task('upload', function () {
  AWS.config.region = region;
  var lambda = new AWS.Lambda();
  var zipFile = './' + outputName;

  lambda.getFunction({ FunctionName: functionName }, function (err, data) {
    if (err) createFunction();
    else updateFunction();
  });

  function createFunction () {
    getZipFile(function (data) {
      var params = {
        Code: {
          ZipFile: data
        },
        FunctionName: functionName,
        Handler: 'index.handler',
        Role: process.env.IAM_ROLE,
        Runtime: 'nodejs'
      };

      lambda.createFunction(params, function (err, data) {
        if (err) console.error(err);
        else {
          console.log('Function ' + functionName + ' has been created.');
        }
      });
    });
  }

  function updateFunction () {
    getZipFile(function (data) {
      var params = {
        FunctionName: functionName,
        ZipFile: data
      };

      lambda.updateFunctionCode(params, function (err, data) {
        if (err) console.error(err);
        else {
          console.log('Function ' + functionName + ' has been updated.');
          console.log(data);
          // after the function has been updated we invoke it!
          testInvoke();
        }
      });
    });
  }

  function getZipFile (next) {
    fs.readFile(zipFile, function (err, data) {
      if (err) console.log(err);
      else {
        next(data);
      }
    });
  }
});

// gulp.task('test-invoke', function () {
function testInvoke () {
  var lambda = new AWS.Lambda();

  var params = {
    FunctionName: functionName,
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: '{ "key1" : "name" }',
    Qualifier: 'ci' // see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#invoke-property
  };

  lambda.getFunction({ FunctionName: functionName }, function (err, data) {
    if (err) console.log('FUNCTION NOT FOUND', err);
    else invokeFunction();
  });

  function invokeFunction () {
    lambda.invoke(params, function (err, data) {
      if (err) console.log(err, err.stack);
      else console.log(data);
    });
  }
}
// });

gulp.task('deploy', function (callback) {
  return runSequence(
    ['js', 'node-mods'],
    ['zip'],
    ['upload'],
    // ['test-invoke'],
    callback
  );
});

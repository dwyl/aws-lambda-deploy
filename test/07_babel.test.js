var fs = require('fs');
var assert = require('assert');
require('decache')('../lib/copy_files'); // need to re-require the file below
var utils = require('../lib/utils');
var base = utils.get_base_path();

var babelrc = {
  presets: ['es2015', 'react'],
  plugins: ['transform-object-rest-spread']
};

describe('Test transpiling code from ES6 to ES5 using Babel', function () {
  before(function (done) {
    fs.writeFileSync(base + '.babelrc', JSON.stringify(babelrc));
    var babel_dir = base + 'babel/';
    fs.mkdirSync(babel_dir); // create temporary dir
    var es6file = fs.readFileSync(base + 'test/fixtures/index.js', 'utf8');
    fs.writeFileSync(babel_dir + 'index.js', es6file);
    var schema = fs.readFileSync(base + 'test/fixtures/schema/index.js', 'utf8');
    fs.mkdirSync(babel_dir + 'schema'); // create temporary nested
    fs.writeFileSync(babel_dir + 'schema/index.js', schema);
    done();
  });

  it('ES6 Babel Test for the JS Hipsters', function (done) {
    var pkg = require(base + 'package.json');
    var files_to_deploy = pkg.files_to_deploy;
    files_to_deploy.push('babel/');
    var copy_files = require('../lib/copy_files');
    copy_files(files_to_deploy);
    // Regression test for: https://github.com/numo-labs/aws-lambda-deploy/issues/21
    var file_path = process.env.TMPDIR + 'dist/babel/index.js'; // deep-nested
    // check that an ES6 File has been transpiled when it is copied
    var babel_str = '_interopRequireDefault(obj)';
    var file_contents = fs.readFileSync(file_path).toString();
    // console.log(file_contents);
    assert(file_contents.indexOf(babel_str) > -1); // confirm transformed
    // require the babel-ified index.js and execute it:
    var handler = require(file_path).handler;
    var context = {};
    context.succeed = function (result) {
      // console.log(result);
      assert.equal(result.message, base);
      done();
    };
    handler({}, context);
  });

  after('remove /babel directory', function (done) {
    // setTimeout(function () { // in case you need to check the files...
    utils.delete_dir_contents(base + 'babel', true);
    fs.unlinkSync(base + '.babelrc'); // delete the temp .babelrc file!
    utils.delete_dir_contents(process.env.TMPDIR + 'dist', true);
    done();
    // }, 10000);
  });
});

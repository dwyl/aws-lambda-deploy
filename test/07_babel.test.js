var fs = require('fs');
var path = require('path');
var assert = require('assert');
require('decache')('../lib/copyfiles'); // need to re-require the file below
var utils = require('../lib/utils');
var base = utils.getBasepath();
var decache = require('decache');
decache('../lib/upload');
decache(base + 'package.json');
decache('../lib/utils');
decache('../lib/copyfiles');

var babelrc = {
  presets: ['es2015', 'react'],
  plugins: ['transform-object-rest-spread']
};

describe('Test transpiling code from ES6 to ES5 using Babel', function () {
  before(function (done) {
    fs.writeFileSync(base + '.babelrc', JSON.stringify(babelrc));
    var babeldir = base + 'babel/';
    fs.mkdirSync(babeldir); // create temporary dir
    var es6file = fs.readFileSync(base + 'test/fixtures/index.js', 'utf8');
    fs.writeFileSync(babeldir + 'index.js', es6file);
    var schema = fs.readFileSync(base + 'test/fixtures/schema/index.js', 'utf8');
    fs.mkdirSync(babeldir + 'schema'); // create temporary nested
    fs.writeFileSync(babeldir + 'schema/index.js', schema);
    done();
  });

  it('ES6 Babel Test for the JS Hipsters', function (done) {
    var pkg = require(base + 'package.json');
    var filestodeploy = pkg['files_to_deploy'];
    filestodeploy.push('babel/');
    var copyfiles = require('../lib/copyfiles');
    copyfiles(filestodeploy);
    // Regression test for: https://github.com/numo-labs/aws-lambda-deploy/issues/21
    var filepath = path.normalize(process.env.TMPDIR + 'dist/babel/index.js'); // deep-nested
    // check that an ES6 File has been transpiled when it is copied
    var babelstr = '_interopRequireDefault(obj)';
    var filecontents = fs.readFileSync(filepath).toString();
    // console.log(filecontents);
    assert(filecontents.indexOf(babelstr) > -1); // confirm transformed
    // require the babel-ified index.js and execute it:
    var handler = require(filepath).handler;
    var context = {};
    context.succeed = function (result) {
      // console.log(result);
      assert.equal(result.message, base);
      done();
    };
    handler({}, context);
  });

  after('remove /babel directory', function (done) {
    utils.deleteDirContents(base + 'babel', true);
    fs.unlinkSync(base + '.babelrc'); // delete the temp .babelrc file!
    utils.deleteDirContents(path.resolve(process.env.TMPDIR, 'dist'), true);
    done();
  });
});

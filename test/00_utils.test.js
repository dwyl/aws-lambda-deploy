require('env2')('.env'); // load environment variables from file if available
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');
var mkdirSync = require('../lib/mkdirSync');

describe('utils.getBasepath', function () {
  it('getBasepath for the project with nested start', function (done) {
    var dir = path.resolve(__dirname, '/../node_modules/aws_sdk/node_modules/sax');
    var parent = path.resolve(__dirname, '/../');
    var base = utils.getBasepath(dir);
    console.log('utils.getBasepath:', base);
    // console.log('parent:',parent);
    assert.equal(base, parent);
    done();
  });

  it('getBasepath for the project without specifying start dir', function (done) {
    var parent = path.join(__dirname, '../');
    var base = utils.getBasepath();
    // console.log('base:',base);
    // console.log('parent:',parent);
    assert.equal(base, parent);
    done();
  });
});

describe('utils.deleteDirContents', function () {
  it('delete existing /dist directory (if there is one)', function (done) {
    console.log('>>>> process.env.TMPDIR', process.env.TMPDIR);
    var distpath = path.normalize(process.env.TMPDIR + 'my_dir');
    var exists = false;
    try {
      utils.deleteDirContents(distpath, true); // completely remove /dist
      exists = fs.statSync(distpath);
    } catch (e) {
      // console.log(e);
    }
    // console.log('exist?', exists);
    assert.equal(exists, false);
    done();
  });

  it('create *NEW* /dist directory', function (done) {
    var distpath = path.normalize(process.env.TMPDIR + 'my_dir');
    console.log('>> distpath:', distpath);
    var res = mkdirSync(distpath); // sync
    assert.equal(distpath, res, 'distpath: ' + distpath);
    done();
  });

  it('attempt to re-create /dist directory again (try/catch branch test)', function (done) {
    var distpath = path.normalize(process.env.TMPDIR + 'my_dir');
    // console.log('>> distpath:',distpath);
    var err = mkdirSync(distpath); // expect to return error
    // console.log(err);
    assert.equal(err.code, 'EEXIST', 'already exists.');
    done();
  });

  it('create a directory *inside* the /dist dir (so we can test deletion)', function (done) {
    var dirpath = path.normalize(process.env.TMPDIR + 'my_dir/node_modules'); // fake node_modules
    // console.log('node_modules path:',dirpath);
    var res = mkdirSync(dirpath); // sync
    assert.equal(dirpath, res, 'node_modules folder created');
    done();
  });

  it('create files *inside* /dist and dist/node_modules dirs to test deletion', function (done) {
    var distpath = path.normalize(process.env.TMPDIR + 'my_dir'); // temporary /dist directory
    var dirpath = distpath + '/node_modules'; // fake node_modules
    var file1 = distpath + '/hello.txt';
    var file2 = dirpath + '/another.txt';
    fs.writeFileSync(file1, 'hello world');
    fs.writeFileSync(file2, 'hello world');
    var exists = false;
    try {
      exists = fs.statSync(file1);
      // console.log(exists);
    } catch (e) {
      console.log(e);
    }
    assert.equal(exists.size, 11, 'file created: ' + file1);
    done();
  });

  it('delete contents of directory but NOT the directory itself', function (done) {
    var distpath = path.normalize(process.env.TMPDIR + 'my_dir'); // temporary /dist directory
    var dirpath = path.normalize(distpath + '/another_dir'); // another_dir to delete shortly
    mkdirSync(dirpath);
    var file1 = path.normalize(distpath + '/picaboo.go');
    var file2 = path.normalize(dirpath + '/anotherfile.doc');
    fs.writeFileSync(file1, 'hello world');
    fs.writeFileSync(file2, 'hello world');
    var stat = false;
    try {
      stat = fs.statSync(file1);
      // console.log(exists);
    } catch (e) {
      console.log(e);
    }
    assert.equal(stat.size, 11, 'file created: ' + file1);
    // now delete the CONTENTS of dirpath but not the dir itself:
    var exists = false;
    try {
      utils.deleteDirContents(dirpath); // no second argument!
      exists = fs.statSync(dirpath);
    } catch (e) {
      // console.log(e);
    }
    assert(exists.size > 0);
    var files = fs.readdirSync(dirpath);
    assert.equal(files.length, 0);
    done();
  });

  it('delete existing /dist directory and all its contents', function (done) {
    var distpath = path.normalize(process.env.TMPDIR + 'my_dir');
    var exists = false;
    try {
      utils.deleteDirContents(distpath, true); // sync
      exists = fs.statSync(distpath);
    } catch (e) {
      // console.log(e);
    }
    assert.equal(exists, false);
    done();
  });

  it('attempt to delete non-existent directory (catch test)', function (done) {
    var distpath = process.env.TMPDIR + 'fakedir';
    var exists = false;
    try {
      utils.deleteDirContents(distpath, true); // sync
      exists = fs.statSync(distpath);
    } catch (e) {
      // console.log(e);
    }
    assert.equal(exists, false);
    done();
  });
});

var git = require('git-rev'); // ONLY used in testing
describe('utils.get_git_hash', function () {
  it('retrieve the latest git hash', function (done) {
    var githash = utils.gitcommithash(); // synchronous
    console.log('githash:', githash);
    git.long(function (hash) {
      assert.equal(githash, hash);
      done();
    });
  });
});

describe('utils.githubcommiturl', function () {
  it('retrieve the latest git hash', function (done) {
    var githuburl = utils.githubcommiturl(); // synchronous
    console.log('githuburl:', githuburl);
    git.long(function (hash) {
      var pkg = require(utils.getBasepath() + 'package.json');
      var url = pkg.repository.url.replace('git+', '').replace('.git', '');
      var gurl = url + '/commit/' + hash;
      assert.equal(githuburl, gurl);
      done();
    });
  });
});

describe('utils.description', function () {
  it('retrieve the description for the lambda', function (done) {
    var pkg = require(utils.getBasepath() + 'package.json');
    var url = utils.githubcommiturl(); // synchronous
    var description = utils.description();
    console.log('description:', description);
    git.long(function (hash) {
      var expected = pkg.description + ' | ' + url;
      assert.equal(description, expected);
      done();
    });
  });
});

describe('utils.makeEnvFile', function () {
  it('create an .env file based on the current environment variables', function (done) {
    var base = utils.getTargetPath();
    console.log('>> utils.makeEnvFile base:', base);
    mkdirSync(base);
    utils.makeEnvFile();
    var dir = fs.readdirSync(path.normalize(base));
    console.log('DIR:', dir);
    var envfile = fs.readFileSync(path.resolve(base + '.env'), 'utf8');
    // console.log(env_file.split('\n').length);
    // console.log(' - - - - - - - - - - - - - - - ');
    // console.log(env_file);
    // console.log(' - - - - - - - - - - - - - - - ');
    assert(envfile.indexOf('AWS_REGION') > -1);
    done();
  });
});

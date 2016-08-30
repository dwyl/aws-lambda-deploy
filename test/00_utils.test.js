require('env2')('.env'); // load environment variables from file if available
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');
var mkdirSync = require('../lib/mkdirSync');

describe('utils.getBasepath', function () {
  it('getBasepath for the project with nested start', function (done) {
    var dir = path.resolve(__dirname + '/../node_modules/aws_sdk/node_modules/sax');
    var parent = path.resolve(__dirname + '/../') + '/';
    var base = utils.getBasepath(dir);
    // console.log('base:',base);
    assert.equal(base, parent);
    done();
  });

  it('getBasepath for the project without specifying start dir', function (done) {
    var parent = path.resolve(__dirname + '/../') + '/';
    var base = utils.getBasepath();
    // console.log('base:',base);
    assert.equal(base, parent);
    done();
  });
});

describe('utils.delete_dir_contents', function () {
  it('delete existing /dist directory (if there is one)', function (done) {
    var distpath = process.env.TMPDIR + 'my_dir';
    var exists = false;
    try {
      utils.delete_dir_contents(distpath, true); // completely remove /dist
      exists = fs.statSync(distpath);
    } catch (e) {
      // console.log(e);
    }
    // console.log('exist?', exists);
    assert.equal(exists, false);
    done();
  });

  it('create *NEW* /dist directory', function (done) {
    var distpath = process.env.TMPDIR + 'my_dir';
    // console.log('>> distpath:',distpath);
    var res = mkdirSync(distpath); // sync
    assert.equal(distpath, res, 'distpath: ' + distpath);
    done();
  });

  it('attempt to re-create /dist directory again (try/catch branch test)', function (done) {
    var distpath = process.env.TMPDIR + 'my_dir';
    // console.log('>> distpath:',distpath);
    var err = mkdirSync(distpath); // expect to return error
    // console.log(err);
    assert.equal(err.code, 'EEXIST', 'already exists.');
    done();
  });

  it('create a directory *inside* the /dist dir (so we can test deletion)', function (done) {
    var dirpath = process.env.TMPDIR + 'my_dir/node_modules'; // fake node_modules
    // console.log('node_modules path:',dirpath);
    var res = mkdirSync(dirpath); // sync
    assert.equal(dirpath, res, 'node_modules folder created');
    done();
  });

  it('create files *inside* /dist and dist/node_modules dirs to test deletion', function (done) {
    var distpath = process.env.TMPDIR + 'my_dir'; // temporary /dist directory
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
    var distpath = process.env.TMPDIR + 'my_dir'; // temporary /dist directory
    var dirpath = distpath + '/another_dir'; // another_dir to delete shortly
    mkdirSync(dirpath);
    var file1 = distpath + '/picaboo.go';
    var file2 = dirpath + '/anotherfile.doc';
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
      utils.delete_dir_contents(dirpath); // no second argument!
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
    var distpath = process.env.TMPDIR + 'my_dir';
    var exists = false;
    try {
      utils.delete_dir_contents(distpath, true); // sync
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
      utils.delete_dir_contents(distpath, true); // sync
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
    var git_hash = utils.git_commit_hash(); // synchronous
    console.log('git_hash:', git_hash);
    git.long(function (hash) {
      assert.equal(git_hash, hash);
      done();
    });
  });
});

describe('utils.github_commit_url', function () {
  it('retrieve the latest git hash', function (done) {
    var github_url = utils.github_commit_url(); // synchronous
    console.log('github_url:', github_url);
    git.long(function (hash) {
      var pkg = require(utils.getBasepath() + 'package.json');
      var url = pkg.repository.url.replace('git+', '').replace('.git', '');
      var gurl = url + '/commit/' + hash;
      assert.equal(github_url, gurl);
      done();
    });
  });
});

describe('utils.description', function () {
  it('retrieve the description for the lambda', function (done) {
    var pkg = require(utils.getBasepath() + 'package.json');
    var url = utils.github_commit_url(); // synchronous
    var description = utils.description();
    console.log('description:', description);
    git.long(function (hash) {
      var expected = pkg.description + ' | ' + url;
      assert.equal(description, expected);
      done();
    });
  });
});

describe('utils.make_env_file', function () {
  it('create an .env file based on the current environment variables', function (done) {
    var base = utils.get_target_path();
    mkdirSync(base);
    utils.make_env_file();
    console.log('basepath');
    var dir = fs.readdirSync(base);
    console.log('DIR:', dir);
    var env_file = fs.readFileSync(base + '.env', 'utf8');
    // console.log(env_file.split('\n').length);
    // console.log(' - - - - - - - - - - - - - - - ');
    // console.log(env_file);
    // console.log(' - - - - - - - - - - - - - - - ');
    assert(env_file.indexOf('AWS_REGION') > -1);
    done();
  });
});

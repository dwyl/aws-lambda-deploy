require('env2')('.env'); // load environment variables from file if available
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const utils = require('../lib/utils');
const mkdirSync = require('../lib/mkdirSync');

describe('utils.getBasepath', function () {
  it('getBasepath for the project with nested start', function (done) {
    const dir = path.resolve(__dirname, '/../node_modules/aws_sdk/node_modules/sax');
    const parent = path.resolve(__dirname, '/../');
    const base = utils.getBasepath(dir);
    console.log('utils.getBasepath:', base);
    // console.log('parent:',parent);
    assert.strictEqual(base, parent);
    done();
  });

  it('getBasepath for the project without specifying start dir', function (done) {
    const parent = path.join(__dirname, '../');
    const base = utils.getBasepath();
    // console.log('base:',base);
    // console.log('parent:',parent);
    assert.strictEqual(base, parent);
    done();
  });
});

describe('utils.deleteDirContents', function () {
  it('delete existing /dist directory (if there is one)', function (done) {
    console.log('>>>> process.env.TMPDIR', process.env.TMPDIR);
    const distpath = path.normalize(process.env.TMPDIR + 'my_dir');
    let exists = false;
    try {
      utils.deleteDirContents(distpath, true); // completely remove /dist
      exists = fs.statSync(distpath);
    } catch (e) {
      // console.log(e);
    }
    // console.log('exist?', exists);
    assert.strictEqual(exists, false);
    done();
  });

  it('create *NEW* /dist directory', function (done) {
    const distpath = path.normalize(process.env.TMPDIR + 'my_dir');
    console.log('>> distpath:', distpath);
    const res = mkdirSync(distpath); // sync
    assert.strictEqual(distpath, res, 'distpath: ' + distpath);
    done();
  });

  it('attempt to re-create /dist directory again (try/catch branch test)', function (done) {
    const distpath = path.normalize(process.env.TMPDIR + 'my_dir');
    // console.log('>> distpath:',distpath);
    const err = mkdirSync(distpath); // expect to return error
    // console.log(err);
    assert.strictEqual(err.code, 'EEXIST', 'already exists.');
    done();
  });

  it('create a directory *inside* the /dist dir (so we can test deletion)', function (done) {
    const dirpath = path.normalize(process.env.TMPDIR + 'my_dir/node_modules'); // fake node_modules
    // console.log('node_modules path:',dirpath);
    const res = mkdirSync(dirpath); // sync
    assert.strictEqual(dirpath, res, 'node_modules folder created');
    done();
  });

  it('create files *inside* /dist and dist/node_modules dirs to test deletion', function (done) {
    const distpath = path.normalize(process.env.TMPDIR + 'my_dir'); // temporary /dist directory
    const dirpath = distpath + '/node_modules'; // fake node_modules
    const file1 = distpath + '/hello.txt';
    const file2 = dirpath + '/another.txt';
    fs.writeFileSync(file1, 'hello world');
    fs.writeFileSync(file2, 'hello world');
    let exists = false;
    try {
      exists = fs.statSync(file1);
      // console.log(exists);
    } catch (e) {
      console.log(e);
    }
    assert.strictEqual(exists.size, 11, 'file created: ' + file1);
    done();
  });

  it('delete contents of directory but NOT the directory itself', function (done) {
    const distpath = path.normalize(process.env.TMPDIR + 'my_dir'); // temporary /dist directory
    const dirpath = path.normalize(distpath + '/another_dir'); // another_dir to delete shortly
    mkdirSync(dirpath);
    const file1 = path.normalize(distpath + '/picaboo.go');
    const file2 = path.normalize(dirpath + '/anotherfile.doc');
    fs.writeFileSync(file1, 'hello world');
    fs.writeFileSync(file2, 'hello world');
    let stat = false;
    try {
      stat = fs.statSync(file1);
      // console.log(exists);
    } catch (e) {
      console.log(e);
    }
    assert.strictEqual(stat.size, 11, 'file created: ' + file1);
    // now delete the CONTENTS of dirpath but not the dir itself:
    let exists = false;
    try {
      utils.deleteDirContents(dirpath); // no second argument!
      exists = fs.statSync(dirpath);
    } catch (e) {
      // console.log(e);
    }
    assert(exists.size > 0);
    const files = fs.readdirSync(dirpath);
    assert.strictEqual(files.length, 0);
    done();
  });

  it('delete existing /dist directory and all its contents', function (done) {
    const distpath = path.normalize(process.env.TMPDIR + 'my_dir');
    let exists = false;
    try {
      utils.deleteDirContents(distpath, true); // sync
      exists = fs.statSync(distpath);
    } catch (e) {
      // console.log(e);
    }
    assert.strictEqual(exists, false);
    done();
  });

  it('attempt to delete non-existent directory (catch test)', function (done) {
    const distpath = process.env.TMPDIR + 'fakedir';
    let exists = false;
    try {
      utils.deleteDirContents(distpath, true); // sync
      exists = fs.statSync(distpath);
    } catch (e) {
      // console.log(e);
    }
    assert.strictEqual(exists, false);
    done();
  });
});

const git = require('git-rev'); // ONLY used in testing
describe('utils.get_git_hash', function () {
  it('retrieve the latest git hash', function (done) {
    const githash = utils.gitcommithash(); // synchronous
    console.log('githash:', githash);
    git.long(function (hash) {
      assert.strictEqual(githash, hash);
      done();
    });
  });
});

describe('utils.githubcommiturl', function () {
  it('retrieve the latest git hash', function (done) {
    const githuburl = utils.githubcommiturl(); // synchronous
    console.log('githuburl:', githuburl);
    git.long(function (hash) {
      const pkg = require(utils.getBasepath() + 'package.json');
      const url = pkg.repository.url.replace('git+', '').replace('.git', '');
      const gurl = url + '/commit/' + hash;
      assert.strictEqual(githuburl, gurl);
      done();
    });
  });
});

describe('utils.description', function () {
  it('retrieve the description for the lambda', function (done) {
    const pkg = require(utils.getBasepath() + 'package.json');
    const url = utils.githubcommiturl(); // synchronous
    const description = utils.description();
    console.log('description:', description);
    git.long(function (hash) {
      var expected = pkg.description + ' | ' + url;
      assert.strictEqual(description, expected);
      done();
    });
  });
});

describe('utils.makeEnvFile', function () {
  it('create an .env file based on the current environment variables', function (done) {
    const base = utils.getTargetPath();
    console.log('>> utils.makeEnvFile base:', base);
    mkdirSync(base);
    utils.makeEnvFile();
    const dir = fs.readdirSync(path.normalize(base));
    console.log('DIR:', dir);
    const envfile = fs.readFileSync(path.resolve(base + '.env'), 'utf8');
    // console.log(env_file.split('\n').length);
    // console.log(' - - - - - - - - - - - - - - - ');
    // console.log(env_file);
    // console.log(' - - - - - - - - - - - - - - - ');
    assert(envfile.indexOf('AWS_REGION') > -1);
    done();
  });
});

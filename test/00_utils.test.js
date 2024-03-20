require('env2')('.env'); // load environment variables from file if available
const test = require('tape');
const fs = require('fs');
const path = require('path');
const utils = require('../lib/utils');
const mkdirSync = require('../lib/mkdirSync');

test('getBasepath for the project with nested start', async function (t) {
  const dir = path.resolve(__dirname, '/../node_modules/aws_sdk/node_modules/sax');
  const parent = path.resolve(__dirname, '/../');
  const base = utils.getBasepath(dir);
  console.log('utils.getBasepath:', base);
  // console.log('parent:',parent);
  t.equal(base, parent);
  t.end();
});

test('getBasepath for the project without specifying start dir', async function (t) {
  const parent = path.join(__dirname, '../');
  const base = utils.getBasepath();
  // console.log('base:',base);
  // console.log('parent:',parent);
  t.equal(base, parent);
  t.end();
});

test('delete existing /dist directory (if there is one)', async function (t) {
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
  t.equal(exists, false);
  t.end();
});

test('create *NEW* /dist directory', function (t) {
  const distpath = path.normalize(process.env.TMPDIR + 'my_dir');
  console.log('>> distpath:', distpath);
  const res = mkdirSync(distpath); // sync
  t.equal(distpath, res, 'distpath: ' + distpath);
  t.end();
});

test('re-create /dist directory again (try/catch branch test)', async function (t) {
  const distpath = path.normalize(process.env.TMPDIR + 'my_dir');
  // console.log('>> distpath:',distpath);
  const err = mkdirSync(distpath); // expect to return error
  // console.log(err);
  t.equal(err.code, 'EEXIST', 'already exists.');
  t.end();
});

test('create a directory *inside* /dist dir (test deletion)', async function (t) {
  const dirpath = path.normalize(process.env.TMPDIR + 'my_dir/node_modules'); // fake node_modules
  // console.log('node_modules path:',dirpath);
  const res = mkdirSync(dirpath); // sync
  t.equal(dirpath, res, 'node_modules folder created');
  t.end();
});

test('create files *inside* /dist and dist/node_modules dirs to test deletion', async function (t) {
  const distpath = path.normalize(process.env.TMPDIR + 'my_dir'); // temp /dist
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
  t.equal(exists.size, 11, 'file created: ' + file1);
  t.end();
});

test('delete contents of dir but NOT the dir itself', async function (t) {
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
  t.equal(stat.size, 11, 'file created: ' + file1);
  // now delete the CONTENTS of dirpath but not the dir itself:
  let exists = false;
  try {
    utils.deleteDirContents(dirpath); // no second argument!
    exists = fs.statSync(dirpath);
  } catch (e) {
    // console.log(e);
  }
  t.ok(exists.size > 0, 'exists.size: ' + exists.size);
  const files = fs.readdirSync(dirpath);
  t.equal(files.length, 0, 'files.lengt: ' + files.length);
  t.end();
});

test('delete existing /dist directory and all its contents', async function (t) {
  t.plan(1);
  const distpath = path.normalize(process.env.TMPDIR + 'my_dir');
  let exists = false;
  try {
    utils.deleteDirContents(distpath, true); // sync
    exists = fs.statSync(distpath);
  } catch (e) {
    // console.log(e);
  }
  t.equal(exists, false);
  // t.end();
});

test('attempt to delete non-existent directory (catch test)', async function (t) {
  t.plan(1);
  const distpath = process.env.TMPDIR + 'fakedir';
  let exists = false;
  try {
    utils.deleteDirContents(distpath, true); // sync
    exists = fs.statSync(distpath);
    console.log(exists);
  } catch (e) {
    console.log('utils.deleteDirContents', distpath, e);
  }
  t.equal(exists, false);
  // t.end();
});

const git = require('git-rev'); // ONLY used in testing
test('retrieve the latest git hash', async function (t) {
  // t.plan(1);
  const githash = utils.gitcommithash(); // synchronous
  console.log('githash:', githash);
  git.long(function (hash) {
    console.log(githash, hash);
    // t.equal(githash, hash);
    // t.end();
  });
});

test('utils.githubcommiturl > retrieve the latest git hash', async function (t) {
  // t.plan(1);
  const githuburl = utils.githubcommiturl(); // synchronous
  console.log('githuburl:', githuburl);
  git.long(function (hash) {
    const pkg = require(utils.getBasepath() + 'package.json');
    const url = pkg.repository.url.replace('git+', '').replace('.git', '');
    const gurl = url + '/commit/' + hash;
    console.log('githuburl:', githuburl, gurl);
    // t.equal(githuburl, gurl);
    // t.end();
  });
});

test('utils.description retrieve description for the lambda', async function (t) {
  // t.plan(1);
  const pkg = require(utils.getBasepath() + 'package.json');
  const url = utils.githubcommiturl(); // synchronous
  const description = utils.description();
  console.log('description:', description);
  git.long(function (hash) {
    const expected = pkg.description + ' | ' + url;
    console.log('description:', description, expected);

    // t.equal(description, expected);
    // t.end()
  });
});

test('utils.makeEnvFile create .env file based on current env vars', async function (t) {
  // t.plan(1);
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
  t.ok(envfile.indexOf('AWS_REGION') > -1);
  // t.end();
});

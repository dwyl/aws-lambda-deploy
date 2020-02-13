'use strict';
const test = require('tape');
const fs = require('fs');
const path = require('path');
const utils = require('../lib/utils');
const basepath = utils.getBasepath();
const copyfiles = require('../lib/copyfiles');
const installnodemodules = require('../lib/install_node_modules');
const pkg = require(basepath + 'package.json');
const zip = require('../lib/zip');

function cleanUp () {
  try { // delete unzipped completely
    utils.deleteDirContents(path.join(process.env.TMPDIR, 'unzipped'), true);
    utils.cleanUp();
  } catch (e) {
    /* ignore */
  }
}

test('zip the /dist directory', async function (t) {
  cleanUp()
  copyfiles(); // setup /dist
  installnodemodules();
  const zipfilepath = path.normalize(process.env.TMPDIR + pkg.name + '.zip');
  zip();
  const stat = fs.statSync(zipfilepath);
  t.ok(stat.size > 1000000, 'stat.size: ' + stat.size); // zip > 1mb
  t.end();
});

test(' unzip the package and confirm the package.json is intact', async function (t) {
  zip.unzip();
  const unzipped = path.normalize(process.env.TMPDIR + '/unzipped');
  const unzippedutils = require(path.normalize(unzipped + '/lib/utils'));
  t.equal(JSON.stringify(utils), JSON.stringify(unzippedutils));
  cleanUp()
  t.end();
});

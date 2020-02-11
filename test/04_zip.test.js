'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const utils = require('../lib/utils');
const basepath = utils.getBasepath();
const copyfiles = require('../lib/copyfiles');
const installnodemodules = require('../lib/install_node_modules');
const pkg = require(basepath + 'package.json');
const zip = require('../lib/zip');

describe('zip', function () {
  before(() => {
    try { // delete unzipped completely
      utils.deleteDirContents(path.join(process.env.TMPDIR, 'unzipped'), true);
      utils.cleanUp();
    } catch (e) {
      /* ignore */
    }
  });

  after(() => { // delete unzipped completely
    utils.deleteDirContents(path.join(process.env.TMPDIR, 'unzipped'), true);
    try {
      utils.cleanUp();
    } catch (e) {
      /* ignore */
    }
  });

  it('zip the /dist directory', function (done) {
    copyfiles(); // setup /dist
    installnodemodules();
    const zipfilepath = path.normalize(process.env.TMPDIR + pkg.name + '.zip');
    zip();
    const stat = fs.statSync(zipfilepath);
    assert(stat.size > 1000000); // the zip is bigger than a megabyte!
    done();
  });

  it(' unzip the package and confirm the package.json is intact', function (done) {
    zip.unzip();
    const unzipped = path.normalize(process.env.TMPDIR + '/unzipped');
    const unzippedutils = require(path.normalize(unzipped + '/lib/utils'));
    assert.strictEqual(JSON.stringify(utils), JSON.stringify(unzippedutils));
    done();
  });
});

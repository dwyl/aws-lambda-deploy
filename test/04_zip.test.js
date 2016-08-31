'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');
var basepath = utils.getBasepath();
var copyfiles = require('../lib/copyfiles');
var installnodemodules = require('../lib/install_node_modules');
var pkg = require(basepath + 'package.json');
var zip = require('../lib/zip');

describe('zip', function () {
  before(() => {
    utils.deleteDirContents(path.join(process.env.TMPDIR, 'unzipped'), true);   // delete unzipped completely
    try {
      utils.cleanUp();
    } catch (e) {
      /* ignore */
    }
  });

  after(() => {
    utils.deleteDirContents(path.join(process.env.TMPDIR, 'unzipped'), true);   // delete unzipped completely
    try {
      utils.cleanUp();
    } catch (e) {
      /* ignore */
    }
  });

  it('zip the /dist directory', function (done) {
    copyfiles(); // setup /dist
    installnodemodules();
    var zipfilepath = path.normalize(process.env.TMPDIR + pkg.name + '.zip');
    zip();
    var stat = fs.statSync(zipfilepath);
    assert(stat.size > 1000000); // the zip is bigger than a megabyte!
    done();
  });

  it(' unzip the package and confirm the package.json is intact', function (done) {
    zip.unzip();
    var unzipped = path.normalize(process.env.TMPDIR + '/unzipped');
    var unzippedutils = require(path.normalize(unzipped + '/lib/utils'));
    assert.equal(JSON.stringify(utils), JSON.stringify(unzippedutils));
    done();
  });
});

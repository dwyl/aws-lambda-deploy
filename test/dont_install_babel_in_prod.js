// adding babel support to dpl means 200 MB of additional dependencies. see:
// https://github.com/numo-labs/aws-lambda-deploy/issues/23#issuecomment-188792991
module.exports = function () {
  var dist_pkg_path = process.env.TMPDIR + 'dist/package.json';
  var dist_pkg = require(dist_pkg_path);
  dist_pkg.dependencies = { 'aws-sdk': '*' };
  var fs = require('fs');
  fs.writeFileSync(dist_pkg_path, JSON.stringify(dist_pkg)); // without babel
};

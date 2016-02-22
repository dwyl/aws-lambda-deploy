
require('./test/00_env.test.js');
require('./lib/copy_files')();
require('./lib/install_node_modules')();
require('./lib/zip')();
var upload = require('./lib/upload');
upload(function (err, data) {
  console.log('Err:', err);
  console.log('Lambda Function:');
  console.log(data);
});

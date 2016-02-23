require('./test/00_env.test.js');
var dpl = require('./lib');
dpl.copy_files();
dpl.install_node_modules();
dpl.zip();
dpl.upload(function (err, data) {
  console.log('Err:', err);
  console.log('Lambda Function:');
  console.log(data);
});

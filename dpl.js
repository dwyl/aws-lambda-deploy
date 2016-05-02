require('env2')('.env');
require('./test/00_env.test.js');
var dpl = require('./lib/index.js');
dpl.copy_files();                    // copy required files & dirs
dpl.install_node_modules();          // install only production node_modules
dpl.zip();                           // zip the /dist directory
dpl.upload(function (err, data) {    // upload the .zip file to AWS:
  if (err) {
    console.log('- - -  - - - - - - - - - - - - - - - - - - - - DEPLOY ERROR');
    console.log(err);
    console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
  }
  console.log('Lambda Function:');
  console.log(data);
  dpl.utils.clean_up();              // delete /dist and .zip file for next time
});

var start = Date.now();
require('./test/00_env.test.js'); // check if AWS keys are set
var dpl = require('./lib/index.js');
var pkg = require(dpl.utils.get_base_path() + 'package.json');
dpl.copy_files();                    // copy required files & dirs
if (pkg.files_to_deploy.indexOf('.env') > -1) {
  dpl.utils.make_env_file(); // github.com/numo-labs/aws-lambda-deploy/issues/31
}
dpl.install_node_modules();          // install only production node_modules
dpl.zip();                           // zip the /dist directory
dpl.upload(function (err, data) {    // upload the .zip file to AWS:
  var exitcode = 0;
  if (err) {
    console.log('- - -  - - - - - - - - - - - - - - - - - - - - DEPLOY ERROR');
    console.log(err);
    console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    exitcode = 1;
  } else {
    console.log('- - - - - - - - > Lambda Function Deployed:');
    console.log(data);
    console.log('- - - - - - - - > took', (Date.now() - start) / 1000, 'seconds');
  }
  dpl.utils.clean_up();              // delete /dist and .zip file for next time
  process.exit(exitcode);
});

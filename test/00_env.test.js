require('env2')('.env'); // load environment variables from file if available
if (typeof process.env.TMPDIR === 'undefined') { // This is for CODSHIP!!!
  var path = require('path');
  process.env.TMPDIR = path.resolve(__dirname, '/../') + '/';
} else {
  console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
  console.log('| process.env.TMPDIR:', process.env.TMPDIR);
  console.log('| where dpl will temporarily store the Lambda Function zip file.');
} // see: https://github.com/numo-labs/aws-lambda-deploy/issues/6

if (typeof process.env.AWS_REGION === 'undefined') {
  console.log('| AWS_REGION environment variable not set!', process.env.AWS_REGION);
}

if (typeof process.env.AWS_IAM_ROLE === 'undefined') {
  console.log('| AWS_IAM_ROLE environment variable not set!', process.env.AWS_IAM_ROLE);
}

console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');

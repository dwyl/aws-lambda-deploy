if(typeof process.env.TMPDIR === 'undefined') { // This is for CODSHIP!!!
  var path = require('path');
  process.env.TMPDIR = path.resolve(__dirname + '/../') + '/';
} // see: https://github.com/numo-labs/aws-lambda-deploy/issues/6

console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
console.log('| process.env.TMPDIR (is set to):', process.env.TMPDIR);
console.log('| That is where the Lambda Function zip file will be temporarily stored')
console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');

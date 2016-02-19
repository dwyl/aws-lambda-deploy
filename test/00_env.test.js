if(typeof process.env.TMPDIR === 'undefined') { // CODSHIP!!!
  var path = require('path');
  process.env.TMPDIR = path.resolve(__dirname + '/../') + '/';
} // see: https://github.com/numo-labs/aws-lambda-deploy/issues/6

console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - ');
console.log('TMPDIR (set to):', process.env.TMPDIR);
console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - ');

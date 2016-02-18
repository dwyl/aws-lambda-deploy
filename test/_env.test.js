console.log(process.env);


if(typeof process.env.TMPDIR === 'undefined') {
  var path = require('path');
  process.env.TMPDIR = path.resolve(__dirname + '/../') + '/';
}

console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - ');
console.log('TMPDIR (set to):', process.env.TMPDIR);

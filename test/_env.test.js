console.log(process.env);


if(typeof process.env.TMPDIR === 'undefined') {
  process.env.TMPDIR = __dirname + 'dist/'
}

console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - ');
console.log('TMPDIR (set to):', process.env.TMPDIR);

var path = require('path');
var aguid = require('aguid');
var fs = require('fs');

console.log(' - - - - - - - - - - - - - - - - - - - - - - ');
console.log(process);
console.log(' - - - - - - - - - - - - - - - - - - - - - - ');
console.log('__dirname:', __dirname);
console.log(' - - - - - - - - - - - - - - - - - - - - - - ');
console.log('process.cwd():', process.cwd());
console.log(' - - - - - - - - - - - - - - - - - - - - - - ');

var utils = require('../lib/utils');
console.log('utils.getBasepath(process.cwd())', utils.getBasepath(process.cwd()));
console.log(' - - - - - - - - - - - - - - - - - - - - - - ');
console.log('utils.getBasepath()', utils.getBasepath());
console.log(' - - - - - - - - - - - - - - - - - - - - - - ');

console.log('process.env.TMPDIR:', process.env.TMPDIR, '(BEFORE)');
console.log(' - - - - - - - - - - - - - - - - - - - - - - ');
process.env.TMPDIR = process.env.TMPDIR || path.resolve(process.cwd(), '../') + '/';
console.log('process.env.TMPDIR:', process.env.TMPDIR, '(SET)');
console.log(' - - - - - - - - - - - - - - - - - - - - - - ');

console.log('utils.getTargetPath()', utils.getTargetPath());
console.log(' - - - - - - - - - - - - - - - - - - - - - - ');

var mkdirSync = require('../lib/mkdirSync');

var distpath = path.normalize(process.env.TMPDIR + '/' + aguid() + '/');
var res = mkdirSync(distpath); // sync
console.log('mkdirSync(distpath)', res);
console.log(' - - - - - - - - - - - - - - - - - - - - - - ');

var filepath = path.normalize(distpath + 'process.env.json');
console.log('filepath:', filepath);
fs.writeFileSync(filepath, JSON.stringify(process.env, null, 2));
console.log(' - - - - - - - - - - - - - - - - - - - - - - ');
console.log('fs.statSync(distpath):', fs.statSync(distpath));

console.log(' - - - - - - - - - - - - - - - - - - - - - - ');
var files = fs.readdirSync(distpath);
console.log('fs.readdirSync(distpath):', files);
console.log(' - - - - - - - - - - - - - - - - - - - - - - ');

var filecontents = fs.readFileSync(path.resolve(distpath, files[0]));
console.log(files[0], 'contains:', filecontents.toString());
console.log(' - - - - - - - - - - - - - - - - - - - - - - ');

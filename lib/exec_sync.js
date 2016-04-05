'use strict';
var child_process = require('child_process');
var fs = require('fs');

function exec_sync (command) { // borrowed from shelljs
  console.log(command);
  // Run the command in a subshell
  var log = ' 2>&1 1>output && echo done! > done'; // WTF is 2>&1 1> ?!?
  // http://stackoverflow.com/questions/818255/in-the-shell-what-does-21-mean

  child_process.exec(command + log); // run the command and output

  // Block the event loop until the command has executed.
  while (!fs.existsSync('done')) { // don't worry this only takes a few ms.
  // Do nothing
  }
  var output = fs.readFileSync('output', 'utf8');
  console.log(output);
  // Delete temporary files.
  fs.unlinkSync('output');
  fs.unlinkSync('done');
  return output; // in case we *want* the output log
}

module.exports = exec_sync;

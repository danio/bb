"use strict";

var execSync = require('child_process').execSync;

function createCommandProcessor(command) {
  var workingDir = this;
  var processor = function() {
    try {
      console.log(command);
      execSync(command, {'cwd': workingDir});
      return true;
    }
    catch(err) {
      console.log(String(err.stdout))
      console.log(err.cmd, 'Failed with error', err.status);
      return false;
    }
  };
  return processor;
}

exports.createCommandProcessors = function(commands, workingDir) {
  return commands.map(createCommandProcessor, workingDir);
}

"use strict";

function createCommandProcessor(command) {
  var sourceDir = this;
  var processor = function() {
    var exec = require('child_process').execSync;
    try {
      console.log(command);
      exec(command, {'cwd': sourceDir});
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

exports.createCommandProcessors = function(commands, sourceDir) {
  return commands.map(createCommandProcessor, sourceDir);
}

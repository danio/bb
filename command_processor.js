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

function createTypedCommandProcessor(command_pair) {
  var workingDir = this;
  var processor = function() {
    var command_type = command_pair[0];
    try {
      var command = command_pair[1];
      console.log(command);
      execSync(command, {'cwd': workingDir});
      return true;
    }
    catch(err) {
      if (command_type == 'out') {
        console.log(String(err.stdout))
      }
      console.log(err.cmd, 'Failed with error', err.status);
      return false;
    }
  };
  return processor;
}

exports.createTypedCommandProcessors = function(commands, workingDir) {
  return commands.map(createTypedCommandProcessor, workingDir);
}

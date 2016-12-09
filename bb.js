"use strict";

var _ = require('underscore');
// add timestamps in front of log messages
require('console-stamp')(console, 'HH:MM:ss');

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
var prog_args = process.argv.slice(2);
var source_dir = prog_args[0];
console.log(source_dir)

var commands = [
  'bash ../Script/CheckCode.sh',
  'nosetests --attr=!slow',
  'behave -k --tags=~skip IntegrationTest/ -t ~@slow',
  'nosetests --attr=slow,!glacial',
  'nosetests --attr=glacial',
  'behave -k --tags=~skip IntegrationTest/ -t @slow'
];

var chokidar = require('chokidar');
var watcher = chokidar.watch(source_dir, {ignored: /^\.|node_modules|\_pycache|.vs/, persistent: true});
var paths = [];
watcher
  .on('add', function(path) {handleChange(path, 'added');})
  .on('change', function(path) {handleChange(path, 'changed');})
  .on('unlink', function(path) {handleChange(path, 'removed');})
  .on('error', function(error) {console.error('Error happened', error);})

function handleChange(path, change_type) {
  //console.log('File', path, 'has been', change_type);
  paths.push(path);
  var pathsAtStart = paths.slice();
  // Note that paths isn't captured until the timeout has elapsed
  setTimeout(function(){
    if (_.isEqual(pathsAtStart, paths)) {
      processChange(paths);
      paths = [];
    }
  }, 100);
}

function processChange(paths) {
  console.log('Processing due to change in', paths);
  var exec = require('child_process').execSync;
  try {
    commands.forEach(function(command) {
      console.log(command);
      var result = exec(command, {'cwd': source_dir});
    });
    console.log('All steps completed successfully');
  }
  catch(err) {
    console.log(String(err.stdout))
    console.log(err.cmd, 'Failed with error', err.status);
  }
}

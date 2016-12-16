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
  'nosetests -s --attr=!slow',
  'behave -k --tags=~skip IntegrationTest/ -t ~@slow',
  'nosetests -s --attr=slow,!glacial',
  'nosetests -s --attr=glacial',
  'behave -k --tags=~skip IntegrationTest/ -t @slow'
];

var chokidar = require('chokidar');
var watcher = chokidar.watch(source_dir, {ignored: /^\.|node_modules|\_pycache|.vs/, persistent: true});
var steps = [];
var updateTime;
watcher
  .on('add', function(path) {handleChange(path, 'added');})
  .on('change', function(path) {handleChange(path, 'changed');})
  .on('unlink', function(path) {handleChange(path, 'removed');})
  .on('error', function(error) {console.error('Error happened', error);})

function createStep(command, nextStep) {
  var step = function(startTime) {
        var promise = new Promise(function(resolve, reject){
          setTimeout(function(){
            if (startTime >= updateTime) {
              var exec = require('child_process').execSync;
              try {
                console.log(command);
                exec(command, {'cwd': source_dir});
                resolve(startTime);
              }
              catch(err) {
                console.log(String(err.stdout))
                console.log(err.cmd, 'Failed with error', err.status);
              }
            }
            else {
              console.log('Files changed, restarting from first step');
            }
          }, 100);
        });
        return promise.then(nextStep);
      }
  return step;
}

var nextStep = null;
commands.reverse().forEach(function(command) {
  nextStep = createStep(command, nextStep);
  steps.unshift(nextStep);
});

function handleChange(path, change_type) {
  //console.log('File', path, 'has been', change_type);
  updateTime = Date.now();
  //console.log('updateTime', updateTime);
  //console.log('startTime', startTime);
  var startTime = Date.now();
  setTimeout(function(){
    //console.log('startTime', startTime, 'updateTime', updateTime);
    if (startTime >= updateTime) {
      //console.log('startTime', startTime, 'updateTime', updateTime);
      console.log('Files changed, processing');
      steps[0](startTime);
    }
  }, 100);
}

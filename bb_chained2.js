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
var paths = [];
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
            console.log(command);
            var exec = require('child_process').execSync;
            try {
              console.log(command);
              exec(command, {'cwd': source_dir});
              resolve(startTime);
            }
            catch(err) {
              console.log(String(err.stdout))
              console.log(err.cmd, 'Failed with error', err.status);
              //reject(new Error("Failed"));
              //resolve(Promise.reject());
              //throw "Failed";
            }
          }, 100);
        });
        return promise.then(nextStep);
      }
  return step;
}

var nextStep = null;
commands.reverse().forEach(function(command) {
  nextStep = addStep(command, nextStep);
  steps.unshift(nextStep);
});

function handleChange(path, change_type) {
  //console.log('File', path, 'has been', change_type);
  paths.push(path);
  var pathsAtStart = paths.slice();
  updateTime = Date.now();
  //console.log('updateTime', updateTime);
  // Note that paths isn't captured until the timeout has elapsed
  
  var steps = [];
  // Do steps in reverse order as they each need the next steps
  var next_step = null;
  commands.reverse().forEach(function(command) {
    //console.log(command);
    //var result = exec(command, {'cwd': source_dir});
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
              //reject(new Error("Failed"));
              //resolve(Promise.reject());
              //throw "Failed";
            }
          }
          else {
            console.log('Files changed');
            //reject(new Error("Files changed"));
            //throw "Files changed";
            //resolve(Promise.reject());
          }
        }, 100);
      });
      if (next_step) {
        return promise.then(next_step, function(){});
      }
      else {
        return promise;
      }
    }
    steps.unshift(step);
    //console.log(steps);
    next_step = step;
  });
  //console.log(steps);

  var startTime = Date.now();
  //console.log('startTime', startTime);
  setTimeout(function(){
    //console.log('startTime', startTime, 'updateTime', updateTime);
    if (startTime >= updateTime) {
      console.log('startTime', startTime, 'updateTime', updateTime);
      steps[0](startTime)
        ;
      }
  }, 100);
}

function doIt(startTime) {
  
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

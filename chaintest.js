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

var steps = [];

function addStep(command, nextStep) {
  var step = function(startTime) {
        var promise = new Promise(function(resolve, reject){
          setTimeout(function(){
            console.log(command);
            if (command != 'nosetests -s --attr=slow,!glacial') {
              resolve(startTime);
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

    
var startTime = Date.now();    
setTimeout(function(){
    //console.log('startTime', startTime, 'updateTime', updateTime);
      console.log('startTime', startTime);
      steps[0](startTime)
  }, 100); 

setTimeout(function(){
    //console.log('startTime', startTime, 'updateTime', updateTime);
      console.log('startTime', startTime);
      steps[0](startTime)
  }, 100);  

"use strict";

var steps = [];
var updateTime;

function wrapProcessor(processor) {
  var wrapped = function(resolve, startTime) {
    if (startTime >= updateTime) {
      if (processor()) {
        resolve(startTime);
      }
    }
    else {
      console.log('Files changed, skipping remaining steps');
    } 
  };
  return wrapped;
}

function createStep(processor, nextStep) {
  var step = function(params) {
    var promise = new Promise(function(resolve, reject){
      setTimeout(function() {processor(resolve, params);}, 100);
    });
    return promise.then(nextStep);
  }
  return step;
}

exports.create = function(commandProcessors) {
  var wrappedProcessors = commandProcessors.map(wrapProcessor);
  var nextStep = function() {
    console.log('All steps completed successfully');
  };
  wrappedProcessors.reverse().forEach(function(processor) {
    nextStep = createStep(processor, nextStep);
    steps.unshift(nextStep);
  });
}

exports.handleChange = function(path, change_type) {
  //console.log('File', path, 'has been', change_type);
  var now = Date.now();
  if (now == updateTime) {
    return;
  }
  updateTime = now;
  var startTime = Date.now();
  setTimeout(function(){
    if (startTime >= updateTime) {
      console.log('Files changed, processing');
      steps[0](startTime);
    }
  }, 100);
}

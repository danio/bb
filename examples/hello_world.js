"use strict";

// add timestamps in front of log messages
require('console-stamp')(console, 'HH:MM:ss');

var bb = require('dpbb');
var fs = require('fs')

// Get directory from command line argument
var progArgs = process.argv.slice(2);
var sourceDir = progArgs[0];
if (!sourceDir) {
  console.log('Directory must be specified.');
  process.exit()
}

// Create a chain of processors, that together
// will print Hello World
var processors = [
  function() {
    console.log('Hello');
    return true;
  },
  function() {
    console.log('World');
    return true;
  }
];
bb.create(processors);

// Start watching the directory with the processor chain
fs.watch(sourceDir, function(eventType) { bb.handleChange(); });
"use strict";

// add timestamps in front of log messages
require('console-stamp')(console, 'HH:MM:ss');

var bb = require('../bb.js');
var fs = require('fs')

var progArgs = process.argv.slice(2);
var sourceDir = progArgs[0];

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

fs.watch(sourceDir, function(eventType) { bb.handleChange(); });

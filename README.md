# bb
A local 'CI-like' Node.js app

## Installing
npm install

## Using

Create a javascript file that calls bb.create with a list of processors,
and then register a file watcher that calls bb.handleChange when any file is changed.

The processors are functions that each return whether they have succeeded.
If any processor fails, the remaining processors will not be executed.

There are some helper processor creators and watchers provided.

### Examples

#### Hello world

A trivial example that will watch a directory
provided on the command line:

```
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
```

To run it:
```
node examples/hello_world.js <DIR_TO_WATCH>
```

Whenever a file in the directory changes, Hello World
will be printed.

#### Commands and chokidar

A more useful example script, that uses the helpers to watch a directory
and run some tests:

```
var bb = require('./bb.js');
var command_processor = require('./command_processor.js');
var chokidar_watcher = require('./chokidar_watcher.js');

// Argument is the directory to monitor
var progArgs = process.argv.slice(2);
var sourceDir = progArgs[0];

// Some commands to run in the following order
var commands = [
  'nosetests',
  'behave -k IntegrationTest'
];

// first create the processors
var processors = command_processor.createCommandProcessors(commands, sourceDir);
bb.create(processors);

// now start watching the directory for changes
// ignores is a regular expression to ignore changes on,
// here we have files starting with ., python cache and visual studio generated files
chokidar_watcher.watch(sourceDir, /^\.|\_pycache|.vs/, bb.handleChange);
```

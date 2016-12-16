"use strict";

exports.watch = function(watchedDir, ignores, changeHandler) {
  var chokidar = require('chokidar');
  var watcher = chokidar.watch(watchedDir, {ignored: ignores, persistent: true});
  watcher
    .on('add', function(path) {changeHandler(path, 'added');})
    .on('change', function(path) {changeHandler(path, 'changed');})
    .on('unlink', function(path) {changeHandler(path, 'removed');})
    .on('error', function(error) {console.error('Error happened', error);})
}

'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const merge = require('lodash.merge');
const runSequence = require('run-sequence');

const utils = require('./utils');
const copy = require('./tasks/copy');
const jshint = require('./tasks/jshint');
const sass = require('./tasks/sass');
const js = require('./tasks/js');
const serve = require('./tasks/serve');
const release = require('./tasks/release');
const sw = require('./tasks/sw');

module.exports = function(config = {}) {
    const defaultConfig = utils.getDefaultConfig(
        config.package, config.merlin);
    const taskConfig = merge(defaultConfig, config);

    gulp.task('copy', copy(taskConfig, browserSync));
    gulp.task('jshint', jshint(taskConfig, browserSync));
    gulp.task('sass', sass(taskConfig, browserSync));
    gulp.task('js', js(taskConfig, browserSync));
    gulp.task('serve', serve(taskConfig, browserSync));
    gulp.task('release', release(taskConfig, browserSync));
    gulp.task('sw', sw(taskConfig, browserSync));

    gulp.task('dev', function(cb) {
        runSequence(
            ['copy', 'sass', 'jshint', 'js'],
            'serve',
            cb
        );
    });
    gulp.task('staging', ['copy', 'sass', 'jshint', 'js'])
    gulp.task('production', ['copy', 'sass', 'jshint', 'js'])

}
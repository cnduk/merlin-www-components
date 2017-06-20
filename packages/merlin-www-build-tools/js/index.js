'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const merge = require('lodash.merge');

const utils = require('./utils');
const copy = require('./tasks/copy');
const jshint = require('./tasks/jshint');
const sass = require('./tasks/sass');
const js = require('./tasks/js');
const serve = require('./tasks/serve');

module.exports = function(config={}){

    const defaultConfig = utils.getDefaultConfig(
        config.package, config.merlin);
    const taskConfig = merge(defaultConfig, config);

    gulp.task('copy', copy(taskConfig, browserSync));
    gulp.task('jshint', jshint(taskConfig, browserSync));
    gulp.task('sass', sass(taskConfig, browserSync));
    gulp.task('js', js(taskConfig, browserSync));
    gulp.task('serve', serve(taskConfig, browserSync));

    gulp.task('dev', ['copy', 'sass', 'jshint', 'js', 'serve'])
    gulp.task('staging', ['copy', 'sass', 'jshint', 'js'])
    gulp.task('production', ['copy', 'sass', 'jshint', 'js'])

}

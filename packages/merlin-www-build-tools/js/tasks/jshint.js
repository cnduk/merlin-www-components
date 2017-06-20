'use strict';

const gulp = require('gulp');
const jshint = require('gulp-jshint');

module.exports = function taskJshintExport(taskConfig, browserSync){
    return function taskJshint(){
        return gulp.src(taskConfig.jshint.src)
            .pipe(jshint('.jshintrc'))
            .pipe(jshint.reporter('unix'))
            .pipe(jshint.reporter('fail'));
    };
}

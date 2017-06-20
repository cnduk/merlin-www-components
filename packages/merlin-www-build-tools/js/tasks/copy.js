'use strict';

const gulp = require('gulp');

module.exports = function taskCopyExports(taskConfig, browserSync){
    return function taskCopy(){
        return gulp.src(taskConfig.copy.src)
            .pipe(gulp.dest(taskConfig.copy.dest));
    };
}

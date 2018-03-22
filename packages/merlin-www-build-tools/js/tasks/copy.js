'use strict';

const gulp = require('gulp');

/* eslint-disable no-unused-vars */
module.exports = function taskCopyExports(taskConfig, browserSync){
/* eslint-enable no-unused-vars */
    return function taskCopy(){
        return gulp.src(taskConfig.copy.src)
            .pipe(gulp.dest(taskConfig.copy.dest));
    };
};

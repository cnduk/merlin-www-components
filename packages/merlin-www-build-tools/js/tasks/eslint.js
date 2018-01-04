'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');

module.exports = function taskEsLintExport(taskConfig, browserSync){
    return function taskEsLint(done){
        return gulp.src(taskConfig.eslint.src)
            .pipe(eslint({useEslintrc: true}))
            .pipe(eslint.failAfterError())
            .pipe(eslint.format('stylish'));
    };
}

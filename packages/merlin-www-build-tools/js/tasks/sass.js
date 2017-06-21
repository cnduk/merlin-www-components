"use strict";

const path = require('path');

const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const SASS_IMPORTER = require('@cnbritain/merlin-sass-custom-importer');

const utils = require('../utils');

const ENV = utils.getEnvironment();

module.exports = function taskSassExport(taskConfig, browserSync){
    return function taskSass(){
        let outputStyle = 'expanded';
        let renameConfig = {};
        if(!ENV.isDev){
            outputStyle = 'compressed';
            renameConfig = { suffix: '.min' };
        }

        const sassConfig = {
            importer: SASS_IMPORTER(taskConfig.merlin, taskConfig.merlin.name),
            outputStyle: outputStyle
        };

        return gulp.src(taskConfig.sass.src)
            .pipe(sourcemaps.init())
            .pipe(sass(sassConfig).on('error', sass.logError))
            .pipe(rename(renameConfig))
            // I have a feeling I'm going to need to check this
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(taskConfig.sass.dest))
            .pipe(browserSync.stream());
        };
}

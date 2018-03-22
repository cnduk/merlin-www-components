'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const merge = require('merge-stream');
const autoprefixer = require('gulp-autoprefixer');
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
        SASS_IMPORTER.LOGGER.enabled = ENV.isDev;

        const streams = taskConfig.sass.src.map((file) => {

            // We have to create a fresh sass importer for each file as it
            // keeps track of what files its imported.
            const sassConfig = {
                importer: SASS_IMPORTER(
                    taskConfig.merlin, taskConfig.merlin.name),
                outputStyle: outputStyle
            };

            const task = gulp.src(file)
                .pipe(sourcemaps.init())
                .pipe(sass.sync(sassConfig).on('error', sass.logError))
                .pipe(autoprefixer({
                    browsers: [
                        'last 2 versions',
                        'ie >= 10'
                    ]
                }))
                .pipe(rename(renameConfig))
                // I have a feeling I'm going to need to check this
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(taskConfig.sass.dest));

            if(ENV.isDev){
                task.pipe(browserSync.stream());
            }
            return task;
        });

        return merge.apply(null, streams);

    };
};

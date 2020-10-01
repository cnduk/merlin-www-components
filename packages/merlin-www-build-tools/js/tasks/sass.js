'use strict';

const gulp = require('gulp');
const del = require('del');
const csso = require('gulp-csso');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const merge = require('merge-stream');
const autoprefixer = require('gulp-autoprefixer');
const SASS_IMPORTER = require('@cnbritain/merlin-sass-custom-importer');

const utils = require('../utils');

const ENV = utils.getEnvironment();

module.exports = function taskSassExport(taskConfig, browserSync) {
    return function taskSass() {
        let outputStyle = 'expanded';
        let renameConfig = {};
        let cssoConfig = {
            restructure: true,
            sourceMap: true,
            debug: false
        };

        if (!ENV.isDev) {
            outputStyle = 'compressed';
            renameConfig = {
                suffix: '.min'
            };
        }

        SASS_IMPORTER.LOGGER.enabled = ENV.isDev;

        // Remove old css revs
        del.sync(taskConfig.sass.dest + 'page-*.{css,map}');

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
                .pipe(autoprefixer());

            if (!ENV.isDev) {
                task.pipe(csso(cssoConfig));
            }

            task.pipe(rename(renameConfig))
                .pipe(gulp.dest(taskConfig.sass.dest))
                .pipe(rev())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(taskConfig.sass.dest))
                .pipe(rev.manifest({
                    transformer: {
                        parse: JSON.parse,
                        stringify: function (value, replacer, space) {
                            // Transform the manifest keys to match what is in brand
                            // config so it can be more easily replaced in core...
                            return JSON.stringify(
                                /*eslint-disable */
                                Object.entries(value).reduce(
                                    function (result, i) {
                                        const prefix = '/static/css/';
                                        result[prefix + i[0]] = prefix + i[1];
                                        return result;
                                    }, {}),
                                replacer,
                                space);
                            /*eslint-enable*/
                        }
                    }
                }))
                .pipe(gulp.dest(taskConfig.sass.dest));

            if (ENV.isDev) {
                task.pipe(browserSync.stream());
            }

            return task;
        });

        return merge.apply(null, streams);
    };
};
'use strict';

const path = require('path');
const fs = require('fs');

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
const through2 = require('through2');

const ENV = utils.getEnvironment();

const manifest = {};

// Gulp rev does manifests, but as we treat each css file
// as a seperate stream and then merge them, it doesn't work gud.
// This "plugin" uses attributes added to the file object by gulp-rev
// to create a manifest that can be used by the cachebusting 
// code in merlin core
const cssManifest = (dest) => {
    const prefix = '/static/css';
    const manifestFile = 'rev-manifest.json';

    return through2.obj((file, enc, cb) => {
        const k = path.join(prefix, path.basename(file.revOrigPath));
        const v = path.join(prefix, path.basename(file.path));
        manifest[k] = v;
        cb(null, file);
    }, function (cb) {
        fs.writeFile(
            path.join(dest, manifestFile),
            JSON.stringify(manifest, undefined, '  '),
            cb
        );
    });
};

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
        del.sync(taskConfig.sass.dest + '*-*.{css,map}');

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
                .pipe(cssManifest(taskConfig.sass.dest))
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(taskConfig.sass.dest));

            if (ENV.isDev) {
                task.pipe(browserSync.stream());
            }

            return task;
        });

        return merge.apply(null, streams);
    };
};
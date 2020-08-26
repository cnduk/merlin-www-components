'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const merge = require('lodash.merge');

const utils = require('./utils');
const copyTask = require('./tasks/copy');
const eslintTask = require('./tasks/eslint');
const sassTask = require('./tasks/sass');
const jsTask = require('./tasks/js');
const serveTask = require('./tasks/serve');
const releaseTask = require('./tasks/release');
const swTask = require('./tasks/sw');

module.exports = function (config = {}) {
    const defaultConfig = utils.getDefaultConfig(config.package, config.merlin);
    const taskConfig = merge(defaultConfig, config);

    const copy = copyTask(taskConfig, browserSync);
    const eslint = eslintTask(taskConfig, browserSync);
    const sass = sassTask(taskConfig, browserSync);
    const js = jsTask(taskConfig, browserSync);
    const serve = serveTask(taskConfig, browserSync);
    const release = releaseTask(taskConfig, browserSync);
    const sw = swTask(taskConfig, browserSync);

    const build = gulp.parallel(copy, sass, eslint, js);

    const dev = gulp.series(
        build,
        serve
    );
    const staging = build;
    const production = build;

    return {
        copy,
        eslint,
        sass,
        js,
        serve,
        release,
        sw,
        dev,
        staging,
        production
    }
}
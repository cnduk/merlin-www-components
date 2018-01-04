'use strict';

const gulp = require('gulp');

module.exports = function taskServeExport(taskConfig, browserSync){
    return function taskServe(){
        browserSync.init({
            port: 3000,
            ghostMode: false,
            proxy: taskConfig.watch.proxy
        });
        // Sass
        gulp.watch(taskConfig.watch.sass, ['sass']);
        // JS
        gulp.watch(taskConfig.watch.js, ['eslint', 'js'])
            .on('change', browserSync.reload);
        // HTML and mustache
        gulp.watch(taskConfig.watch.html).on('change', browserSync.reload);
    };
}

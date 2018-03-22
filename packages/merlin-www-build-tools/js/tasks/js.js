'use strict';
/* globals __dirname */

const fs = require('fs');
const path = require('path');

const gulp = require('gulp');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const plumber = require('gulp-plumber');

const utils = require('../utils');

const DYNAMIC_CONFIG_URL = /\{\{ DYNAMIC_CONFIG_URL \}\}/;
const ENV = utils.getEnvironment();

/* eslint-disable no-unused-vars */
module.exports = function taskJsExport(taskConfig, browserSync){
/* eslint-enable no-unused-vars */
    const pluginDir = fs.realpathSync(path.resolve(
        __dirname,
        '..',
        '..',
        'node_modules'
    ));

    return function taskJs(){

        let plugins = null;
        let outputFile = null;

        if(ENV.isDev){
            outputFile = '[name].js';
            plugins = [
                new webpack.NormalModuleReplacementPlugin(
                    DYNAMIC_CONFIG_URL, function(ctx){
                        var configKey = 'default';
                        try {
                            configKey = taskConfig.package.cnOptions.brandConfig;
                        /* eslint-disable no-empty */
                        } catch(err){}
                        /* eslint-enable no-empty */
                        // Check if the value is undefined
                        configKey = configKey === undefined ? 'default' : configKey;
                        ctx.request = `./${configKey}`;
                    }),
                new webpack.optimize.CommonsChunkPlugin({
                    name: 'core',
                    filename: 'core.js'
                })
            ];
        } else {
            outputFile = '[name].min.js';
            plugins = [
                new webpack.NormalModuleReplacementPlugin(
                    DYNAMIC_CONFIG_URL, function(ctx){
                        var configKey = 'default';
                        try {
                            configKey = taskConfig.package.cnOptions.brandConfig;
                        /* eslint-disable no-empty */
                        } catch(err){}
                        /* eslint-enable no-empty */
                        // Check if the value is undefined
                        configKey = configKey === undefined ? 'default' : configKey;
                        ctx.request = `./${configKey}`;
                    }),
                new webpack.optimize.CommonsChunkPlugin({
                    name: 'core',
                    filename: 'core.min.js'
                }),
                new webpack.optimize.ModuleConcatenationPlugin(),
                new webpack.optimize.UglifyJsPlugin({
                    sourceMap: true
                })
            ];
        }

        const webpackConfig = {
            entry: taskConfig.js.src,
            module: {
                'loaders': [{
                    'test': /\.mustache$/,
                    'loader': 'mustache-loader'
                }]
            },
            plugins: plugins,
            output: {
                'filename': outputFile,
                'path': taskConfig.js.dest
            },
            devtool: 'source-map',
            resolveLoader: {
                modules: [
                    pluginDir,
                    'node_modules'
                ]
            }
        };
        return gulp.src(Object.values(taskConfig.js.src))
            .pipe(plumber())
            .pipe(webpackStream(webpackConfig, webpack))
            .pipe(gulp.dest(taskConfig.js.dest));
    };
};

'use strict';

const gulp = require('gulp');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const utils = require('../utils');

const DYNAMIC_CONFIG_URL = /\{\{ DYNAMIC_CONFIG_URL \}\}/;
const ENV = utils.getEnvironment();

module.exports = function taskJsExport(taskConfig, browserSync){
    return function taskJs(){
        let plugins = [
            new webpack.NormalModuleReplacementPlugin(
                DYNAMIC_CONFIG_URL, function(ctx){
                    var configKey = 'default';
                    try {
                        configKey = taskConfig.package.cnOptions.brandConfig;
                    } catch(err){}
                    // Check if the value is undefined
                    configKey = configKey === undefined ? 'default' : configKey;
                    ctx.request = `./${configKey}`;
                }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'core',
                filename: 'core.js'
            })
        ];
        if(ENV.isProd){
            plugins = plugins.concat([
                new webpack.optimize.ModuleConcatenationPlugin(),
                new webpack.optimize.UglifyJsPlugin({
                    sourceMap: true
                })
            ]);
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
                'filename': '[name].js',
                'path': taskConfig.js.dest
            },
            devtool: "source-map"
        };
        return gulp.src(Object.values(taskConfig.js.src))
            .pipe(webpackStream(webpackConfig, webpack))
            .pipe(gulp.dest(taskConfig.js.dest));
    };
}

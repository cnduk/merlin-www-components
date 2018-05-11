'use strict';

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const {loadFile, promiseError} = require('../utils');
const Logger = require('../Logger');

const DYNAMIC_CONFIG_URL = /\{\{ DYNAMIC_CONFIG_URL \}\}/;

function compileJS(component, themeName, name, filename){
    return new Promise((resolve, reject) => {

        const componentDir = fs.realpathSync(path.resolve(
            path.dirname(component.filename),
            'node_modules'
        ));

        const webpackConfig = {
            entry: {
                [name]: filename
            },
            module: {
                rules: [{
                    test: /\.mustache$/,
                    use: 'mustache-loader'
                }]
            },
            plugins: [
                new webpack.NormalModuleReplacementPlugin(
                    DYNAMIC_CONFIG_URL,
                    (ctx) => {ctx.request = `./${themeName}`;}
                )
            ],
            output: {
                filename: '[name].build.js'
            },
            stats: "verbose",
            resolveLoader: {
                modules: [
                    componentDir,
                    "node_modules"
                ]
            }
        };

        webpack(webpackConfig, async (err, stats) => {
            if (err) {
                console.error(err.stack || err);
                if (err.details) {
                    console.error(err.details);
                }
                process.exit(1);
            }

            const info = stats.toJson();

            if (stats.hasErrors()) {
                info.errors.forEach((err)=>{
                    console.error(chalk.bold.red(err));
                });
                process.exit(1);
            }

            if (stats.hasWarnings()) {
                info.warnings.forEach((w)=>{
                    console.warn(chalk.bold.yellow(w));
                });
            }

            // Load file
            const buildFile = info.assetsByChunkName[name];
            const fileContents = await loadFile(buildFile);
            fs.unlink(buildFile, () => {
                Logger.log('JS', `Loaded js - ${filename}`);
                resolve(fileContents);
            });
        });
    });
}

module.exports = {
    compileJS
};

'use strict';

const chalk = require('chalk');
const fs = require('fs');
const webpack = require('webpack');

const LOGGER = require('./logger');
const { loadFile, promiseError } = require('./utils');

function compileJs(key, file){
    return new Promise((resolve, reject) => {
        webpack(getWebpackConfig(key, file), (err, stats) => {
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
            const buildFile = info.assetsByChunkName[key];
            loadFile(buildFile)
                .then((fileContents) => {
                    // Delete build file
                    fs.unlink(buildFile, () => {
                        LOGGER.log('JS', `Loaded js - ${file}`);
                        resolve(fileContents);
                    });
                }, promiseError);
        });
    });
}


function getWebpackConfig(key, file){
    return {
        'entry': {
            [key]: file
        },
        'module': {},
        'plugins': [],
        'output': {
            'filename': '[name].build.js'
        },
        "stats": "verbose"
    };
}

module.exports = {
    compileJs
};
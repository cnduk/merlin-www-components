'use strict';

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const LOGGER = require('./logger');
const { loadFile, promiseError } = require('./utils');

const DYNAMIC_CONFIG_URL = /\{\{ DYNAMIC_CONFIG_URL \}\}/;
const componentDir = fs.realpathSync(
    path.resolve(__dirname, '../node_modules'));

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
        'module': {
            'rules': [{
                'test': /\.mustache$/,
                'use': 'mustache-loader'
            }]
        },
        'plugins': [
            new webpack.NormalModuleReplacementPlugin(
                DYNAMIC_CONFIG_URL,
                function(ctx){
                    var configKey = 'default';
                    try {
                        configKey = packageJson.cnOptions.brandConfig;
                    } catch(err){}
                    // Check if the value is undefined
                    configKey = configKey === undefined ? 'default' : configKey;
                    ctx.request = `./${configKey}`;
                }
            )
        ],
        'output': {
            'filename': '[name].build.js'
        },
        "stats": "verbose",
        "resolveLoader": {
            "modules": [
                componentDir,
                "node_modules"
            ]
        }
    };
}

module.exports = {
    compileJs
};
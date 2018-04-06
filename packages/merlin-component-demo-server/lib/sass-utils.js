'use strict';

const sass = require('node-sass');
const sassImporter = require('@cnbritain/merlin-sass-custom-importer');

const Logger = require('./logger');
const { promiseError } = require('./utils');

function compileSass(file, merlinConfig){
    return new Promise((resolve, reject) => {
        const importer = sassImporter(merlinConfig, merlinConfig.name);

        promiseSass({ file, importer }).then((sassContents) => {

            Logger.log('SASS', `Loaded sass - '${file}'`);
            importer.SESSION.reset();
            resolve(sassContents.css.toString());

        }, promiseError);
    });
}

function promiseSass(...args){
    return new Promise((resolve, reject) => {
        sass.render(...args, (err, result) => {
            if(err){
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = {
    compileSass
};

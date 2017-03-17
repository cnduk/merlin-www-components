'use strict';

const fs = require('fs');

const LOGGER = require('./logger');

function loadFile(filename, encoding='utf8'){
    return new Promise((resolve, reject) => {
        fs.readFile(filename, { encoding }, (err, data) => {
            if(err){
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function loadJSON(file){
    return new Promise((resolve, reject) => {
        loadFile(file)
            .then((data) => {
                try {
                    const json = JSON.parse(data);
                    LOGGER.log('DATA', `Loaded data - '${file}'`);
                    resolve(json);
                } catch(err){
                    LOGGER.log('DATA', `Failed data - ${file}`);
                    reject(err);
                }
            }, promiseError);
    });
}

function promiseError(err){
    console.error(err);
    process.exit(1);
}

module.exports = {
    loadFile,
    loadJSON,
    promiseError
};

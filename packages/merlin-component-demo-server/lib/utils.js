'use strict';

const fs = require('fs');

const Logger = require('./Logger');

function promiseError(err){
    console.error(err);
    process.exit(1);
}

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
                    Logger.log('DATA', `Loaded data - '${file}'`);
                    resolve(json);
                } catch(err){
                    Logger.log('DATA', `Failed data - ${file}`);
                    reject(err);
                }
            }, promiseError);
    });
}

module.exports = {
    loadFile,
    loadJSON,
    promiseError
};

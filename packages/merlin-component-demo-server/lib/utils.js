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

function mkdir(dir){
    return new Promise((resolve, reject) => {
        fs.mkdir(dir, (err) => {
            if(err){
                if(err.code === 'EEXIST'){
                    resolve();
                } else {
                    reject(err);
                }
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    loadFile,
    loadJSON,
    mkdir,
    promiseError
};

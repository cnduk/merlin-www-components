'use strict';

const mustache = require('mustache');

const LOGGER = require('./logger');
const { loadFile, promiseError } = require('./utils');

function loadTemplate(file){
    return new Promise((resolve, reject) => {
        loadFile(file)
            .then((template) => {
                mustache.parse(template);
                LOGGER.log('TEMPLATE', `Loaded template - '${file}'`);
                resolve(template);
            }, promiseError);
    });
}

module.exports = {
    loadTemplate
};

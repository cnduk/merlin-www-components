'use strict';

const fs = require('fs');
const path = require('path');

const ComponentConfig = require('./ComponentConfig');
const LOGGER = require('./logger');
const { loadJSON, promiseError } = require('./utils');
const { compileJs } = require('./js-utils');
const { loadSass } = require('./sass-utils');
const { loadTemplate } = require('./template-utils');

function resolveDependencies(componentMap, dependencies, previousDir='.'){
    return Promise.all(dependencies.map((filename) => {
        return new Promise((resolve, reject) => {
            const merlinDir = path.resolve(previousDir, 'node_modules', filename);
            const merlinFile = path.resolve(merlinDir, 'merlin.json');

            // Load merlin dependency
            loadJSON(merlinFile)
                .then((config) => {
                    resolveDependency(componentMap, config, merlinDir, {
                        sass: true,
                        data: true,
                        js: true
                    }).then(resolve, reject);
                }, promiseError);
        });
    }));
}

function resolveDependency(componentMap, config, merlinDir, ignore={ sass: false, data: false, js: false }){
    return new Promise((resolve, reject) => {
        const realMerlinDir = fs.realpathSync(merlinDir);

        // Check if we've already loaded this component
        if(componentMap.has(config.name)){
            LOGGER.log('COMPONENT', `Component already loaded - ${config.name}`);
            resolve();
        } else {
            LOGGER.log('COMPONENT', `Loading component - ${config.name}`);

            const allPromises = [];

            if(ignore.data){
                allPromises.push(Promise.resolve(null));
            } else {
                allPromises.push(resolveDependencyData(realMerlinDir, config.data));
            }

            // ALWAYS LOAD DA PARTIALS
            allPromises.push(resolveDependencyPartials(realMerlinDir, config.partials));

            if(ignore.sass){
                allPromises.push(Promise.resolve(null));
            } else {
                allPromises.push(resolveDependencyThemes(realMerlinDir, config.themes, config));
            }

            if(ignore.js){
                allPromises.push(Promise.resolve(null));
            } else {
                allPromises.push(resolveDependencyJs(realMerlinDir, config.js));
            }



            Promise.all(allPromises).then((results) => {

                const dependencyConfig = new ComponentConfig(config);
                // Data
                if(results[0] !== null){
                    results[0].forEach((value, key) => {
                        dependencyConfig.data.set(`${config.name}/${key}`, value);
                    });
                }
                // Partials
                if(results[1] !== null){
                    results[1].forEach((value, key) => {
                        dependencyConfig.partials.set(`${config.name}/${key}`, value);
                    });
                }
                // Themes
                if(results[2] !== null){
                    results[2].forEach((value, key) => {
                        dependencyConfig.themes.set(`${config.name}/${key}`, value);
                    });
                }
                // JS
                if(results[3] !== null){
                    results[3].forEach((value, key) => {
                        dependencyConfig.js.set(`${config.name}/${key}`, value);
                    });
                }

                // Assign the main
                if(!config.hasOwnProperty('main') && typeof config.main !== 'string' ){
                    console.error(`No main file found in ${config.name}`);
                    process.exit(1);
                }
                dependencyConfig.main = `${config.name}/${config.main}`;
                dependencyConfig.location = fs.realpathSync(merlinDir);
                // Add the main partial under config.name
                dependencyConfig.partials.set(
                    config.name,
                    dependencyConfig.partials.get(`${config.name}/${config.main}`)
                );

                dependencyConfig.currentTheme = config.currentTheme;

                // Add config to COMPONENTS
                componentMap.set(config.name, dependencyConfig);

                // Resolve dependency dependencies
                if(Array.isArray(config.dependencies)){
                    resolveDependencies(
                        componentMap,
                        config.dependencies,
                        merlinDir
                    ).then(resolve, reject);
                } else {
                    resolve();
                }

            }, promiseError);
        }
    });
}

function resolveDependencyData(merlinDir, dataConfig){
    if(!dataConfig) return Promise.resolve(null);
    if(Object.keys(dataConfig).length === 0) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
        const dataPromises = Object.keys(dataConfig).map((key) => {
            return loadJSON(path.resolve(merlinDir, dataConfig[key]))
                .then((json) => {
                    return Promise.resolve({ key, json });
                }, promiseError);
        });

        Promise.all(dataPromises).then((files) => {
            const dataMap = new Map();
            files.forEach((file) => {
                dataMap.set(file.key, file.json);
            });
            resolve(dataMap);
        }, promiseError);
    });
}

function resolveDependencyPartials(merlinDir, partialsConfig){
    if(!partialsConfig) return Promise.resolve(null);
    if(Object.keys(partialsConfig).length === 0) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
        const partialPromises = Object.keys(partialsConfig).map((key) => {
            return loadTemplate(path.resolve(merlinDir, partialsConfig[key]))
                .then((template) => {
                    return Promise.resolve({ key, template });
                }, promiseError);
        });

        Promise.all(partialPromises).then((templates) => {
            const templateMap = new Map();
            templates.forEach((template) => {
                templateMap.set(template.key, template.template);
            });
            resolve(templateMap);
        }, promiseError);
    });
}

function resolveDependencyThemes(merlinDir, themesConfig, config){
    if(!themesConfig) return Promise.resolve(null);
    if(Object.keys(themesConfig).length === 0) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
        const themePromises = Object.keys(themesConfig).map((key) => {
            return loadSass(path.resolve(merlinDir, themesConfig[key]), config)
                .then((sass) => {
                    return Promise.resolve({ key, sass });
                }, promiseError);
        });

        Promise.all(themePromises).then((sassContents) => {
            const sassMap = new Map();
            sassContents.forEach((content) => {
                sassMap.set(content.key, content.sass);
            });
            resolve(sassMap);
        }, promiseError);
    });
}

function resolveDependencyJs(merlinDir, jsConfig){
    if(!jsConfig) return Promise.resolve(null);
    if(Object.keys(jsConfig).length === 0) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
        const dependencyPromises = Object.keys(jsConfig).map((key) => {
            return compileJs(key, path.resolve(merlinDir, jsConfig[key]))
                .then((js) => {
                    return Promise.resolve({ key, js });
                }, promiseError);
        });

        Promise.all(dependencyPromises).then((jsContents) => {
            const jsMap = new Map();
            jsContents.forEach((content) => {
                jsMap.set(content.key, content.js);
            });
            resolve(jsMap);
        });
    });
}

module.exports = {
    resolveDependencies,
    resolveDependency,
    resolveDependencyData,
    resolveDependencyPartials,
    resolveDependencyThemes,
    resolveDependencyJs
};

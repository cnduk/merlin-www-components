'use strict';

const fs = require('fs');
const path = require('path');

const chalk = require('chalk');
const express = require('express');
const mustache = require('mustache');
const sass = require('node-sass');
const sassImporter = require('@cnbritain/merlin-sass-custom-importer');
const webpack = require('webpack');

const COMPONENTS = new Map();
let MASTER_CONFIG = null;
let MASTER_COMPONENT = null;
const PARTIALS = {};
const THEMES = {};
const JS = {};
const DATA = {};


const LOGGER = {
    'enabled': false,
    'log': function(mode, ...args){
        if(!this.enabled) return;
        this[mode](...args);
    },
    'DATA': function(...args){
        console.log(chalk.red(...args));
    },
    'TEMPLATE': function(...args){
        console.log(chalk.magenta(...args));
    },
    'PARTIAL': function(...args){
        console.log(chalk.cyan(...args));
    },
    'SASS': function(...args){
        console.log(chalk.yellow(...args));
    },
    'SERVER': function(...args){
        console.log(chalk.bold.green(...args));
    },
    'JS': function(...args){
        console.log(chalk.blue(...args));
    },
    'COMPONENT': function(...args){
        console.log(chalk.italic(...args));
    }
};


class ComponentConfig {
    constructor(name){
        this.currentTheme = null;
        this.data = new Map();
        this.isMaster = false;
        this.js = new Map();
        this.main = null;
        this.name = name;
        this.partials = new Map();
        this.themes = new Map();
    }
}


class MerlinComponentDemoServer {

    _init(){
        // Load app templates
        Promise.all([
            loadTemplate(path.resolve(__dirname, '../templates/component.html')),
            loadTemplate(path.resolve(__dirname, '../templates/page.html'))
        ]).then((templates) => {
            this._partials.component = templates[0];
            this._partials.page = templates[1];
        }, promiseError);

        // Create the app
        const app = express();
        this._app = app;
        this._routes();
    }

    _renderComponent(dataKey){
        if(!DATA.hasOwnProperty(dataKey)){
            const msg = `Unknown data - ${dataKey}`;
            LOGGER.log('SERVER', msg);
            return msg;
        }

        return mustache.render(
            PARTIALS[MASTER_COMPONENT.main],
            DATA[dataKey],
            PARTIALS
        );
    }

    _routes(){
        this._app.get('/', (req, res) => {

            const datas = Object.keys(MASTER_COMPONENT.data);
            const themes = Object.keys(MASTER_COMPONENT.themes);

            const view = {
                "data": {
                    "components": []
                }
            };
            MASTER_COMPONENT.data.forEach((_, dataKey) => {
                if(MASTER_COMPONENT.themes.size === 0){
                    view.data.components.push({
                        "escaped_name": encodeURIComponent(MASTER_COMPONENT.main),
                        "name": MASTER_COMPONENT.main,
                        "escaped_theme": null,
                        "theme": null,
                        "escaped_data": encodeURIComponent(dataKey),
                        "data": dataKey
                    });
                } else {
                    MASTER_COMPONENT.themes.forEach((_, themeKey) => {
                        view.data.components.push({
                            "escaped_name": encodeURIComponent(MASTER_COMPONENT.main),
                            "name": MASTER_COMPONENT.main,
                            "escaped_theme": encodeURIComponent(themeKey),
                            "theme": themeKey,
                            "escaped_data": encodeURIComponent(dataKey),
                            "data": dataKey
                        });
                    });
                }
            });

            const indexPage = mustache.render(this._partials.page, view);

            LOGGER.log('SERVER', 'Index page loaded');
            res.send(indexPage);
        });
        this._app.get('/:data/:theme', (req, res) => {
            const dataKey = decodeURIComponent(req.params.data);
            const themeKey = decodeURIComponent(req.params.theme);

            const componentTemplate = this._renderComponent(dataKey);
            const theme = THEMES[themeKey];

            const componentPage = mustache.render(
                this._partials.component, {
                    "page": {
                        "component": componentTemplate,
                        "js": MASTER_COMPONENT.js.get(`${MASTER_COMPONENT.name}/demo`) || false,
                        "theme": theme
                    }
                });

            LOGGER.log('SERVER', `Component page loaded - ${themeKey}/${dataKey}`);
            res.send(componentPage);
        });
    }

    constructor(config={}, port=null){

        this._app = null;
        this._isListening = false;
        this._partials = {};

        this.port = null;

        MASTER_CONFIG = config;

        resolveDependency(config, '.')
            .then(() => {
                COMPONENTS.get(config.name).isMaster = true;
                MASTER_COMPONENT = COMPONENTS.get(config.name);
                buildComponentDicts();
                this._init();
                if(port !== null) this.listen(port);
            }, promiseError);

    }

    get isListening(){
        return this._isListening;
    }

    listen(port){
        if(this._isListening) return;
        this._isListening = true;
        this.port = port;
        this._app.listen(port);
        LOGGER.log('SERVER', `Now listening on port ${port}`);
    }

    static loadJSON(file){
        return loadJSON(file);
    }

    static loadTemplate(file){
        return loadTemplates(file);
    }

    static loadSass(file){
        return loadSass(sass);
    }

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
                    LOGGER.log('DATA', `Loaded data - '${file}'`);
                    resolve(json);
                } catch(err){
                    reject(err);
                }
            }, promiseError);
    });
}

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

function loadSass(file){
    return new Promise((resolve, reject) => {
        const importer = sassImporter(MASTER_CONFIG, MASTER_CONFIG.name);
        promiseSass({
            file,
            importer
        })
        .then((sassContents) => {
            LOGGER.log('SASS', `Loaded sass - '${file}'`);
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

function promiseError(err){
    console.error(err);
    process.exit(1);
}

function resolveDependencies(dependencies){
    return Promise.all(dependencies.map((filename) => {
        return new Promise((resolve, reject) => {
            const merlinDir = path.resolve('node_modules', filename);
            const merlinFile = path.resolve(merlinDir, 'merlin.json');

            // Load merlin dependency
            loadJSON(merlinFile)
                .then((config) => {
                    resolveDependency(config, merlinDir)
                        .then(resolve, reject);
                }, promiseError);
        });
    }));
}

function resolveDependency(config, merlinDir){
    return new Promise((resolve, reject) => {
        // Check if we've already loaded this component
        if(COMPONENTS.has(config.name)){
            LOGGER.log('COMPONENT', `Component already loaded - ${config.name}`);
            resolve();
        } else {
            LOGGER.log('COMPONENT', `Loading component - ${config.name}`);
            Promise.all([
                resolveDependencyData(merlinDir, config.data),
                resolveDependencyPartials(merlinDir, config.partials),
                resolveDependencyThemes(merlinDir, config.themes),
                resolveDependencyJs(merlinDir, config.js)
            ]).then((results) => {

                const dependencyConfig = new ComponentConfig(config.name);
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

                dependencyConfig.currentTheme = config.currentTheme;

                // Add config to COMPONENTS
                COMPONENTS.set(config.name, dependencyConfig);

                // Resolve dependency dependencies
                if(Array.isArray(config.dependencies)){
                    resolveDependencies(config.dependencies)
                        .then(resolve, reject);
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
        Promise.all(Object.keys(dataConfig).map((key) => {
            return loadJSON(path.resolve(merlinDir, dataConfig[key]))
                .then((json) => {
                    return Promise.resolve({ key, json });
                }, promiseError);
        })).then((files) => {
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
        Promise.all(Object.keys(partialsConfig).map((key) => {
            return loadTemplate(path.resolve(merlinDir, partialsConfig[key]))
                .then((template) => {
                    return Promise.resolve({ key, template });
                }, promiseError);
        })).then((templates) => {
            const templateMap = new Map();
            templates.forEach((template) => {
                templateMap.set(template.key, template.template);
            });
            resolve(templateMap);
        }, promiseError);
    });
}

function resolveDependencyThemes(merlinDir, themesConfig){
    if(!themesConfig) return Promise.resolve(null);
    if(Object.keys(themesConfig).length === 0) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
        Promise.all(Object.keys(themesConfig).map((key) => {
            return loadSass(path.resolve(merlinDir, themesConfig[key]))
                .then((sass) => {
                    return Promise.resolve({ key, sass });
                }, promiseError);
        })).then((sassContents) => {
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
        Promise.all(Object.keys(jsConfig).map((key) => {
            return compileJs(key, path.resolve(merlinDir, jsConfig[key]))
                .then((js) => {
                    return Promise.resolve({ key, js });
                }, promiseError);
        })).then((jsContents) => {
            const jsMap = new Map();
            jsContents.forEach((content) => {
                jsMap.set(content.key, content.js);
            });
            resolve(jsMap);
        });
    });
}

function buildComponentDicts(){
    COMPONENTS.forEach((component) => {
        component.partials.forEach((value, key) => {
            PARTIALS[key] = value;
        });
        component.themes.forEach((value, key) => {
            THEMES[key] = value;
        });
        component.js.forEach((value, key) => {
            JS[key] = value;
        });
        component.data.forEach((value, key) => {
            DATA[key] = value;
        });
    });
}

module.exports = MerlinComponentDemoServer;
module.exports.LOGGER = LOGGER;

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
    _enabled: false,
    get enabled(){
        return this._enabled;
    },
    set enabled(value){
        this._enabled = value;
        sassImporter.LOGGER.enabled = value;
    },
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

    _getDemoUrl(theme, partial, data){
        const escapedTheme = encodeURIComponent(theme);
        const escapedPartial = encodeURIComponent(partial);
        const escapedData = encodeURIComponent(data);
        return `/${escapedTheme}/${escapedPartial}/${escapedData}`;
    }

    _prefix(value){
        return `${this.name}/${value}`;
    }

    constructor(config){
        this._config = config;
        this.currentTheme = null;
        this.data = new Map();
        this.demos = [];
        this.isMaster = false;
        this.js = new Map();
        this.location = null;
        this.main = null;
        this.name = config.name;
        this.partials = new Map();
        this.themes = new Map();
    }

    createDemos(){
        const demos = [];
        if(this._config.hasOwnProperty('demo') && Object.keys(this._config.demo).length > 0){
            Object.keys(this._config.demo).forEach((demoKey) => {
                const demoValue = this._config.demo[demoKey];
                const demoGroup = {
                    name: demoKey,
                    demos: []
                };

                // Quick settings
                if(typeof demoValue === 'string'){
                    const dataKey = this._prefix(demoValue);

                    if(!this.data.has(dataKey)){
                        throw new Error(`unknown data key in demo - ${demoValue}`);
                    }

                    this.themes.forEach((_, themeKey) => {
                        demoGroup.demos.push({
                            data: dataKey,
                            main: this.main,
                            theme: themeKey,
                            title: `${themeKey} - ${this.main} - ${dataKey}`,
                            url: this._getDemoUrl(themeKey, this.main, dataKey)
                        });
                    });

                } else {
                    const dataKey = this._prefix(demoValue.data);
                    const partialKey = this._prefix(demoValue.main);

                    // Check data key exists
                    if(!this.data.has(dataKey)){
                        throw new Error(`unknown data key in demo - ${demoValue.data}`);
                    }

                    // Check main exists
                    if(!this.partials.has(partialKey)){
                        throw new Error(`unknown partial key in demo - ${demoValue.main}`);
                    }

                    demoValue.themes.forEach((demoTheme) => {
                        const themeKey = this._prefix(demoTheme);

                        // Check theme exists
                        if(!this.themes.has(themeKey)){
                            throw new Error(`unknown theme key in demo - ${demoTheme}`);
                        }

                        demoGroup.demos.push({
                            data: dataKey,
                            main: partialKey,
                            theme: themeKey,
                            title: `${themeKey} - ${partialKey} - ${dataKey}`,
                            url: this._getDemoUrl(themeKey, partialKey, dataKey)
                        });
                    });
                }
                demos.push(demoGroup);
            });

        // No demos so create a default list from data, themes and main
        } else {
            const demoGroup = {
                name: 'All',
                demos: []
            };
            this.data.forEach((_, dataKey) => {
                this.themes.forEach((_, themeKey) => {
                    demoGroup.demos.push({
                        data: dataKey,
                        main: this.main,
                        theme: themeKey,
                        title: `${themeKey} - ${this.main} - ${dataKey}`,
                        url: this._getDemoUrl(themeKey, this.main, dataKey)
                    });
                });
            });
            demos.push(demoGroup);
        }
        this.demos = demos;
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
        // Check if assets were installed. If so, setup the assets folder
        if(COMPONENTS.has('@cnbritain/merlin-www-assets')){
            const assetComponent = COMPONENTS.get('@cnbritain/merlin-www-assets');
            app.use('/assets', express.static(`${assetComponent.location}/static`));
        }
        this._app = app;
        this._routes();
    }

    _renderComponent(partialKey, dataKey){
        if(!PARTIALS.hasOwnProperty(partialKey)){
            const msg = `Unknown partial - ${partialKey}`;
            LOGGER.log('SERVER', msg);
            return msg;
        }

        if(!DATA.hasOwnProperty(dataKey)){
            const msg = `Unknown data - ${dataKey}`;
            LOGGER.log('SERVER', msg);
            return msg;
        }

        return mustache.render(PARTIALS[partialKey], DATA[dataKey], PARTIALS);
    }

    _routes(){
        this._app.get('/static/*', routeStatic.bind(this));
        this._app.get('/', routeIndex.bind(this));
        this._app.get('/theme/:theme', routeTheme.bind(this));
        this._app.get('/:theme/:partial/:data', routeDataTheme.bind(this));
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
                MASTER_COMPONENT.createDemos();
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
                    LOGGER.log('DATA', `Failed data - ${file}`);
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

        promiseSass({ file, importer }).then((sassContents) => {

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

function resolveDependencies(dependencies, previousDir='.'){
    return Promise.all(dependencies.map((filename) => {
        return new Promise((resolve, reject) => {
            const merlinDir = path.resolve(previousDir, 'node_modules', filename);
            const merlinFile = path.resolve(merlinDir, 'merlin.json');

            // Load merlin dependency
            loadJSON(merlinFile)
                .then((config) => {
                    resolveDependency(config, merlinDir, {
                        sass: true,
                        data: true,
                        js: true
                    }).then(resolve, reject);
                }, promiseError);
        });
    }));
}

function resolveDependency(config, merlinDir, ignore={ sass: false, data: false, js: false }){
    return new Promise((resolve, reject) => {
        const realMerlinDir = fs.realpathSync(merlinDir);

        // Check if we've already loaded this component
        if(COMPONENTS.has(config.name)){
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
                allPromises.push(resolveDependencyThemes(realMerlinDir, config.themes));
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
                COMPONENTS.set(config.name, dependencyConfig);

                // Resolve dependency dependencies
                if(Array.isArray(config.dependencies)){
                    resolveDependencies(config.dependencies, merlinDir)
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

function resolveDependencyThemes(merlinDir, themesConfig){
    if(!themesConfig) return Promise.resolve(null);
    if(Object.keys(themesConfig).length === 0) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
        const themePromises = Object.keys(themesConfig).map((key) => {
            return loadSass(path.resolve(merlinDir, themesConfig[key]))
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

function routeStatic(req, res){
    if(!req.headers.referer) return res.send('broke');

    const decodedReferer = decodeURIComponent(req.headers.referer);
    const matches = decodedReferer.match(/(@cnbritain\/[-\w]+\/([-\w]+))$/);
    if(!matches) return res.send('broke');

    const THEME_KEY = matches[1];
    if(!THEMES.hasOwnProperty(THEME_KEY)) return res.send('broke');

    res.redirect(`/assets/${matches[2]}/${req.params[0]}`);
}

function routeIndex(req, res){

    const view = {
        "data": {
            "groups": MASTER_COMPONENT.demos,
            "title": "All themes"
        }
    };

    const indexPage = mustache.render(this._partials.page, view);

    LOGGER.log('SERVER', 'Index page loaded');
    res.send(indexPage);
}

function routeTheme(req, res){
    const theme = `${MASTER_COMPONENT.name}/${decodeURIComponent(req.params.theme)}`;
    const view = {
        "data": {
            "groups": [],
            "title": `${req.params.theme} theme page`
        }
    };
    view.data.groups = MASTER_COMPONENT.demos.map((group) => {
        return {
            "name": group.name,
            "demos": group.demos.filter((demo) => {
                return demo.theme === theme;
            })
        };
    }).filter((group) => {
        return group.demos.length > 0;
    });
    const indexPage = mustache.render(this._partials.page, view);

    LOGGER.log('SERVER', 'Theme page loaded');
    res.send(indexPage);
}

function routeDataTheme(req, res){
    const themeKey = decodeURIComponent(req.params.theme);
    const partialKey = decodeURIComponent(req.params.partial);
    const dataKey = decodeURIComponent(req.params.data);

    const componentTemplate = this._renderComponent(partialKey, dataKey);
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
}

module.exports = MerlinComponentDemoServer;
module.exports.LOGGER = LOGGER;

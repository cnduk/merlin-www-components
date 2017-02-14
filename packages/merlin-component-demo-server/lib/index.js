'use strict';

const fs = require('fs');
const path = require('path');

const chalk = require('chalk');
const express = require('express');
const glob = require('glob');
const mustache = require('mustache');
const sass = require('node-sass');
const webpack = require('webpack');


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
    }
};

class MerlinComponentDemoServer {

    _buildJs(){
        if(this.customJs !== null){
            LOGGER.log('JS', `Building js - ${getKeyFromPath(this.customJs)}`);
            return new Promise((resolve, reject) => {
                webpack(getWebpackConfig(this.customJs), (err, stats) => {
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

                    resolve();
                });
            });
        }
        return Promise.resolve();
    }

    _init(){
        // Load app related templates
        this._templates = loadTemplates(`${__dirname}/../templates/*.html`, false);

        // Create the app
        const app = express();
        this._app = app;
        this._routes();
    }

    _renderComponent(componentKey, dataKey){
        if(!this.templates.hasOwnProperty(componentKey)){
            const msg = `Unknown template - ${componentKey}`;
            LOGGER.log('SERVER', msg);
            return msg;
        }

        if(!this.data.hasOwnProperty(dataKey)){
            const msg = `Unknown data - ${dataKey}`;
            LOGGER.log('SERVER', msg);
            return msg;
        }

        return mustache.render(
            this.templates[componentKey],
            this.data[dataKey],
            this.partials
        );
    }

    _routes(){
        this._app.get('/', (req, res) => {

            const templates = Object.keys(this.templates);
            const themes = Object.keys(this.themes);
            const datas = Object.keys(this.data);

            const view = {
                "data": {
                    "components": []
                }
            };
            templates.forEach((template) => {
                datas.forEach((data) => {
                    if(themes.length === 0){
                        view.data.components.push({
                            "name": template,
                            "theme": null,
                            "data": data
                        });
                    } else {
                        themes.forEach((theme) => {
                            view.data.components.push({
                                "name": template,
                                "theme": theme,
                                "data": data
                            });
                        });
                    }
                });
            });
            const indexPage = mustache.render(this._templates.page, view);

            LOGGER.log('SERVER', 'Index page loaded');
            res.send(indexPage);
        });
        this._app.get('/:component/:data/:theme', (req, res) => {
            const params = req.params;

            const componentTemplate = this._renderComponent(
                params.component, params.data);
            const theme = this.themes[params.theme];

            const componentPage = mustache.render(
                this._templates.component, {
                    "page": {
                        "component": componentTemplate,
                        "js": this._js,
                        "theme": theme
                    }
                });

            LOGGER.log('SERVER', `Component page loaded - ${params.component}/${params.theme}/${params.data}`);
            res.send(componentPage);
        });
    }

    constructor(config={}, port=null){
        this._app = null;
        this._js = '';
        this._isListening = false;
        this._templates = null;

        this.data = config.data || {};
        this.customJs = config.js || null;
        this.partials = config.partials || {};
        this.port = null;
        this.templates = config.templates || {};
        this.themes = config.themes || {};

        this._init();
        this._buildJs()
            .then(
                () => {
                    return loadFile(`${path.dirname(this.customJs)}/demo.build.js`);
                },
                promiseError
            ).then((contents) => {
                this._js = contents;
            }, promiseError);

        if(port !== null) this.listen(port);
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

    static loadJSON(dir, async=true){
        return loadJSON(dir, async);
    }

    static loadTemplates(dir, async=true){
        return loadTemplates(dir, async);
    }

    static loadSass(dir, async=true){
        return loadSass(dir, async);
    }

}

function loadFile(filename, encoding='utf8', async=true){
    if(async){
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
    return fs.readFileSync(filename, { encoding });
}

function loadJSON(dir, async=true){
    if(async){
        return new Promise((resolve, reject) => {
            glob(dir, { nodir: true }, (err, files) => {
                if(err) return reject(err);

                const output = {};
                const chain = [];
                const keys = [];
                files.forEach((file) => {
                    keys.push(getKeyFromPath(file));
                    chain.push(loadFile(file));
                });
                Promise.all(chain)
                    .then((datas) => {
                        datas.forEach((data, i) => {
                            try {
                                const json = JSON.parse(data);
                                LOGGER.log('DATA', `Loaded and parsed data - '${keys[i]}'`);
                                output[keys[i]] = json;
                            } catch(err){
                                reject(err);
                            }
                        });
                        resolve(output);
                    }, (err) => reject(err));
            });
        });
    }

    const files = glob.sync(dir, { nodir: true });
    const output = {};
    files.forEach((file) => {
        const key = getKeyFromPath(file);
        const json = JSON.parse(loadFile(file, 'utf8', false));
        LOGGER.log('DATA', `Loaded and parsed data -'${key}'`);
        output[key] = json;
    });
    return output;
}

function loadTemplates(dir, async=true){
    if(async){
        return new Promise((resolve, reject) => {
            glob(dir, { nodir: true }, (err, files) => {
                if(err) return reject(err);

                const output = {};
                const keys = [];
                const chain = [];
                files.forEach((file) => {
                    keys.push(getKeyFromPath(file));
                    chain.push(loadFile(file));
                });
                Promise.all(chain)
                    .then((datas) => {
                        datas.forEach((data, i) => {
                            mustache.parse(data);
                            LOGGER.log('TEMPLATE', `Loaded and parsed template - '${keys[i]}'`);
                            output[keys[i]] = data;
                        });
                        resolve(output);
                    }, (err) => reject(err));
            });
        });
    }

    const files = glob.sync(dir, { nodir: true });
    const output = {};
    files.forEach((file) => {
        const key = getKeyFromPath(file);
        const template = loadFile(file, 'utf8', false);
        mustache.parse(template);
        LOGGER.log('TEMPLATE', `Loaded and parsed template - '${key}'`);
        output[key] = template;
    });
    return output;
}

// TODO: do it
function loadSass(dir, async=true){
    if(async){
        return new Promise((resolve, reject) => {
            glob(dir, (err, files) => {
                if(err) return reject(err);

                const output = {};
                const keys = [];
                const chain = [];
                files.forEach((file) => {
                    keys.push(getKeyFromPath(file));
                    chain.push(promiseSass({ file }));
                });
                Promise.all(chain)
                    .then((datas) => {
                        datas.forEach((data, i) => {
                            LOGGER.log('SASS', `Loaded and compiled sass - '${keys[i]}'`);
                            output[keys[i]] = data.css.toString();
                        });
                        resolve(output);
                    }, (err) => reject(err));
            });
        });
    }

    const files = glob.sync(dir);
    const output = {};
    files.forEach((file) => {
        const key = getKeyFromPath(file);
        const result = sass.renderSync({
            'file': file
        });
        LOGGER.log('SASS', `Loaded and compiled sass - '${key}'`);
        output[key] = result;
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

function getKeyFromPath(filepath){
    const breakdown = path.parse(filepath);
    return breakdown.name;
}

function getWebpackConfig(js){
    return {
        'entry': {
            'demo': js
        },
        'module': {},
        'plugins': [],
        'output': {
            'filename': 'demo.build.js',
            'path': './demo'
        },
        "stats": "verbose"
    };
}

function promiseError(err){
    console.error(err);
    process.exit(1);
}


module.exports = MerlinComponentDemoServer;
module.exports.LOGGER = LOGGER;

'use strict';

const path = require('path');

const express = require('express');
const mustache = require('mustache');

const LOGGER = require('./logger');
const { resolveDependency } = require('./dependency-resolvers');
const { loadTemplate } = require('./template-utils');
const { loadJSON, promiseError } = require('./utils');

const COMPONENTS = new Map();
const PARTIALS = {};
const THEMES = {};
const JS = {};
const DATA = {};
let MASTER_CONFIG = null;
let MASTER_COMPONENT = null;

class MerlinComponentDemoServer {

    _loadAppTemplates(){
        return Promise.all([
            loadTemplate(path.resolve(__dirname, '../templates/component.html')),
            loadTemplate(path.resolve(__dirname, '../templates/page.html'))
        ]).then((templates) => {
            this._partials.component = templates[0];
            this._partials.page = templates[1];
            return Promise.resolve();
        }, promiseError);
    }

    _createExpressApp(){
        // Create the app
        const app = express();
        // Check if assets were installed. If so, setup the assets folder
        if(COMPONENTS.has('@cnbritain/merlin-www-assets')){
            const assetComponent = COMPONENTS.get('@cnbritain/merlin-www-assets');
            app.use('/assets', express.static(`${assetComponent.location}/static`));
        }
        this._app = app;
        this._routes();
        return Promise.resolve();
    }

    _routes(){
        this._app.get('/static/*', routeStatic.bind(this));
        this._app.get('/', routeIndex.bind(this));
        this._app.get('/data/:data', routeData.bind(this));
        this._app.get('/theme/:theme', routeTheme.bind(this));
        this._app.get('/:theme/:partial/:data', routeDataTheme.bind(this));
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

    constructor(config={}, port=null){

        this._app = null;
        this._isListening = false;
        this._partials = {};

        this.port = null;

        MASTER_CONFIG = config;

        resolveDependency(COMPONENTS, config, '.')
            .then(() => {
                COMPONENTS.get(config.name).isMaster = true;
                MASTER_COMPONENT = COMPONENTS.get(config.name);
                MASTER_COMPONENT.createDemos();
                buildComponentDicts();
                this._loadAppTemplates();
                this._createExpressApp();
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

function routeData(req, res){
    const data = `${MASTER_COMPONENT.name}/${decodeURIComponent(req.params.data)}`;
    const view = {
        "data": {
            "groups": [],
            "title": `${req.params.data} data page`
        }
    };
    view.data.groups = MASTER_COMPONENT.demos.map((group) => {
        return {
            "name": group.name,
            "demos": group.demos.filter((demo) => {
                return demo.data === data;
            })
        };
    }).filter((group) => {
        return group.demos.length > 0;
    });
    const indexPage = mustache.render(this._partials.page, view);

    LOGGER.log('SERVER', 'Data page loaded');
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

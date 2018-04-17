'use strict';

const path = require('path');
const http = require('http');
const socket = require('socket.io');
const express = require('express');
const mustacheExpress = require('mustache-express');
const chokidar = require('chokidar');
const Mustache = require('mustache');
const opn = require('opn');
const {DEFAULT_PORT, COMPONENTS} = require('./constants');
const Logger = require('./Logger');
const ComponentManager = require('./ComponentManager');

const resolve = p => path.resolve(__dirname, p);
let RENDER_SETTINGS = null;

class Server {

    _dynamicAssetStatic(req, res){
        res.redirect(`/assets/${this._currentTheme}/${req.params[0]}`);
    }

    _onIndex(req, res){
        const componentSettings = {
            partials: Array.from(this.component.partials.keys()).map((key) => {
                return {
                    name: key,
                    main: this.component.name === key
                }
            }),
            themes: Array.from(this.component.themes.keys()),
            data: Array.from(this.component.data.keys()),
            name: this.component.name,
            dependencies: Array.from(this.component.dependencies.values()).map((d) => {
                return d.name.replace(/^@cnbritain\//gi, '');
            })
        };

        return res.render('index', {
            component: componentSettings
        });
    }

    _initApp(){
        const app = express();
        const server = http.Server(app);

        // Middleware
        app.engine('mustache', mustacheExpress());
        const viewDir = resolve('../views');
        Logger.log('SERVER', `Setting view directory: ${viewDir}`);
        app.set('views', viewDir);
        app.set('view engine', 'mustache');
        // Alows us to change the mustache template in views on the fly
        app.set('view cache', false);
        // Editor statics
        app.use('/editor', express.static(resolve('../static')));

        // Routes
        app.get('/', this._onIndex.bind(this));
        // Enable dynamic static for assets if assets is added
        if(COMPONENTS.has('@cnbritain/merlin-www-assets')){
            const assetComponent = COMPONENTS.get(
                '@cnbritain/merlin-www-assets');
            const assetStatic = path.resolve(
                path.dirname(assetComponent.filename),
                'static'
            );
            app.use('/assets', express.static(assetStatic));
            app.get('/static/*', this._dynamicAssetStatic.bind(this));
        }

        this._app = app;
        this._http = server;
    }

    _initSocket(){
        const io = socket(this._http);
        this._io = io;

        io.on('connection', socket => {
            this._sockets.push(socket);

            // Changing settings
            socket.on('render', async (e) => {
                RENDER_SETTINGS = e;
                this._currentTheme = RENDER_SETTINGS.THEME;
                const html = await render(this.component);
                socket.emit('render', html);
            });
            // TODO: only theme changes
            // socket.on('theme', e => console.log(e));

            socket.on('disconnect', () => {
                this._sockets.splice(this._sockets.indexOf(socket), 1);
                socket.removeAllListeners();
            });
        });
    }

    _initWatch(){
        const watcher = chokidar.watch(this.component.getWatchFiles());
        watcher.on('change', async (filename) => {
            const fileExt = path.extname(filename);
            let onlyStyles = false;

            switch (fileExt){

                // Partials
                case '.html':
                case '.mustache':
                    Mustache.clearCache();
                    for(const dep of COMPONENTS.values()){
                        await dep.resolvePartials();
                    }
                    break;

                // Themes
                case '.css':
                case '.scss':
                    onlyStyles = true;
                    break;

                // JS
                case '.js':
                    break;

                // Data
                case '.json':
                    for(const dep of COMPONENTS.values()){
                        await dep.resolveData();
                    }
                    break;

            }

            if(onlyStyles){
                const newCss = await renderStyles(this.component);
                this._io.emit('renderStyles', newCss);
            } else {
                const html = await render(this.component);
                this._io.emit('render', html);
            }

        });
    }

    constructor(component){
        this._app = null;
        this._http = null;
        this._io = null;
        this._sockets = [];
        this._currentTheme = null;
        this.component = component;
    }

    run(port=DEFAULT_PORT){
        this._initApp();
        this._initSocket();
        this._initWatch();
        this._http.listen(port, () => {
            opn(`http://localhost:${port}`);
            Logger.log('SERVER', `Running on port ${port}`);
        });
    }

}

async function renderStyles(component){
    const styles = await component.renderStyles(
        RENDER_SETTINGS.THEME
    );
    return styles;
}

async function render(component){
    const html = await component.render(
        RENDER_SETTINGS.PARTIAL,
        RENDER_SETTINGS.THEME,
        RENDER_SETTINGS.DATA,
        RENDER_SETTINGS.JS
    );
    return html;
}

module.exports = Server;

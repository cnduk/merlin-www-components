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
const {ComponentManager} = require('./components');
const {SnapshotManager} = require('./snapshots');

const resolve = p => path.resolve(__dirname, p);
let RENDER_SETTINGS = null;
const RENDERER_SOCKETS = new Map();

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

    _onRender(req, res){
        return res.render('render', {SESSION_ID: req.query.id});
    }

    async _onSnapshot(req, res){
        console.log(req.query);

        let pageSnapshots = null;

        if(req.query.hasOwnProperty('compare')){
            const c = await SnapshotManager.compareSnapshots(
                req.query.id, req.query.compare);

            pageSnapshots = Array.from(c.entries()).map(i => {
                return {
                    name: i[0],
                    url: i[1]
                };
            });
        } else {
            const snapshot = SnapshotManager.snapshots[req.query.id];
            pageSnapshots = Array.from(snapshot.images.entries()).map(i => {
                return {
                    name: i[0],
                    url: i[1]
                };
            });
        }

        return res.render('snapshot', {snapshots: pageSnapshots});
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
        app.get('/render', this._onRender.bind(this));
        app.get('/snapshot', this._onSnapshot.bind(this));

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

        // Renderer - we can have multiple renderer pages
        const nsRenderer = io.of('/renderer');
        nsRenderer.on('connection', socket => {
            socket.once('id', async (id) => {
                RENDERER_SOCKETS.set(socket, id);
                Logger.log('SERVER', `Renderer socket connected ${id}`);

                if(RENDER_SETTINGS !== null){
                    try {
                        const html = await render(this.component);
                        socket.emit('render', html);
                    } catch(err){
                        socket.emit('renderError', JSON.stringify(err));
                    }
                }

            });
        });

        // Editor
        const nsEditor = io.of('/editor');
        nsEditor.on('connection', socket => {
            const id = socket.id.split('#')[1];
            Logger.log('SERVER', `Editor socket connected ${id}`);

            this._sockets.push(socket);

            socket.emit('id', id);
            socket.emit(
                'snapshot-list',
                SnapshotManager.snapshots.map(s => s.name)
            );

            // Changing settings
            socket.on('render', async (e) => {
                RENDER_SETTINGS = e;
                this._currentTheme = RENDER_SETTINGS.THEME;
                const s = getSocketsWithId(RENDERER_SOCKETS, id);
                try {
                    const html = await render(this.component);
                    s.forEach((sock) => sock.emit('render', html));
                } catch(err){
                    s.forEach((sock) => {
                        sock.emit('renderError', JSON.stringify(err));
                    });
                }
            });

            socket.on('snapshot', async () => {
                await SnapshotManager.takeSnapshot(
                    `http://localhost:${this._appPort}/render?id=${id}`);

                socket.emit(
                    'snapshot-complete',
                    SnapshotManager.snapshots.map(s => s.name)
                );
            });

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

            const s = Array.from(RENDERER_SOCKETS.keys());
            if(onlyStyles){
                try {
                    const newCss = await renderStyles(this.component);
                    s.forEach((sock) => {
                        sock.emit('renderStyles', newCss);
                    });
                } catch(err){
                    const jsonError = JSON.stringify(err);
                    s.forEach((sock) => {
                        sock.emit('renderError', jsonError);
                    });
                }
            } else {
                try {
                    const html = await render(this.component);
                    s.forEach((sock) => {
                        sock.emit('render', html);
                    });
                } catch(err){
                    const jsonError = JSON.stringify(err);
                    s.forEach((sock) => {
                        sock.emit('renderError', jsonError);
                    });
                }
            }

        });
    }

    constructor(component){
        this._app = null;
        this._http = null;
        this._io = null;
        this._sockets = [];
        this._currentTheme = null;
        this._appPort = null;
        this.component = component;
    }

    run(port=DEFAULT_PORT){
        this._appPort = port;
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

function getSocketsWithId(socketMap, id){
    const sockets = [];
    for(const [sock, i] of socketMap.entries()){
        if(i === id) sockets.push(sock);
    }
    return sockets;
}

module.exports = Server;

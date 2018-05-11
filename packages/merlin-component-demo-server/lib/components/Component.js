'use strict';

const path = require('path');
const Mustache = require('mustache');
const {COMPONENTS} = require('../constants');
const {loadFile, loadJSON} = require('../utils');
const {compileSass} = require('../sass/utils');
const {compileJS} = require('../webpack/utils');
const Logger = require('../Logger');

class Component {

    async _resolveDependencies(){
        Logger.log('COMPONENT', `Resolving dependencies for ${this.name}`);

        for(const name of this._config.dependencies){
            if(!COMPONENTS.has(name)){
                Logger.log('COMPONENT', `${this.name}: Component ${name} not found! Loading merlin.json`);

                // Get filename for merlin
                const filename = resolveDependencyMerlin(this.filename, name);
                let config = null;
                try {
                    config = await loadJSON(filename);
                } catch(err){
                    console.error(err);
                    process.exit(1);
                }

                const c = new Component(filename, config);
                COMPONENTS.set(config.name, c);
                // NOTE: resolve after we add to components to prevent
                // creating multiple of same components
                await c.resolve();
            }
            this.dependencies.set(name, COMPONENTS.get(name));
        }
    }

    async resolvePartials(){
        Logger.log('PARTIAL', `Resolving partials for ${this.name}`);
        this.partials.clear();

        // Resolve local partials
        for(const [name, filename] of Object.entries(this._config.partials)){
            const partial = await loadFile(
                resolvePartial(this.filename, filename));
            const key = partialKey(this.config, name);

            // Parse the mustache template
            Mustache.parse(partial);

            this.partials.set(key, partial);
            Logger.log('PARTIAL', `${this.name}: Found ${name} partial -> ${key}`);
        }

        // Assign main
        if(this.main){
            this.partials.set(this.name, this.partials.get(this.main));
            Logger.log('PARTIAL', `${this.name}: Setting main -> ${this.main}`);
        }

        // TODO: Maybe add in dependency partials?
    }

    async _resolveThemes(){
        Logger.log('SASS', `Resolving themes for ${this.name}`);

        for(const [name, filename] of Object.entries(this._config.themes)){
            this.themes.set(name, resolveTheme(this.filename, filename));
            Logger.log('SASS', `${this.name}: Found ${name} theme`);
        }
    }

    async resolveData(){
        Logger.log('DATA', `Resolving data for ${this.name}`);
        this.data.clear();

        for(const [name, filename] of Object.entries(this._config.data)){
            const data = await loadJSON(resolveData(this.filename, filename));
            this.data.set(name, data);
            Logger.log('DATA', `${this.name}: Found ${name} data`);
        }
    }

    async _resolveJS(){
        Logger.log('JS', `Resolving JS for ${this.name}`);

        for(const [name, filename] of Object.entries(this._config.js)){
            this.js.set(name, resolveJS(this.filename, filename));
            Logger.log('JS', `${this.name}: Found ${name} theme`);
        }
    }

    constructor(filename, config){
        this._config = Object.assign({}, config);
        this._isResolved = false;

        this.filename = filename;
        this.name = this._config.name;
        this.main = partialKey(this._config, this._config.main);

        this.dependencies = new Map();
        this.partials = new Map();
        this.themes = new Map();
        this.js = new Map();
        this.data = new Map();
    }

    get config(){
        return this._config;
    }

    async resolve(){
        if(this._isResolved) return;

        // Dependencies
        await this._resolveDependencies();

        // Partials
        await this.resolvePartials();

        // Themes
        await this._resolveThemes();

        // JS
        await this._resolveJS();

        // Data
        await this.resolveData();

        this._isResolved = true;
    }

    getAllPartials(){
        const partials = {};

        // Add component partials
        for(const [k, v] of this.partials.entries()){
            partials[k] = v;
        }

        // Each dependency
        for(const dep of this.dependencies.values()){
            Object.assign(partials, dep.getAllPartials());
        }

        return partials;
    }

    async renderStyles(themeName){
        return await compileSass(
            this.themes.get(themeName),
            this.config
        );
    }

    async render(partialName, themeName, dataName, enableJS){

        // Mustache render
        const html = Mustache.render(
            this.partials.get(partialName),
            this.data.get(dataName),
            this.getAllPartials()
        );

        // Get sass
        // TODO: cache this?
        const compiledSass = await this.renderStyles(themeName);
        const styles = `
            <style id="elStyles" type="text/css">
                ${compiledSass}
            </style>
        `;

        // Get scripts
        let scripts = '';
        if(enableJS){
            let compiledJS = null;

            if(this.js.has('demo')){
                compiledJS = await compileJS(
                    this, themeName, 'demo', this.js.get('demo'));
            } else {
                compiledJS = `console.log('No demo js found.')`;
            }
            scripts = `
                <script type="text/javascript">
                    ${compiledJS}
                </script>
            `;
        }

        return `${styles}\n${html}\n${scripts}`;
    }

    getWatchFiles(){
        let files = [];
        const currentDir = path.dirname(this.filename);

        // Get component files - sass, partials, js, data
        files = files.concat([
            // Styles
            path.resolve(currentDir, 'sass/**/*.scss'),
            // Partials
            path.resolve(currentDir, 'partials/**/*.html'),
            path.resolve(currentDir, 'partials/**/*.mustache'),
            path.resolve(currentDir, 'templates/**/*.html'),
            path.resolve(currentDir, 'templates/**/*.mustache'),
            // JS
            path.resolve(currentDir, 'js/**/*.js'),
            // Data
            path.resolve(currentDir, 'data/**/*.json'),
            path.resolve(currentDir, 'demo/**/*.json')
        ]);

        // Get dependency files
        for(const dep of this.dependencies.values()){
            files = files.concat(dep.getWatchFiles());
        }

        return files;
    }

}

module.exports = Component;


function resolveDependencyMerlin(currentFilename, dependencyName){
    return path.resolve(
        path.dirname(currentFilename),
        'node_modules',
        dependencyName,
        'merlin.json'
    );
}

function resolvePartial(currentFilename, partialFilename){
    return path.resolve(
        path.dirname(currentFilename),
        partialFilename
    );
}

function resolveTheme(currentFilename, themeFilename){
    return path.resolve(
        path.dirname(currentFilename),
        themeFilename
    );
}

function resolveData(currentFilename, dataFilename){
    return path.resolve(
        path.dirname(currentFilename),
        dataFilename
    );
}

function resolveJS(currentFilename, jsFilename){
    return path.resolve(
        path.dirname(currentFilename),
        jsFilename
    );
}

function partialKey(config, name){
    return `${config.name}/${name}`;
}

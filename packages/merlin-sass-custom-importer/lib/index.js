'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const COMPONENTS_DIR = path.normalize('node_modules');
const LOGGER = {
    'enabled': false,
    'log': function(mode, ...args){
        if(!this.enabled) return;
        this[mode](...args);
    },
    'SKIP': function(...args){
        console.log(chalk.underline.red(...args));
    },
    'LOAD': function(...args){
        console.log(chalk.underline.green(...args));
    }
};
const WIREFRAME_KEY = {
    key: ':wireframe',
    length: 10,
    file: 'sass/wireframe/wireframe',
    contains: function(url){
        return url.endsWith(this.key);
    },
    resolve: function(url, previous){
        const previousDir = getComponentDirFromPath(previous);
        const baseUrl = url.substr(0, url.length - this.length);
        return path.resolve(previousDir, 'node_modules', baseUrl, this.file);
    }
};
const THEME_KEY = {
    key: ':theme',
    length: 6,
    contains: function(url){
        return url.endsWith(this.key);
    },
    resolve: function(url, previous, theme){
        const previousDir = getComponentDirFromPath(previous);
        const baseUrl = url.substr(0, url.length - this.length);
        return path.resolve(previousDir, 'node_modules', baseUrl, `sass/${theme}/${theme}.scss`);
    }
};
const BRAND_KEY = {
    key: null,
    length: null,
    contains: function(url){
        return BRAND_THEMES.some((brand) => url.endsWith(`:${brand}`));
    },
    resolve: function(url, previous){
        let theme = null;
        let len = BRAND_THEMES.length;
        while(len--){
            if(url.endsWith(`:${BRAND_THEMES[len]}`)){
                theme = BRAND_THEMES[len];
                break;
            }
        }

        const previousDir = getComponentDirFromPath(previous);
        const baseUrl = url.substr(0, url.length - theme.length - 1);
        return path.resolve(previousDir, 'node_modules', baseUrl, `sass/${theme}/${theme}.scss`);
    }
};

const BRAND_THEMES = [
    "vogue",
    "wired",
    "glamour",
    "gq",
    "tatler",
    "traveller",
    "missvogue"
];

module.exports = function(merlinConfig={}, scopeName=null){

    const SESSION = new Set();
    SESSION.SKIPPED_ITEMS = 0;
    SESSION.LOADED_ITEMS = 0;
    SESSION.reset = function sessionReset(){
        SESSION.clear();
        SESSION.SKIPPED_ITEMS = 0;
        SESSION.LOADED_ITEMS = 0;
    };

    const scope = scopeName ? `(${scopeName})` : '';

    function importer(url, previous, done){

        const realPrevious = fs.realpathSync(previous);
        let sassUrl = null;

        // Check if path begins with @, update url to be component based
        if(url.startsWith('@')){
            sassUrl = resolveComponentTheme(url, realPrevious);

        // Resolve url normally, relatively
        } else {
            let urlParts = path.normalize(realPrevious).split(path.sep);
            urlParts.pop();
            sassUrl = path.resolve(urlParts.join(path.sep), url);
        }

        correctSassPartials(sassUrl);

        if(SESSION.has(sassUrl)){
            LOGGER.log('SKIP', `SASS${scope}::Skipping ${sassUrl}`);
            SESSION.SKIPPED_ITEMS++;
            return done({ contents: '' });
        }

        LOGGER.log('LOAD', `SASS${scope}::Loading ${sassUrl}`);
        SESSION.LOADED_ITEMS++;
        SESSION.add(sassUrl);
        return done({ file: sassUrl });
    }

    importer.SESSION = SESSION;

    return importer;

};
module.exports.LOGGER = LOGGER;

function correctSassPartials(url){
    const urlPieces = url.split(path.sep);
    let filename = urlPieces.pop();
    if(filename.startsWith('_')){
        filename = filename.slice(1);
    }
    return path.resolve(urlPieces.join(path.sep), filename);
}

function resolveComponentTheme(url, previous){
    // Check if we're using our keywords - theme, wireframe. If so, resolve
    // the sass location
    if(WIREFRAME_KEY.contains(url)){
        return WIREFRAME_KEY.resolve(url, previous);
    } else if(THEME_KEY.contains(url)){
        return THEME_KEY.resolve(url, previous, merlinConfig.currentTheme);
    } else if(BRAND_KEY.contains(url)){
        return BRAND_KEY.resolve(url, previous);
    } else {
        return url;
    }
}

const RE_COMPONENT_DIR = new RegExp(`(.+packages${path.sep}merlin-[-\\w]+${path.sep})`);
function getComponentDirFromPath(p){
    const matches = RE_COMPONENT_DIR.exec(p);
    if(matches){
        return matches[1];
    }
    throw new Error(`Cannot find component name in path: ${p}`);
}
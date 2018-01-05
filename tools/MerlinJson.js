'use strict';

const fs = require('fs');
const path = require('path');

function getValue(src, key, defaultValue){
    if(src.hasOwnProperty(key)) return src[key];
    return defaultValue;
}

function resolveObject(files, parentDir){
    const o = new Map();
    for(const [key, value] of Object.entries(files)){
        o.set(key, path.resolve(parentDir, value));
    }
    return o;
}

function validateFilenames(filenameGroup, filenameMap){
    for(const filename of filenameMap.values()){
        try {
            const fsStat = fs.statSync(filename);
            if(!fsStat.isFile()){
                throw new Error();
            }
        } catch(err){
            throw new TypeError(
                `Missing ${filenameGroup}\nCannot found file ${filename}\n`);
        }
    }
    return true;
}

class MerlinJson {

    constructor(config, parentDir){
        this.name = config.name;
        this.description = getValue(config, 'description', null);
        this.currentTheme = getValue(config, 'currentTheme', null);
        this.parentDir = parentDir;

        this.dependencies = getValue(config, 'dependencies', []).slice(0);
        this.partials = resolveObject(
            getValue(config, 'partials', {}), parentDir);
        this.main = getValue(config, 'main', null);
        this.themes = resolveObject(getValue(config, 'themes', {}), parentDir);
        this.data = resolveObject(getValue(config, 'data', {}), parentDir);
        this.js = resolveObject(getValue(config, 'js', {}), parentDir);
        this.demo = Object.assign({}, getValue(config, 'demo', {}));

        this.validate();
    }

    validateDependencies(){
        const NODE_MODULES = path.resolve(this.parentDir, 'node_modules');
        this.dependencies.forEach((dependency) => {
            const dependencyDir = path.resolve(NODE_MODULES, dependency);
            try {
                const fsStat = fs.statSync(dependencyDir);
                if(!fsStat.isDirectory()){
                    throw new Error();
                }
            } catch(err) {
                throw new TypeError(
                    `Missing dependency\nCannot find ${dependency}`);
            }
        });
        return true;
    }

    validatePartials(){
        validateFilenames('partial', this.partials);
        if(this.main !== null && !this.partials.has(this.main)){
            throw new TypeError(
                `Unknown partial main\nCannot find ${this.main}`);
        }
        return true;
    }

    validateThemes(){
        return validateFilenames('theme', this.themes);
    }

    validateData(){
        return validateFilenames('data', this.data);
    }

    validateJs(){
        return validateFilenames('js', this.js);
    }

    validateDemo(){
        for(const [demoName, demoSettings] of Object.entries(this.demo)){
            // Themes
            demoSettings.themes.forEach((theme) => {
                if(!this.themes.has(theme)){
                    throw new TypeError(
                        `Unknown theme in demo ${demoName}: ${theme}`);
                }
            });
            // Main
            if(!this.partials.has(demoSettings.main)){
                throw new TypeError(
                    `Unknown main in demo ${demoName}: ${demoSettings.main}`);
            }
            // Data
            if(!this.data.has(demoSettings.data)){
                throw new TypeError(
                    `Unknown data in demo ${demoName}: ${demoSettings.data}`);
            }
        }
        return true;
    }

    validate(){
        this.validateDependencies();
        this.validatePartials();
        this.validateThemes();
        this.validateData();
        this.validateJs();
        this.validateDemo();
    }

    static fromFilename(filename){
        const resolvedFilename = path.resolve(filename);
        const parentDir = path.dirname(filename);
        return new MerlinJson(require(resolvedFilename), parentDir);
    }

}

module.exports = MerlinJson;

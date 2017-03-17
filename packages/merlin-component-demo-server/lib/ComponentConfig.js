'use strict';

class ComponentConfig {

    _getDemoUrl(theme, partial, data){
        const escapedTheme = encodeURIComponent(theme);
        const escapedPartial = encodeURIComponent(partial);
        const escapedData = encodeURIComponent(data);
        return `/${escapedTheme}/${escapedPartial}/${escapedData}`;
    }

    _getKeyPrefix(value){
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

    _createAllDemoGroups(){
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
        return [ demoGroup ];
    }

    _createSimpleDemoGroup(demoKey, demoValue){
        const demoGroup = {
            name: demoKey,
            demos: []
        };
        const dataKey = this._getKeyPrefix(demoValue);

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
        return demoGroup;
    }

    _createDetailedDemoGroup(demoKey, demoValue){
        const demoGroup = {
            name: demoKey,
            demos: []
        };
        const dataKey = this._getKeyPrefix(demoValue.data);
        const partialKey = this._getKeyPrefix(demoValue.main);

        // Check data key exists
        if(!this.data.has(dataKey)){
            throw new Error(`unknown data key in demo - ${demoValue.data}`);
        }

        // Check main exists
        if(!this.partials.has(partialKey)){
            throw new Error(`unknown partial key in demo - ${demoValue.main}`);
        }

        demoValue.themes.forEach((demoTheme) => {
            const themeKey = this._getKeyPrefix(demoTheme);

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

        return demoGroup;
    }

    _hasConfigDemos(config){
        if(!config.hasOwnProperty('demo')) return false;
        return Object.keys(config.demo).length > 0;
    }

    createDemos(){
        const demos = [];

        if(this._hasConfigDemos(this._config)){
            Object.keys(this._config.demo).forEach((demoKey) => {

                const demoValue = this._config.demo[demoKey];
                let demoGroup = null;

                if(typeof demoValue === 'string'){
                    demoGroup = this._createSimpleDemoGroup(
                        demoKey, demoValue);
                } else {
                    demoGroup = this._createDetailedDemoGroup(
                        demoKey, demoValue);
                }

                demos.push(demoGroup);
            });

        // No demos so create a default list from data, themes and main
        } else {
            demos = this._createAllDemoGroups();
        }

        this.demos = demos;
    }

}

module.exports = ComponentConfig;

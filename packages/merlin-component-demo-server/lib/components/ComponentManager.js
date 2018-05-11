'use strict';

const {COMPONENTS} = require('../constants');
const {loadJSON} = require('../utils');
const Component = require('./Component');

class ComponentManager {

    constructor(){}

    get components(){
        return COMPONENTS;
    }

    async create(filename){

        let config = null;
        try {
            config = await loadJSON(filename);
        } catch (err){
            console.error(err);
            process.exit(1);
        }

        if(!COMPONENTS.has(config.name)){
            const c = new Component(filename, config);
            COMPONENTS.set(config.name, c);
            await c.resolve();
        }
        return COMPONENTS.get(config.name);
    }

}

module.exports = new ComponentManager();

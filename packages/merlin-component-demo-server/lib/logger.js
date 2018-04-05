'use strict';

const chalk = require('chalk');

const sassImporter = require('@cnbritain/merlin-sass-custom-importer');

class Logger {

    constructor(){
        this._enabled = false;
    }

    get enabled(){
        return this._enabled;
    }
    set enabled(value){
        this._enabled = value;
        sassImporter.LOGGER.enabled = value;
    }

    log(mode, ...args){
        if(!this.enabled) return;
        this[mode](...args);
    }

    DATA(...args){
        console.log(chalk.red(...args));
    }

    TEMPLATE(...args){
        console.log(chalk.magenta(...args));
    }

    PARTIAL(...args){
        console.log(chalk.cyan(...args));
    }

    SASS(...args){
        console.log(chalk.yellow(...args));
    }

    SERVER(...args){
        console.log(chalk.bold.green(...args));
    }

    JS(...args){
        console.log(chalk.blue(...args));
    }

    COMPONENT(...args){
        console.log(chalk.italic(...args));
    }

}

module.exports = new Logger();

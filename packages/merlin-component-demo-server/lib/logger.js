const chalk = require('chalk');

const sassImporter = require('@cnbritain/merlin-sass-custom-importer');

const LOGGER = {
    _enabled: false,
    get enabled(){
        return this._enabled;
    },
    set enabled(value){
        this._enabled = value;
        sassImporter.LOGGER.enabled = value;
    },
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
    },
    'COMPONENT': function(...args){
        console.log(chalk.italic(...args));
    }
};

module.exports = LOGGER;

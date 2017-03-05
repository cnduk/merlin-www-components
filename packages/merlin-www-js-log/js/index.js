'use strict';

var LOG_LOCALSTORAGE_KEY = 'merlin-www-log-js';
var LOG_LEVELS = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    silent: 5
};
var LOG_STYLES = {
    trace: 'color:green;',
    debug: 'color:cyan;',
    info: 'color:purple;',
    warn: 'color:orange;',
    error: 'background-color:red;color:black;'
};

export var LOGGERS = {};

var noop = function noop(){};
var consoleLog = window.console.log.bind(window.console);
var backupConsole = {
    error: window.console.error,
    log: window.console.log,
    info: window.console.info,
    warn: window.console.warn
};
var isHijacked = false;


function Logger(loggerName){
    if(LOGGERS.hasOwnProperty(loggerName)){
        throw new Error('Logger already exists with name ' + loggerName);
    }

    this.colors = true;
    this.currentLevel = null;
    this.name = loggerName;

    LOGGERS[this.name] = this;
    getPersistedLevel();
}

var loggerPrototype = {

    _log: function _log(levelName, args){
        // Check if we can console log at this time
        if(LOG_LEVELS[levelName] < LOG_LEVELS[this.currentLevel]) return;

        if(this.colors){
            args.splice(0, 0, this.name + ' %c' + levelName.toUpperCase());
            args.splice(1, 0, LOG_STYLES[levelName]);
        } else {
            args.splice(0, 0, this.name + ' ' + levelName.toUpperCase());
        }

        consoleLog.apply(null, args);
    },

    constructor: Logger,

    setDefaultLogLevel: function(levelName){
        validateLevelName(levelName);
    },

    setGlobalLogLevel: function(levelName){
        validateLevelName(levelName);
        LOGGERS.forEach(function updateGlobalLogLevel(logger){
            logger.setLogLevel(levelName);
        });
    },

    setLogLevel: function(levelName){
        validateLevelName(levelName);
        this.currentLevel = levelName;
        setPersistedLevel();
    },

    trace: function(){
        var args = copy(arguments);
        this._log('trace', args);
    },

    debug: function(){
        var args = copy(arguments);
        this._log('debug', args);
    },

    info: function(){
        var args = copy(arguments);
        this._log('info', args);
    },

    warn: function(){
        var args = copy(arguments);
        this._log('warn', args);
    },

    error: function(){
        var args = copy(arguments);
        this._log('error', args);
    }

};

Logger.prototype = loggerPrototype;

hijackConsole();
getPersistedLevel();
export default Logger;

function copy(args){
    var len = args.length;
    var o = new Array(len);
    while(len--) o[len] = args[len];
    return o;
}

function getPersistedLevel(){
    var json;
    try {
        json = window.localStorage.getItem(LOG_LOCALSTORAGE_KEY);
    } catch(err){
        return;
    }
    var config = JSON.parse(json);
    for(var key in config){
        if(!config.hasOwnProperty(key)) continue;
        if(!LOGGERS.hasOwnProperty(key)) continue;
        LOGGERS[key].setLogLevel(config[key]);
    }
}

function setPersistedLevel(){
    var config = {};
    Object.keys(LOGGERS).forEach(function(key){
        config[key] = LOGGERS[key].currentLevel;
    });
    var json = JSON.stringify(config);
    try {
        window.localStorage.setItem(LOG_LOCALSTORAGE_KEY, json);
    } catch(err){}
}

export function hijackConsole(){
    if(isHijacked) return;
    isHijacked = true;
    window.console.error = noop;
    window.console.info = noop;
    window.console.log = noop;
    window.console.warn = noop;
}

export function liberateConsole(){
    if(!isHijacked) return;
    isHijacked = false;
    window.console.error = backupConsole.error;
    window.console.info = backupConsole.info;
    window.console.log = backupConsole.log;
    window.console.warn = backupConsole.warn;
}

function validateLevelName(levelName){
    if(LOG_LEVELS.hasOwnProperty(levelName)) return true;
    throw new Error(levelName + ' is not a valid log level');
}

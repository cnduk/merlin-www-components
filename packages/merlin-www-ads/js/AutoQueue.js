'use strict';

export var DEFAULT_TIMEOUT = 1500;

function AutoQueue(timeout){
    this._callbacks = [];
    this._list = [];
    this.isRunning = false;
    this.timeout = (
        timeout === undefined ? DEFAULT_TIMEOUT : parseInt(timeout, 10));
}
AutoQueue.prototype = {

    '_finish': function(){
        this._callbacks.forEach(function(fn){ fn(); });
        this._callbacks.length = 0;
        this.isRunning = false;
    },

    '_next': function(){
        if(this._list.length < 1) return this._finish();
        if(this.isRunning) return;
        this.isRunning = true;
        var fn = this._list.shift();
        var p = new Promise(function(res, rej){
            var tmr = setTimeout(function(){
                tmr = null;
                res();
            }, this.timeout);
            fn(function(){
                clearTimeout(tmr);
                res();
            }, function(){
                clearTimeout(tmr);
                rej();
            });
        }.bind(this)).then(function(){
            this.isRunning = false;
            this._next();
        }.bind(this),function(){
            this.isRunning = false;
            this._next();
        }.bind(this));
    },

    'chain': function(fn, callback){
        this._list.push(fn);
        this._callbacks.push(callback);
        this._next();
    },

    'constructor': AutoQueue

};

export default AutoQueue;
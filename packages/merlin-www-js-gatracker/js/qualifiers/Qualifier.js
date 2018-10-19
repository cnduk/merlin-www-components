
import EventEmitter from 'eventemitter2';
import {inherit} from '@cnbritain/merlin-www-js-utils/js/functions';

function Qualifier(){
    EventEmitter.call(this, {wildcard: true});

    this._isSetup = false;
    this.isQualified = false;
    this.setup();
}

Qualifier.prototype = inherit(EventEmitter.prototype, {
    constructor: Qualifier,
    qualify: function qualify(){
        this.isQualified = true;
        this.emit('qualify');
        this.teardown();
    },
    _setup: function _setup(){},
    setup: function setup(){
        if(this._isSetup) return;
        this._isSetup = true;
        this._setup();
    },
    _teardown: function _teardown(){},
    teardown: function teardown(){
        if(!this._isSetup) return;
        this._isSetup = false;
        this._teardown();
        this.removeAllListeners();
    }
});

export default Qualifier;

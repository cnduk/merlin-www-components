import EventEmitter from 'eventemitter2';
import {
    inherit,
    loadScript
} from '@cnbritain/merlin-www-js-utils/js/functions';

function SailthruManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this._sailthrewId = null;
    this._hasLoadedScript = false;
}

SailthruManager.prototype = inherit(EventEmitter.prototype, {
    constructor: SailthruManager,

    init: function init(sailthrewId) {
        this._sailthrewId = sailthrewId;
    },

    loadScript: function loadScript() {
        if (this._hasLoadedScript) return;
        if (this._sailthrewId === null) {
            console.warn('Missing Sailthru Id', this._sailthrewId);
            return;
        }
        this._hasLoadedScript = true;
        loadScript('https://ak.sail-horizon.com/spm/spm.v1.min.js').then(function(){
            this.initSaleThrough();
        }.bind(this));
    },

    initSaleThrough: function initSaleThrough() {
        if (this._hasLoadedScript && this._sailthrewId !== null) {
            Sailthru.init({customerId: this._sailthrewId});
        }
    }
});

export default new SailthruManager();

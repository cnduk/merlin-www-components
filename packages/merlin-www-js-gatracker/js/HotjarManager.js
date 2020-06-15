import EventEmitter from 'eventemitter2';
import {
    inherit,
    loadScript
} from '@cnbritain/merlin-www-js-utils/js/functions';

function HotjarManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this._hjsv = 6;
    this._hotjarId = null;
    this._hasLoadedScript = false;
}

HotjarManager.prototype = inherit(EventEmitter.prototype, {
    constructor: HotjarManager,

    init: function init(hotjairId) {
        this._hotjarId = hotjarId;
    },

    loadScript: function loadScript() {
        if (this._hasLoadedScript) return;
        if (this._hotjarId === null) return; // Don't load the script if no hotjar ID is set
        
        this._hasLoadedScript = true;

        // Unwrapped the Hotjar embed to end up with...
        window.hj = window.hj || function() { (window.hj.q = window.hj.q || []).push(arguments) };
        window._hjSettings = { 
            hjid: this._hotjarId,
            hjsv: this._hjsv
        };

        var src = 'https://static.hotjar.com/c/hotjar-' + this._hotjarId + '.js?sv=' + this._hjsv;

        loadScript(src);
    }
});

export default new HotjarManager();
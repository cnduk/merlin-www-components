import EventEmitter from 'eventemitter2';
import {
    inherit,
    loadScript
} from '@cnbritain/merlin-www-js-utils/js/functions';

function SparrowManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this._sparrowConfig = null;
    this._hasLoadedScript = false;
}

SparrowManager.prototype = inherit(EventEmitter.prototype, {
    constructor: SparrowManager,

    init: function init(sparrowConfig) {
        this._sparrowConfig = sparrowConfig;
    },

    loadScript: function loadScript() {
        if (this._hasLoadedScript) return;
        if (this._sparrowConfig === null) {
            console.warn('Missing Sparrow Config', this._sparrowConfig);
        }
        
        this._hasLoadedScript = true;

        loadScript('https://pixel.condenastdigital.com/config/' + this._sparrowConfig + '.config.js').then(
            function() {
                loadScript('https://pixel.condenastdigital.com/sparrow.min.js');
            },
            function() {
                console.warn('Failed loading Sparrow Config!');
            }
        );
    }
});

export default new SparrowManager();
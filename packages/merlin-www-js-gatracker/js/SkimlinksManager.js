import EventEmitter from 'eventemitter2';
import {
    inherit,
    loadScript
} from '@cnbritain/merlin-www-js-utils/js/functions';

function SkimlinksManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this._skimlinksId = null;
    this._hasLoadedScript = false;
}

SkimlinksManager.prototype = inherit(EventEmitter.prototype, {
    constructor: SkimlinksManager,

    init: function init(skimlinksId) {
        this._skimlinksId = skimlinksId;
    },

    loadScript: function loadScript() {
        if (this._hasLoadedScript) return;
        if (this._skimlinksId === null) {
            console.warn('Missing Skimlinks Id', this._skimlinksId);
            return;
        }
        this._hasLoadedScript = true;
        loadScript(
            'https://s.skimresources.com/js/' +
                this._skimlinksId +
                '.skimlinks.js'
        );
    }
});

export default new SkimlinksManager();

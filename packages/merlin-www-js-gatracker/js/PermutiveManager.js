import EventEmitter from 'eventemitter2';
import {
    inherit,
    loadScript
} from '@cnbritain/merlin-www-js-utils/js/functions';

var PROJECT_ID = '';
var API_KEY = '';

function PermutiveManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this._config = null;
    this._hasLoadedScript = false;
}

PermutiveManager.prototype = inherit(EventEmitter.prototype, {
    constructor: PermutiveManager,

    setConfig: function setConfig(config) {
        this._config = config;
        permutive.addon('web', config);
    },

    init: function init(config) {
        !(function (n, e, o, r, i) {
            if (!e) {
                (e = e || {}),
                    (window.permutive = e),
                    (e.q = []),
                    (e.config = i || {}),
                    (e.config.projectId = o),
                    (e.config.apiKey = r),
                    (e.config.environment =
                        e.config.environment || 'production');
                for (
                    var t = [
                        'addon',
                        'identify',
                        'track',
                        'trigger',
                        'query',
                        'segment',
                        'segments',
                        'ready',
                        'on',
                        'once',
                        'user',
                        'consent'
                    ],
                    c = 0;
                    c < t.length;
                    c++
                ) {
                    var f = t[c];
                    e[f] = (function (n) {
                        return function () {
                            var o = Array.prototype.slice.call(arguments, 0);
                            e.q.push({ functionName: n, arguments: o });
                        };
                    })(f);
                }
            }
        })(document, window.permutive, PROJECT_ID, API_KEY, {});

        this.setConfig(config);
    },

    loadScript: function loadScript() {
        if (this._hasLoadedScript) return;

        this._hasLoadedScript = true;

        loadScript('https://cdn.permutive.com/' + PROJECT_ID + '-web.js');
    }
});

export default new PermutiveManager();

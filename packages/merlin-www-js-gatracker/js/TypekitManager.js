import EventEmitter from 'eventemitter2';
import { inherit } from '@cnbritain/merlin-www-js-utils/js/functions';

function TypekitManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this._typekitId = null;
    this._hasLoadedScript = false;
}

TypekitManager.prototype = inherit(EventEmitter.prototype, {
    constructor: TypekitManager,

    init: function init(typekitId) {
        this._typekitId = typekitId;
    },

    loadScript: function loadScript() {
        if (this._typekitId === null) return;
        if (this._hasLoadedScript) return;
        this._hasLoadedScript = true;
        (function(d, kitId) {
            var config = { kitId: kitId, scriptTimeout: 3000, async: true },
                h = d.documentElement,
                t = setTimeout(function() {
                    h.className =
                        h.className.replace(/\bwf-loading\b/g, '') +
                        ' wf-inactive';
                }, config.scriptTimeout),
                tk = d.createElement('script'),
                f = false,
                s = d.getElementsByTagName('script')[0],
                a;
            h.className += ' wf-loading';
            tk.src = 'https://use.typekit.net/' + config.kitId + '.js';
            tk.async = true;
            tk.onload = tk.onreadystatechange = function() {
                a = this.readyState;
                if (f || (a && a != 'complete' && a != 'loaded')) return;
                f = true;
                clearTimeout(t);
                try {
                    Typekit.load(config);
                } catch (e) {}
            };
            s.parentNode.insertBefore(tk, s);
        })(document, this._typekitId);
    }
});

export default new TypekitManager();

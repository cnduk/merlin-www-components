import EventEmitter from 'eventemitter2';
import { inherit } from '@cnbritain/merlin-www-js-utils/js/functions';

function FacebookPixelManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this._facebookPixelId = null;
    this._hasLoadedScript = false;
}

FacebookPixelManager.prototype = inherit(EventEmitter.prototype, {
    constructor: FacebookPixelManager,

    init: function init(facebookPixelId) {
        this._facebookPixelId = facebookPixelId;
    },

    loadScript: function loadScript() {
        if (this._hasLoadedScript) return;

        !(function(f, b, e, v, n, t, s) {
            if (f.fbq) return;
            n = f.fbq = function() {
                n.callMethod
                    ? n.callMethod.apply(n, arguments)
                    : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
        })(
            window,
            document,
            'script',
            'https://connect.facebook.net/en_US/fbevents.js'
        );

        this._hasLoadedScript = true;
        this.dispatchPageview();
    },

    dispatchPageview: function dispatchPageview() {
        if (this._hasLoadedScript && this._facebookPixelId !== null) {
            fbq('init', this._facebookPixelId);
            fbq('track', 'PageView');
        }
    }
});

export default new FacebookPixelManager();

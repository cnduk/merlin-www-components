import EventEmitter from 'eventemitter2';
import { inherit } from '@cnbritain/merlin-www-js-utils/js/functions';

function TwitterConversionManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this._twitterPixelID = null;
    this._hasLoadedScript = false;
}

TwitterConversionManager.prototype = inherit(EventEmitter.prototype, {
    constructor: TwitterConversionManager,

    init: function init(twitterPixelID) {
        this._twitterPixelID = twitterPixelID;
    },

    loadScript: function loadScript() {
        if (this._hasLoadedScript) return;
        if (this._twitterPixelID === null) {
            console.warn('Missing Twitter Pixel ID', this._twitterPixelID);
        }

        !function (e, t, n, s, u, a) {
            e.twq || (s = e.twq = function () {
                s.exe ? s.exe.apply(s, arguments) : s.queue.push(arguments);
            }, s.version = '1.1', s.queue = [], u = t.createElement(n), u.async = !0, u.src = '//static.ads-twitter.com/uwt.js',
                a = t.getElementsByTagName(n)[0], a.parentNode.insertBefore(u, a))
        }(window, document, 'script');

        this._hasLoadedScript = true;

        window.twq('init', this._twitterPixelID);
        window.twq('track', 'PageView');
    }
});

export default new TwitterConversionManager();
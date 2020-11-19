import EventEmitter from 'eventemitter2';
import { inherit } from '@cnbritain/merlin-www-js-utils/js/functions';
import { ArticleManager } from '@cnbritain/merlin-www-article';
import OneTrustManager from '@cnbritain/merlin-www-js-gatracker/js/OneTrustManager';

function DotmetricsManager() {
    EventEmitter.call(this, {
        wildcard: true
    });

    this.hasLoadedScript = false;
    this.tags = {};
}

DotmetricsManager.prototype = inherit(EventEmitter.prototype, {
    constructor: DotmetricsManager,

    init: function init(tags) {
        this.tags = tags;
    },

    loadScript: function loadScript(test) {
        if (this.hasLoadedScript) return;

        (function () {
            window.dm = window.dm || { AjaxData: [] };
            window.dm.AjaxEvent = function (et, d, ssid, ad) {
                dm.AjaxData.push({ et: et, d: d, ssid: ssid, ad: ad });
                window.DotMetricsObj && DotMetricsObj.onAjaxDataUpdate();
            };
            var d = document,
                h = d.getElementsByTagName('head')[0],
                s = d.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = 'https://uk-script.dotmetrics.net/door.js?d=' + document.location.host;
            h.appendChild(s);
        }());

        this.hasLoadedScript = true;

        ArticleManager.on('focus', this.onArticleFocus);
    },

    onArticleFocus: function onArticleFocus(e) {
        if (!OneTrustManager.ready || !OneTrustManager.consentedPerformanceCookies) return;

        var article = e.target;

        console.log(article);
    }
});

export default new DotmetricsManager();
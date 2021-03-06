import EventEmitter from 'eventemitter2';
import { inherit, assign } from '@cnbritain/merlin-www-js-utils/js/functions';
import { ArticleManager } from '@cnbritain/merlin-www-article';

function DotmetricsManager() {
    EventEmitter.call(this, {
        wildcard: true
    });

    this.initialised = false;
    this.hasLoadedScript = false;

    this.config = {
        pageType: null,
        pageTags: [],
        tags: {},
    };
}

const HOMEPAGE_TAG = 'homepage';
const OTHER_TAG = 'other';

DotmetricsManager.prototype = inherit(EventEmitter.prototype, {
    constructor: DotmetricsManager,

    init: function init(cfg) {
        // merge our configs
        this.config = assign(this.config, cfg);

        this.initialised = true;
    },

    loadScript: function loadScript() {
        if (!this.initialised || this.hasLoadedScript) return;

        var initialTag = this.getTag(this.config.pageType);

        (function () {
            window.dm = window.dm || { AjaxData: [] };
            window.dm.AjaxEvent = function (et, d, ssid, ad) {
                window.dm.AjaxData.push({ et: et, d: d, ssid: ssid, ad: ad });
                window.DotMetricsObj && window.DotMetricsObj.onAjaxDataUpdate();
            };
            var d = document,
                h = d.getElementsByTagName('head')[0],
                s = d.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = 'https://uk-script.dotmetrics.net/door.js?d=' + document.location.host;
            s.src += '&t=' + initialTag;
            h.appendChild(s);
        }());

        ArticleManager.on('urlchange', function (e) {
            if (e.target &&
                e.target.ads &&
                e.target.ads.key_values &&
                e.target.ads.key_values.tags) {
                var tag = this.getTagForArticle(e.target.ads.key_values.tags);
                window.dm.AjaxEvent('pageview', null, tag);
            }
        }.bind(this));

        this.hasLoadedScript = true;
    },

    getTag: function getTag(pageType) {
        switch (pageType) {
        case 'homepage':
            return HOMEPAGE_TAG;
        case 'article': case 'gallery': case 'video':
            return this.getTagForArticle(this.config.pageTags);
        default:
            return OTHER_TAG;
        }
    },

    getTagForArticle: function getTagForArticle(pageTags) {
        var tags = this.config.tags;

        for (var x = 0; x < pageTags.length; x++) {
            if (pageTags[x] in tags) {
                return tags[pageTags[x]];
            }
        }

        return OTHER_TAG;
    }
});

export default new DotmetricsManager();
import EventEmitter from 'eventemitter2';
import {
    inherit,
    loadScript
} from '@cnbritain/merlin-www-js-utils/js/functions';

function TreasureDataManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this._config = null;
    this._hasLoadedScript = false;
    this._td = null;
}

TreasureDataManager.prototype = inherit(EventEmitter.prototype, {
    constructor: TreasureDataManager,

    init: function init(config) {
        this._config = config;

        this.initTreasure();
    },

    loadScript: function loadScript() {
        if (this._hasLoadedScript) return;
        if (this.config === null) {
            console.warn('Missing TDP Config', this._config);
        }

        ! function (t, e) {
            if (void 0 === e[t]) {
                e[t] = function () {
                    e[t].clients.push(this), this._init = [Array.prototype.slice.call(arguments)]
                }, e[t].clients = [];
                for (var r = function (t) {
                        return function () {
                            return this["_" + t] = this["_" + t] || [], this["_" + t].push(Array.prototype.slice.call(arguments)), this
                        }
                    }, s = ["addRecord", "blockEvents", "fetchServerCookie", "fetchGlobalID", "fetchUserSegments", "resetUUID", "ready", "setSignedMode", "setAnonymousMode", "set", "trackEvent", "trackPageview", "trackClicks", "unblockEvents"], n = 0; n < s.length; n++) {
                    var c = s[n];
                    e[t].prototype[c] = r(c)
                }
                var o = document.createElement("script");
                o.type = "text/javascript", o.async = !0, o.src = ("https:" === document.location.protocol ? "https:" : "http:") + "//cdn.treasuredata.com/sdk/2.3/td.min.js";
                var a = document.getElementsByTagName("script")[0];
                a.parentNode.insertBefore(o, a)
            }
        }("Treasure", window);

        this._hasLoadedScript = true;
    },

    initTreasure: function initTreasure() {
        if (this._hasLoadedScript) {
            this._td = new Treasure({
                database: this._config.database,
                writeKey: this._config.writeKey,
                host: 'in.treasuredata.com',
                startInSignedMode: true,
                sscDomain: this._config.sscDomain,
                sscServer: this._config.sscServer,
                useServerSideCookie: true,
                development: this._config.development
            });

            // Set the Permutive ID as the TD Unknown ID
            if (window.permutive && window.permutive.context) {
                this._td.set('$global', 'td_unknown_id', window.permutive.context.user_id);
            }  

            // SET CUSTOM PARAMS HERE
            // td.set("$global","td_global_id","td_global_id"); 

            this._td.fetchServerCookie(
                function (result) {
                    this._td.set('$global', {
                        td_ssc_id: result
                    });
                    this.fireEvents();
                }.bind(this),
                function () {
                    this.fireEvents();
                }.bind(this)
            );
        }
    },

    fireEvents: function fireEvents() {
        if (this._hasLoadedScript && this._td != null) {
            this._td.trackPageview(this._config.pageviewTable);
        }
    }
});

export default new TreasureDataManager();
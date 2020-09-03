import EventEmitter from "eventemitter2";
import {
    inherit,
    updateQueryString,
    addEvent,
    delegate,
} from "@cnbritain/merlin-www-js-utils/js/functions";

function TreasureDataManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this._config = null;
    this._hasLoadedScript = false;
    this._td = null;
}

var promiseRetry = function promiseRetry(tries, delay, fn) {
    return new Promise(function (resolve, reject) {
        return fn()
            .then(resolve)
            .catch(function (err) {
                if (tries > 0) {
                    setTimeout(function () {
                        promiseRetry(tries - 1, delay, fn)
                            .then(resolve, reject);
                    }, delay);
                }
                else {
                    reject(err);
                    return;
                }
            });
    });
}

var toArray = function toArray(collection) {
    var len = collection.length;
    var arr = new Array(len);
    while (len--) arr[len] = collection[len];
    return arr;
}

TreasureDataManager.prototype = inherit(EventEmitter.prototype, {
    constructor: TreasureDataManager,

    init: function init(config) {
        this._config = config;
    },

    loadTreasureDataScript: function loadTreasureDataScript() {
        if (this._hasLoadedScript) return;
        if (!this._config) {
            console.warn("Missing TDP Config", this._config);
        }

        /* eslint-disable */
        !function (t, e) {
            if (void 0 === e[t]) { e[t] = function () { e[t].clients.push(this), this._init = [Array.prototype.slice.call(arguments)] }, e[t].clients = []; for (var r = function (t) { return function () { return this["_" + t] = this["_" + t] || [], this["_" + t].push(Array.prototype.slice.call(arguments)), this } }, s = ["addRecord", "blockEvents", "fetchServerCookie", "fetchGlobalID", "fetchUserSegments", "resetUUID", "ready", "setSignedMode", "setAnonymousMode", "set", "trackEvent", "trackPageview", "trackClicks", "unblockEvents"], n = 0; n < s.length; n++) { var c = s[n]; e[t].prototype[c] = r(c) } var o = document.createElement("script"); o.type = "text/javascript", o.async = !0, o.src = ("https:" === document.location.protocol ? "https:" : "http:") + "//cdn.treasuredata.com/sdk/2.4/td.min.js"; var a = document.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a) }
        }("Treasure", window);
        /* eslint-enable */

        this._hasLoadedScript = true;

        this.initTreasure();
    },

    _onNewsletterSubmit: function _onNewsletterSubmit(e) {
        e.preventDefault();

        var eml = document.getElementById('nl-form__email').value;
        var nls = toArray(document.querySelectorAll('.nl-form__checkbox:checked')).map(function (el) {
            return el.name.replace('chk_', '');
        });

        var submitForm = function submitForm() {
            document.querySelector('.nl-form').submit();
        };

        this._td.trackEvent(
            this._config.pageviewTable,
            {
                "email": eml,
                "newsletters": nls,
            },
            submitForm,
            submitForm
        )
    },

    _attachFormHandler: function _attachFormHandler() {
        if (!document.querySelector('.nl-form')) return;
        addEvent(
            document,
            'submit',
            delegate('.nl-form', this._onNewsletterSubmit.bind(this))
        );
    },

    _permutiveReady: function _permutiveReady() {
        // Wait for a total of one second for permutive to load...        
        return promiseRetry(10, 10, function () {
            if (window.permutive && window.permutive.ready) {
                window.permutive.ready(function () {
                    resolve(window.permutive);
                });
            } else {
                reject(new Error("Permutive not ready"));
            }
        }.bind(this));
    },

    _getPermutiveSegments: function _getPermutiveSegments(permtuive) {
        return new Promise(function (resolve, reject) {

        });
    },

    _getPermutive: function _getPermutive() {
        this._permutiveReady()
            .then(function (permutive) {
                var permutiveId = permutive.context.user_id;

                this._td.set('$global', 'td_unknown_id', permutiveId);

                this._attachPermutiveID(permutiveId);

                permutive.segments(function (segments) {
                    this._td.set('$global', 'permutive_segment_id', segments);
                    resolve(permutive);
                }.bind(this));
            }.bind(this))
            .then(function (permutive) {
                // by this point permutive will be loaded and ready
                this._td.fetchUserSegments({
                    audienceToken: [this._config.writeKey],
                    keys: { permutiveId: permutive.context.user_id }
                },
                    function (v) {
                        if (v.length > 0 && v[0].attributes && v[0].attributes.email_sha256) {
                            permutive.identify([{
                                tag: "email_sha256",
                                id: v[0].attributes.email_sha256,
                                priority: 1
                            }]);
                        }
                    },
                    function error(err) { }
                );
            }.bind(this));
    },

    _attachPermutiveID: function _attachPermutiveID(id) {
        // If there's any elements with the .js-tdp-link class
        // attach the client id as a query string parameter to ensure
        // id is forwarded on;
        document.querySelectorAll(
            ".js-tdp-link"
        ).forEach(
            function (el) {
                if (el.hasAttribute("href")) {
                    el.href = updateQueryString(el.href, {
                        td_user_id: id,
                    });
                }
            }.bind(this)
        );
    },

    _getServerCookie: function _getServerCookie() {
        return new Promise(function (resolve, reject) {
            this._td.fetchServerCookie(
                function (result) {
                    this._td.set("$global", "td_ssc_id", result);
                    resolve(result);
                }.bind(this),
                function (err) {
                    reject(err);
                }
            );
        }.bind(this));
    },

    initTreasure: function initTreasure() {
        if (this._hasLoadedScript) {
            this._td = new Treasure({
                database: this._config.database,
                writeKey: this._config.writeKey,
                host: this._config.host,
                startInSignedMode: true,
                sscDomain: this._config.sscDomain,
                sscServer: this._config.sscServer,
                useServerSideCookie: true,
                development: this._config.development,
                accountId: this._config.accountId,
            });

            this._td.set('$global', "td_global_id", "td_global_id");

            if (this._config.page_data) {
                this._td.set("$global", this._config.page_data);
            }

            this._attachFormHandler();

            // Track the pageview after both permutive and ssc cookie have settled
            Promise.allSettled([
                this._getPermutive(),
                this._getServerCookie(),
            ]).then(function (results) {
                this.fireEvents();
            }.bind(this));
        }
    },

    createImage: function createImage(url) {
        var el = document.createElement("img");
        el.src = ("https:" === document.location.protocol ? "https://" : "http://") + url;
        el.width = 1;
        el.height = 1;
        el.style.display = "none";
        document.body.appendChild(el);
    },

    googleSyncCallback: function googleSyncCallback() {
        var gidsync_url = "cm.g.doubleclick.net/pixel";
        var params =
            "?google_nid=treasuredata_dmp&" +
            "google_cm" +
            "&td_write_key=8151/fcd628065149d648b80f11448b4083528c0d8a91" +
            "&td_global_id=td_global_id" +
            "&td_client_id=" + this._td.client.track.uuid +
            "&td_host=" + document.location.host +
            "&account=" + this._config.accountId;

        this.createImage(gidsync_url + params);
    },

    fireEvents: function fireEvents() {
        if (this._hasLoadedScript && this._td != null) {
            this._td.trackPageview(
                this._config.pageviewTable,
                this.googleSyncCallback.bind(this)
            );
        }
    },
});

export default new TreasureDataManager();
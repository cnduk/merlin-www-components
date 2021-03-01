import EventEmitter from 'eventemitter2';
import {
    inherit,
    updateQueryString,
    addEvent,
    delegate,
} from '@cnbritain/merlin-www-js-utils/js/functions';

function TreasureDataManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this._config = null;
    this._hasLoadedScript = false;
    this._td = null;
}

var hash = function hash(text) {
    // eslint-disable-next-line compat/compat
    var enc = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', enc).then(function (hashBuffer) {
        // eslint-disable-next-line compat/compat
        var hashArray = Array.from(new Uint8Array(hashBuffer));
        var hashHex = hashArray.map(function (b) {
            return b.toString(16).padStart(2, '0');
        }).join('');
        return hashHex;
    });
};

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
};

var toArray = function toArray(collection) {
    var len = collection.length;
    var arr = new Array(len);
    while (len--) arr[len] = collection[len];
    return arr;
};

TreasureDataManager.prototype = inherit(EventEmitter.prototype, {
    constructor: TreasureDataManager,

    init: function init(config) {
        this._config = config;
    },

    loadTreasureDataScript: function loadTreasureDataScript() {
        if (this._hasLoadedScript) return;
        if (!this._config) {
            console.warn('Missing TDP Config', this._config);
            return;
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

        hash(eml).then(function (hashed) {
            this._td.trackEvent(
                this._config.pageviewTable,
                {
                    'email': eml,
                    'hashed_email': hashed,
                    'newsletters': nls,
                },
                submitForm,
                submitForm
            );
        }.bind(this));
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
        // Wait for a total of two seconds for permutive to load...        
        // try 20 times with 100ms delay between each try
        return promiseRetry(20, 100, function () {
            return new Promise(function (resolve, reject) {
                if (window.permutive && window.permutive.ready) {
                    window.permutive.ready(function () {
                        resolve(window.permutive);
                    });
                } else {
                    reject(new Error('Permutive not ready'));
                }
            }.bind(this));
        }.bind(this));
    },

    _getPermutive: function _getPermutive() {
        var permutive = null;

        return this._permutiveReady()
            .then(function (p) {
                permutive = p;

                var permutiveId = permutive.context.user_id;

                this._td.set('$global', 'td_unknown_id', permutiveId);

                permutive.identify([{
                    tag: 'td_unknown_id',
                    id: permutiveId,
                    priority: 0
                }]);

                this._attachPermutiveID(permutiveId);

                return new Promise(function (resolve, reject) {
                    this._td.fetchUserSegments({
                        audienceToken: this._config.audienceToken,
                        keys: { 'permutive_id': permutiveId }
                    }, resolve, reject);
                }.bind(this));
            }.bind(this))
            .then(function (segments) {
                this._td.set('$global', 'permutive_segment_id', segments);

                if (
                    segments.length > 0 &&
                    segments[0].attributes &&
                    segments[0].attributes.email_sha256
                ) {
                    permutive.identify([{
                        tag: 'email_sha256',
                        id: segments[0].attributes.email_sha256,
                        priority: 1
                    }]);
                }
            }.bind(this));
    },

    _attachPermutiveID: function _attachPermutiveID(id) {
        // If there's any elements with the .js-tdp-link class
        // attach the client id as a query string parameter to ensure
        // id is forwarded on;
        document.querySelectorAll(
            '.js-tdp-link'
        ).forEach(
            function (el) {
                if (el && el.hasAttribute('href')) {
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
                    this._td.set('$global', 'td_ssc_id', result);
                    resolve(result);
                }.bind(this),
                function (err) {
                    reject(err);
                }
            );
        }.bind(this));
    },

    _getGAClientID: function _getGAClientID() {
        return new Promise(function (resolve, reject) {
            if (window.ga) {
                window.ga(function (t) {
                    var gaID = t.get('clientId');

                    this._td.set('$global', 'ga_id', gaID);

                    resolve(gaID);
                    return;
                }.bind(this));
            }

            reject('missing ga() method');
        }.bind(this));
    },

    initTreasure: function initTreasure() {
        if (this._hasLoadedScript) {
            this._td = new window.Treasure({
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

            this._td.set('$global', 'td_global_id', 'td_global_id');

            if (this._config.page_data) {
                this._td.set('$global', this._config.page_data);
            }

            this._attachFormHandler();

            // Track the pageview after both permutive and ssc cookie have settled
            Promise.allSettled([
                this._getPermutive(),
                this._getServerCookie(),
                this._getGAClientID(),
            ]).then(function () {
                this.fireEvents();
            }.bind(this));
        }
    },

    fireEvents: function fireEvents() {
        if (this._hasLoadedScript && this._td != null) {
            this._td.trackPageview(
                this._config.pageviewTable,
                function () {
                    googleSyncCallback(this._td.client.track.uuid, this._config.accountId);
                }.bind(this)
            );
        }
    },
});

var createImage = function createImage(url) {
    var el = document.createElement('img');
    el.src = ('https:' === document.location.protocol ? 'https://' : 'http://') + url;
    el.width = 1;
    el.height = 1;
    el.style.display = 'none';
    document.body.appendChild(el);
};

var googleSyncCallback = function googleSyncCallback(clientId, accountId) {
    var gidsync_url = 'cm.g.doubleclick.net/pixel';
    var params =
        '?google_nid=treasuredata_dmp' +
        '&google_cm' +
        '&td_write_key=8151/fcd628065149d648b80f11448b4083528c0d8a91' +
        '&td_global_id=td_global_id' +
        '&td_client_id=' + clientId +
        '&td_host=' + document.location.host +
        '&account=' + accountId;

    createImage(gidsync_url + params);
};

export default new TreasureDataManager();
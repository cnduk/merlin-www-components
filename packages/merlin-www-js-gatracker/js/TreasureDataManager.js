import EventEmitter from "eventemitter2";
import {
    inherit,
    loadScript,
    updateQueryString,
} from "@cnbritain/merlin-www-js-utils/js/functions";

function TreasureDataManager() {
    EventEmitter.call(this, {
        wildcard: true,
    });
    this._config = null;
    this._hasLoadedScript = false;
    this._td = null;
}

TreasureDataManager.prototype = inherit(EventEmitter.prototype, {
    constructor: TreasureDataManager,

    init: function init(config) {
        this._config = config;
    },

    loadScript: function loadScript() {
        if (this._hasLoadedScript) return;
        if (this._config === null) {
            console.warn("Missing TDP Config", this._config);
        }

        !(function (t, e) {
            if (void 0 === e[t]) {
                (e[t] = function () {
                    e[t].clients.push(this),
                        (this._init = [Array.prototype.slice.call(arguments)]);
                }),
                (e[t].clients = []);
                for (
                    var r = function (t) {
                            return function () {
                                return (
                                    (this["_" + t] = this["_" + t] || []),
                                    this["_" + t].push(
                                        Array.prototype.slice.call(arguments)
                                    ),
                                    this
                                );
                            };
                        },
                        s = [
                            "addRecord",
                            "blockEvents",
                            "fetchServerCookie",
                            "fetchGlobalID",
                            "fetchUserSegments",
                            "resetUUID",
                            "ready",
                            "setSignedMode",
                            "setAnonymousMode",
                            "set",
                            "trackEvent",
                            "trackPageview",
                            "trackClicks",
                            "unblockEvents",
                        ],
                        n = 0; n < s.length; n++
                ) {
                    var c = s[n];
                    e[t].prototype[c] = r(c);
                }
                var o = document.createElement("script");
                (o.type = "text/javascript"),
                (o.async = !0),
                (o.src =
                    ("https:" === document.location.protocol ?
                        "https:" :
                        "http:") +
                    "//cdn.treasuredata.com/sdk/2.3/td.min.js");
                var a = document.getElementsByTagName("script")[0];
                a.parentNode.insertBefore(o, a);
            }
        })("Treasure", window);

        this._hasLoadedScript = true;

        this.initTreasure();
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

            // Set the Permutive ID as the TD Unknown ID
            if (window.permutive) {
                window.permutive.ready(
                    function () {
                        console.log("PERMUTIVE READY");

                        console.log("Got ID: ", window.permutive.context.user_id);

                        var permutiveId = window.permutive.context.user_id;
                        this._td.set(
                            "$global",
                            "td_unknown_id",
                            window.permutive.context.user_id
                        );

                        window.permutive.segments(function (segments) {
                            console.log("Got segments: ", segments);
                            this._td.set(
                                "$global",
                                "permutive_segment_id",
                                segments
                            )
                        }.bind(this));

                        // If there's any elements with the .js-tdp-link class
                        // attach the client id as a query string parameter to ensure
                        // id is forwarded on
                        var tdpLinks = document.querySelectorAll(
                            ".js-tdp-link"
                        );

                        tdpLinks.forEach(
                            function (el) {
                                if (el.hasAttribute("href")) {
                                    el.href = updateQueryString(el.href, {
                                        td_user_id: permutiveId,
                                    });
                                }
                            }.bind(this)
                        );
                    }.bind(this)
                );
            }

            this._td.set("$global", "td_global_id", "td_global_id");

            if (this._config.page_data) {
                this._td.set("$global", this._config.page_data);
            }

            this._td.fetchServerCookie(
                function (result) {
                    this._td.set("$global", {
                        td_ssc_id: result,
                    });
                    this.fireEvents();
                }.bind(this),
                function () {
                    this.fireEvents();
                }.bind(this)
            );
        }
    },

    createImage: function createImage(url) {
        var el = document.createElement("img");
        el.src =
            ("https:" === document.location.protocol ? "https://" : "http://") +
            url;
        el.width = 1;
        el.height = 1;
        el.style.display = "none";
        document.body.appendChild(el);
    },

    googleSyncCallback: function googleSyncCallback() {
        var gidsync_url =
            "cm.g.doubleclick.net/pixel?google_nid=treasuredata_dmp&google_cm&td_write_key=8151/fcd628065149d648b80f11448b4083528c0d8a91&td_global_id=td_global_id";
        var params =
            "&td_client_id=" +
            this._td.client.track.uuid +
            "&td_host=" +
            document.location.host +
            "&account=" +
            this._config.accountId;

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
import EventEmitter from 'eventemitter2';
import {
    getCookie,
    inherit,
    loadScript,
    setCookie
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    hasCookiesEnabled
} from '@cnbritain/merlin-www-js-utils/js/detect';

function OneTrustManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this.ONETRUST_COOKIE = 'cnd_one_trust_consent';
    this._loadingScript = false;
    this.consent = null;
}

OneTrustManager.prototype = inherit(EventEmitter.prototype, {
    constructor: OneTrustManager,
    getConsent: function getConsent() {
        var cookieValue = getCookie(this.ONETRUST_COOKIE);
        if (cookieValue !== null) {
            return cookieValue;
        } else {
            return false;
        }
    },
    setConsent: function setConsent(value) {
        setCookie(this.ONETRUST_COOKIE, value);
        this.consent = value;
    },
    init: function init(options) {
        if (!options.hasOwnProperty('script_url')) {
            throw new Error('Missing script_url value');
        }

        // Set the callback before trying to load the script
        window.OptanonWrapper = function() {
            if (window.OptanonActiveGroups) {
                var consentToTargeting = /,4,/.test(window.OptanonActiveGroups);

                if (consentToTargeting) {
                    this.setConsent(1);
                } else {
                    this.setConsent(0);
                }
            }
        }.bind(this);

        this.loadOneTrustScript(options.script_url);

        var oneTrustConsent = this.getConsent();
        if (oneTrustConsent !== false) {
            this.consent = parseInt(oneTrustConsent, 10);
            return;
        }

        if (!hasCookiesEnabled) {
            this.setConsent(0);
            return;
        }
    },
    loadOneTrustScript: function loadOneTrustScript(scriptUrl) {
        if (this._loadingScript) return;

        this._loadingScript = true;

        loadScript(scriptUrl)
            .then(function() {
                // console.log('Loaded OneTrust script');
            }, function() {
                console.warn('Failed to load OneTrust script!'); // eslint-disable-line no-console
                this._loadingScript = false;
            }.bind(this));
    }
});

export default new OneTrustManager();
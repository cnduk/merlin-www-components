import EventEmitter from 'eventemitter2';
import {
    getCookie,
    inherit,
    loadScript,
    setCookie,
    createEventTemplate
} from '@cnbritain/merlin-www-js-utils/js/functions';
import { hasCookiesEnabled } from '@cnbritain/merlin-www-js-utils/js/detect';

var ONETRUST_CONSENT_COOKIE = 'OptanonConsent';

var VERSION_1 = {
    loadConsent: function loadConsent() {
        this.setConsent(getCookie(this.ONETRUST_COOKIE));
    },
    loadOneTrustScript: function loadOneTrustScript(scriptUrl) {
        if (this._loadingScript) return;

        this._loadingScript = true;

        loadScript(scriptUrl).then(
            function() {
                // console.log('Loaded OneTrust script');
            },
            function() {
                console.warn('Failed to load OneTrust script!'); // eslint-disable-line no-console
                this._loadingScript = false;
            }.bind(this)
        );
    },
    oneTrustCallback: function oneTrustCallback() {
        if (window.OptanonActiveGroups) {
            setTimeout(
                function() {
                    this.setConsent(window.OptanonActiveGroups);
                }.bind(this),
                100
            );
        }
    },
    processConsentData: function processConsentData() {
        if (this.consentData) {
            this.consentedStrictlyCookies = /,1,/.test(this.consentData);
            this.consentedPerformanceCookies = /,2,/.test(this.consentData);
            this.consentedFunctionalCookies = /,3,/.test(this.consentData);
            this.consentedTargetingCookies = /,4,/.test(this.consentData);
        }
        this.isDialogClosed = !!getCookie('OptanonAlertBoxClosed');
    },
    setConsent: function setConsent(value) {
        var beforeValue = this.consentData;

        setCookie(this.ONETRUST_COOKIE, value);
        this.consentData = value;
        this.processConsentData.call(this);

        if (beforeValue !== this.consent) {
            this._emitChange({
                consentValue: this.consentData
            });
        }
    }
};

// looks like the new version is 5...
var VERSION_2 = {
    loadConsent: function loadConsent() {
        var data = getCookie(this.ONETRUST_COOKIE) || '';
        this.setConsent(data);
    },
    loadOneTrustScript: function loadOneTrustScript(scriptUrl, domainScript) {
        if (this._loadingScript) return;

        this._loadingScript = true;

        loadScript(scriptUrl, {
            attributes: { 'data-domain-script': domainScript }
        }).then(
            function() {
                // console.log('Loaded OneTrust script');
            },
            function() {
                console.warn('Failed to load OneTrust script!'); // eslint-disable-line no-console
                this._loadingScript = false;
            }.bind(this)
        );
    },
    oneTrustCallback: function oneTrustCallback() {
        this.setConsent(getCookie(ONETRUST_CONSENT_COOKIE));
    },
    processConsentData: function processConsentData() {
        this.isDialogClosed = !!getCookie('OptanonAlertBoxClosed');

        var cookieParts = this.consentData.split('&').filter(function(part) {
            return /^groups=/i.test(part);
        });
        if (cookieParts.length === 0) return;

        var groups = decodeURIComponent(cookieParts[0].split('=')[1]);
        // these are always going to be true. you cannot turn these off.
        this.consentedStrictlyCookies = true;
        // this.consentedStrictlyCookies = /1:1/.test(groups);
        this.consentedPerformanceCookies = /2:1/.test(groups);
        this.consentedFunctionalCookies = /3:1/.test(groups);
        this.consentedTargetingCookies = /4:1/.test(groups);
        this.consentedSocialNetworkCookies = /5:1/.test(groups);
    },
    setConsent: function setConsent(value) {
        var beforeValue = this.consentData;

        setCookie(this.ONETRUST_COOKIE, value);
        this.consentData = value;
        this.processConsentData.call(this);

        if (beforeValue !== this.consent) {
            this._emitChange({
                consentValue: this.consentData
            });
        }

        if (this.isDialogClosed) this._emitReady();
    }
};

var VERSIONS = {
    1: VERSION_1,
    2: VERSION_2
};

function OneTrustManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this.ONETRUST_COOKIE = 'cnd_one_trust_consent2';
    this.loadConsent = null;
    this.loadOneTrustScript = null;
    this.processConsentData = null;
    this.setConsent = null;
    this._loadingScript = false;
    this._isReady = false;
    this.isDialogClosed = false;
    this.consentData = '';
    this.consentedStrictlyCookies = true;
    this.consentedPerformanceCookies = false;
    this.consentedFunctionalCookies = false;
    this.consentedTargetingCookies = false;
    this.consentedSocialNetworkCookies = false;
}

OneTrustManager.prototype = inherit(EventEmitter.prototype, {
    constructor: OneTrustManager,

    _emitChange: function _emitChange(data) {
        this.emit('change', createEventTemplate('change', this, data));
    },

    _emitReady: function _emitReady(data) {
        if (this._isReady) return;
        this.emit('ready', createEventTemplate('ready', this, data));
        this._isReady = true;
    },

    init: function init(options) {
        if (!options.hasOwnProperty('script_url')) {
            throw new Error('Missing script_url value');
        }

        // Default the version value to 1
        var version = options.version || 1;
        var VERSION_HANDLERS = VERSIONS[version];
        this.loadConsent = VERSION_HANDLERS.loadConsent.bind(this);
        this.loadOneTrustScript = VERSION_HANDLERS.loadOneTrustScript.bind(
            this
        );
        this.processConsentData = VERSION_HANDLERS.processConsentData.bind(
            this
        );
        this.setConsent = VERSION_HANDLERS.setConsent.bind(this);
        // Set the callback before trying to load the script
        window.OptanonWrapper = VERSION_HANDLERS.oneTrustCallback.bind(this);

        this.loadConsent();
        this.loadOneTrustScript(options.script_url, options.domain_script);
        if (!hasCookiesEnabled) this.setConsent('');
    }
});

export default new OneTrustManager();

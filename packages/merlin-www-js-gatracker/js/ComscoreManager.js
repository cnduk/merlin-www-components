import EventEmitter from 'eventemitter2';
import {
    getCookie,
    inherit,
    loadScript,
    setCookie
} from '@cnbritain/merlin-www-js-utils/js/functions';
import { hasCookiesEnabled } from '@cnbritain/merlin-www-js-utils/js/detect';
import OneTrustManager from './OneTrustManager';

function ComscoreManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this.COMSCORE_COOKIE = 'cnd_comscore_consent';
    this.COMSCORE_PUBLISHED_ID = 15335235;
    this._loadingScript = false;
    // Consent can be true, false or null.
    // True - user has consented
    // False - user has rejected
    // null - user has not said anything
    this.consent = null;
}
ComscoreManager.prototype = inherit(EventEmitter.prototype, {
    constructor: ComscoreManager,
    getConsent: function getConsent() {
        var cookieValue = getCookie(this.COMSCORE_COOKIE);
        // console.log('getConsent', cookieValue);
        return cookieValue;
    },
    setConsent: function setConsent(value) {
        // console.log('Setting cs_ucfr=' + value);
        if (OneTrustManager.ready && OneTrustManager.consentedStrictlyCookies) {
            setCookie(this.COMSCORE_COOKIE, value);
        }
        this.consent = value;
    },
    init: function init() {
        // Check if the comscore cookie has been set
        var comscoreConsent = this.getConsent();
        if (comscoreConsent !== null) {
            // console.log('User has given Comscore consent', comscoreConsent);
            this.consent = Number(comscoreConsent);
            return;
        }
        if (!hasCookiesEnabled) {
            // console.log('Cookies are disabled');
            this.setConsent(null);
            return;
        }
    },
    loadComscoreScript: function loadComscoreScript() {
        if (this._loadingScript) return;

        this._loadingScript = true;
        var scriptUrl = null;
        if (document.location.protocol === 'https:') {
            scriptUrl = 'https://sb.scorecardresearch.com/beacon.js';
        } else {
            scriptUrl = 'http://b.scorecardresearch.com/beacon.js';
        }
        loadScript(scriptUrl).then(
            function() {
                // console.log('Loaded Comscore script');
            },
            function() {
                console.warn('Failed to load Comscore script!'); // eslint-disable-line no-console
                this._loadingScript = false;
            }.bind(this)
        );
    },
    sendBeacon: function sendBeacon(url) {
        if (this.consent === null) {
            console.warn(
                'User has not consented yet. Beacon will send value missing `cs_ucfr`.'
            ); // eslint-disable-line no-console
        }

        var comscoreData = {
            c1: '2',
            c2: this.COMSCORE_PUBLISHED_ID,
            cs_ucfr: this.consent === null ? '' : this.consent
        };
        if (url) comscoreData['c4'] = url;
        // console.log('Firing a Comscore beacon', comscoreData);

        if ('COMSCORE' in window && window.COMSCORE !== null) {
            COMSCORE.beacon(comscoreData);
        } else {
            window._comscore = window._comscore || [];
            window._comscore.push(comscoreData);
            this.loadComscoreScript();
        }
    }
});

export default new ComscoreManager();

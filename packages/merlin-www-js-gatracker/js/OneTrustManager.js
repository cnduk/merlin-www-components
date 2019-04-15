import EventEmitter from 'eventemitter2';
import {
    getCookie,
    inherit,
    loadScript,
    setCookie,
    createEventTemplate
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    hasCookiesEnabled
} from '@cnbritain/merlin-www-js-utils/js/detect';

function OneTrustManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this.ONETRUST_COOKIE = 'cnd_one_trust_consent1';
    this._loadingScript = false;
    this.isDialogClosed = false;
    this.consentData = null;
    this.consentedStrictlyCookies = false;
    this.consentedPerformanceCookies = false;
    this.consentedFunctionalCookies = false;
    this.consentedTargetingCookies = false;
}

OneTrustManager.prototype = inherit(EventEmitter.prototype, {

    constructor: OneTrustManager,

    _processConsentData: function _processConsentData(){
        if(this.consentData){
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
        this._processConsentData();

        if(beforeValue !== this.consent){
            this.emit('change', createEventTemplate('change', this, {
                consentValue: this.consent
            }));
        }
    },

    loadConsent: function loadConsent(){
        this.setConsent(getCookie(this.ONETRUST_COOKIE));
    },   

    init: function init(options) {
        if (!options.hasOwnProperty('script_url')) {
            throw new Error('Missing script_url value');
        }

        // Set the callback before trying to load the script
        window.OptanonWrapper = function() {
            if (window.OptanonActiveGroups) {
                setTimeout(function(){
                    this.setConsent(window.OptanonActiveGroups);
                }.bind(this), 100);
            }
        }.bind(this);

        this.loadOneTrustScript(options.script_url);
        this.loadConsent();
        if(!hasCookiesEnabled) this.setConsent(',,');
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

import EventEmitter from 'eventemitter2';
import {
    getCookie,
    inherit,
    loadScript,
    setCookie
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {hasCookiesEnabled} from '@cnbritain/merlin-www-js-utils/js/detect';
import WindowScrollQualifier from './qualifiers/WindowScrollQualifier';
import LinkClickQualifier from './qualifiers/LinkClickQualifier';
import CookieWarningQualifier from './qualifiers/CookieWarningQualifier';
import PageVisibilityQualifier from './qualifiers/PageVisibilityQualifier';

function ComscoreManager(){
    EventEmitter.call(this, {wildcard: true});
    this.COMSCORE_COOKIE = 'cnd_comscore_consent';
    this.COMSCORE_PUBLISHED_ID = 15335235;
    this._qualifiers = [];
    this._loadingScript = false;
    this.consent = null;
}
ComscoreManager.prototype = inherit(EventEmitter.prototype, {
    constructor: ComscoreManager,
    _onQualify: function _onQualify(e){
        // console.log('_onQualify');
        this._setConsent(1);
        this._qualifiers.forEach(function(q){ q.teardown(); });
        this._qualifiers = null;
        this.emit('qualify', e);
    },
    _createQualifiers: function _createQualifiers(settings){
        var qualifiers = [
            WindowScrollQualifier,
            LinkClickQualifier,
            CookieWarningQualifier,
            PageVisibilityQualifier
        ];
        qualifiers.forEach(function(cls) {
            var q = new cls(settings);
            q.once('qualify', this._onQualify.bind(this));
            this._qualifiers.push(q);
        }.bind(this));
    },
    _getConsent: function _getConsent(){
        var cookieValue = getCookie(this.COMSCORE_COOKIE);
        // console.log('_getConsent', cookieValue);
        if(cookieValue !== null){
            return cookieValue;
        } else {
            return false;
        }
    },
    _setConsent: function _setConsent(value){
        // console.log('Setting cs_ucfr=' + value);
        setCookie(this.COMSCORE_COOKIE, value);
        this.consent = value;
    },
    init: function init(settings){
        // console.log('initComscore');

        if(!settings.hasOwnProperty('cookieWarning')){
            throw new Error('Missing cookieWarning value');
        }

        // Check if the comscore cookie has been set
        var comscoreConsent = this._getConsent();
        if(comscoreConsent !== false){
            // console.log('User has given Comscore consent', comscoreConsent);
            this.consent = parseInt(comscoreConsent, 10);
            return;
        }

        if(!hasCookiesEnabled){
            // console.log('Cookies are disabled');
            this._setConsent(0);
            return;
        }

        // Check cookie warning state. If isHidden, we know they already agree.
        // There should also be a cookie set before hand so this shouldnt really
        // trigger.
        if(settings.cookieWarning.isHidden){
            // console.log('CookieWarning is hidden');
            this._setConsent(1);
            return;
        }

        // console.log('Applying listeners for qualifiers');
        this._createQualifiers(settings);
    },
    loadComscoreScript: function loadComscoreScript(){
        if(this._loadingScript) return;

        this._loadingScript = true;
        var scriptUrl = null;
        if(document.location.protocol === 'https:'){
            scriptUrl = "https://sb.scorecardresearch.com/beacon.js";
        } else {
            scriptUrl = "http://b.scorecardresearch.com/beacon.js";
        }
        loadScript(scriptUrl)
            .then(function(){
                // console.log('Loaded Comscore script');
            }, function(){
                console.warn('Failed to load Comscore script!'); // eslint-disable-line no-console
                this._loadingScript = false;
            }.bind(this));
    },
    sendBeacon: function sendBeacon(url){
        if(this.consent === null){
            console.warn('User has not consented yet. Beacon will send value missing `cs_ucfr`.'); // eslint-disable-line no-console
        }

        var comscoreData = {
            c1: '2',
            c2: this.COMSCORE_PUBLISHED_ID,
            cs_ucfr: this.consent
        };
        if(url) comscoreData['c4'] = url;
        // console.log('Firing a Comscore beacon', comscoreData);

        if( 'COMSCORE' in window && window.COMSCORE !== null ){
            COMSCORE.beacon(comscoreData);
        } else {
            window._comscore = window._comscore || [];
            window._comscore.push(comscoreData);
            this.loadComscoreScript();
        }

    }
});

export default new ComscoreManager();

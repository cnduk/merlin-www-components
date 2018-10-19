
import EventEmitter from 'eventemitter2';
import {
    getCookie,
    inherit,
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
    this._qualifiers = [];
    this.consent = null;

    this._init();
}
ComscoreManager.prototype = inherit(EventEmitter.prototype, {
    constructor: ComscoreManager,
    _onQualify: function _onQualify(){
        console.log('_onQualify');
        this._setConsent(1);
        this._qualifiers.forEach(function(q){ q.teardown(); });
        this._qualifiers = null;
        this.emit('qualify');
    },
    _createQualifiers: function _createQualifiers(){
        var qualifiers = [
            WindowScrollQualifier,
            LinkClickQualifier,
            CookieWarningQualifier,
            PageVisibilityQualifier
        ];
        qualifiers.forEach(function(cls) {
            var q = new cls();
            q.once('qualify', this._onQualify.bind(this));
            this._qualifiers.push(q);
        }.bind(this));
    },
    _getConsent: function _getConsent(){
        var cookieValue = getCookie(this.COMSCORE_COOKIE);
        console.log('_getConsent', cookieValue);
        if(cookieValue !== null){
            return cookieValue;
        } else {
            return false;
        }
    },
    _setConsent: function _setConsent(value){
        console.log('Setting cs_ucfr=' + value);
        setCookie(this.COMSCORE_COOKIE, value);
        this.consent = value;
    },
    _init: function _init(){
        console.log('initComscore');

        // Check if the comscore cookie has been set
        var comscoreConsent = this._getConsent();
        if(comscoreConsent !== false){
            console.log('User has given Comscore consent', comscoreConsent);
            this.consent = parseInt(comscoreConsent, 10);
            return;
        }

        if(!hasCookiesEnabled){
            console.log('Cookies are disabled');
            this._setConsent(0);
            return;
        }

        // Check cookie warning state. If isHidden, we know they already agree.
        // There should also be a cookie set before hand so this shouldnt really
        // trigger.
        if(CookieWarning.isHidden){
            console.log('CookieWarning is hidden');
            this._setConsent(1);
            return;
        }

        console.log('Applying listeners for qualifiers');
        this._createQualifiers();
    },
    beacon: function beacon(){
        if(this.consent === null){
            console.warn('User has not consented yet. Beacon will send value missing `cs_ucfr`.');
        }
        console.log('Firing a Comscore beacon');
        // TODO: this code
    }
});

export var cm = new ComscoreManager();
// if(cm.consent !== null){
//     cm.beacon();
// } else {
//     cm.once('qualify', function(){
//         this.beacon();
//     });
// }

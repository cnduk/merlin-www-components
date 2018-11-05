
import {inherit} from '@cnbritain/merlin-www-js-utils/js/functions';
import Qualifier from './Qualifier';

function CookieWarningQualifier(settings){
    Qualifier.call(this, settings);
    this._name = 'CookieWarning';
}
CookieWarningQualifier.prototype = inherit(Qualifier.prototype, {
    _onWarningVisibilityChange: function _onWarningVisibilityChange(e){
        if(e.state === 'hidden'){
            // console.log('Qualified by closing cookie warning');
            this.qualify();
        }
    },
    _setup: function _setup(){
        this._handler = this._onWarningVisibilityChange.bind(this);
        this._settings.cookieWarning.addListener(
            'visibilitychange', this._handler);
    },
    _teardown: function _teardown(){
        this._settings.cookieWarning.removeListener(
            'visibilityChange', this._handler);
        this._handler = null;
    },
    constructor: CookieWarningQualifier
});

export default CookieWarningQualifier;

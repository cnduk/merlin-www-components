

import {inherit} from '@cnbritain/merlin-www-js-utils/js/functions';
import CookieWarning from '@cnbritain/merlin-www-cookie-warning';
import Qualifier from './Qualifier';

function CookieWarningQualifier(){
    Qualifier.call(this);
}
CookieWarningQualifier.prototype = inherit(Qualifier.prototype, {
    _onWarningVisibilityChange: function _onWarningVisibilityChange(e){
        if(e.state === 'hidden'){
            // console.log('Qualified by closing cookie warning');
            this.qualify();
        }
    },
    _setup: function _setup(){
        CookieWarning.addListener(
            'visibilitychange', this._onWarningVisibilityChange);
    },
    _teardown: function _teardown(){
        CookieWarning.removeListener(
            'visibilityChange', this._onWarningVisibilityChange);
    },
    constructor: CookieWarningQualifier
});

export default CookieWarningQualifier;


import {
    addEvent,
    cloneArray,
    delegate,
    inherit,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';
import CookieWarning from '@cnbritain/merlin-www-cookie-warning';
import Qualifier from './Qualifier';

function LinkClickQualifier(){
    Qualifier.call(this);
}
LinkClickQualifier.prototype = inherit(Qualifier.prototype, {
    _onDocumentClick: function _onDocumentClick(e){
        // Cookie warning already closed meaning they agree to terms
        if(CookieWarning.el === null){
            // console.log('Qualified by cookie warning being closed');
            this.qualify();
            return;
        }

        var cookieAnchors = cloneArray(
            CookieWarning.el.getElementsByTagName('a'));
        // Delegate target is not an anchor in the cookie warning
        if(cookieAnchors.indexOf(e.delegateTarget) === -1){
            // console.log('Qualified by scrolling');
            this.qualify();
        }
    },
    _setup: function _setup(){
        this._handler = delegate('a', this._onDocumentClick, this);
        addEvent(document, 'click', this._handler);
    },
    _teardown: function _teardown(){
        removeEvent(document, 'click', this._handler);
        this._handler = null;
    },
    constructor: LinkClickQualifier
});

export default LinkClickQualifier;

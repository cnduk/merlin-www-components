
import {
    addEvent,
    cloneArray,
    delegate,
    inherit,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';
import Qualifier from './Qualifier';

function LinkClickQualifier(settings){
    Qualifier.call(this, settings);
    this._name = 'LinkClick';
}
LinkClickQualifier.prototype = inherit(Qualifier.prototype, {
    _onDocumentClick: function _onDocumentClick(e){
        // Cookie warning already closed meaning they agree to terms
        if(this._settings.cookieWarning.el === null){
            // console.log('Qualified by cookie warning being closed');
            this.qualify();
            return;
        }

        var cookieAnchors = cloneArray(
            this._settings.cookieWarning.el.getElementsByTagName('a'));
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

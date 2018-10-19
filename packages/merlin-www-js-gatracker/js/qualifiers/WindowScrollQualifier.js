
import {
    addEvent,
    getWindowScrollTop,
    inherit,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';
import Qualifier from './Qualifier';

function WindowScrollQualifier(){
    Qualifier.call(this);
}
WindowScrollQualifier.prototype = inherit(Qualifier.prototype, {
    _onWindowScroll: function _onWindowScroll(){
        var scrollTop = getWindowScrollTop();
        var scrollDiff = scrollTop - this._lastScrollPosition;
        this._lastScrollPosition = scrollTop;
        this._totalScrollDepth += Math.abs(scrollDiff);

        if(this._totalScrollDepth >= this._SCROLL_DEPTH){
            console.log('Qualified by scrolling');
            this.qualify();
        }
    },
    _setup: function _setup(){
        this._SCROLL_DEPTH = 1000;
        this._lastScrollPosition = 0;
        this._totalScrollDepth = 0;
        this._handler = this._onWindowScroll.bind(this);
        addEvent(window, 'scroll', this._handler);
    },
    _teardown: function _teardown(){
        removeEvent(window, 'scroll', this._handler);
        this._handler = null;
    },
    constructor: WindowScrollQualifier
});

export default WindowScrollQualifier;

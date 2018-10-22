
import {
    addEvent,
    inherit,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';
import Qualifier from './Qualifier';

function PageVisibilityQualifier(){
    Qualifier.call(this);
}
PageVisibilityQualifier.prototype = inherit(Qualifier.prototype, {
    _onDocumentVisibilityChange: function _onDocumentVisibilityChange(){
        // There is a third state: prerender
        if(document.visibilityState === 'visible'){
            this._resumeTimer();
        } else if(document.visibilityState === 'hidden') {
            this._pauseTimer();
        }
    },
    _onTimeup: function _onTimeup(){
        this.qualify();
    },
    _resumeTimer: function _resumeTimer(){
        if(this._pageTimer === null){
            // console.log('Resuming timer', this._durationLeft);
            this._startTime = Date.now();
            this._pageTimer = setTimeout(
                this._onTimeup.bind(this), this._durationLeft);
        }
    },
    _pauseTimer: function _pauseTimer(){
        if(this._pageTimer !== null){
            // console.log('Pausing timer');
            var passedTime = Date.now() - this._startTime;
            this._durationLeft = this._durationLeft - passedTime;
            clearTimeout(this._pageTimer);
            this._pageTimer = null;
        }
    },
    _setup: function _setup(){
        this._pageTimer = null;
        this._startTime = null;
        this._durationLeft = 15000;
        this._handler = this._onDocumentVisibilityChange.bind(this);
        addEvent(document, 'visibilitychange', this._handler);
        this._resumeTimer();
    },
    _teardown: function _teardown(){
        removeEvent(document, 'visibilitychange', this._handler);
        clearTimeout(this._pageTimer);
        this._handler = null;
        this._pageTimer = null;
    },
    constructor: PageVisibilityQualifier
});

export default PageVisibilityQualifier;

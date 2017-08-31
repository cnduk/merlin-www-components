"use strict";

import EventEmitter from 'eventemitter2';

import {
    inherit,
    hasClass,
    addClass,
    removeClass
} from '@cnbritain/merlin-www-js-utils/js/functions';

var CLS_TIMED_CONTENT = 'bb-timed-content';
var CLS_TIMED_CONTENT_PENDING = 'bb-timed-content--pending';
var CLS_TIMED_CONTENT_ACTIVE = 'bb-timed-content--active';
var CLS_TIMED_CONTENT_EXPIRED = 'bb-timed-content-expired';
var CLS_TIMED_CONTENT_PREVIEW = 'bb-timed-content--preview';

function TimedContent() {
    EventEmitter.call(this, {wildcard: true});

    this.timedContentBlocks = toArray(document.querySelectorAll('.' + CLS_TIMED_CONTENT));

    this._init();
}

TimedContent.prototype = inherit(EventEmitter.prototype, {
    'constructor': TimedContent,

    '_init': function() {
        var tctLen = this.timedContentBlocks.length;

        while(tctLen--) {
            this.setTimers(this.timedContentBlocks[tctLen]);
        }
    },

    'setTimers': function(el) {
        if el.hasClass(CLS_TIMED_CONTENT_PREVIEW) { return; }

        var state = el.getAttribute('data-state');

        if (!state) { return; }

        var activeFrom = el.getAttribute('data-active-from');
        var activeTo = el.getAttribute('data-active-to');

        if (!activeFrom && !activeTo) { return; }

        var activeFromDate = activeFrom ? new Date(activeFrom) : false;
        var activeToDate = activeTo ? new Date(activeTo) : false;

        var now = new Date();

        switch (state) {
            case 'pending':
                if (activeFromDate && now < activeFromDate) {
                    window.setTimeout(this.setActive, activeFromDate - now, el);
                }

                if (activeToDate && now < activeToDate) {
                    window.setTimeout(this.setExpired, activeToDate - now, el);
                }
            break;

            case 'active':
                if (activeToDate && now < activeToDate) {
                    window.setTimeout(this.setExpired, activeToDate - now, el);
                }
            break;

            case 'expired':
                this.setExpired(el);
            break;

            default:
                console.error('Unknown state: ' + state);
            break;
        }
    },

    'setActive': function(el) {
        el.setAttribute('data-state', 'active');
        // in theory we'll never go from expired to active...
        removeClass(el, CLS_TIMED_CONTENT_PENDING);
        addClass(el, CLS_TIMED_CONTENT_ACTIVE);
    },

    'setExpired': function(el) {
        el.remove();
    }
});

function toArray(collection){
    var len = collection.length;
    var arr = new Array(len);
    while(len--) arr[len] = collection[len];
    return arr;
}

export default {
    /**
     * Initialises any timed-content blocks we find on a page...
     */
    'init': function(){
    }
};

function initialiaseTimedContent() {
    new TimedContent();
}


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
    // We need to set a max timeout value as any number bigger than maxint will cause the timeout
    // to fire immediately
    this.maxTimeout = 86400 * 5; // 5 days seems plenty?
    this._init();
}

TimedContent._log = function() {
    var DEBUG = false;

    if (DEBUG) {
        return console.log.apply(null, arguments);
    }

    return;
};

TimedContent.prototype = inherit(EventEmitter.prototype, {
    'constructor': TimedContent,

    '_init': function() {
        var tctLen = this.timedContentBlocks.length;

        while(tctLen--) {
            this.setTimers(this.timedContentBlocks[tctLen]);
        }
    },

    '_parseDate': function(dateString) {
        var parts = dateString.split(' ');
        var date = parts[0];
        var time = parts[1];

        var dateParts = date.split('-');
        var timeParts = time.substr(0, time.indexOf('+')).split(':');

        return new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2]);
    },

    'setTimers': function(el) {
        TimedContent._log("Setting timers for %o", el);
        if (hasClass(el, CLS_TIMED_CONTENT_PREVIEW)) { TimedContent._log("- Preview mode, nothing to do here."); return; }

        var state = el.getAttribute('data-state');

        if (!state) { TimedContent._log("- No state found."); return; }

        TimedContent._log("- Found state: '%s'", state);

        var activeFrom = el.getAttribute('data-active-from');
        var activeTo = el.getAttribute('data-active-to');

        TimedContent._log("- Active From: [%s] Active To: [%s]", activeFrom, activeTo);

        if (!activeFrom && !activeTo) { return; }

        var activeFromDate = activeFrom ? this._parseDate(activeFrom) : false;
        var activeToDate = activeTo ? this._parseDate(activeTo) : false;

        var now = new Date();

        TimedContent._log("- Now: [%s] Active From: [%s] Active To: [%s]", now, activeFromDate, activeToDate);

        switch (state) {
            case 'pending':
                TimedContent._log("- Has PENDNG state.");
                if (activeFromDate && now < activeFromDate && (activeFromDate - now) < this.maxTimeout) {
                    TimedContent._log("- Will set active in %ds", (activeFromDate - now)/1000);
                    window.setTimeout(this.setActive, activeFromDate - now, el);
                }

                if (activeToDate && now < activeToDate  && (activeToDate - now) < this.maxTimeout) {
                    TimedContent._log("- Will set expired in %ds", (activeToDate - now)/1000);
                    window.setTimeout(this.setExpired, activeToDate - now, el);
                }
            break;

            case 'active':
                TimedContent._log("- Has ACTIVE state.");
                if (activeToDate && now < activeToDate && (activeToDate - now) < this.maxTimeout) {
                    TimedContent._log("- Will set expired in %ds", (activeToDate - now)/1000);
                    window.setTimeout(this.setExpired, activeToDate - now, el);
                }
            break;

            case 'expired':
                TimedContent._log("- Has EXPIRED state.");
                this.setExpired(el);
            break;

            default:
                console.error('Unknown state: ' + state);
            break;
        }
    },

    'setActive': function(el) {
        TimedContent._log("Setting %s to state [ACTIVE]", el);
        el.setAttribute('data-state', 'active');
        removeClass(el, CLS_TIMED_CONTENT_PENDING); // in theory we'll never go from expired to active...
        addClass(el, CLS_TIMED_CONTENT_ACTIVE);
    },

    'setExpired': function(el) {
        TimedContent._log("Setting %s to state [EXPIRED]", el);
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


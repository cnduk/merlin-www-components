'use strict';

import {
    hasClass,
    addClass,
    removeClass,
    removeElement
} from '@cnbritain/merlin-www-js-utils/js/functions';

var CLS_TIMED_CONTENT = 'bb-timed-content';
var CLS_TIMED_CONTENT_PENDING = 'bb-timed-content--pending';
var CLS_TIMED_CONTENT_ACTIVE = 'bb-timed-content--active';
var CLS_TIMED_CONTENT_EXPIRED = 'bb-timed-content-expired';
var CLS_TIMED_CONTENT_PREVIEW = 'bb-timed-content--preview';
// We need to set a max timeout value as any number bigger than maxint will
// cause the timeout to fire immediately. 5 days seems plenty?
var MAX_TIMEOUT = 86400 * 5;

function log(){
    var DEBUG = false;

    if (DEBUG) {
        console.log.apply(console, arguments);
    }
}

function toArray(collection){
    var len = collection.length;
    var arr = new Array(len);
    while(len--) arr[len] = collection[len];
    return arr;
}

function parseDate(dateString){
    var parts = dateString.split(' ');
    var date = parts[0];
    var time = parts[1];

    var dateParts = date.split('-');
    var timeParts = time.substr(0, time.indexOf('+')).split(':');

    var parsedDate = new Date(
        dateParts[0],
        dateParts[1] - 1,
        dateParts[2],
        timeParts[0],
        timeParts[1],
        timeParts[2]
    );

    if(isNaN(Number(parsedDate))){
        return false;
    } else {
        return parsedDate;
    }
}

function validateDate(testDate, nowDate){
    return (
        testDate &&
        nowDate < testDate &&
        (testDate - nowDate) < this.maxTimeout
    );
}

function setElementActive(el) {
    log("Setting %s to state [ACTIVE]", el);
    el.setAttribute('data-state', 'active');
    // in theory we'll never go from expired to active...
    removeClass(el, CLS_TIMED_CONTENT_PENDING);
    addClass(el, CLS_TIMED_CONTENT_ACTIVE);
}

function setElementExpired(el) {
    log("Setting %s to state [EXPIRED]", el);
    removeElement(el);
}

function setElementTimer(el){
    log("Setting timers for %o", el);

    if (hasClass(el, CLS_TIMED_CONTENT_PREVIEW)) {
        log("- Preview mode, nothing to do here.");
        return;
    }

    var state = el.getAttribute('data-state');

    if (!state) {
        log("- No state found.");
        return;
    }

    log("- Found state: '%s'", state);

    var activeFrom = el.getAttribute('data-active-from');
    var activeTo = el.getAttribute('data-active-to');

    log("- Active From: [%s] Active To: [%s]", activeFrom, activeTo);

    if (!activeFrom && !activeTo) return;

    var activeFromDate = activeFrom ? parseDate(activeFrom) : false;
    var activeToDate = activeTo ? parseDate(activeTo) : false;

    var now = new Date();

    log("- Now: [%s] Active From: [%s] Active To: [%s]", now,
        activeFromDate, activeToDate);

    switch (state) {
        case 'pending':
            log("- Has PENDNG state.");
            if(validateDate(activeFromDate, now)){
                log("- Will set active in %ds", (activeFromDate - now)/1000);
                window.setTimeout(setElementActive, activeFromDate - now, el);
            }

            if(validateDate(activeToDate, now)){
                log("- Will set expired in %ds", (activeToDate - now)/1000);
                window.setTimeout(setElementExpired, activeToDate - now, el);
            }
        break;

        case 'active':
            log("- Has ACTIVE state.");
            if(validateDate(activeToDate, now)){
                log("- Will set expired in %ds", (activeToDate - now)/1000);
                window.setTimeout(setElementExpired, activeToDate - now, el);
            }
        break;

        case 'expired':
            log("- Has EXPIRED state.");
            setElementExpired(el);
        break;

        default:
            console.error('Unknown state: ' + state);
        break;
    }
}

export default function(){
    var timedContentBlocks = toArray(
        document.querySelectorAll('.' + CLS_TIMED_CONTENT));
    var tctLen = timedContentBlocks.length;

    while(tctLen--) {
        setElementTimer(timedContentBlocks[tctLen]);
    }
}

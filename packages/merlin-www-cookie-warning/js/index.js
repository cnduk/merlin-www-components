'use strict';

import EventEmitter from 'eventemitter2';
import {
    addClass,
    addEvent,
    deleteCookie,
    getCookie,
    inherit,
    removeClass,
    removeElement,
    removeEvent,
    setCookie
} from '@cnbritain/merlin-www-js-utils/js/functions';
import * as events from './events';

export var COOKIE_DIALOG_CLOSED = 'cnd_cookie_dialog_gdpr_closed';
export var COOKIE_DIALOG_COUNT = 'cnd_cookie_dialog_gdpr_count';
var JS_CLOSE_BUTTON = '.js-c-cookie-close-btn';
var COUNT_LIMIT = 3;

function CookieWarning(el) {
    EventEmitter.call(this, {
        wildcard: true
    });

    this.el = el;
    this.isHidden = true;

    this._hooks = {
        click: null
    };

    this._init();
}
CookieWarning.prototype = inherit(EventEmitter.prototype, {
    _bindListeners: function _bindListeners() {
        this._hooks.click = this.remove.bind(this);
        addEvent(
            this.el.querySelector(JS_CLOSE_BUTTON), 'click',
            this._hooks.click);
    },
    _unbindListeners: function _unbindListeners() {
        if (this._hooks !== null) {
            removeEvent(
                this.el.querySelector(JS_CLOSE_BUTTON), 'click',
                this._hooks.click);
            this._hooks = null;
        }
    },
    _init: function _init() {

        // Check if dialog has already been closed
        var isDialogClosed = getCookie(COOKIE_DIALOG_CLOSED);
        if (isDialogClosed) {
            this.remove();
            return;
        }

        if (this.incrementCounter()) {
            this._bindListeners();
            this.show();
        }

    },
    constructor: CookieWarning,
    hide: function hide() {
        if (this.isHidden) return;
        this.isHidden = true;
        addClass(this.el, 'is-hidden');
        this.emit('visibilitychange', events.visibilitychange(this, 'hidden'));
    },
    show: function show() {
        if (!this.isHidden) return;
        this.isHidden = false;
        removeClass(this.el, 'is-hidden');
        this.emit('visibilitychange', events.visibilitychange(this, 'visible'));
    },
    remove: function remove() {
        deleteCookie(COOKIE_DIALOG_COUNT);
        setCookie(COOKIE_DIALOG_CLOSED, true, 365);
        this.hide();
        this._unbindListeners();
        this.emit('remove', events.remove(this));
        this.removeAllListeners();
        removeElement(this.el);
        this.el = null;
    },
    incrementCounter: function incrementCounter() {
        // Update page counter and remove after we've hit third page
        var pageCounter = getCookie(COOKIE_DIALOG_COUNT);

        if (pageCounter === null) {
            setCookie(COOKIE_DIALOG_COUNT, 1, 365);

        } else {
            pageCounter = parseInt(pageCounter, 10);
            if (isNaN(pageCounter)) {
                setCookie(COOKIE_DIALOG_COUNT, 1, 365);

            } else {
                pageCounter++;
                if (pageCounter === COUNT_LIMIT) {
                    this.emit('limitexceeded', events.limitexceeded(this));
                    deleteCookie(COOKIE_DIALOG_COUNT);
                    setCookie(COOKIE_DIALOG_CLOSED, true, 365);
                    this.remove();
                    return false;

                } else {
                    setCookie(COOKIE_DIALOG_COUNT, pageCounter, 365);
                }
            }
        }

        return true;
    }
});

var COOKIE_WARNING;

if (document.getElementById('domCookieWarning') !== null) {
    COOKIE_WARNING = new CookieWarning(
        document.getElementById('domCookieWarning'));
}

export default COOKIE_WARNING;
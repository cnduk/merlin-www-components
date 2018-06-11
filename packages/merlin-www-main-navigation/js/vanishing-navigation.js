'use strict';

import EventEmitter from 'eventemitter2';
import {
    addClass,
    addEvent,
    getWindowScrollTop,
    inherit,
    removeClass,
    removeEvent,
    throttle
} from '@cnbritain/merlin-www-js-utils/js/functions';

import * as events from './events';


var CLS_VANISH = 'n-vanishing-nav';
var CLS_VANISH_HIDDEN = 'is-hidden';
var MIN_HIDDEN_Y = 400;
var THROTTLE_MS = 300;

function VanishingNavigation(el) {
    EventEmitter.call(this, {
        'wildcard': true
    });

    this._isEnabled = false;
    this._isPaused = false;
    this._isVisible = true;
    this._hooks = {
        'scroll': null
    };
    this._lastScrollY = 0;
    this._offsetY = 0;

    this.el = el;
}

VanishingNavigation.prototype = inherit(EventEmitter.prototype, {

    'constructor': VanishingNavigation,

    hide: function hide() {
        if (!this._isVisible) return;
        this._isVisible = false;
        addClass(this.el, CLS_VANISH_HIDDEN);
        this.emit('visibilitychange', events.visibilitychange(this, 'hidden'));
    },
    show: function show() {
        if (this._isVisible) return;
        this._isVisible = true;
        removeClass(this.el, CLS_VANISH_HIDDEN);
        this.emit('visibilitychange', events.visibilitychange(this, 'visible'));
    },

    enable: function enable() {
        if (this._isEnabled) return;
        this._isEnabled = true;

        addClass(this.el, CLS_VANISH);
        this._hooks.scroll = throttle(this.update, THROTTLE_MS, this);
        addEvent(window, 'scroll', this._hooks.scroll);
        this.emit('enable', events.enable(this));
    },
    disable: function disable() {
        if (!this._isEnabled) return;
        this._isEnabled = false;

        removeClass(this.el, CLS_VANISH);
        removeEvent(window, 'scroll', this._hooks.scroll);
        this._hooks.scroll = null;
        this.emit('disable', events.disable(this));
    },
    update: function update() {
        if (this._isPaused) return;

        var scrollY = getWindowScrollTop();
        var scrollVelocity = scrollY - this._lastScrollY;
        this._lastScrollY = scrollY;

        this.emit('update', events.update(this, scrollY, scrollVelocity));

        // Check if we are in the min Y
        if (scrollY - this._offsetY <= MIN_HIDDEN_Y) {
            if (!this._isVisible) this.show();
            return;
        }

        // Check if we're scrolling up and visible
        if (!this._isVisible && scrollVelocity < 0) {
            return this.show();
        }

        // Check if we are greater than our min Y
        if (this._isVisible && scrollVelocity > 0) {
            return this.hide();
        }
    },

    pause: function pause() {
        this._isPaused = true;
        this.emit('pause', events.pause(this));
    },
    unpause: function unpause() {
        this._isPaused = false;
        this.emit('unpause', events.unpause(this));
    }

});

export default VanishingNavigation;
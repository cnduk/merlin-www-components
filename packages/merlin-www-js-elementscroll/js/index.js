'use strict';

import EventEmitter from 'eventemitter2';

import {
    addEvent,
    assign,
    cloneObject,
    getScrollLeft,
    getScrollTop,
    inherit,
    isWindow,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';


var DEFAULT_OPTIONS = {
    'offset': {
        'x': 0,
        'y': 0
    },
    'relative': true,
    'stopOnUserInput': true
};

var DEFAULT_POSITION = {
    'x': 0,
    'y': 0
};

/**
 * @class Gallery
 * @param {HTMLElement}     el          Gallery Element
 * @param {Object}          options     Gallery options
 */
function ElementScroll(scrollElement) {
    EventEmitter.call(this);

    /**
     * RequestAnimationFrame animation count
     * @private
     * @type {Number}
     */
    this._frame = null;

    /**
     * Current scroll position for x and y
     * @private
     * @type {Object}
     */
    this._scrollStart = cloneObject(DEFAULT_POSITION);

    /**
     * Determines whether to scroll window or element
     * @private
     * @type {Function}
     */
    this._setPosition = isWindow(scrollElement) ? setWindowScroll : setElementScroll;

    /**
     * @private
     * @type {Number}
     */
    this._timeStart = null;
    this._updateBound = this._update.bind(this);
    this._userInput = null;

    /**
     * Scroll duration length
     * @public
     * @type {Number}
     */
    this.duration = 0;

    /**
     * Scroll element
     * @public
     * @type {HTMLElement}
     */
    this.el = scrollElement;

    /**
     * Is scrolling boolean
     * @public
     * @type {Boolean}
     */
    this.isScrolling = false;

    /**
     * Scroll offset position for x and y
     * @public
     * @type {Object}
     */
    this.offset = cloneObject(DEFAULT_POSITION);

    /**
     * Clone of scroll element
     * @public
     * @type {HTMLElement}
     */
    this.scrollTarget = null;
}

ElementScroll.prototype = inherit(EventEmitter.prototype, {
    'constructor': ElementScroll,

    '_bindStopOnInput': function() {
        this._userInput = function() {
            this.stop();
        }.bind(this);

        addEvent(this.el, 'wheel', this._userInput);
        addEvent(this.el, 'touchstart', this._userInput);
    },

    '_complete': function() {
        resetElementScroll(this);
        this.emit('complete');
    },

    '_unbindStopOnInput': function() {
        if (this._userInput === null) return;
        removeEvent(this.el, 'wheel', this._userInput);
        removeEvent(this.el, 'touchstart', this._userInput);
        this._userInput = null;
    },

    '_update': function(time) {
        if (this._timeStart === null) this._timeStart = time;

        var totalTime = time - this._timeStart;
        var scrollX = easeInOutQuad(totalTime, this._scrollStart.x,
            this.scrollTarget.x, this.duration);
        var scrollY = easeInOutQuad(totalTime, this._scrollStart.y,
            this.scrollTarget.y, this.duration);
        this._setPosition(this.el, scrollX, scrollY);
        this.emit('update', scrollY);

        if (totalTime < this.duration) {
            this._frame = requestAnimationFrame(this._updateBound);
        } else {
            this._setPosition(this.el, this._scrollStart.x + this.scrollTarget.x,
                this._scrollStart.y + this.scrollTarget.y);
            this._complete();
        }

    },

    'destroy': function() {
        this.stop();
        this.removeAllListeners();
        this._setPosition = null;
        this._updateBound = null;
    },

    'start': function(target, duration, _options) {
        var options = assign({}, DEFAULT_OPTIONS, _options);

        if (this.isScrolling) this.stop();

        this.isScrolling = true;
        this.duration = duration;
        this.offset.x = options.offset.x;
        this.offset.y = options.offset.y;

        // If we want to stop on user input
        if (options.stopOnUserInput) this._bindStopOnInput();

        // Assign the scroll start
        this._scrollStart = assign({}, DEFAULT_POSITION, {
            'x': getScrollLeft(this.el),
            'y': getScrollTop(this.el)
        });

        // Assign the scroll target
        this.scrollTarget = cloneObject(target);

        this.scrollTarget.x = Math.ceil(this.scrollTarget.x + this.offset.x);
        this.scrollTarget.y = Math.ceil(this.scrollTarget.y + this.offset.y);

        // If the scrollTarget is not relative, it is absolute. So updated
        // the scrollTarget to be relative as everything is worked out based
        // on the change between the two values
        if (!options.relative) {
            this.scrollTarget.x -= this._scrollStart.x;
            this.scrollTarget.y -= this._scrollStart.y;
        }

        // Fire events
        this.emit('start');

        // If we dont have request animation frame, just jump to the postition
        if (window.requestAnimationFrame) {
            this._frame = requestAnimationFrame(this._updateBound);
        } else {
            this._setPosition(this.scrollTarget.x, this.scrollTarget.y);
            this._complete();
        }

    },

    'stop': function() {
        if (!this.isScrolling) return;
        resetElementScroll(this);
        this.emit('stop');
    }
});


export default ElementScroll;


/**
 * easeInOutQuad easing
 * @param  {Number} t Current time
 * @param  {Number} b Start value
 * @param  {Number} c Change in value
 * @param  {Number} d Duration
 * @return {Number}
 */
function easeInOutQuad(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
    return -c / 2 * ((--t) * (t - 2) - 1) + b;
}

/**
 * Resets the element scroll back to default
 * @param  {ElementScroll} elementScroll
 * @return {ElementScroll}
 */
function resetElementScroll(elementScroll) {
    cancelAnimationFrame(elementScroll._frame);
    elementScroll._unbindStopOnInput();
    elementScroll.isScrolling = false;
    elementScroll.scrollTarget = null;
    elementScroll._frame = null;
    elementScroll._scrollStart = null;
    elementScroll._timeStart = null;
    return elementScroll;
}

/**
 * Set the elements scroll left and top
 * @param {HtmlNode} el
 * @param {Number} x
 * @param {Number} y
 */
function setElementScroll(el, x, y) {
    if (x !== undefined) el.scrollLeft = x;
    if (y !== undefined) el.scrollTop = y;
}

/**
 * Sets the window scroll left and top
 * @param {Window} window
 * @param {Number} x
 * @param {Number} y
 */
function setWindowScroll(window, x, y) {
    window.scrollTo(x, y);
}
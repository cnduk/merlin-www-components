'use strict';

import {
    addClass,
    addEvent,
    clamp,
    getBoundingClientRect,
    getParent,
    hasClass,
    removeClass,
    throttle
} from '@cnbritain/merlin-www-js-utils/js/functions';
import ElementScroll from '@cnbritain/merlin-www-js-elementscroll';
import {AdManager, AdUtils} from '@cnbritain/merlin-www-ads';

/**
 * The scroll duration
 * @constant
 * @type {Number}
 */
var SCROLL_DURATION = 1000;

/**
 * The scroll throttle
 * @contant
 * @type {Number}
 */
var SCROLL_THROTTLE = 300;

var CLS_ITEM_AD = '.c-top-stories__cards-listitem--ad';
var CLS_HAS_NAVIGATION = 'has-navigation';
var CLS_HAS_NO_SCROLL = 'has-no-scroll';

/**
 * @class TopStoriesNavigation
 * @param {HTMLElement} el
 */
function TopStoriesNavigation(el, options) {

    /**
     * The button elements
     * @private
     * @type {Array.<HTMLElement>}
     */
    this._btns = toArray(el.querySelectorAll('.c-top-stories__nav button'));

    /**
     * The scroll element
     * @private
     * @type {HTMLElement}
     */
    this._elScroll = el.querySelector('.c-top-stories__cards');

    /**
     * The scroll animater
     * @private
     * @type {ElementScroll}
     */
    this._scroller = null;

    /**
     * The top stories element
     * @public
     * @alias el
     * @memberof! TopStoriesNavigation.prototype
     * @type {HTMLElement}
     */
    this.el = el;

    /**
     * The scroll offset
     * @private
     * @type {Number}
     */
    this._scrollOffset = options.scrollOffset || 0;

    // Scroll listener
    addEvent(
        this._elScroll,
        'scroll',
        throttle(onScroll.bind(this), SCROLL_THROTTLE)
    );

    // Arrow buttons
    if (this._btns.length > 0) {
        addEvent(this._btns[0], 'click', this.previousItems.bind(this));
        addEvent(this._btns[1], 'click', this.nextItems.bind(this));
    }

    // Check if we have any ads
    var adElements = this.el.querySelectorAll(CLS_ITEM_AD);
    if(adElements.length > 0){
        AdManager.init();
        AdManager.on('register', onAdRegister);
        AdManager.lazy(this.el);
    }

}
TopStoriesNavigation.prototype = {

    'constructor': TopStoriesNavigation,

    /**
     * Scrolls the element to the next items
     * @public
     * @memberof! TopStoriesNavigation.prototype
     */
    'nextItems': function() {
        // Get the scroll group size and scrollLeft
        var scrollRect = getBoundingClientRect(this._elScroll);

        // Get the stories position and sizes
        var elStories = getStoryElements(this._elScroll);
        var storyRects = elStories.map(getBoundingClientRect);
        storyRects = storyRects.map(normaliseToElement(scrollRect));

        // Find the first element that is offscreen or partially off
        var offscreenIndex = -1;
        var i = -1;
        var length = storyRects.length;
        while (++i < length) {
            if (storyRects[i].right > scrollRect.width) {
                offscreenIndex = i;
                break;
            }
        }
        if (offscreenIndex === -1) return;

        var offset = 0;
        if(window.innerWidth <= scrollRect.width){
            offset = -this._scrollOffset;
        }
        this.scrollTo(storyRects[offscreenIndex].left + offset);
    },

    /**
     * Scrolls the element to the previous items
     * @public
     * @memberof! TopStoriesNavigation.prototype
     */
    'previousItems': function() {
        // Get the scroll group size and scrollLeft
        var scrollRect = getBoundingClientRect(this._elScroll);

        // Get the stories position and sizes
        var elStories = getStoryElements(this._elScroll);
        var storyRects = elStories.map(getBoundingClientRect);
        storyRects = storyRects.map(normaliseToElement(scrollRect));

        // Find the first element that is offscreen or partially off
        var offscreenIndex = -1;
        var length = storyRects.length;
        while (length--) {
            if (storyRects[length].left < 0) {
                offscreenIndex = length;
                break;
            }
        }
        if (offscreenIndex === -1) return;

        var offset = 0;
        if(window.innerWidth <= scrollRect.width){
            offset = this._scrollOffset;
        }
        this.scrollTo(
            -scrollRect.width + storyRects[offscreenIndex].right + offset);
    },

    /**
     * Scrolls the element to the x location
     * @public
     * @memberof! TopStoriesNavigation.prototype
     * @param  {Number} x
     */
    'scrollTo': function(x) {
        if (this._scroller !== null) {
            this._scroller.destroy();
            this._scroller = null;
        }

        // Clamp the scroll left
        var left = clamp(
            0, this._elScroll.scrollWidth - this._elScroll.offsetWidth,
            this._elScroll.scrollLeft + x);
        left -= this._elScroll.scrollLeft;

        this._scroller = new ElementScroll(this._elScroll);
        this._scroller.on('complete', onElementScrollFinish.bind(this));
        this._scroller.on('stop', onElementScrollFinish.bind(this));
        this._scroller.start({
            'x': left,
            'y': 0
        }, SCROLL_DURATION, {
            'stopOnUserInput': false
        });
    },

    /**
     * Show the navigation buttons
     */
    showNavigation: function(){
        if(!hasClass(this.el, CLS_HAS_NAVIGATION)){
            addClass(this.el, CLS_HAS_NAVIGATION);
        }
    },

    /**
     * Hide the navigation buttons
     */
    hideNavigation: function(){
        if(hasClass(this.el, CLS_HAS_NAVIGATION)){
            removeClass(this.el, CLS_HAS_NAVIGATION);
        }
    },

    /**
     * Disable scrolling on the card list
     */
    disableScroll: function(){
        if(!hasClass(this.el, CLS_HAS_NO_SCROLL)){
            addClass(this.el, CLS_HAS_NO_SCROLL);
        }
    },

    /**
     * Enable scrolling on the card list
     */
    enableScroll: function(){
        if(hasClass(this.el, CLS_HAS_NO_SCROLL)){
            removeClass(this.el, CLS_HAS_NO_SCROLL);
        }
    }

};


/**
 * Disables a button
 * @param  {HTMLElement} el
 */
function disableButton(el) {
    if (el.hasAttribute('disabled')) return;
    el.setAttribute('disabled', true);
    addClass(el, 'is-disabled');
}

/**
 * Enables a button
 * @param  {HTMLElement} el
 */
function enableButton(el) {
    if (!el.hasAttribute('disabled')) return;
    el.removeAttribute('disabled');
    removeClass(el, 'is-disabled');
}

/**
 * Gets the article cards
 * @param  {HTMLElement} el
 * @return {Array.<HTMLElement>}
 */
function getStoryElements(el) {
    return toArray(el.querySelectorAll('.c-top-stories__cards-listitem'));
}

/**
 * Checks if the element scrollLeft is at the end
 * @param  {HTMLElement}  el
 * @return {Boolean}
 */
function isScrollAtEnd(el) {
    return el.scrollLeft === el.scrollWidth - el.offsetWidth;
}

/**
 * Checks if the element scrollLeft is at the start
 * @param  {HTMLElement}  el
 * @return {Boolean}
 */
function isScrollAtStart(el) {
    return el.scrollLeft === 0;
}

/**
 * Callback for when an element has finished scrolling
 */
function onElementScrollFinish() {
    this._scroller.destroy();
    this._scroller = null;

    // Check the state of the buttons
    updateButtonStates(this._elScroll, this._btns);
}

/**
 * Normalises the position of an element with the other element
 * @param  {Object} elRect
 * @return {Object}
 */
function normaliseToElement(elRect) {
    return function normaliseToElement_inner(rect) {
        return {
            'bottom': rect.bottom - elRect.top,
            'height': rect.height,
            'left': rect.left - elRect.left,
            'right': rect.right - elRect.left,
            'top': rect.top - elRect.top,
            'width': rect.width
        };
    };
}

/**
 * Callback for scroll event
 */
function onScroll() {
    updateButtonStates(this._elScroll, this._btns);
}

/**
 * Converts a collection into an array
 * @param  {*} collection
 * @return {Array}
 */
function toArray(collection) {
    var length = collection.length;
    var o = new Array(length);
    while (length--) o[length] = collection[length];
    return o;
}

/**
 * Updates the button states based on the scroll element scrollLeft
 * @param  {HTMLElement} scroll
 * @param  {Array.<HTMLElement>} btns
 */
function updateButtonStates(scroll, btns) {
    if (isScrollAtStart(scroll)) {
        disableButton(btns[0]);
        enableButton(btns[1]);
    } else if (isScrollAtEnd(scroll)) {
        enableButton(btns[0]);
        disableButton(btns[1]);
    } else {
        enableButton(btns[0]);
        enableButton(btns[1]);
    }
}

function onAdRegister(e) {
    if (AdUtils.isAdNative(e.ad, 'promotion-small')) {
        e.ad.once('render', onNativeAdRender);
        e.ad.once('stop', onNativeAdStop);
    }
}

function onNativeAdRender(e) {
    e.target.off('stop', onNativeAdStop);

    // Remove is-hidden from list item
    var listItem = getParent(e.target.el, CLS_ITEM_AD);
    removeClass(listItem, 'is-hidden');
}

function onNativeAdStop(e) {
    e.target.off('render', onNativeAdRender);
}

export default TopStoriesNavigation;


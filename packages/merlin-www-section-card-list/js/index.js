'use strict';

/**
 * @module CardList
 */

import Card from '@cnbritain/merlin-www-card';
import { AdManager } from '@cnbritain/merlin-www-ads';
import {
    removeClass
} from '@cnbritain/merlin-www-js-utils/js/functions';

/**
 * Card list css class
 * @constant
 * @type {String}
 */
var CLS_LIST = '.js-c-card-list';

/**
 * Card list item css class
 * @constant
 * @type {String}
 */
var CLS_ITEM = '.js-c-card-list__item';

/**
 * Card list ad css class
 * @constant
 * @type {String}
 */
var CLS_AD = '.js-c-card-list__ad';

/**
 * AdManager register listener boolean
 * @type {Boolean}
 */
var LISTENER_REGISTERED = false;

/**
 * List of CardLists
 * @type {Array}
 */
var cardListList = [];

export default {

    /**
     * Initialises the cards in the list
     */
    'init': function(){
        // Initialiases the cards
        Card.init();

        // Check if any of the lists contain ads
        var cardLists = document.querySelectorAll(CLS_LIST);
        var i = -1;
        var len = cardLists.length;
        while(++i < len){
            if(isInitialised(cardLists[i])) continue;
            if(hasAdSlot(cardLists[i])){
                cardListList.push(new CardList(cardLists[i]));
            }
            setInitialised(cardLists[i]);
        }
        bindAdManagerListener();

    }

};

/**
 * @class CardList
 * @param {HTMLElement} el The card list
 */
function CardList(el){

    /**
     * The card list item ad elements
     * @public
     * @alias el
     * @memberof! CardList.prototype
     * @type {Array.<HTMLElement>}
     */
    this.adEls = toArray(el.querySelectorAll(CLS_AD));

    /**
     * Array of bound listeners
     * @private
     * @type {Array}
     */
    this._adListeners = new Array(this.adEls.length);

    /**
     * Array of Ads
     * @public
     * @alias ads
     * @memberof! CardList.prototype
     * @type {Array}
     */
    this.ads = new Array(this.adEls.length);

    /**
     * The card list
     * @public
     * @alias el
     * @memberof! CardList.prototype
     * @type {HTMLElement}
     */
    this.el = el;

    /**
     * Total ad elements found
     * @public
     * @alias totalAdsFound
     * @memberof! CardList.prototype
     * @type {Number}
     */
    this.totalAdsFound = 0;
}
CardList.prototype = {

    'constructor': CardList,

    /**
     * Destroys the card list
     * @public
     * @memberof! CardList.prototype
     */
    'destroy': function(){
        this.adEls = null;
        this._adListeners = null;
        this.ads = null;
        this.el = null;

        var index = cardListList.indexOf(this);
        cardListList.splice(index, 1);
        if(cardListList.length === 0) unbindAdManagerListener();
    },

    /**
     * Listens to an Ad for render and stop events
     * @param  {Ad} ad
     * @public
     * @memberof! CardList.prototype
     */
    'listenToAd': function(ad){
        var len = this.adEls.length;
        while(len--){
            if(!this.adEls[len].contains(ad.el)) continue;
            break;
        }
        if(len === -1) return;
        this.ads[len] = ad;
        this._adListeners[len] = onAdRenderStop.bind(this);
        ad.once('render', this._adListeners[len]);
        ad.once('stop', this._adListeners[len]);
        this.totalAdsFound++;
    }

};

/**
 * Binds listeners to AdManager register event
 */
function bindAdManagerListener(){
    if(LISTENER_REGISTERED) return;
    LISTENER_REGISTERED = true;
    AdManager.on('register', onManagerRegister);
}

/**
 * Finds the ad in the list
 * @param  {Array.<Ad>} list
 * @param  {Ad} ad
 * @return {Number}      The index
 */
function getAdFromList(list, ad){
    var len = list.length;
    while(len--){
        if(list[len] === ad) return len;
    }
    return -1;
}

/**
 * Checks if the element contains ad element
 * @param  {HTMLElement}  el
 * @return {Boolean}
 */
function hasAdSlot(el){
    return el.querySelectorAll(CLS_AD).length > 0;
}

/**
 * Checks if the element is initialised
 * @param  {HTMLElement}  el
 * @return {Boolean}
 */
function isInitialised(el){
    return (
        el.hasAttribute('data-card-list-initialised') &&
        el.getAttribute('data-card-list-initialised') === 'true');
}

/**
 * Callback for when an Ad fires render or stop
 * @param  {Object} e
 */
function onAdRenderStop(e){
    // Remove last item
    var adIndex = getAdFromList(this.ads, e.target);
    var ad = e.target;
    var adEl = this.adEls[adIndex];
    if(e.type === 'render'){
        var tmp = this.el.querySelectorAll(CLS_ITEM + ':last-child')[0];
        tmp.parentNode.removeChild(tmp);
        removeClass(adEl, 'is-hidden');

    // Remove ad slot
    } else if(e.type === 'stop'){
        adEl.parentNode.removeChild(adEl);
    } else {
        throw new TypeError('Incorrect event type', e);
    }

    // Unbind ad listeners
    ad.off('render', this._adListeners[adIndex]);
    ad.off('stop', this._adListeners[adIndex]);

    // Remove ad and adel
    this.ads.splice(adIndex, 1);
    this.adEls.splice(adIndex, 1);
    this._adListeners.splice(adIndex, 1);
    this.totalAdsFound--;

    // Check to see if we need to destroy
    if(this.totalAdsFound === 0) this.destroy();
}

/**
 * Callback for when the AdManager emits a register event
 * @param  {Object} e
 */
function onManagerRegister(e){
    var i = -1;
    var len = cardListList.length;
    while(++i < len){
        if(cardListList[i].totalAdsFound === cardListList[i].ads.length ||
            !cardListList[i].el.contains(e.ad.el)) continue;
        cardListList[i].listenToAd(e.ad);
        break;
    }
}

/**
 * Sets the card list element to initialised
 * @param {HTMLElement} el
 */
function setInitialised(el){
    el.getAttribute('data-card-list-initialised', 'true');
    return el;
}

/**
 * Converts a collection to an array
 * @param  {*} collection
 * @return {Array}
 */
function toArray(collection){
    var len = collection.length;
    var o = new Array(len);
    while(len--) o[len] = collection[len];
    return o;
}

/**
 * Unbinds the AdManager register listener
 */
function unbindAdManagerListener(){
    LISTENER_REGISTERED = false;
    AdManager.off('register', onManagerRegister);
}
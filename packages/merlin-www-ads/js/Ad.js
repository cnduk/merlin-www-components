'use strict';

import AdModel from './AdModel';
import EventEmitter from 'eventemitter2';
import {
    AD_SIZES,
    AD_STATES,
    getAdTypeBySize
} from './Utils';
import {
    createEventTemplate,
    inherit
} from '@cnbritain/merlin-www-js-utils/js/functions';

/**
 * Default settings for the ad model
 * @constant
 * @default
 * @type {Object}
 */
var AD_DEFAULTS = {
    'bidding': false,
    'creativeId': null,
    'dfp': null,
    'group': null,
    'lazyload': false,
    'lineItemId': null,
    'nativeStyle': 0,
    'order': Number.MAX_VALUE,
    'placement': null,
    'position': null,
    'sizemap': null,
    'sizes': null,
    'targets': null,
    'unit': null,
    'values': null,
    'zone': null
};
export var AD_DEFAULTS;


/**
 * @class Ad
 * @param {HTMLElement} el
 * @param {AdManager} manager
 * @param {Object} options
 */
function Ad(el, manager, options){

    /*
     * Inheritance
     */
    EventEmitter.call(this, { 'wildcard': true });
    AdModel.call(this, AD_DEFAULTS);

    /**
     * The ad element
     * @alias el
     * @memberof! Ad.prototype
     * @public
     * @type {HTMLElement}
     */
    this.el = el;

    /**
     * Unique id of the advert
     * @alias id
     * @memberof! Ad.prototype
     * @public
     * @type {String}
     */
    this.id = el.getAttribute('id');

    /**
     * The group the ad is part of
     * @public
     * @alias group
     * @memberof! Ad.prototype
     * @type {AdGroup}
     */
    this.group = null;

    /**
     * The manager that created the ad
     * @alias manager
     * @public
     * @memberof! Ad.prototype
     * @type {AdManager}
     */
    this.manager = manager;

    /**
     * The rendered size of the advert
     * @public
     * @alias renderedSize
     * @memberof! Ad.prototype
     * @type {Array.<Number>}
     */
    this.renderedSize = null;

    /**
     * The GPT slot
     * @public
     * @alias slot
     * @memberof! Ad.prototype
     * @type {googletag.Slot}
     */
    this.slot = null;

    /**
     * Current state of the advert
     * @public
     * @alias state
     * @memberof! Ad.prototype
     * @type {Number}
     */
    this.state = AD_STATES.UNINITIALISED;

    /**
     * The type of advert
     * @public
     * @alias type
     * @memberof! Ad.prototype
     * @type {Number}
     */
    this.type = AD_SIZES.UNKNOWN;

    this.el.setAttribute('data-ad-initialised', true);
    this.set(options);
    this.manager.slots[this.id] = this;
}

var proto = inherit(AdModel.prototype, EventEmitter.prototype);
Ad.prototype = inherit(proto, {

    'constructor': Ad,

    /**
     * Destroys the advert
     * @public
     * @memberof! Ad.prototype
     */
    'destroy': function(){
        this.clear();
        resetAd(this);
        this.emit('destroy', createEventTemplate('destroy', this));
        this.removeAllListeners();
    },

    /**
     * Forces the ad to change size
     * @public
     * @memberof! Ad.prototype
     * @param  {Number} width
     * @param  {Number} height
     */
    'forceSizeChange': function(width, height){
        this.type = getAdTypeBySize(width, height);
    },

    /**
     * Registers the advert with AdManager
     * @public
     * @memberof! Ad.prototype
     * @return {Promise}
     */
    'register': function(){
        return this.manager.register(this);
    }

});

/**
 * Resets the advert back to an original base state
 * @param  {Ad} ad
 */
function resetAd(ad){
    ad.manager.slots[ad.id] = null;
    ad.el = null;
    ad.id = null;
    if(ad.group) ad.group.remove(ad);
    ad.manager = null;
    ad.renderedSize = null;
    ad.slot = null;
    ad.state = null;
}

export default Ad;

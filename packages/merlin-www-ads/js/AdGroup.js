'use strict';

import EventEmitter from 'eventemitter2';
import {
    hasGroup
} from './Utils';
import {
    assign,
    createEventTemplate,
    getElementOffset,
    getObjectValues,
    hasOwnProperty,
    inherit,
    randomUUID
} from '@cnbritain/merlin-www-js-utils/js/functions';

var DEFAULT_MAX_SLOTS = Infinity;

/**
 * @class AdGroup
 * @param {AdManager} manager
 * @param {Object} options
 */
function AdGroup(manager, options){
    EventEmitter.call(this, { 'wildcard': true });

    var config = assign({
        'id': 'batch-' + randomUUID(),
        'maxSlots': DEFAULT_MAX_SLOTS
    },options);

    /**
     * The bounds of the entire group
     * @private
     * @type {Object}
     */
    this._bounds = {
        'bottom': -Infinity,
        'top': Infinity
    };

    /**
     * Unique id of the group
     * @public
     * @alias id
     * @memberof! AdGroup.prototype
     * @type {String}
     */
    this.id = config.id;

    /**
     * Whether to lazyload the group
     * @public
     * @alias lazyload
     * @memberof! AdGroup.prototype
     * @type {Boolean}
     */
    this.lazyload = false;

    /**
     * The manager that created the group
     * @public
     * @alias manager
     * @memberof! AdGroup.prototype
     * @type {AdManager}
     */
    this.manager = manager;

    /**
     * The maximum amount of slots the group can have
     * @public
     * @alias maxSlots
     * @memberof! AdGroup.prototype
     * @type {Number}
     */
    this.maxSlots = config.maxSlots;

    /**
     * The amount of slots in the group
     * @public
     * @alias size
     * @memberof! AdGroup.prototype
     * @type {Number}
     */
    this.size = 0;

    /**
     * The ad slots
     * @public
     * @alias slots
     * @memberof! AdGroup.prototype
     * @type {Object}
     */
    this.slots = {};

    this.manager.groups[this.id] = this;
}

AdGroup.prototype = inherit(EventEmitter.prototype, {

    /**
     * Add an Ad to the group
     * @public
     * @memberof! AdGroup.prototype
     * @param  {Ad} ad
     */
    'add': function(ad){
        // Check if already part of a group
        if(hasGroup(ad)){
            throw new TypeError('Ad is already part of a group');
        }

        // Check size
        if(this.size >= this.maxSlots){
            throw new RangeError('Group has maxed its slots');
        }

        // Add the ad to the slots
        this.slots[ad.id] = ad;
        ad.group = this;
        ad.once('destroy', onAdDestroy);

        // Update size, lazyload and emit events
        this.size++;
        if(!this.lazyload && ad.get('lazyload')) this.lazyload = true;
        this.emit('add', createEventTemplate('add', this, {
            'ad': ad
        }));
    },

    'constructor': AdGroup,

    /**
     * Destroys the group
     * @public
     * @memberof! AdGroup.prototype
     */
    'destroy': function(){
        // Destroy all ads
        var adKey = '';
        for(adKey in this.slots){
            if(!hasOwnProperty(this.slots, adKey)) continue;
            this.slots[adKey].destroy();
        }

        // Clear the group
        clearGroup.call(this);

        // Emit event and clear listeners
        this.emit('destroy', createEventTemplate('destroy', this));
        this.removeAllListeners();
    },

    /**
     * Refreshes all the slots in the group
     * @public
     * @memberof! AdGroup.prototype
     * @return {Promise}
     */
    'refresh': function(){
        return this.manager.refresh(getObjectValues(this.slots), false);
    },

    /**
     * Registers all the slots in the group
     * @public
     * @memberof! AdGroup.prototype
     * @return {Promise}
     */
    'register': function(){
        return Promise.all(getObjectValues(this.slots).map(mapRegister));
    },

    /**
     * Release all the slots from the group
     * @public
     * @memberof! AdGroup.prototype
     */
    'release': function(){
        this.remove();
        this.emit('release', createEventTemplate('release', this));
    },

    /**
     * Removes an Ad from the group
     * @public
     * @memberof! AdGroup.prototype
     * @param  {Ad} ad
     */
    'remove': function(ad){
        // If nothing, we're removing everything
        if(arguments.length === 0){
            getObjectValues(this.slots).forEach(this.remove.bind(this));
            return;
        }

        // Check if ad is in a group
        if(!hasGroup(ad)) return;
        // Check if ad is part of this group
        if(ad.group !== this){
            throw new Error('Ad is not part of this group');
        }

        // Remove ad from group
        ad.off('destroy', onAdDestroy);
        ad.group = null;
        this.slots[ad.id] = null;
        delete this.slots[ad.id];

        // Update size and emit events
        this.size--;
        this.emit('remove', createEventTemplate('remove', this, {
            'ad': ad
        }));
    },

    /**
     * Renders all the slots in the group
     * @public
     * @memberof! AdGroup.prototype
     * @return {Promise}
     */
    'render': function(){
        return this.manager.render(getObjectValues(this.slots));
    },

    /**
     * Recalculates the top and bottom bounds of the group
     * @public
     * @memberof! AdGroup.prototype
     */
    'resize': function(){
        var positions = getObjectValues(this.slots).map(function(ad){
            return getElementOffset(ad.el);
        });
        var top = Infinity;
        var bottom = -Infinity;
        positions.forEach(function(position){
            if(position.top < top) top = position.top;
            if(position.bottom > bottom) bottom = position.bottom;
        });
        this._bounds.bottom = bottom;
        this._bounds.top = top;
    }

});

/**
 * Resets the group
 * @this AdGroup
 */
function clearGroup(){
    this.manager = null;
    this.slots = null;
}

/**
 * Registers the ad
 * @param  {Ad} ad
 * @return {Promise}
 */
function mapRegister(ad){
    return ad.register();
}

/**
 * Callback for when an Ad is destroyed
 */
function onAdDestroy(){
    // Remove ad from the group
    this.group.remove(this);
}

export default AdGroup;

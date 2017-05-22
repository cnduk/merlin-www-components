"use strict";

import EventEmitter from 'eventemitter2';

import {
    assign,
    inherit
} from '@cnbritain/merlin-www-js-utils/js/functions';

var DEFAULT_OPTIONS = {
    "silent": false
};

function Manager(){

    /**
     * @inheritance
     */
    EventEmitter.call( this );

    /**
     * @public
     */
    this.groups = [];
    this.obstacles = [];
    this.scrolls = [];
    this.stickies = [];

    /**
     * @private
     */

}

Manager.prototype = inherit( EventEmitter.prototype, {

    /**
     * Adds an item to the group list
     * @param  {Group} item
     * @param  {Object} _options
     */
    "addGroup": function( item, _options ){
        var options = getOptions( _options );
        addItem( this.groups, item );
        if( !options.silent ) this.emit( "add", item );
    },

    /**
     * Adds an item to the obstacle list
     * @param  {Obstacle} item
     * @param  {Object} _options
     */
    "addObstacle": function( item, _options ){
        var options = getOptions( _options );
        addItem( this.obstacles, item );
        if( !options.silent ) this.emit( "add", item );
    },

    /**
     * Adds an item to the scroll list
     * @param  {Scroll} item
     * @param  {Object} _options
     */
    "addScroll": function( item, _options ){
        var options = getOptions( _options );
        addItem( this.scrolls, item );
        if( !options.silent ) this.emit( "add", item );
    },

    /**
     * Adds an item to the stick list
     * @param  {Stick} item
     * @param  {Object} _options
     */
    "addStick": function( item, _options ){
        var options = getOptions( _options );
        addItem( this.stickies, item );
        if( !options.silent ) this.emit( "add", item );
    },

    "constructor": Manager,

    /**
     * Checks if the item is in the group list
     * @param  {Group} item
     * @param  {Boolean} returnIndex Whether we want an index returned
     * @return {Boolean/Number}
     */
    "hasGroup": function( item, returnIndex ){
        return hasItem( this.groups, item, returnIndex );
    },

    /**
     * Checks if the item is in the obstacle list
     * @param  {Obstacle} item
     * @param  {Boolean} returnIndex Whether we want an index returned
     * @return {Boolean/Number}
     */
    "hasObstacle": function( item, returnIndex ){
        return hasItem( this.obstacles, item, returnIndex );
    },

    /**
     * Checks if the item is in the scroll list
     * @param  {Scroll} item
     * @param  {Boolean} returnIndex Whether we want an index returned
     * @return {Boolean/Number}
     */
    "hasScroll": function( item, returnIndex ){
        return hasItem( this.scrolls, item, returnIndex );
    },

    /**
     * Checks if the item is in the stick list
     * @param  {Stick} item
     * @param  {Boolean} returnIndex Whether we want an index returned
     * @return {Boolean/Number}
     */
    "hasStick": function( item, returnIndex ){
        return hasItem( this.stickies, item, returnIndex );
    },

    /**
     * Triggers a recalculate on all groups and children, and scrolls
     */
    "recalculate": function(){
        this.groups.forEach( recalculateItem );
        this.scrolls.forEach( recalculateItem );
    },

    /**
     * Removes an item from the group list
     * @param  {Group} item
     * @param  {Object} _options
     */
    "removeGroup": function( item, _options ){
        var options = getOptions( _options );
        if( removeItem( this.groups, item ) && !options.silent ){
            this.emit( "remove", item );
        }
    },

    /**
     * Removes an item from the obstacle list
     * @param  {Obstacle} item
     * @param  {Object} _options
     */
    "removeObstacle": function( item, _options ){
        var options = getOptions( _options );
        if( removeItem( this.obstacles, item ) && !options.silent ){
            this.emit( "remove", item );
        }
    },

    /**
     * Removes an item from the scroll list
     * @param  {Scroll} item
     * @param  {Object} _options
     */
    "removeScroll": function( item, _options ){
        var options = getOptions( _options );
        if( removeItem( this.scrolls, item ) && !options.silent ){
            this.emit( "remove", item );
        }
    },

    /**
     * Removes an item from the stick list
     * @param  {Stick} item
     * @param  {Object} _options
     */
    "removeStick": function( item, _options ){
        var options = getOptions( _options );
        if( removeItem( this.stickies, item ) && !options.silent ){
            this.emit( "remove", item );
        }
    },

} );

/**
 * Checks if the item already exists in the haystack. If not, adds to it
 * @param {Array} haystack
 * @param {*} item
 */
function addItem( haystack, item ){
    if( hasItem( haystack, item ) ) return;
    haystack.push( item );
}

/**
 * Checks if the needle exists in the haystack
 * @param  {Array}  haystack
 * @param  {*}  needle
 * @param  {Boolean}  returnIndex Whether to return an index
 * @return {Boolean/Number}
 */
function hasItem( haystack, needle, returnIndex ){
    if( !needle ) return false;
    var index = haystack.length;
    while(index--){
        if(haystack[index] === needle) break;
        if(haystack[index].el === needle) break;
    }
    if( !!returnIndex ) return index;
    return index !== -1;
}

/**
 * Creates an object with options
 * @param  {Object} options
 * @return {Object}
 */
function getOptions( options ){
    return assign({}, DEFAULT_OPTIONS, options );
}

/**
 * Triggers a recalculate on the item
 * @param  {*} item
 */
function recalculateItem( item ){
    item.recalculate( true );
}

/**
 * Removes an item from the haystack if it exists
 * @param  {Array} haystack
 * @param  {*} item
 * @return {Boolean}
 */
function removeItem( haystack, item ){
    var index = -1;
    if( ( index = hasItem( haystack, item, true ) ) === -1 ) return false;
    haystack.splice( index, 1 );
    return true;
}


/* There can only be one manager */
export default new Manager();
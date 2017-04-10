"use strict";
/* globals ga, COMSCORE */

import { assign } from '@cnbritain/merlin-www-js-utils/js/functions';

/**
 * RegEx to check if the string is a dimension
 * @constant
 * @type {RegExp}
 */
var RE_DIMENSION = /^dimension/;

/**
 * @class GATracker
 * @param {String} id      The GA unique id
 * @param {Object} _config
 */
function GATracker(id, _config){

    /**
     * The name of the tracker. This will be updated after creation to contain
     * a period at the end as we refer to it in all the GA events
     * @type {String}
     */
    this._name = "TRACKER" + GATracker.TRACKERS.length;

    /**
     * The tracking id
     * @private
     * @type {String}
     */
    this._id = id;

    /**
     * The type of GATracker
     * @public
     * @type {String}
     */
    this.type = _config && _config.type !== undefined ? _config.type : "brand";


    var config = {
        "allowLinker": !!( _config && _config.linker ),
        "cookieDomain": _config && _config.cookieDomain !== undefined ?
                        _config.cookieDomain :
                        "auto",
        "name": this._name,
        "trackingId": this._id
    };
    ga( "create", config );

    /**
     * See if we need to require displayfeatures
     */
    if( _config && _config.displayFeatures === true ){
        ga( this._name + ".require", "displayfeatures" );
    }

    /**
     * See if we need to require autolinker
     */
    if( _config && _config.linker !== undefined ){
        ga( this._name + ".require", "linker" );
        ga( this._name + ".linker:autoLink", _config.linker );
    }

    if(_config && _config.optimizeId !== undefined){
        ga(this._name + ".require", _config.optimizeId);
    }

    /**
     * Add this tracker to the global tracking
     */
    GATracker.TRACKERS.push( this );

}

/**
 * List of trackers that have been created
 * @static
 * @type {Array}
 */
GATracker.TRACKERS = [];


/**
 * Calls send on all the trackers
 * @static
 * @param {String} hitType
 * @param {Object} config
 */
GATracker.SendAll = function SendAll( hitType, config ){
    GATracker.TRACKERS.forEach(function SendAll_inner( tracker ){
        tracker.send( hitType, config );
    });
};


/**
 * Calls set on all the trackers
 * @param {String/Object} fieldName
 * @param {String/Number} value
 */
GATracker.SetAll = function SetAll( fieldName, value ){
    var argCount = arguments.length;
    GATracker.TRACKERS.forEach(function SetAll_inner( tracker ){
        if( argCount === 2 ){
            tracker.set( fieldName, value );
        } else {
            tracker.set( fieldName );
        }
    });
};


/**
 * GATracker prototype
 * @type {Object}
 */
GATracker.prototype = {

    "constructor": GATracker,

    /**
     * Fires a ga send call
     * @public
     * @memberof! GATracker.prototype
     * @param  {String} hitType
     * @param  {Object} config  Data to send along with the call
     */
    "send": function( hitType, config ){
        var options = assign( {
            "comscore": true
        }, config, {
            "hitType": hitType
        } );

        var comscore = options.comscore;
        delete options.comscore;

        ga( this._name + ".send", options );

        // Whenever we send a pageview, send a comscore beacon
        if( hitType === GATracker.SEND_HITTYPES.PAGEVIEW && comscore &&
            this.type === "brand" ){
            sendComscore( location.href );
        }

    },

    /**
     * Fires a ga set call to set information
     * @public
     * @memberof! GATracker.prototype
     * @param  {String/Object} fieldName Either a key or an object with data
     * @param  {String/Number} value
     */
    "set": function( fieldName, value ){
        var setData = fieldName;

        if( arguments.length === 2 ){
            setData = {};
            setData[ fieldName ] = value;
        }

        // If the tracker is `conde`, we need to remove custom dimensions. We
        // might not need to do this but just to be safe :)
        if( this.type !== "brand" ){
            setData = removeCustomDimensions( setData );
        }

        ga( this._name + ".set", setData );
    }
};

/**
 * Gets the dimension label by dimension index
 * @static
 * @param  {String} index
 * @return {String}       The dimension label
 */
GATracker.getDimensionByIndex = function( index ){
    if( GATracker.INDEX_BY_DIMENSION.hasOwnProperty( index ) ){
        return GATracker.INDEX_BY_DIMENSION[ index ];
    }
    throw new TypeError( index + " is not a valid index" );
};

/**
 * Gets the dimension index by dimension label
 * @static
 * @param  {String} dimension
 * @return {String}           The dimension index
 */
GATracker.getIndexByDimension = function( dimension ){
    if( GATracker.DIMENSION_BY_INDEX.hasOwnProperty( dimension ) ){
        return GATracker.DIMENSION_BY_INDEX[ dimension ];
    }
    throw new TypeError( dimension + " is not a valid dimension" );
};

/**
 * Lookup table of dimension index by dimension label
 * @static
 * @type {Object}
 */
GATracker.INDEX_BY_DIMENSION = {
    "PAGE_TEMPLATE": "dimension1",
    "BASE_URL": "dimension3",
    "UPDATE_DATE": "dimension22",
    "PUBLISH_DATE": "dimension10",
    "AUTHOR": "dimension7",
    "GALLERY_URL": "dimension33",
    "PRIMARY_TAG": "dimension4",
    "TAGS": "dimension6",
    "MAGAZINE_CONTENT": "dimension19",
    "MAGAZINE_ISSUE": "dimension20",
    "UMBRACO_ID": "dimension35",
    "MERLIN_ID": "dimension36",
    "PAGE_AGE": "dimension9",
    "GALLERY_LENGTH": "dimension13",
    "GALLERY_POSITION": "dimension12",
    "GALLERY_PHOTO_CREDIT": "dimension11",
    "PLATFORM": "dimension5",
    "AD_BLOCKER": "dimension43",
    "WORD_COUNT": "dimension8",
    "DISPLAY_DATE": "dimension45",
    "NAME_OF_DAY": "dimension41",
    "PUBLISH_DATE_HOUR": "dimension42"
};

/**
 * Lookup table of dimension labels by dimension index
 * @static
 * @type {Object}
 */
GATracker.DIMENSION_BY_INDEX = {
    "dimension1": "PAGE_TEMPLATE",
    "dimension3": "BASE_URL",
    "dimension22": "UPDATE_DATE",
    "dimension10": "PUBLISH_DATE",
    "dimension7": "AUTHOR",
    "dimension33": "GALLERY_URL",
    "dimension4": "PRIMARY_TAG",
    "dimension6": "TAGS",
    "dimension19": "MAGAZINE_CONTENT",
    "dimension20": "MAGAZINE_ISSUE",
    "dimension35": "UMBRACO_ID",
    "dimension36": "MERLIN_ID",
    "dimension9": "PAGE_AGE",
    "dimension13": "GALLERY_LENGTH",
    "dimension12": "GALLERY_POSITION",
    "dimension11": "GALLERY_PHOTO_CREDIT",
    "dimension5": "PLATFORM",
    "dimension43": "AD_BLOCKER",
    "dimension8": "WORD_COUNT",
    "dimension45": "DISPLAY_DATE",
    "dimension41": "NAME_OF_DAY",
    "dimension42": "PUBLISH_DATE_HOUR"
};

/**
 * List of crossdomain linker domains
 * @constant
 * @deprecated
 * @type {Array}
 */
// GATracker.DOMAINS = [
//     "bridesmagazine.co.uk",
//     "cntraveller.com",
//     "condenast.co.uk",
//     "houseandgarden.co.uk",
//     "glamourmagazine.co.uk",
//     "gq-magazine.co.uk",
//     "tatler.com",
//     "vanityfair.co.uk",
//     "vogue.co.uk",
//     "wired.co.uk"
// ];

/**
 * List of referrer types
 * @constant
 * @type {Object}
 */
GATracker.REFERRERS = {
    "EXTERNAL": "External",
    "HOMEPAGE": "Homepage",
    "INCONTENT_LINK": "In-content link",
    "INFINITE_SCROLL": "Infinite scroll",
    "MAGAZINE_PAGE": "Magazine page",
    "RELATED_READING_LIST": "Related reading list",
    "TAG_PAGE": "Tag page",
    "TOP STORIES LIST": "Top stories list"
};

/**
 * List of ga send hit types
 * @constant
 * @type {Object}
 */
GATracker.SEND_HITTYPES = {
    "EVENT": "event",
    "EXCEPTION": "exception",
    "ITEM": "item",
    "PAGEVIEW": "pageview",
    "SCREENVIEW": "screenview",
    "SOCIAL": "social",
    "TIMING": "timing",
    "TRANSACTION": "transaction"
};

/**
 * The GA tracking id of the site. This will be updated in the page template.
 * @static
 * @type {String}
 */
GATracker.TRACKING_BRAND_ID = null;

/**
 * The GA tracking id for CondeNast
 * @static
 * @type {String}
 */
GATracker.TRACKING_CONDE_ID = null;

/**
 * Comscore id
 * @static
 * @type {Number}
 */
GATracker.COMSCORE_PUBLISHED_ID = 15335235;

/**
 * Removes custom dimension keys from an object
 * @param  {Object} data
 * @return {Object}      Filtered data
 */
function removeCustomDimensions( data ){
    var filtered = {};
    var key = "";
    for(key in data){
        if(!data.hasOwnProperty(key)) continue;
        if(RE_DIMENSION.test(key)) continue;
        filtered[key] = data[key];
    }
    return filtered;
}

/**
 * Sends a comscore beacon
 * @param  {String} url
 * @return {Boolean}
 */
function sendComscore( url ){
    if( "COMSCORE" in window && window.COMSCORE !== null ){
        return COMSCORE.beacon({
            "c1": "2",
            "c2": GATracker.COMSCORE_PUBLISHED_ID,
            "c4": url
        });
    }
    return false;
}

export default GATracker;

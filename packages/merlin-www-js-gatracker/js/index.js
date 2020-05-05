'use strict';
/* globals ga, COMSCORE */

import {
    assign,
    getQueryArgs,
    getQueryString,
    getUrlHost,
    isDefined,
    loadScript,
    hasOwnProperty
} from '@cnbritain/merlin-www-js-utils/js/functions';
import ComscoreManager from './ComscoreManager';

/**
 * RegEx to check if the string is a dimension
 * @constant
 * @type {RegExp}
 */
var RE_DIMENSION = /^dimension/;

/**
 * List of query args to remove from the location value
 * @constant
 * @type {Array}
 */
var IGNORE_PARAMS = [
    'TestAdTargeting',
    'TestAdKeyValue',
    'TestAdNetworkId',
    'TestAdUnit',
    'TestAdZone',
    'email',
    'noads',
    'exclude_uid',
    'referral_uid'
];

var hasConsent = false;
var hasLoadedScript = false;

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
    this._name = (_config && _config.name !== undefined ? _config.name : null);

    /**
     * The tracking id
     * @private
     * @type {String}
     */
    this._id = id;

    /**
     * Client id of the tracker created by GA. This is not the same as id.
     * @private
     * @type {Number}
     */
    this._clientId = null;

    /**
     * The type of GATracker
     * @public
     * @type {String}
     */
    this.type = _config && _config.type !== undefined ? _config.type : 'brand';


    var config = {
        'allowLinker': !!( _config && _config.linker ),
        'cookieDomain': _config && _config.cookieDomain !== undefined ?
            _config.cookieDomain :
            'auto',
        'trackingId': this._id,
        'transport': 'beacon'
    };
    if(this._name !== null) config.name = this._name;
    ga( 'create', config );

    /**
     * See if we need to require displayfeatures
     */
    if( _config && _config.displayFeatures === true ){
        ga( trackerPrefix(this, 'require'), 'displayfeatures' );
    }

    /**
     * See if we need to require autolinker
     */
    if( _config && _config.linker !== undefined ){
        ga( trackerPrefix(this, 'require'), 'linker' );
        ga( trackerPrefix(this, 'linker:autoLink'), _config.linker );
    }

    if(_config && _config.optimizeId !== undefined){
        ga( trackerPrefix(this, 'require'), _config.optimizeId);
    }

    if(this.type === 'brand'){
        ga(function gaClientId(){
            // t0 is the default name if there is not one
            var name = 't0';
            if(this._name !== null) name = this._name;
            this._clientId = ga.getByName(name).get('clientId');
        }.bind(this));
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
 * Reset all custom dimensions on all the trackers
 * @static
 */
GATracker.ResetCustomDimensions = function ResetCustomDimensions(){
    GATracker.TRACKERS.forEach(function ResetAll_inner( tracker ){
        tracker.resetCustomDimensions();
    });
};


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

    'constructor': GATracker,

    /**
     * Reset all the custom dimensions on the tracker
     */
    'resetCustomDimensions': function(){
        var resetValues = {};
        for(var key in GATracker.DIMENSION_BY_INDEX){
            if(!hasOwnProperty(GATracker.DIMENSION_BY_INDEX, key)) continue;
            resetValues[key] = null;
        }
        this.set(resetValues);
    },

    /**
     * Fires a ga send call
     * @public
     * @memberof! GATracker.prototype
     * @param  {String} hitType
     * @param  {Object} config  Data to send along with the call
     */
    'send': function( hitType, config ){
        // Don't send anything if we don't have consent
        if(!hasConsent) return;
        ga(function gaSend(){
            var options = assign( {
                'comscore': true
            }, config, {
                'hitType': hitType
            } );

            var comscore = options.comscore;
            delete options.comscore;

            // Set the clientId as a custom dimension if its defined
            if(this._clientId !== null){
                this.set(
                    GATracker.getDimensionByIndex('CLIENT_ID'),
                    this._clientId
                );
            }

            ga( trackerPrefix(this, 'send'), options );

            // Whenever we send a pageview, send a comscore beacon
            if( hitType === GATracker.SEND_HITTYPES.PAGEVIEW && comscore &&
                this.type === 'brand' ){
                ComscoreManager.sendBeacon(location.href);
            }
        }.bind(this));
    },

    /**
     * Fires a ga set call to set information
     * @public
     * @memberof! GATracker.prototype
     * @param  {String/Object} fieldName Either a key or an object with data
     * @param  {String/Number} value
     */
    'set': function( fieldName, value ){
        // Don't set anything if we don't have consent
        if(!hasConsent) return;
        var argLength = arguments.length;
        ga(function gaSet(){
            var setData = fieldName;

            if( argLength === 2 ){
                setData = {};
                setData[ fieldName ] = value;
            }

            // Update location value to remove specific query params
            if(hasOwnProperty(setData, 'location') &&
                isDefined(setData['location'])){
                setData['location'] = filterQueryParams(setData['location']);
            }

            // If the tracker is `conde`, we need to remove custom dimensions. We
            // might not need to do this but just to be safe :)
            if( this.type !== 'brand' ){
                setData = removeCustomDimensions( setData );
            }

            ga( trackerPrefix(this, 'set'), setData );
        }.bind(this));
    }
};

/**
 * Gets the dimension label by dimension index
 * @static
 * @param  {String} index
 * @return {String}       The dimension label
 */
GATracker.getDimensionByIndex = function( index ){
    if(hasOwnProperty( GATracker.INDEX_BY_DIMENSION, index ) ){
        return GATracker.INDEX_BY_DIMENSION[ index ];
    }
    throw new TypeError( index + ' is not a valid index' );
};

/**
 * Gets the dimension index by dimension label
 * @static
 * @param  {String} dimension
 * @return {String}           The dimension index
 */
GATracker.getIndexByDimension = function( dimension ){
    if( hasOwnProperty( GATracker.DIMENSION_BY_INDEX, dimension ) ){
        return GATracker.DIMENSION_BY_INDEX[ dimension ];
    }
    throw new TypeError( dimension + ' is not a valid dimension' );
};

// This initialises the wrapper but does not load of trigger any analytics
GATracker.init = function(){
    var queue = function(){
        ga.q = ga.q || [];
        ga.q.push(arguments);
    };
    window.ga = window.ga || queue;
    window.ga.l = +new Date;
};

// This loads the analytics script which in turn sets all the wheels in motion
GATracker.loadGAScript = function(){
    if(hasLoadedScript) return;
    // (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    // (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    // m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    // })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    loadScript('https://www.google-analytics.com/analytics.js');
    hasLoadedScript = true;
};

GATracker.setConsent = function(consent){
    hasConsent = consent;
};

/**
 * Lookup table of dimension index by dimension label
 * @static
 * @type {Object}
 */
GATracker.INDEX_BY_DIMENSION = {
    'AD_BLOCKER': 'dimension43',
    'ARTICLE_BREAKS': 'dimension24',
    'AUTHOR': 'dimension7',
    'BASE_URL': 'dimension3',
    'CLIENT_ID': 'dimension107',
    'CONTENT_SOURCE': 'dimension52',
    'DISPLAY_DATE': 'dimension45',
    'GALLERY_LENGTH': 'dimension13',
    'GALLERY_PHOTO_CREDIT': 'dimension11',
    'GALLERY_POSITION': 'dimension12',
    'GALLERY_URL': 'dimension33',
    'MAGAZINE_CONTENT': 'dimension19',
    'MAGAZINE_ISSUE': 'dimension20',
    'MERLIN_ID': 'dimension36',
    'NAME_OF_DAY': 'dimension41',
    'PAGE_AGE': 'dimension9',
    'PAGE_TEMPLATE': 'dimension1',
    'PLATFORM': 'dimension5',
    'PRIMARY_TAG': 'dimension4',
    'PUBLISH_DATE': 'dimension10',
    'PUBLISH_DATE_HOUR': 'dimension42',
    'SPONSOR': 'dimension47',
    'SPONSORED': 'dimension46',
    'SYNDICATED': 'dimension48',
    'SYNDICATION_ORIGINAL_LANGUAGE': 'dimension51',
    'SYNDICATION_ORIGINAL_URL': 'dimension50',
    'SYNDICATION_SOURCE': 'dimension49',
    'TAGS': 'dimension6',
    'UMBRACO_ID': 'dimension35',
    'UPDATE_DATE': 'dimension22',
    'WORD_COUNT': 'dimension8'
};

/**
 * Lookup table of dimension labels by dimension index
 * @static
 * @type {Object}
 */
GATracker.DIMENSION_BY_INDEX = {
    'dimension1': 'PAGE_TEMPLATE',
    'dimension3': 'BASE_URL',
    'dimension4': 'PRIMARY_TAG',
    'dimension5': 'PLATFORM',
    'dimension6': 'TAGS',
    'dimension7': 'AUTHOR',
    'dimension8': 'WORD_COUNT',
    'dimension9': 'PAGE_AGE',
    'dimension10': 'PUBLISH_DATE',
    'dimension11': 'GALLERY_PHOTO_CREDIT',
    'dimension12': 'GALLERY_POSITION',
    'dimension13': 'GALLERY_LENGTH',
    'dimension19': 'MAGAZINE_CONTENT',
    'dimension20': 'MAGAZINE_ISSUE',
    'dimension22': 'UPDATE_DATE',
    'dimension24': 'ARTICLE_BREAKS',
    'dimension33': 'GALLERY_URL',
    'dimension35': 'UMBRACO_ID',
    'dimension36': 'MERLIN_ID',
    'dimension41': 'NAME_OF_DAY',
    'dimension42': 'PUBLISH_DATE_HOUR',
    'dimension43': 'AD_BLOCKER',
    'dimension45': 'DISPLAY_DATE',
    'dimension46': 'SPONSORED',
    'dimension47': 'SPONSOR',
    'dimension48': 'SYNDICATED',
    'dimension49': 'SYNDICATION_SOURCE',
    'dimension50': 'SYNDICATION_ORIGINAL_URL',
    'dimension51': 'SYNDICATION_ORIGINAL_LANGUAGE',
    'dimension52': 'CONTENT_SOURCE',
    'dimension107': 'CLIENT_ID'
};

/**
 * List of crossdomain linker domains
 * @constant
 * @deprecated
 * @type {Array}
 */
// GATracker.DOMAINS = [
//     'bridesmagazine.co.uk',
//     'cntraveller.com',
//     'condenast.co.uk',
//     'houseandgarden.co.uk',
//     'glamourmagazine.co.uk',
//     'gq-magazine.co.uk',
//     'tatler.com',
//     'vanityfair.co.uk',
//     'vogue.co.uk',
//     'wired.co.uk'
// ];

/**
 * List of referrer types
 * @constant
 * @type {Object}
 */
GATracker.REFERRERS = {
    'EXTERNAL': 'External',
    'HOMEPAGE': 'Homepage',
    'INCONTENT_LINK': 'In-content link',
    'INFINITE_SCROLL': 'Infinite scroll',
    'MAGAZINE_PAGE': 'Magazine page',
    'RELATED_READING_LIST': 'Related reading list',
    'TAG_PAGE': 'Tag page',
    'TOP STORIES LIST': 'Top stories list'
};

/**
 * List of ga send hit types
 * @constant
 * @type {Object}
 */
GATracker.SEND_HITTYPES = {
    'EVENT': 'event',
    'EXCEPTION': 'exception',
    'ITEM': 'item',
    'PAGEVIEW': 'pageview',
    'SCREENVIEW': 'screenview',
    'SOCIAL': 'social',
    'TIMING': 'timing',
    'TRANSACTION': 'transaction'
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
 * Removes custom dimension keys from an object
 * @param  {Object} data
 * @return {Object}      Filtered data
 */
function removeCustomDimensions( data ){
    var filtered = {};
    var key = '';
    for(key in data){
        if(!hasOwnProperty(data, key)) continue;
        if(RE_DIMENSION.test(key)) continue;
        filtered[key] = data[key];
    }
    return filtered;
}

function filterQueryParams(url){
    var hostUrl = getUrlHost(url);
    var queryArgs = getQueryArgs(url);
    var filteredArgs = {};

    for(var key in queryArgs){
        if(!hasOwnProperty(queryArgs, key)) continue;
        if(IGNORE_PARAMS.indexOf(key) !== -1) continue;
        filteredArgs[key] = queryArgs[key];
    }

    var queryString = getQueryString(filteredArgs);
    if(queryString === ''){
        return hostUrl;
    } else {
        return hostUrl + '?' + queryString;
    }
}

function trackerPrefix(tracker, key){
    if(tracker._name){
        return tracker._name + '.' + key;
    } else {
        return key;
    }
}

export default GATracker;


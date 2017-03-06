'use strict';
/* globals googletag, OX, rubicontag */

/**
 * @module Utils
 */

import AutoQueue from './AutoQueue';
import BRAND_CONFIG from '@cnbritain/merlin-www-common';

import {
    createEventTemplate,
    getNamespaceKey,
    hasOwnProperty,
    isDefined,
    loadScript,
    unescapeJinjaValue
} from '@cnbritain/merlin-www-js-utils/js/functions';

/**
 * GPT Script url
 * @readonly
 * @constant
 * @type {String}
 */
var GPT_URL = '//www.googletagservices.com/tag/js/gpt.js';
export var GPT_URL;

/**
 * The open x script url. This needs to be set in order for it to work.
 * @type {String}
 */
var OPEN_X_URL = null;
export var OPEN_X_URL;

var OPEN_X_LOADED = false;

/**
 * The rubicon script url. This needs to be set in order for it to work.
 * @type {String}
 */
var RUBICON_URL = null;
export var RUBICON_URL;

var RUBICON_LOADED = false;

var PAGE_AD_CONFIG = null;

/**
 * The teads script url. This needs to be set in order for it to work.
 * @type {String}
 */
var TEAD_URL = null;
export var TEAD_URL;

/**
 * The test ad config set by the page
 * @type {Object}
 */
var TEST_AD_CONFIG = false;

/**
 * Key for the local storage testing unit
 * @type {String}
 */
var KEY_TEST_AD_UNIT = 'ad_test_unit';

/**
 * Key for the local storage testing zone
 * @type {String}
 */
var KEY_TEST_AD_ZONE = 'ad_test_zone';

/**
 * Different ad sizes
 * @readonly
 * @enum {Number}
 */
var AD_SIZES = {
    'UNKNOWN': -1,
    'NATIVE': 0,
    'MPU': 1,
    'DOUBLESKY': 2,
    'LEADERBOARD': 3,
    'SUPERLEADER': 4,
    'BILLBOARD': 5,
    'RESPONSIVE': 6,
    'GALLERY_INTERSTITIAL': 7,
    'INCONTENT': 8,
    'INREAD': 9,
    'TRACKING_PIXEL': 10
};
export var AD_SIZES;

/**
 * Maps sizes to enums
 * @constant
 * @type {Object}
 */
var AD_SIZES_MAP = {
    '1x1': 0,
    '300x250': 1,
    '300x600': 2,
    '728x90': 3,
    '970x90': 4,
    '970x250': 5,
    '1520x300': 6,
    '700x400': 7,
    '420x160': 8,
    '100x100': 9,
    '5x5': 10
};

/**
 * Different states for the advert
 * @readonly
 * @enum {Number}
 */
var AD_STATES = {
    'UNINITIALISED': 0,
    'INITIALISED': 1,
    'REGISTERED': 2,
    'RENDERED': 3,
    'STOPPED': 4,
    'DESTROYED': 5
};
export var AD_STATES;

/**
 * Default properties for the Ad element
 * @readonly
 * @type {Object}
 */
var DEFAULT_AD_ELEMENT_ATTRIBUTES = {
    'bidding': false,
    'group': null,
    'lazyload': false,
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

/**
 * Parser for Ad element attributes
 * @readonly
 * @type {Object}
 */
var AD_ATTRIBUTE_MAP = {
    'bidding': {
        'map': function toBool(value){
            // lol
            return String(value).toLowerCase() === 'true';
        },
        'required': true
    },
    'group': {
        'map': function toString(value){
            if(value === null) return null;
            return value.toString();
        },
        'required': false
    },
    'lazyload': {
        'map': function toBool(value){
            // lol
            return String(value).toLowerCase() === 'true';
        },
        'required': false
    },
    'nativeStyle': {
        'map': Number,
        'required': false
    },
    'order': {
        'map': Number,
        'required': false
    },
    // 'placement': null,
    // 'position': null,
    'sizemap': {
        'map': JSON.parse,
        'required': false
    },
    'sizes': {
        'map': JSON.parse,
        'required': true
    },
    'targets': {
        'map': JSON.parse,
        'required': false
    },
    'unit': {
        'map': function(value){
            if(TEST_AD_CONFIG.AD_UNIT === false) return value;
            return TEST_AD_CONFIG.AD_UNIT;
        },
        'required': true
    },
    'values': {
        'map': parseAdKeyValues,
        'required': false
    },
    'zone': {
        'map': function(value){
            if(TEST_AD_CONFIG.AD_ZONE === false) return value;
            return TEST_AD_CONFIG.AD_ZONE;
        },
        'required': true
    }
};

/**
 * Ok so OpenX register and refresh can only go one at a time. Literally. So
 * we have to queue up functions and get them to fire off callbacks when theyre
 * finished.
 */
var OPEN_X_REGISTER = new AutoQueue(500);
var OPEN_X_REFRESH = new AutoQueue(500);

/**
 * Creates the DFP url
 * @param  {Object} attribs
 * @return {String}
 */
export function buildDFPUrl(attribs){
    return attribs.zone + '/' + attribs.unit;
}

/**
 * Checks if we have a test ad config we're suppose to be using. If something
 * is set, set TEST_AD_CONFIG values. These keys will be set in the base
 * template page.
 * @param  {Boolean} refresh Force refresh the values
 * @return {Object}         TEST_AD_CONFIG
 */
export function checkTestAdConfig(refresh){
    if(!refresh && TEST_AD_CONFIG !== false) return;

    // Set empty defaults for the test
    TEST_AD_CONFIG = {
        'AD_UNIT': false,
        'AD_ZONE': false
    };

    var key = getNamespaceKey(BRAND_CONFIG.abbr);
    var tmp = null;

    // Unit
    tmp = window[key].Store.get(key + '_' + KEY_TEST_AD_UNIT);
    if(tmp){
         TEST_AD_CONFIG.AD_UNIT = tmp;
         window[key].Store.remove(key + '_' + KEY_TEST_AD_UNIT);
    }

    // Zone
    tmp = window[key].Store.get(key + '_' + KEY_TEST_AD_ZONE);
    if(tmp){
        TEST_AD_CONFIG.AD_ZONE = tmp;
        window[key].Store.remove(key + '_' + KEY_TEST_AD_ZONE);
    }

    return TEST_AD_CONFIG;
}

export function createOpenXConfig(ad){
    return [
        ad.get('dfp'),
        ad.get('sizes').map(function(size){
            return size.join('x');
        }),
        ad.id
    ];
}

function createSizeMap(sizemapAttrib){
    var sizemap = googletag.sizeMapping();
    sizemapAttrib.forEach(function eachRow(row){
        // Row[0] - dimensions
        // Row[1] - Ad sizes
        sizemap.addSize(row[0], row[1]);
    });
    return sizemap;
}

/**
 * Gets the attributes from the Ad element
 * @param  {HTMLElement} el
 * @return {Object}
 */
export function getAdElementAttributes(el){
    // Check if there is a test ad config we're suppose to be using
    checkTestAdConfig();

    var value = null;
    var key = '';
    var output = {};
    for(key in DEFAULT_AD_ELEMENT_ATTRIBUTES){
        if(hasOwnProperty(DEFAULT_AD_ELEMENT_ATTRIBUTES, key) &&
            el.hasAttribute('data-ad-' + key)){
            value = el.getAttribute('data-ad-' + key);
            if(value) output[key] = value;
        } else {
            output[key] = DEFAULT_AD_ELEMENT_ATTRIBUTES[key];
        }
    }
    return output;
}

/**
 * Gets the ad size from width and height
 * @param  {Number} width
 * @param  {Number} height
 * @return {Number}
 */
export function getAdTypeBySize(width, height){
    var key = width + 'x' + height;
    if(AD_SIZES_MAP.hasOwnProperty(key)) return AD_SIZES_MAP[key];
    return AD_SIZES.UNKNOWN;
}

export function getPageAdConfig(refresh){
    if(PAGE_AD_CONFIG === null || refresh){
        var key = getNamespaceKey(BRAND_CONFIG.abbr);
        PAGE_AD_CONFIG = window[key].Store.get(key + '_ad_config');
    }
    return PAGE_AD_CONFIG;
}

export function getRubiconSlot(ad){
    return rubicontag.getSlot(ad.id);
}

/**
 * Get the slot from the Ad
 * @param  {Ad} ad
 * @return {googletag.Slot}
 */
export function getSlot(ad){
    return ad.slot;
}

/**
 * Checks if the ad allows header bidding
 * @param  {Ad}  ad
 * @return {Boolean}
 */
export function hasHeaderBidding(ad){
    return ad.get('bidding');
}

/**
 * Checks if the Ad is part of a group
 * @param  {Ad}  ad
 * @return {Boolean}
 */
export function hasGroup(ad){
    return ad.group !== null;
}

/**
 * Keys to ignore when setting the key value targeting
 * @param  {String} key
 * @return {Boolean}
 */
function ignoreAttributeKey(key){
    return key === "ad_network_id" || key === "ad_custom_targeting" ||
        key === "ad_tag_prefix" || key === "ad_unit" || key === "ad_url" ||
        key === "ad_zone" || key === "targeting_doctype" ||
        key === "targeting_tags";
}

/**
 * Checks if an advert has been destroyed
 * @param  {Ad}  ad The advert to check
 * @return {Boolean}
 */
export function isAdDestroyed(ad){
    return ad.state === AD_STATES.DESTROYED;
}

/**
 * Checks if an advert has been initialised
 * @param  {Ad}  ad The advert to check
 * @return {Boolean}
 */
export function isAdInitialised(ad){
    return ad.state === AD_STATES.INITIALISED;
}

/**
 * Checks if an advert has been rendered
 * @param  {Ad}  ad The advert to check
 * @return {Boolean}
 */
export function isAdRendered(ad){
    return ad.state === AD_STATES.RENDERED;
}

/**
 * Checks if an advert element has been initialised
 * @param  {HTMLElement}  el
 * @return {Boolean}
 */
export function isElInitialised(el){
    return el.hasAttribute('data-ad-initialised');
}

export function loadAdLibraries(){
    // Setup the googletag bits so we can start queuing things
    window.googletag = window.googletag || {};
    window.googletag.cmd = window.googletag.cmd || [];

    return Promise.all([
        loadOpenXLibrary(),
        loadRubiconLibrary()
    ]).then(function(){
        return loadGPTLibrary();
    });
}

/**
 * Loads the GPT library
 * @return {Promise}
 */
export function loadGPTLibrary(){
    window.googletag = window.googletag || {};
    window.googletag.cmd = window.googletag.cmd || [];
    return loadScript(GPT_URL);
}

export function loadOpenXLibrary(){
    window.OX_dfp_ads = window.OX_dfp_ads || [];
    if(OPEN_X_URL === null){
        console.warn('OpenX library has no url specified to load. Ads will continue without OpenX');
        return Promise.resolve();
    }
    return loadScript(OPEN_X_URL)
        .then(function(){
            OPEN_X_LOADED = true;
            return Promise.resolve();
        }, function(){
            console.warn('OpenX library failed to load. Ads will continue without OpenX');
            OPEN_X_LOADED = false;
            return Promise.resolve();
        }).catch(function(){
            console.warn('OpenX library failed to load. Ads will continue without OpenX');
            OPEN_X_LOADED = false;
            return Promise.resolve();
        });
}

export function loadRubiconLibrary(){
    window.rubicontag = window.rubicontag || {};
    window.rubicontag.cmd = window.rubicontag.cmd || [];
    if(RUBICON_URL === null){
        console.warn('Rubicon library has no url specified to load. Ads will continue without Rubicon');
        return Promise.resolve();
    }
    return loadScript(RUBICON_URL)
        .then(function(){
            RUBICON_LOADED = true;
            return Promise.resolve();
        }, function(){
            console.warn('Error loading rubicon library');
            RUBICON_LOADED = false;
            return Promise.resolve();
        }).catch(function(){
            console.warn('Error loading rubicon library');
            RUBICON_LOADED = false;
            return Promise.resolve();
        });
}

export function loadTeadLibrary(){
    window._ttf = window._ttf || [];
    return loadScript(TEAD_URL);
}

/**
 * Parses the ad key value pairs. These need to be unescaped as jinja super
 * encodes the json
 * @param  {String} value
 * @return {Object}
 */
export function parseAdKeyValues(value){
    if( !isDefined( value ) ) return null;
    // Unescape the values as jinja has escaped them to shit
    var tmp = unescapeJinjaValue( value );
    tmp = JSON.parse( tmp );
    if( tmp === "" ) return null;
    return tmp;
}

/**
 * Parses the attributes for the ads
 * @param  {HTMLElement} el
 * @return {Object}
 */
export function parseAdAttributes(el){
    var attributes = getAdElementAttributes(el);
    attributes = mapAdElementAttributes(attributes);
    // Add in DFP
    attributes.dfp = buildDFPUrl(attributes);
    return attributes;
}

/**
 * Maps the ad attributes
 * @param  {Object} attribs
 * @return {Object}
 */
export function mapAdElementAttributes(attribs){
    var key = "";
    for(key in AD_ATTRIBUTE_MAP){
        if(!hasOwnProperty(AD_ATTRIBUTE_MAP, key)) continue;
        if(AD_ATTRIBUTE_MAP[key].required && !hasOwnProperty(attribs, key)){
            throw new TypeError(key + ' property is required');
        }
        if(AD_ATTRIBUTE_MAP[key].map){
            attribs[key] = AD_ATTRIBUTE_MAP[key].map(attribs[key], attribs);
        }
    }
    return attribs;
}

/**
 * Adds a callback to GPT's cmd queue
 * @param  {Function} callback
 * @return {Promise}
 */
export function pushToGoogleTag(callback){
    return (new Promise(function pushToGoogleTag_promise(resolve, reject){
        // googletag seems to be swalling errors so we catch any errors we make
        // and reject the promise and then throw the rejection.
        googletag.cmd.push(function pushToGoogleTag_callback(){
            try {
                var result = callback(resolve);
                if(result !== undefined) resolve(result);
            } catch(err){
                reject(err);
            }
        });
    })).then(function(value){
        return Promise.resolve(value);
    }, function(err){
        throw err;
    });
}

export function refreshGPT(ads, changeCorrelator){
    return pushToGoogleTag(function(res){
        var slots = null;
        if(Array.isArray(ads)){
            slots = ads.map(getSlot);
        } else {
            slots = [getSlot(ads)];
        }

        if(OPEN_X_LOADED) OX.dfp_bidder.setOxTargeting(slots);
        if(RUBICON_LOADED) slots.forEach(setRubiconTargeting);
        googletag.pubads().refresh(slots, {
            'changeCorrelator': !!changeCorrelator
        });
        res();
    });

    function setRubiconTargeting(slot){
        rubicontag.setTargetingForGPTSlot(slot);
    }
}

export function refreshOpenX(ads){
    return pushToGoogleTag(function(res){
        OPEN_X_REFRESH.chain(function(resolve){
            // If ads is a value, we want to refresh the slots we've been
            // given otherwise we want to refresh all.
            if(isDefined(ads)){
                var slots = null;

                // Get the slots of the ads
                if(Array.isArray(ads)){
                    slots = ads.map(getSlot).filter(isDefined);
                } else {
                    slots = [getSlot(ads)].filter(isDefined);
                }

                // Check that we have slots. If so, refresh them.
                if(slots.length > 0){
                    OX.dfp_bidder.refresh(resolve, slots);
                } else {
                    resolve();
                }
            } else {
                // Refresh allthethings
                OX.dfp_bidder.refresh(resolve);
            }
        }, res);
    });
}

export function refreshRubicon(ads){
    return pushToGoogleTag(function(res){
        // If rubicon is not loaded, dont do it
        if(!RUBICON_LOADED) return res();

        var slots = null;
        if(Array.isArray(ads)){
            slots = ads.filter(hasHeaderBidding).map(getRubiconSlot);
        } else {
            if(hasHeaderBidding(ads)){
                slots = [getRubiconSlot(ads)];
            } else {
                slots = [null];
            }
        }
        // Filter any nulls
        slots = slots.filter(function(s){ return s !== null; });
        // Check if we have slots. If no slots, just use null and do all
        if(slots.length < 1) slots = null;
        // If there are no slots, we dont want to refresh rubicon
        if(slots === null){
            return res();
        }
        // Send off rubicon request
        rubicontag.run(res, {
            'slots': slots
        });
    });
}

export function registerGPT(ad){
    return pushToGoogleTag(function(res){
        // Create the slot
        var slot = googletag.defineSlot(ad.get('dfp'),
            ad.get('sizes'), ad.id);
        slot.addService(googletag.pubads());
        // Set the targeting
        if(ad.get('targets') !== null){
            var targets = ad.get('targets').filter(function(target){
                return target !== '';
            });
            if(targets.length > 0){
                slot.setTargeting(getPageAdConfig().ad_tag_prefix, targets);
            }
        }
        // Set the position
        if(ad.get('position')){
            slot.setTargeting('position', ad.get('position'));
        }
        // Set key/values
        if(ad.get('values')){
            var key = '';
            var values = ad.get('values');
            for(key in values){
                if(!hasOwnProperty(values, key)) continue;
                if(ignoreAttributeKey(key)) continue;
                if(key === 'ad_keyvalue'){
                    for(var key2 in values[key]){
                        if(!hasOwnProperty(values[key], key2)) continue;
                        slot.setTargeting(key2, values[key][key2]);
                    }
                } else {
                    slot.setTargeting(key, values[key]);
                }
            }
        }
        // Set sizemapping
        if(ad.get('sizemap')){
            slot.defineSizeMapping(
                createSizeMap(ad.get('sizemap')).build());
        }
        // Update slot information
        ad.slot = slot;
        ad.state = AD_STATES.REGISTERED;
        // Events
        ad.emit('register', createEventTemplate('register', ad, {
            'slot': slot
        }));
        ad.manager.emit('register', createEventTemplate('register', ad.manager, {
            'ad': ad,
            'slot': slot
        }));
        return ad;
    });
}

export function registerOpenX(ad){
    return pushToGoogleTag(function(res){
        OPEN_X_REGISTER.chain(function(resolve, reject){
            if(hasHeaderBidding(ad)){
                OX.dfp_bidder.addSlots([createOpenXConfig(ad)], resolve);
            } else {
                resolve();
            }
        }, res);
    });
}

export function registerRubicon(ad){
    return pushToGoogleTag(function(res){
        if(RUBICON_LOADED && hasHeaderBidding(ad)){
            rubicontag.defineSlot(
                ad.get('dfp'),
                ad.get('sizes'),
                ad.id
            );
        }
        res();
    });
}

export function renderGPT(ad){
    return pushToGoogleTag(function(res){
        googletag.display(ad.id);
        res();
    });
}

export function setAdUrls(config){
    for(var key in config){
        if(!hasOwnProperty(config, key)) continue;
        switch(key){
            case 'GPT_URL':
                GPT_URL = config[key];
                break;
            case 'OPEN_X_URL':
                OPEN_X_URL = config[key];
                break;
            case 'RUBICON_URL':
                RUBICON_URL = config[key];
                break;
            case 'TEAD_URL':
                TEAD_URL = config[key];
                break;
        }
    }
}

/**
 * Sets the state of the Ad to destroyed
 * @param {Ad} ad
 * @return {Ad}
 */
export function setAdStateToDestroyed(ad){
    ad.state = AD_STATES.DESTROYED;
    ad.el.setAttribute('data-ad-destroyed', true);
    return ad;
}

/**
 * Sets the state of the Ad to rendered
 * @param {Ad} ad
 * @return {Ad}
 */
export function setAdStateToRendered(ad){
    ad.state = AD_STATES.RENDERED;
    ad.el.setAttribute('data-ad-rendered', true);
    return ad;
}

/**
 * Sets the state of the Ad to stopped
 * @param {Ad} ad
 * @return {Ad}
 */
export function setAdStateToStopped(ad){
    ad.state = AD_STATES.STOPPED;
    ad.el.setAttribute('data-ad-stopped', true);
    return ad;
}
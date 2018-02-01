'use strict';
/* globals googletag, rubicontag, pbjs */

/**
 * @module Utils
 */

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
export var GPT_URL = '//www.googletagservices.com/tag/js/gpt.js';


/**
 * The rubicon script url. This needs to be set in order for it to work.
 * @type {String}
 */
export var RUBICON_URL = null;

var RUBICON_LOADED = false;

var PAGE_AD_CONFIG = null;

/**
 * The teads script url. This needs to be set in order for it to work.
 * @type {String}
 */
export var TEAD_URL = null;

/**
 * Setting object for prebid.js. Contains adapter settings like Rubicon.
 * @type {Object}
 */
var PREBID_SETTINGS = {};

/**
 * The url that should be used to load prebid
 * @type {String}
 */
// var PREBID_URL = '/static/js/prebid.js';
export var PREBID_URL = null;

/**
 * Prebid timeout in milliseconds
 * @type {Number}
 */
var PREBID_TIMEOUT = 1000;

/**
 * Prebid state for whether it has loaded
 * @type {Boolean}
 */
var PREBID_LOADED = false;

/**
 * Ad sizes we only want to send to Rubicon
 * @type {Object}
 */
var RUBICON_ALLOWED_SIZES = {
    '728x90': true,
    '300x600': true,
    '300x250': true,
    '970x250': true,
    '970x90': true
};

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
export var AD_SIZES = {
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
export var AD_STATES = {
    'UNINITIALISED': 0,
    'INITIALISED': 1,
    'REGISTERED': 2,
    'RENDERED': 3,
    'STOPPED': 4,
    'DESTROYED': 5
};

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
            if(value === null || value === 'null') return null;
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
 * Get all the targeting on a current ad slot
 * @param  {googletag.Slot} slot
 * @return {Object}
 */
export function getSlotTargeting(slot){
    var targeting = {};
    var keys = slot.getTargetingKeys();
    keys.forEach(function(key){
        targeting[key] = slot.getTargeting(key);
    });
    return targeting;
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
    return key === 'ad_network_id' || key === 'ad_custom_targeting' ||
        key === 'ad_tag_prefix' || key === 'ad_unit' || key === 'ad_url' ||
        key === 'ad_zone' || key === 'targeting_doctype' ||
        key === 'targeting_tags';
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
        loadPrebidLibrary(),
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
 * Loads the specified prebid url. A timeout is set to ensure we don't wait
 * too long.
 * @return {Promise}
 */
export function loadPrebidLibrary(){
    if(PREBID_URL === null){
        console.warn('Prebid library has no url specified to load. Ads will continue without Prebid');
        return Promise.resolve();
    }

    window.pbjs = window.pbjs || {};
    window.pbjs.que = window.pbjs.que || [];

    var prebidPromise = loadScript(PREBID_URL)
        .then(function(){
            PREBID_LOADED = true;
            return Promise.resolve();
        }, function(){
            console.warn('Error loading prebid library');
            PREBID_LOADED = false;
            return Promise.resolve();
        }).catch(function(){
            console.warn('Error loading prebid library');
            PREBID_LOADED = false;
            return Promise.resolve();
        });

    var timeoutPromise = promisifyTimeout(PREBID_TIMEOUT);

    return Promise.race([prebidPromise, timeoutPromise]);
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
    if( tmp === '' ) return null;
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
    var key = '';
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
 * Creates a timeout wrapped in a promise
 * @param  {Number} ms amount of milliseconds
 * @return {Promise}
 */
export function promisifyTimeout(ms){
    return new Promise(function(resolve){
        setTimeout(resolve, ms);
    });
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
        var slotIds = null;
        if(Array.isArray(ads)){
            slots = ads.map(getSlot);
            slotIds = ads.map(function(ad){ return ad.id; });
        } else {
            slots = [getSlot(ads)];
            slotIds = [ads.id];
        }

        if(RUBICON_LOADED) slots.forEach(setRubiconTargeting);

        if(PREBID_LOADED){
            pbjs.que.push(function() {
                pbjs.requestBids({
                    timeout: PREBID_TIMEOUT,
                    adUnitCodes: slotIds,
                    bidsBackHandler: function() {
                        pbjs.setTargetingForGPTAsync(slotIds);
                        googletag.pubads().refresh(slots,{
                            'changeCorrelator': !!changeCorrelator
                        });
                        res();
                    }
                });
            });
        } else {
            googletag.pubads().refresh(slots, {
                'changeCorrelator': !!changeCorrelator
            });
            res();
        }

    });

    function setRubiconTargeting(slot){
        rubicontag.setTargetingForGPTSlot(slot);
    }
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
    return pushToGoogleTag(function(){
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
        // Prebid bits
        if(PREBID_LOADED){
            pbjs.que.push(function() {
                pbjs.setTargetingForGPTAsync();
            });
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

/**
 * Create the prebid config for the specified ads
 * @param  {Array.<Ad>} ads
 * @return {Array}
 */
function getPrebidAdUnits(ads){
    var adUnits = [];

    ads.forEach(function(ad){
        if(!hasHeaderBidding(ad)){
            return;
        }

        var bids = [];

        // Rubicon
        if(PREBID_SETTINGS.hasOwnProperty('RUBICON')){
            PREBID_SETTINGS.RUBICON.zoneId.forEach(function(zoneId){
                bids.push({
                    bidder: 'rubicon',
                    params: {
                        accountId: PREBID_SETTINGS.RUBICON.accountId,
                        siteId: PREBID_SETTINGS.RUBICON.siteId,
                        zoneId: zoneId
                    }
                });
            });
        }

        // No bids to be setup, dont do anything
        if(bids.length === 0) return;

        var adUnit = {
            code: ad.id,
            sizes: ad.get('sizes').filter(function(dims){
                return RUBICON_ALLOWED_SIZES.hasOwnProperty(dims.join('x'));
            }),
            bids: bids
        };

        if(ad.get('sizemap')){
            var sizemap = ad.get('sizemap').map(function(group){
                return {
                    minWidth: group[0][0],
                    sizes: group[1].filter(function(dims){
                        return RUBICON_ALLOWED_SIZES.hasOwnProperty(
                            dims.join('x'));
                    }).map(function(dims){
                        return dims[0];
                    })
                };
            });
            if(sizemap.length > 0){
                adUnit['sizeMapping'] = sizemap;
            }
        }
        adUnits.push(adUnit);
    });

    return adUnits;
}

/**
 * Registers prebid if loaded
 * @param  {Ad} ad
 * @return {Promise}
 */
export function registerPrebid(ad){
    return pushToGoogleTag(function(res){
        if(PREBID_LOADED && hasHeaderBidding(ad)){
            pbjs.que.push(function() {
                var adUnits = getPrebidAdUnits([ad]);
                pbjs.addAdUnits(adUnits);

                pbjs.requestBids({
                    bidsBackHandler: function(){ res(); }
                });
            });
        } else {
            res();
        }
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
        case 'RUBICON_URL':
            RUBICON_URL = config[key];
            break;
        case 'TEAD_URL':
            TEAD_URL = config[key];
            break;
        case 'PREBID_URL':
            PREBID_URL = config[key];
            break;
        case 'PREBID_SETTINGS':
            PREBID_SETTINGS = config[key];
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

/**
 * Creates a page impression element
 * @param  {string} unit   ad unit
 * @param  {string} zone   ad zone
 * @param  {object} values key values
 * @return {HTMLDivElement}
 */
export function createPageImpressionElement(unit, zone, values){
    var attrs = {
        unit: unit,
        zone: zone,
        sizes: '[[5, 5]]',
        bidding: false,
        sizemap: null,
        values: JSON.stringify(values),
        placement: 'PAGE_IMPRESSION_TRACKER'
    };
    var div = document.createElement('div');
    for(var key in attrs){
        if(!attrs.hasOwnProperty(key)) continue;
        div.setAttribute('data-ad-' + key, attrs[key]);
    }
    return div;
}

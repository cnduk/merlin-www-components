'use strict';

import CONFIG_BRAND from '@cnbritain/merlin-www-common';
import GATracker from '@cnbritain/merlin-www-js-gatracker';
import {
    getNamespaceKey
} from '@cnbritain/merlin-www-js-utils/js/functions';
import InternationalRedirect from '@cnbritain/merlin-www-international-redirect';

export function displayHiringMessage(){
    var hiring = [
        '%c',
        ' _    _                             _     _      _             ',
        '| |  | |                           | |   (_)    (_)            ',
        '| |  | | ___      __ _ _ __ ___    | |__  _ _ __ _ _ __   __ _ ',
        '| |/\\| |/ _ \\    / _` | \'__/ _ \\   | \'_ \\| | \'__| | \'_ \\ / _` |',
        '\\  /\\  /  __/   | (_| | | |  __/   | | | | | |  | | | | | (_| |',
        ' \\/  \\/ \\___|    \\__,_|_|  \\___|   |_| |_|_|_|  |_|_| |_|\\__, |',
        '                                                          __/ |',
        '                                                         |___/ ',
        '%c',
        'Are you an awesome software engineer? Join the team in London',
        'that builds Wired, Vogue, GQ, Glamour and more.',
        '',
        'https://code.condenast.co.uk/jobs',
        'https://code.condenast.co.uk/home',
        '',
        'https://www.condenast.co.uk'
    ];
    console.log(
        hiring.join('\n'),
        'color: #f0f;font-weight:bold;text-shadow:0 0 10px #f0f;',
        'color: #000;'
    );
}

/**
 * Gets the value from local storage
 * @param  {String} key
 * @return {*}
 */
export function getStorage(key){
    var cnd = getNamespaceKey(CONFIG_BRAND.abbr);
    var prefix = cnd + '_';
    var storeKey = key;
    if(key.substr(0, prefix.length) !== prefix){
        storeKey = prefix + storeKey;
    }
    return window[cnd].Store.get(storeKey);
}

export function initInternationalRedirect(){
    if(InternationalRedirect.el !== null){
        sendInternationRedirectEvent('Shown', null);
        InternationalRedirect.on('visibilityChange', function(e){
            sendInternationRedirectEvent('Closed', null);
        });
        InternationalRedirect.on('linkClick', function(e){
            sendInternationRedirectEvent('Link Click', e.country);
        });
        InternationalRedirect.on('linkHover', function(e){
            sendInternationRedirectEvent('Link Hover', e.country);
        });
    }
}

export function sendInternationRedirectEvent(action, label){
    GATracker.SendAll(GATracker.SEND_HITTYPES.EVENT, {
        'eventAction': action,
        'eventCategory': 'CountryBanner',
        'eventLabel': label,
        'transport': 'beacon'
    });
}

/**
 * Sets the value into local storage
 * @param {String} key
 * @param {*} val
 */
export function setStorage(key, val){
    var cnd = getNamespaceKey(CONFIG_BRAND.abbr);
    var prefix = cnd + '_';
    var storeKey = key;
    if(key.substr(0, prefix.length) !== prefix){
        storeKey = prefix + storeKey;
    }
    return window[cnd].Store.set(storeKey, val);
}

/**
 * Converts a collection into an array
 * @param  {*} collection
 * @return {Array}
 */
export function toArray(collection){
    var len = collection.length;
    var arr = new Array(len);
    while(len--) arr[len] = collection[len];
    return arr;
}

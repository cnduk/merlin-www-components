'use strict';

import CONFIG_BRAND from '@cnbritain/merlin-www-common';
import {
    getNamespaceKey
} from '@cnbritain/merlin-www-js-utils/js/functions';
import { AdUtils } from '@cnbritain/merlin-www-ads';

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

/**
 * Check an ad to see if it is a native.
 * @param  {Ad}  adModel
 * @return {Boolean}
 */
export function isAdNative(adModel){
    var adSizes = adModel.get('sizes');
    var len = adSizes.length;

    var adType = null;
    while(len--){
        adType = AdUtils.getAdTypeBySize(adSizes[len][0], adSizes[len][1]);

        if(adType !== AdUtils.AD_SIZES.NATIVE) continue;
        if(adModel.get('position') !== 'promotion-small') continue;

        return true;
    }

    return false;
}

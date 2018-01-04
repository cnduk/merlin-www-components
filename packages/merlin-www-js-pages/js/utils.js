'use strict';

import CONFIG_BRAND from '@cnbritain/merlin-www-common';
import {
    getNamespaceKey
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    AdUtils
} from '@cnbritain/merlin-www-ads';

export function displayHiringMessage() {
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
export function getStorage(key) {
    var cnd = getNamespaceKey(CONFIG_BRAND.abbr);
    var prefix = cnd + '_';
    var storeKey = key;
    if (key.substr(0, prefix.length) !== prefix) {
        storeKey = prefix + storeKey;
    }
    return window[cnd].Store.get(storeKey);
}

/**
 * Sets the value into local storage
 * @param {String} key
 * @param {*} val
 */
export function setStorage(key, val) {
    var cnd = getNamespaceKey(CONFIG_BRAND.abbr);
    var prefix = cnd + '_';
    var storeKey = key;
    if (key.substr(0, prefix.length) !== prefix) {
        storeKey = prefix + storeKey;
    }
    return window[cnd].Store.set(storeKey, val);
}

/**
 * Converts a collection into an array
 * @param  {*} collection
 * @return {Array}
 */
export function toArray(collection) {
    var len = collection.length;
    var arr = new Array(len);
    while (len--) arr[len] = collection[len];
    return arr;
}

/**
 * Check an ad to see if it is a native.
 * @param  {Ad}  adModel
 * @return {Boolean}
 */
var _NATIVE_SIZES = ['promotion-small', 'promotion-medium', 'promotion-large'];
export function isAdNative(adModel, nativeSize) {
    var adSizes = adModel.get('sizes');
    var len = adSizes.length;

    if (nativeSize !== undefined && _NATIVE_SIZES.indexOf(nativeSize) === -1) {
        throw new Error('Unknown native ad size: ' + nativeSize);
    }
    if (nativeSize !== undefined) {
        var positionRe = new RegExp('^' + nativeSize, 'i');
    } else {
        var positionRe = new RegExp('^promotion-', 'i');
    }

    var adType = null;
    while (len--) {
        adType = AdUtils.getAdTypeBySize(adSizes[len][0], adSizes[len][1]);

        if (adType !== AdUtils.AD_SIZES.NATIVE) continue;
        if (!positionRe.test(adModel.get('position'))) continue;

        return true;
    }

    return false;
}

/**
 * Return the global namespace for the brand
 * @return {object}
 */
export function getGlobalNamespace() {
    return window[getNamespaceKey(CONFIG_BRAND.abbr)];
}

/**
 * Set the value in the global namespace for the brand
 * @param {object} obj
 */
export function setGlobalNamespace(obj) {
    window[getNamespaceKey(CONFIG_BRAND.abbr)] = obj;
}

/**
 * Append a list of child elements to another element.
 *
 * Ok, so huddle around boys and girls. The reason we are not iterating
 * through the loop and just appending the children is because NodeList works
 * differently if its parent is a DocumentFragment. Instead of the usual,
 * remove from parent when you append, the node is still kept in the
 * DocumentFragment so the length never changes.
 *
 * @param  {HTMLElement} el
 * @param  {Array.<HTMLElement>} children
 */
export function appendChildren(el, children) {
    Array.prototype.forEach.call(children, function(child) {
        el.appendChild(child);
    });
}
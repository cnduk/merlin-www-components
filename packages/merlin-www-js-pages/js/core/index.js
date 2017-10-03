"use strict";

import CONFIG_BRAND from '@cnbritain/merlin-www-common';
import {
    addClass,
    addEvent,
    getParent,
    getNamespaceKey,
    removeClass,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    getUserAgent,
    hasTouch
} from '@cnbritain/merlin-www-js-utils/js/detect';
import MainNavigation from '@cnbritain/merlin-www-main-navigation';
import CookieWarning from '@cnbritain/merlin-www-cookie-warning';
import CommonImage from '@cnbritain/merlin-www-image';
import store from '@cnbritain/merlin-www-js-store';
import GATracker from '@cnbritain/merlin-www-js-gatracker';
import TopStories from '@cnbritain/merlin-www-top-stories';
import CardList from '@cnbritain/merlin-www-card-list';
import { AdManager, AdDebugger, AdUtils } from '@cnbritain/merlin-www-ads';
import es6Promise from 'es6-promise';
import { fartscroll, raptor } from '@cnbritain/merlin-www-goofs';

import { displayHiringMessage, initInternationalRedirect } from '../utils';

var CLS_STATE_HIDDEN = 'is-hidden';
var DEFAULT_INIT_CONFIG = {
    'OPEN_X_URL': null,
    'RUBICON_URL': null,
    'TEAD_URL': '//cdn.teads.tv/js/all-v2.js'
};

export default function init(config){

    var _config = null;
    if(config === undefined){
        _config = DEFAULT_INIT_CONFIG;
    } else {
        _config = config;
    }

    // Small natives can be on every single page (top stories)
    AdManager.on('register', onAdRegister);

    // Polyfill promises for basically IE
    es6Promise.polyfill();

    // Apply class to body root stating we are IE10.
    // IE10+ removed the option to use html statement comments.
    // This makes me upset that I have to do this.
    if(getUserAgent.name === 'MSIE' && getUserAgent.version >= 10){
        addClass(
            document.getElementsByTagName('html')[0], 'is-ie' +
            getUserAgent.version);
    }

    var os = "";
    var browser = getUserAgent.name;
    browser = browser.toLowerCase();

    if (navigator.appVersion.indexOf("Win") !== -1) os = "windows";
    if (navigator.appVersion.indexOf("Mac") !== -1) os = "macos";
    if (navigator.appVersion.indexOf("X11") !== -1) os = "unix";
    if (navigator.appVersion.indexOf("Linux") !== -1) os = "linux";

    addClass(document.getElementsByTagName('html')[0], 'is-' + os);
    addClass(document.getElementsByTagName('html')[0], 'is-' + browser);

    // Removes :focus outline
    if (hasTouch) {
        addClass(document.body, 'has-touch');
    }

    AdUtils.setAdUrls({
        OPEN_X_URL: _config['OPEN_X_URL'],
        RUBICON_URL: _config['RUBICON_URL'],
        TEAD_URL: _config['TEAD_URL']
    });

    CommonImage.init();
    TopStories.init({ scrollOffset: 30 });
    CardList.init();
    displayHiringMessage();
    initInternationalRedirect();
    raptor();

    // Global namespace stuffs
    // Don't just use the abbreviation in case something else in the page
    // overwrites it
    window[getNamespaceKey(CONFIG_BRAND.abbr)] = {
        'AdDebugger': AdDebugger,
        'AdManager': AdManager,
        'GATracker': GATracker,
        'Store': store
    };

    // Click the footer logo 5 times to activate the toots
    var tooterIcon = document.querySelector('.c-footer__list-item--logo svg');
    if(tooterIcon){
        var tootCount = 0;
        addEvent(tooterIcon, 'click', function tootClicker(){
            tootCount++;
            if(tootCount>=5){
                fartscroll();
                removeEvent(tooterIcon, 'click', tootClicker);
                tooterIcon = null;
                tootCount = 0;
            }
        });
    }
}

export function isAdNative(ad){
    var adSizes = ad.get('sizes');
    var len = adSizes.length;

    var adType = null;
    while(len--){
        adType = AdUtils.getAdTypeBySize(adSizes[len][0], adSizes[len][1]);
        if(adType !== AdUtils.AD_SIZES.NATIVE) continue;
        if(ad.get('position') !== 'promotion-small') continue;
        return true;
    }

    return false;
}

export function onAdRegister(e){
    if(isAdNative(e.ad)){
        e.ad.once('render', onNativeAdRender);
        e.ad.once('stop', onNativeAdStop);
    }
}

export function onNativeAdRender(e){
    e.target.off('stop', onNativeAdStop);

    // Remove is-hidden from list item
    var listItem = getParent(e.target.el, '.c-card-list__item--ad');
    removeClass(listItem, CLS_STATE_HIDDEN);
}

export function onNativeAdStop(e){
    e.target.off('render', onNativeAdRender);
}

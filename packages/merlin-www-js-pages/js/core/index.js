'use strict';

import es6Promise from 'es6-promise';

import {
    addClass,
    addEvent,
    assign,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    getUserAgent,
    hasTouch
} from '@cnbritain/merlin-www-js-utils/js/detect';
// Need to import MainNavigation and CookieWarning to initialise bits
import MainNavigation from '@cnbritain/merlin-www-main-navigation'; // eslint-disable-line no-unused-vars
import InfobarManager from '@cnbritain/merlin-www-infobar'; // eslint-disable-line no-unused-vars
import SubscribeBarManager from '@cnbritain/merlin-www-subscribe-bar'; // eslint-disable-line no-unused-vars
import CommonImage from '@cnbritain/merlin-www-image';
import store from '@cnbritain/merlin-www-js-store';
import GATracker from '@cnbritain/merlin-www-js-gatracker';
import ComscoreManager from '@cnbritain/merlin-www-js-gatracker/js/ComscoreManager';
import OneTrustManager from '@cnbritain/merlin-www-js-gatracker/js/OneTrustManager';
import SectionCardList from '@cnbritain/merlin-www-section-card-list';
import {
    AdManager,
    AdDebugger,
    AdUtils
} from '@cnbritain/merlin-www-ads';
import {
    fartscroll,
    raptor
} from '@cnbritain/merlin-www-goofs';
import InternationalRedirect from '@cnbritain/merlin-www-international-redirect';
import {
    displayHiringMessage,
    setGlobalNamespace
} from '../utils';
import {
    initLinkTracking,
    initInfobarTracking,
    initSubscribebarTracking
} from './analytics';

var DEFAULT_INIT_CONFIG = {
    'OPEN_X_URL': null,
    'RUBICON_URL': null,
    'TEAD_URL': '//cdn.teads.tv/js/all-v2.js',
    'PREBID_URL': null,
    'PREBID_SETTINGS': {}
};

export default function init(config) {

    var _config = DEFAULT_INIT_CONFIG;
    if (config !== undefined) {
        _config = assign({}, DEFAULT_INIT_CONFIG, config);
    }

    // Global namespace stuffs
    // Don't just use the abbreviation in case something else in the page
    // overwrites it
    setGlobalNamespace({
        'AdDebugger': AdDebugger,
        'AdManager': AdManager,
        'GATracker': GATracker,
        'MainNavigation': MainNavigation,
        'Store': store,
        'OneTrustManager': OneTrustManager
    });

    setupHtmlClasses();

    // Polyfill promises for basically IE
    es6Promise.polyfill();

    AdUtils.setAdUrls({
        OPEN_X_URL: _config['OPEN_X_URL'],
        RUBICON_URL: _config['RUBICON_URL'],
        TEAD_URL: _config['TEAD_URL'],
        PREBID_URL: _config['PREBID_URL'],
        PREBID_SETTINGS: _config['PREBID_SETTINGS']
    });

    initChain();

    CommonImage.init();
    SectionCardList.init();
    initInternationalRedirect();
    displayHiringMessage();
    initLinkTracking();
    initInfobarTracking();
    initSubscribebarTracking();

    // Goofs
    setupFartscroll();
    raptor();

    ComscoreManager.init();
    var consentCookie = parseInt(OneTrustManager.getConsent());
    if (consentCookie) {
        ComscoreManager.setConsent(1);
    } else {
        ComscoreManager.setConsent(0);
    }
    ComscoreManager.sendBeacon();
}

export function initInternationalRedirect() {
    if (InternationalRedirect.el !== null) {
        sendInternationRedirectEvent('Shown', null);
        InternationalRedirect.on('visibilityChange', function() {
            sendInternationRedirectEvent('Closed', null);
        });
        InternationalRedirect.on('linkClick', function(e) {
            sendInternationRedirectEvent('Link Click', e.country);
        });
        InternationalRedirect.on('linkHover', function(e) {
            sendInternationRedirectEvent('Link Hover', e.country);
        });
    }
}

export function sendInternationRedirectEvent(action, label) {
    GATracker.SendAll(GATracker.SEND_HITTYPES.EVENT, {
        'eventAction': action,
        'eventCategory': 'CountryBanner',
        'eventLabel': label,
        'transport': 'beacon'
    });
}

export function setupFartscroll() {
    var tooterIcon = document.querySelector('.c-footer__list-item--brand-logo svg');

    if (!tooterIcon) return;

    // Click the footer logo 5 times to activate the toots
    var tootCount = 0;

    function onIconClick() {
        if (++tootCount >= 5) {
            fartscroll();
            removeEvent(tooterIcon, 'click', onIconClick);
            tooterIcon = null;
            tootCount = 0;
        }
    }

    addEvent(tooterIcon, 'click', onIconClick);
}

export function setupHtmlClasses() {
    var html = document.getElementsByTagName('html')[0];

    // Apply class to body root stating we are IE10.
    // IE10+ removed the option to use html statement comments.
    // This makes me upset that I have to do this.
    if (getUserAgent.name === 'MSIE' && getUserAgent.version >= 10) {
        addClass(html, 'is-ie' + getUserAgent.version);
    }

    var os = null;
    var browser = getUserAgent.name;
    browser = browser.toLowerCase();

    if (navigator.appVersion.indexOf('Win') !== -1) {
        os = 'windows';
    } else if (navigator.appVersion.indexOf('Mac') !== -1) {
        os = 'macos';
    } else if (navigator.appVersion.indexOf('X11') !== -1) {
        os = 'unix';
    } else if (navigator.appVersion.indexOf('Linux') !== -1) {
        os = 'linux';
    }

    addClass(html, 'is-' + browser);
    if (os !== null) {
        addClass(html, 'is-' + os);
    }

    // Removes :focus outline
    if (hasTouch) {
        addClass(html, 'has-touch');
    }
}

export function initChain() {
    InfobarManager.once('enable', function() {
        if (MainNavigation.state.isFixed) {
            InfobarManager.infobar.fix();
        }
    });
    InfobarManager.once('load', function() {
        if (!InfobarManager.infobar || InfobarManager.infobar.state.isEnabled == false) {
            SubscribeBarManager.lazyload();
            SubscribeBarManager.once('enable', function() {
                if (MainNavigation.state.isFixed) {
                    SubscribeBarManager.subscribeBar.fix();
                }
            });
        }
    });
    InfobarManager.lazyload();
}
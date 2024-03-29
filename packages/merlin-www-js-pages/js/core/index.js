'use strict';

import es6Promise from 'es6-promise';

import {
    addClass,
    assign
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
import DotmetricsManager from '@cnbritain/merlin-www-js-gatracker/js/DotmetricsManager';
import FacebookPixelManager from '@cnbritain/merlin-www-js-gatracker/js/FacebookPixelManager';
import HotjarManager from '@cnbritain/merlin-www-js-gatracker/js/HotjarManager';
import OneTrustManager from '@cnbritain/merlin-www-js-gatracker/js/OneTrustManager';
import ParselyManager from '@cnbritain/merlin-www-js-gatracker/js/ParselyManager';
import PermutiveManager from '@cnbritain/merlin-www-js-gatracker/js/PermutiveManager';
import SailthruManager from '@cnbritain/merlin-www-js-gatracker/js/SailthruManager';
import SkimlinksManager from '@cnbritain/merlin-www-js-gatracker/js/SkimlinksManager';
import SparrowManager from '@cnbritain/merlin-www-js-gatracker/js/SparrowManager';
import TypekitManager from '@cnbritain/merlin-www-js-gatracker/js/TypekitManager';
import TreasureDataManager from '@cnbritain/merlin-www-js-gatracker/js/TreasureDataManager';
import TwitterConversionManager from '@cnbritain/merlin-www-js-gatracker/js/TwitterConversionManager';
import SectionCardList from '@cnbritain/merlin-www-section-card-list';
import SiteFooter from '@cnbritain/merlin-www-footer';
import {
    AdManager,
    AdDebugger,
    AdUtils
} from '@cnbritain/merlin-www-ads';
import InternationalRedirect from '@cnbritain/merlin-www-international-redirect';
import {
    setGlobalNamespace
} from '../utils';
import {
    initLinkTracking,
    initInfobarTracking,
    initSubscribebarTracking,
    loadSiteCensus
} from './analytics';

var DEFAULT_INIT_CONFIG = {
    OPEN_X_URL: null,
    RUBICON_URL: null,
    TEAD_URL: '//cdn.teads.tv/js/all-v2.js',
    PREBID_URL: null,
    PREBID_SETTINGS: {}
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
        AdDebugger: AdDebugger,
        AdManager: AdManager,
        DotmetricsManager: DotmetricsManager,
        FacebookPixelManager: FacebookPixelManager,
        GATracker: GATracker,
        HotjarManager: HotjarManager,
        MainNavigation: MainNavigation,
        OneTrustManager: OneTrustManager,
        ParselyManager: ParselyManager,
        PermutiveManager: PermutiveManager,
        SailthruManager: SailthruManager,
        SkimlinksManager: SkimlinksManager,
        SparrowManager: SparrowManager,
        Store: store,
        TreasureDataManager: TreasureDataManager,
        TwitterConversionManager: TwitterConversionManager,
        TypekitManager: TypekitManager,
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

    GATracker.init();
    OneTrustManager.on('ready', function () {
        SiteFooter.addOneTrust();
        if (this.consentedStrictlyCookies) {
            TypekitManager.loadScript();
        }

        if (this.consentedPerformanceCookies) {
            GATracker.loadGAScript();
            loadSiteCensus();
            SailthruManager.loadScript();
            HotjarManager.loadScript();
            ParselyManager.loadScript();
        }

        if (this.consentedTargetingCookies) {
            FacebookPixelManager.loadScript();
            PermutiveManager.loadScript();
            TreasureDataManager.loadTreasureDataScript();
            SparrowManager.loadScript();
            TwitterConversionManager.loadScript();
            DotmetricsManager.loadScript();
        }
    });
    OneTrustManager.on('change', function () {
        GATracker.setConsent(this.consentedPerformanceCookies);
        if (this.consentedPerformanceCookies) {
            SailthruManager.loadScript();
            ParselyManager.loadScript();
        }
    });

    initChain();

    CommonImage.init();
    SectionCardList.init();
    initInternationalRedirect();
    initLinkTracking();
    initInfobarTracking();
    initSubscribebarTracking();
}

export function initInternationalRedirect() {
    if (InternationalRedirect.el !== null) {
        sendInternationRedirectEvent('Shown', null);
        InternationalRedirect.on('visibilityChange', function () {
            sendInternationRedirectEvent('Closed', null);
        });
        InternationalRedirect.on('linkClick', function (e) {
            sendInternationRedirectEvent('Link Click', e.country);
        });
        InternationalRedirect.on('linkHover', function (e) {
            sendInternationRedirectEvent('Link Hover', e.country);
        });
    }
}

export function sendInternationRedirectEvent(action, label) {
    GATracker.SendAll(GATracker.SEND_HITTYPES.EVENT, {
        eventAction: action,
        eventCategory: 'CountryBanner',
        eventLabel: label,
        transport: 'beacon'
    });
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
    InfobarManager.once('enable', function () {
        if (MainNavigation.state.isFixed) {
            InfobarManager.infobar.fix();
        }
    });
    InfobarManager.once('load', function () {
        if (
            !InfobarManager.infobar ||
            InfobarManager.infobar.state.isEnabled == false
        ) {
            SubscribeBarManager.lazyload();
            SubscribeBarManager.once('enable', function () {
                if (MainNavigation.state.isFixed) {
                    SubscribeBarManager.subscribeBar.fix();
                }
            });
        }
    });
    InfobarManager.lazyload();
}
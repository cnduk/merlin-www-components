'use strict';

import {
    addEvent,
    delegate,
    hasClass,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';
import GATracker from '@cnbritain/merlin-www-js-gatracker';
import InfobarManager from '@cnbritain/merlin-www-infobar';
import SubscribeBarManager from '@cnbritain/merlin-www-subscribe-bar';

/* eslint-disable */
var hasBeacon = !!navigator.sendBeacon;
/* eslint-enable */
var clickEvents = ['click', 'auxclick'];
var delegateHandler = null;
var brandTracker = null;

/**
 * Get the domain from a url
 * @param  {String} str the url
 * @return {String}     The domain from the url
 */
export function getDomain(str) {
    return str.replace(/^(https|http)?(:\/\/)?(www\.)?/i, '').split(/[/?#]/)[0];
}

/**
 * Compare the url with the current browser location
 * @param  {String}  url the url to compare with
 * @return {Boolean}
 */
export function isInternalUrl(url) {
    var urlDomain = getDomain(url);
    var currentDomain = getDomain(location.href);
    return urlDomain === currentDomain;
}

/**
 * Check if the anchor is a bbcode button
 * @param  {HTMLNode}  domLink Anchor tag
 * @return {Boolean}
 */
export function isBBCodeButton(domLink) {
    return hasClass(domLink, 'bb-button');
}

/**
 * Check if the page will be navigating away
 * @param  {HTMLNode}  domLink the anchor
 * @param  {Object}  event   the click event
 * @return {Boolean}
 */
export function isLinkNavigatingPage(domLink, event) {
    return !(
        event.type !== 'click' ||
        domLink.getAttribute('target') === '_blank' ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.which > 1
    );
}

/**
 * Create the GA event values
 * @param  {HTMLNode} domLink the anchor
 * @return {Object}         the values for GA
 */
export function getEventValues(domLink) {
    var url = domLink.getAttribute('href');
    var isButton = isBBCodeButton(domLink);
    var isInternal = isInternalUrl(url);

    var actionType = isButton ? 'Button' : 'Link';
    var actionLabel = isInternal ? 'Internal Click' : 'Outbound Click';

    var eventAction = actionType + ': ' + actionLabel;
    var eventLabel = url + ' | ' + domLink.innerText;

    return {
        eventCategory: 'In-content Links',
        eventAction: eventAction,
        eventLabel: eventLabel
    };
}

/**
 * Retrieve the GA tracker for the brand
 * @return {GATracker}
 */
export function getBrandTracker() {
    if (brandTracker !== null) return brandTracker;

    var tracker = GATracker.TRACKERS.filter(function (t) {
        return t.type === 'brand';
    })[0];
    if (!tracker) {
        console.warn('No brand tracker found. Removing link events.');
        unbindEvents();
        return;
    }

    return (brandTracker = tracker);
}

/**
 * Click handler for when links and buttons are clicked
 * @param  {Object} e the click event object
 */
export function onLinkClick(e) {
    var tracker = getBrandTracker();
    if (!tracker) return;

    var link = this;

    var eventValues = getEventValues(link);
    var isNavigationPage = isLinkNavigatingPage(link, e);

    // If browser doesnt have beacon support, we have to preventDefault and
    // wait till the ga event has been sent then redirect the page
    if (!hasBeacon && isNavigationPage) {
        if (!e.defaultPrevented) {
            e.preventDefault();
        }
        eventValues.hitCallback = function () {
            location.href = link.getAttribute('href');
        };
    }

    tracker.send(GATracker.SEND_HITTYPES.EVENT, eventValues);
}

/**
 * Bind events to the document through a delegate
 */
export function bindEvents() {
    if (delegateHandler === null) {
        delegateHandler = delegate('.bb-button, .bb-a', onLinkClick);
        clickEvents.forEach(function (eventType) {
            addEvent(document, eventType, delegateHandler);
        });
    }
}

/**
 * Unbind events from the document
 */
export function unbindEvents() {
    if (delegateHandler !== null) {
        clickEvents.forEach(function (eventType) {
            removeEvent(document, eventType, delegateHandler);
        });
        delegateHandler = null;
    }
}

function onInfobarLoad() {
    if (InfobarManager.infobar !== null) {
        InfobarManager.infobar.addListener('linkClick', function (e) {
            var category = 'Info Bar';
            var action = null;
            var label = null;

            if (e.linkType == 'message') {
                action = 'Message Click';
                label = e.target.href + ' | ' + e.target.innerText;
            }

            if (e.linkType == 'button') {
                action = 'Button Click';
                label = e.target.href + ' | ' + e.target.innerText;
            }

            GATracker.SendAll(GATracker.SEND_HITTYPES.EVENT, {
                eventCategory: category,
                eventAction: action,
                eventLabel: label
            });
        });
    }
}

export function initInfobarTracking() {
    if (InfobarManager.isLoaded) {
        onInfobarLoad();
    } else {
        InfobarManager.once('load', onInfobarLoad);
    }
}

/**
 * Social Follow event tracking
 */
export function onSocialFollowClick(e) {
    var link = e.delegateTarget;
    var eventLabel = link.href + ' | ' + link.innerText;

    GATracker.SendAll(GATracker.SEND_HITTYPES.EVENT, {
        eventCategory: 'Social',
        eventAction: 'Follow',
        eventLabel: eventLabel
    });
}

export function initFollowButtonsTracking() {
    addEvent(
        document,
        'click',
        delegate('.c-nav__share-link', onSocialFollowClick)
    );
}

/**
 * Section newsletter tracking
 */
export function onSectionNewsletterSubmit() {
    GATracker.SendAll(GATracker.SEND_HITTYPES.EVENT, {
        eventCategory: 'slice_newsletter',
        eventAction: 'Submit',
        eventLabel: 'Continue'
    });
}

export function initSectionNewsletterTracking() {
    if (!document.querySelector('.c-newsletter__form')) return;
    addEvent(
        document,
        'submit',
        delegate('.c-newsletter__form', onSectionNewsletterSubmit)
    );
}

/**
 * Subscribe bar sign up location tracking
 */

function onSubscribeBarLoaded() {
    if (SubscribeBarManager.subscribeBar !== null) {
        SubscribeBarManager.subscribeBar.addListener('signup', function () {
            GATracker.SendAll(GATracker.SEND_HITTYPES.EVENT, {
                eventCategory: 'Subscribe bar',
                eventAction: 'Sign up',
                eventLabel: window.location.href
            });
        });
    }
}

export function initSubscribebarTracking() {
    if (SubscribeBarManager.isLoaded) {
        onSubscribeBarLoaded();
    } else {
        SubscribeBarManager.once('load', onSubscribeBarLoaded);
    }
}

/**
 * Initialise link tracking
 */
export function initLinkTracking() {
    bindEvents();
    initFollowButtonsTracking();
    initSectionNewsletterTracking();
}

export function loadSiteCensus() {
    (function () {
        var d = new Image(1, 1);
        d.onerror = d.onload = function () {
            d.onerror = d.onload = null;
        };
        d.src = [
            '//secure-uk.imrworldwide.com/cgi-bin/m?ci=uk-405185h&cg=0&cc=1&si=',
            escape(window.location.href),
            '&rp=',
            escape(document.referrer),
            '&ts=compact&rnd=',
            new Date().getTime()
        ].join('');
    })();
}

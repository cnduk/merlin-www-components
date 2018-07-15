'use strict';

import {
    ArticleManager
} from '@cnbritain/merlin-www-article';
import {
    addEvent,
    debounce,
    delegate
} from '@cnbritain/merlin-www-js-utils/js/functions';
import GATracker from '@cnbritain/merlin-www-js-gatracker';

var allowAllFocus = false;

export default function init() {
    ArticleManager.on('imagefocus', debounce(onArticleImageFocus, 300));
    ArticleManager.on('focus', onArticleFocus);
    ArticleManager.on('expand', onArticleExpand);

    initRecommendationTracking();
    initReadNextTracking();
}


export function onArticleImageFocus(e) {
    sendGalleryImagePageview(e.target.parentArticle, e.imageIndex);
}

export function onArticleFocus(e) {
    var article = e.target;

    // Update the analytics to include ad block changes
    article.analytics[GATracker.getDimensionByIndex('AD_BLOCKER')] = String(!window.ads_not_blocked);

    // NOTE: first article to focus is super likely to be non infinite scroll
    // article so to avoid it, we dont send a pageview if its not infinite
    // and is the first time.
    if (allowAllFocus || (!allowAllFocus && article.isInfinite)) {
        allowAllFocus = true;
        sendPageview(article);
    }
}

export function onArticleExpand(e) {
    sendCustomEvent({
        'eventCategory': 'Infinite scroll',
        'eventAction': 'Expand gallery',
        'eventLabel': e.target.properties.title
    });
}

export function sendCustomEvent(trackerData) {
    GATracker.SendAll(GATracker.SEND_HITTYPES.EVENT, trackerData);
}

export function sendGalleryImagePageview(article, imageIndex) {
    var analytics = article.analytics;

    var CREDIT_DIMENSION = GATracker.getDimensionByIndex(
        'GALLERY_PHOTO_CREDIT');
    var POSITION_DIMENSION = GATracker.getDimensionByIndex(
        'GALLERY_POSITION');
    var BASE_URL = GATracker.getDimensionByIndex('BASE_URL');

    var image = article.gallery.imageElements[imageIndex];
    var imageUid = image.querySelector('.c-figure').getAttribute('id');
    var credit = image.querySelector('.c-figure__credit');
    if (credit) {
        analytics[CREDIT_DIMENSION] = credit.innerHTML;
        credit = null;
    }

    analytics[POSITION_DIMENSION] = String(imageIndex + 1);

    GATracker.SetAll(analytics);
    GATracker.SendAll(GATracker.SEND_HITTYPES.PAGEVIEW, {
        'page': analytics[BASE_URL] + '#' + imageUid,
        'title': article.el.querySelector('.a-header__title').innerHTML
    });

    analytics = null;
    image = null;
}

export function sendPageview(article) {
    // Reset all custom dimensions first to make sure we dont leak any previous
    // dimensions from older articles
    GATracker.ResetCustomDimensions();
    GATracker.SetAll(article.analytics);
    GATracker.SendAll(GATracker.SEND_HITTYPES.PAGEVIEW);
}

/**
 * Recommended event tracking
 */

function onRecommendedArticleClick(e){
    var link = e.delegateTarget;
    var eventLabel = link.href + ' | ' + link.innerText;
    sendCustomEvent({
        eventCategory: 'Recommended',
        eventAction: 'Bottom Click',
        eventLabel: eventLabel
    });
}

export function initRecommendationTracking(){
    var recommendedTest = document.querySelector(
        '.c-card-section--a-recommended .c-card__link');
    if(recommendedTest === null) return;

    var recommendedSlice = document.querySelector(
        '.c-card-section--a-recommended');
    addEvent(recommendedSlice, 'click', delegate(
        '.c-card__link', onRecommendedArticleClick));
}

/**
 * Read next event tracking
 */

function onReadNextClick(e){
    var link = e.delegateTarget;
    var eventLabel = link.href + ' | ' + link.innerText;
    sendCustomEvent({
        eventCategory: 'Recommended',
        eventAction: 'Read Next Click',
        eventLabel: eventLabel
    });
}

export function initReadNextTracking(){
    var readnextTest = document.querySelector(
        '.a-sidebar-content .c-card__link');
    if(readnextTest === null) return;

    var readNextContent = document.querySelector(
        '.a-body__content');
    addEvent(readNextContent, 'click', delegate(
        '.a-sidebar-content .c-card__link', onReadNextClick));
}

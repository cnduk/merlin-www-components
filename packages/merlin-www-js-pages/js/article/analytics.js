'use strict';

import {ArticleManager} from '@cnbritain/merlin-www-article';
import {
    addEvent,
    debounce,
    delegate,
    getParent,
    hasClass
} from '@cnbritain/merlin-www-js-utils/js/functions';
import GATracker from '@cnbritain/merlin-www-js-gatracker';
import {toArray} from '../utils';
import NewsletterManager from '@cnbritain/merlin-www-bbcode/js/newsletter-manager';

var allowAllFocus = false;
var previousArticle = null;

export default function init() {
    ArticleManager.on('imagefocus', debounce(onArticleImageFocus, 300));
    ArticleManager.on('blur', onArticleBlur);
    ArticleManager.on('focus', onArticleFocus);
    ArticleManager.on('expand', onArticleExpand);

    initRecommendationTracking();
    initReadNextTracking();
    initInlineEmbedTracking();
    initTopStoriesTracking();
    initSocialShareTracking();
    initNewsletterTracking();
}


export function onArticleImageFocus(e) {
    sendGalleryImagePageview(e.target.parentArticle, e.imageIndex);
}

export function onArticleBlur(e){
    previousArticle = e.target;
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

// This is super basic just to help the lovely geoff
function getWordCount(text){
    return text.split(/\s/).length;
}

export function sendGalleryImagePageview(article, imageIndex) {
    // Create a copy of the analytics. Its a simple object so we can use the
    // JSON method.
    var analytics = JSON.parse(JSON.stringify(article.analytics));

    var CREDIT_DIMENSION = GATracker.getDimensionByIndex(
        'GALLERY_PHOTO_CREDIT');
    var POSITION_DIMENSION = GATracker.getDimensionByIndex(
        'GALLERY_POSITION');
    var BASE_URL = GATracker.getDimensionByIndex('BASE_URL');
    var WORD_COUNT = GATracker.getDimensionByIndex('WORD_COUNT');

    var image = article.gallery.imageElements[imageIndex];
    var imageUid = image.querySelector('.c-figure').getAttribute('id');
    var caption = image.querySelector('.c-figure__caption');
    if(caption){
        analytics[WORD_COUNT] = String(getWordCount(caption.innerText));
        caption = null;
    }
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

    sendCustomEvent({
        'eventCategory': 'Infinite scroll',
        'eventAction': 'Next article',
        'eventLabel': (
            previousArticle.properties.url + ' | ' + article.properties.url)
    });
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
    addEvent(
        document,
        'click',
        delegate(
            '.c-card-section--a-recommended .c-card__link',
            onRecommendedArticleClick
        )
    );
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
    addEvent(document, 'click', delegate(
        '.a-sidebar-content .c-card__link', onReadNextClick));
}


/**
 * Embed card tracking
 */

function onEmbedClick(e){
    var eventAction = null;
    var eventLabel = null;

    // Article
    if(hasClass(e.delegateTarget, 'bb-card')){
        eventAction = 'Internal Embed Click - Article';

    // Gallery
    } else if(hasClass(e.delegateTarget, 'bb-gallery')){
        var imageColumns = e.delegateTarget.querySelectorAll('.bb-gallery__col');
        eventAction = 'Internal Embed Click - Gallery:Thumbs ' + imageColumns.length;

    // Show
    } else if(hasClass(e.delegateTarget, 'bb-show-gallery')){
        eventAction = 'Internal Embed Click - Show';

    // Video
    } else if(hasClass(e.delegateTarget, 'bb-video')){
        eventAction = 'Internal Embed Click - Video';
    }

    var link = e.delegateTarget.querySelector('a');
    eventLabel = link.href + ' | ' + link.innerText;

    sendCustomEvent({
        eventCategory: 'Internal Embed',
        eventAction: eventAction,
        eventLabel: eventLabel
    });
}

export function initInlineEmbedTracking(){
    // Article, gallery, video, show
    addEvent(document, 'click', delegate(
        '.bb-card, .bb-gallery, .bb-show-gallery, .bb-video', onEmbedClick));
}


/**
 * Top stories tracking
 */

function onTopStoriesClick(e){
    var listItem = getParent(
        e.delegateTarget, '.c-top-stories__cards-listitem');
    var eventAction = null;

    // Check if native ad
    if(hasClass(listItem, 'c-top-stories__cards-listitem--ad')){
        eventAction = 'Top Stories Bar Click Pos: Native';
    } else {
        var list = getParent(e.delegateTarget, '.c-top-stories__cards-list');
        var items = toArray(
            list.querySelectorAll('.c-top-stories__cards-listitem'));
        items = items.filter(function(item){
            return !hasClass(item, 'c-top-stories__cards-listitem--ad');
        });
        var index = items.indexOf(listItem);
        eventAction = 'Top Stories Bar Click Pos: ' + (index + 1);
    }

    var link = e.delegateTarget;
    var eventLabel = link.href + ' | ' + link.innerText;

    sendCustomEvent({
        eventCategory: 'Top Stories Bar',
        eventAction: eventAction,
        eventLabel: eventLabel
    });
}

export function initTopStoriesTracking(){
    addEvent(document, 'click', delegate(
        '.c-top-stories .c-card__link', onTopStoriesClick));
}

/**
 * Social Share event tracking
 */

function onSocialShareClick(e) {
    var eventAction = null;
    var eventLabel = null;

    //Share: article, gallery, video or show shares
    if (hasClass(e.delegateTarget, '.btn-share')) {
        eventAction = 'Share';

    //Image Share: gallery image shares
    } else if(hasClass(e.delegateTarget, '.c-figure__toolbar-listitem')){
        eventAction = 'Image Share';
    }

    var link = e.delegateTarget.querySelector('a');
    eventLabel = link.href + ' | ' + link.innerText;

    sendCustomEvent({
        eventCategory: 'Social',
        eventAction: eventAction,
        eventLabel: eventLabel
    });
}

export function initSocialShareTracking(){
    addEvent(document, 'click', delegate(
        '.btn-share, .c-figure__toolbar-listitem', onSocialShareClick));
}

export function initNewsletterTracking() {
    NewsletterManager.on('signup', function(e) {

        var formEl = e.target.formEl;
        var type = formEl.querySelector('[name=newsletter]').value;
        var ctaText = formEl.querySelector('[name=submit]').value;

        var pageUrl = window.location.href;

        sendCustomEvent({
            eventCategory: 'Internal Embed',
            eventAction: 'Internal Embed Click - Newsletter Signup',
            eventLabel: pageUrl + ' | ' + ctaText + ' | ' + type
        });
    });
}
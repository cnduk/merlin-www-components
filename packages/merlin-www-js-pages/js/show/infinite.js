'use strict';

import {
    addEvent,
    addHtml,
    onPageLoad,
    removeEvent,
    throttle,
    updateQueryString,
    locationOrigin
} from '@cnbritain/merlin-www-js-utils/js/functions';
import SectionCardList from '@cnbritain/merlin-www-section-card-list';
import {
    AdManager
} from '@cnbritain/merlin-www-ads';
import InfiniteScroll from '@cnbritain/merlin-www-js-infinitescroll';

import {
    createStickGroup
} from '../tagpage/sticky';
import {
    getStorage,
    setStorage
} from '../utils';

var INFINITE_BOTTOM_THRESHOLD = 1000;
var INFINITE_SCROLL_THROTTLE = 300;
var INFINITE_RESIZE_THROTTLE = 300;
var infiniteScroller = null;
var infiniteBodyScrollHeight = 0;
var hookInfiniteResize = null;

export default function init() {
    // Check if tag_infinite_scroll is set to true
    if (getStorage('infinite_stop')) return;

    infiniteScroller = new InfiniteScroll({
        'el': window,
        'throttle': INFINITE_SCROLL_THROTTLE,
        'trigger': onInfiniteTrigger,
        'url': onInfiniteUrl
    });
    infiniteScroller.on('loadError', onInfiniteLoadError);
    infiniteScroller.on('loadComplete', onInfiniteLoadComplete);

    resize();
    onPageLoad(resize);
    hookInfiniteResize = throttle(resize, INFINITE_RESIZE_THROTTLE);
    addEvent(window, 'resize', hookInfiniteResize);

    infiniteScroller.enable();
}

export function resize() {
    infiniteBodyScrollHeight = document.body.scrollHeight - window.innerHeight;
}

export function onInfiniteTrigger(scrollY) {
    return scrollY >= (infiniteBodyScrollHeight - INFINITE_BOTTOM_THRESHOLD);
}

export function getNextPageUrl(tagUrl, pageNumber) {
    var adInstanceCounts = getStorage('ad_instance_counts');

    var url = updateQueryString(tagUrl, {
        page: pageNumber,
        ad_instance_counts: JSON.stringify(adInstanceCounts),
    });
    return url;
}

export function onInfiniteUrl(pageCounter) {
    return locationOrigin() + getNextPageUrl(
        getStorage('infinite_url'), pageCounter + 1);
}

export function destroyInfiniteScroller() {
    infiniteScroller.destroy();
    removeEvent(window, 'resize', hookInfiniteResize);

    infiniteScroller = null;
    hookInfiniteResize = null;
}

export function throwInfiniteError(message, e) {
    destroyInfiniteScroller();
    throw new Error(message, e);
}

export function onInfiniteLoadError(e) {
    throwInfiniteError('Error trying to load url in infinite scroll', e);
}

export function insertSection(section) {

    var docFragment = document.createDocumentFragment();
    var addToFragment = addHtml(docFragment);

    addToFragment(section);

    var hook = document.getElementById('infiniteScrollHook');
    hook.parentNode.insertBefore(docFragment, hook);

    // Loaded in a new section so we need to create a new sticky group
    createStickGroup(hook.previousElementSibling);

    addToFragment = null;
    hook = null;
    docFragment = null;

}

export function onInfiniteLoadComplete(e) {

    var responseText = e.originalRequest.responseText;
    var responseJSON = null;
    try {
        responseJSON = JSON.parse(responseText);
    } catch (err) {
        throwInfiniteError('Error trying to parse response JSON', err);
    }

    // Add items to page
    if (responseJSON.data.template) insertSection(responseJSON.data.template);

    // Update any local storage values
    if (responseJSON.data.local_storage) {
        responseJSON.data.local_storage.forEach(function (item) {
            setStorage(item.key, item.value);
        });
    }

    // Check if we need to stop
    if (responseJSON.data.stop) destroyInfiniteScroller();

    // TODO: Page impression tracker
    resize();

    SectionCardList.init();

    // Trigger some more lazy ads
    AdManager.lazy();

}
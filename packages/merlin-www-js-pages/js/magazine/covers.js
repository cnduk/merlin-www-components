'use strict';

import {
    addEvent,
    addHtml,
    onPageLoad,
    removeEvent,
    throttle,
    updateQueryString
} from '@cnbritain/merlin-www-js-utils/js/functions';
import InfiniteScroll from '@cnbritain/merlin-www-js-infinitescroll';

var ID_HOOK_COVERS = 'infiniteScrollHook';
var INFINITE_BOTTOM_THRESHOLD = 1000;
var INFINITE_SCROLL_THROTTLE = 300;
var INFINITE_RESIZE_THROTTLE = 300;
var infiniteScroller = null;
var infiniteBodyScrollHeight = 0;
var hookInfiniteResize = null;


export function getMagazineCovers(page) {
    var url = updateQueryString('/xhr/magazine', {
        page: page
    });
    return url;
}

export default function initInfiniteScroll() {
    infiniteScroller = new InfiniteScroll({
        'el': window,
        'throttle': INFINITE_SCROLL_THROTTLE,
        'trigger': function(scrollY) {
            return scrollY >= (
                infiniteBodyScrollHeight - INFINITE_BOTTOM_THRESHOLD);
        },
        'url': function(pageCounter) {
            return location.origin + getMagazineCovers(pageCounter+1);
        }
    });
    infiniteScroller.on('loadError', onInfiniteLoadError);
    infiniteScroller.on('loadComplete', onInfiniteLoadComplete);

    onInfiniteWindowResize();
    onPageLoad(onInfiniteWindowResize);
    hookInfiniteResize = throttle(
        onInfiniteWindowResize, INFINITE_RESIZE_THROTTLE);
    addEvent(window, 'resize', hookInfiniteResize);

    infiniteScroller.enable();
}

export function destroyInfiniteScroller() {
    infiniteScroller.destroy();
    removeEvent(window, 'resize', hookInfiniteResize);

    infiniteScroller = null;
    hookInfiniteResize = null;
}

export function appendChildren(el, children){
    var i = -1;
    var len = children.length;
    while(++i < len) el.appendChild(children[i]);
}

export function insertMagazines(section) {
    var docFragment = document.createDocumentFragment();
    var addToFragment = addHtml(docFragment);

    var hook = document.getElementById(ID_HOOK_COVERS);
    hook = hook.previousElementSibling.querySelector('.c-card-section ul');

    addToFragment(section);
    appendChildren(hook, docFragment.querySelectorAll('.c-card-list__item'));
}

export function onInfiniteLoadError(e) {
    throwInfiniteError('Error trying to load url in infinite scroll', e);
}

export function onInfiniteWindowResize() {
    infiniteBodyScrollHeight = (
        document.body.scrollHeight - window.innerHeight);
}

export function throwInfiniteError(message, e) {
    destroyInfiniteScroller();
    throw new Error(message, e);
}

export function onInfiniteLoadComplete(e) {
    var responseText = e.originalRequest.responseText;
    var responseJSON = null;

    try {
        responseJSON = JSON.parse(responseText);
    } catch(err){
        throwInfiniteError('Error trying to parse response JSON', err);
    }

    // Add items to page
    if(responseJSON.data.template) insertMagazines(responseJSON.data.template);

    // Check if we need to stop
    if(responseJSON.stop) destroyInfiniteScroller();

    // TODO: Page impression tracker
    onInfiniteWindowResize();
}

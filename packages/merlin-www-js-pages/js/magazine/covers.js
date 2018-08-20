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
import {
    ID_MAGAZINE_COVERS_HOOK
} from '../constants';
import {
    appendChildren
} from '../utils';


var INFINITE_BOTTOM_THRESHOLD = 1000;
var INFINITE_SCROLL_THROTTLE = 300;
var INFINITE_RESIZE_THROTTLE = 300;

var infiniteScroller = null;
var infiniteBodyScrollHeight = 0;
var hookInfiniteResize = null;


export function resizeWindow() {
    infiniteBodyScrollHeight = document.body.scrollHeight - window.innerHeight;
}

export function getUrl(page) {
    return location.origin + updateQueryString('/xhr/magazine', {
        page: page + 1
    });
}

export function getTrigger(scrollY) {
    return scrollY >= (infiniteBodyScrollHeight - INFINITE_BOTTOM_THRESHOLD);
}

export function throwInfiniteError(message, e) {
    destroyInfiniteScroller();
    throw new Error(message, e);
}

export function onInfiniteError(e) {
    throwInfiniteError('Error trying to load url in infinite scroll', e);
}

export function destroyInfiniteScroller() {
    infiniteScroller.destroy();
    removeEvent(window, 'resize', hookInfiniteResize);

    infiniteScroller = null;
    hookInfiniteResize = null;
}

export function insertMagazines(section) {
    var docFragment = document.createDocumentFragment();
    var addToFragment = addHtml(docFragment);

    var hook = document.getElementById(ID_MAGAZINE_COVERS_HOOK);
    hook = hook.previousElementSibling.querySelector('.c-card-section--mag-magazines ul');

    addToFragment(section);
    appendChildren(hook, docFragment.querySelectorAll('.js-c-card-section__card-listitem'));
}

export function onInfiniteSuccess(e) {
    var responseText = e.originalRequest.responseText;
    var responseJSON = null;

    try {
        responseJSON = JSON.parse(responseText);
    } catch (err) {
        throwInfiniteError('Error trying to parse response JSON', err);
    }

    // Add items to page
    if (responseJSON.data.template) insertMagazines(responseJSON.data.template);

    // Check if we need to stop
    if (responseJSON.stop) destroyInfiniteScroller();

    // TODO: Page impression tracker
    resizeWindow();
}

export default function init() {
    infiniteScroller = new InfiniteScroll({
        'el': window,
        'throttle': INFINITE_SCROLL_THROTTLE,
        'trigger': getTrigger,
        'url': getUrl
    });
    infiniteScroller.on('loadError', onInfiniteError);
    infiniteScroller.on('loadComplete', onInfiniteSuccess);

    onPageLoad(resizeWindow);
    resizeWindow();
    hookInfiniteResize = throttle(resizeWindow, INFINITE_RESIZE_THROTTLE);
    addEvent(window, 'resize', hookInfiniteResize);

    infiniteScroller.enable();
}
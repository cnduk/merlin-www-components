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

import { getStorage } from '../utils';

var INFINITE_BOTTOM_THRESHOLD = 1000;
var INFINITE_SCROLL_THROTTLE = 300;
var INFINITE_RESIZE_THROTTLE = 300;
var infiniteScroller = null;
var infiniteBodyScrollHeight = 0;
var hookInfiniteResize = null;


export function destroyInfiniteScroller(){
    infiniteScroller.destroy();
    removeEvent(window, 'resize', hookInfiniteResize);

    infiniteScroller = null;
    hookInfiniteResize = null;
}

export function getNextPageUrl(pageNumber){
    var url = updateQueryString('/xhr' + getStorage('infinite_url'), {
        page: pageNumber
    });
    return url;
}

export default function init(){
    infiniteScroller = new InfiniteScroll({
        'el': window,
        'throttle': INFINITE_SCROLL_THROTTLE,
        'trigger': function(scrollY){
            return scrollY >= (
                infiniteBodyScrollHeight - INFINITE_BOTTOM_THRESHOLD);
        },
        'url': function(pageCounter){
            return location.origin + getNextPageUrl(pageCounter+1);
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

export function insertSection(section){
    var docFragment = document.createDocumentFragment();
    var addToFragment = addHtml(docFragment);

    addToFragment(section);

    var hook = document.getElementById('infiniteScrollHook');
    hook.parentNode.insertBefore(docFragment, hook);

    addToFragment = null;
    hook = null;
    docFragment = null;
}

export function onInfiniteLoadError( e ){
    throwInfiniteError('Error trying to load url in infinite scroll', e);
}

export function onInfiniteLoadComplete( e ){

    var responseText = e.originalRequest.responseText;
    var responseJSON = null;
    try {
        responseJSON = JSON.parse(responseText);
    } catch(err){
        throwInfiniteError('Error trying to parse response JSON', err);
    }

    // Add items to page
    if(responseJSON.data.template) insertSection(responseJSON.data.template);

    // Check if we need to stop
    if(responseJSON.data.stop) destroyInfiniteScroller();

    // TODO: Page impression tracker
    onInfiniteWindowResize();

}

export function onInfiniteWindowResize(){
    infiniteBodyScrollHeight = document.body.scrollHeight - window.innerHeight;
}

export function throwInfiniteError(message, e){
    destroyInfiniteScroller();
    throw new Error(message, e);
}

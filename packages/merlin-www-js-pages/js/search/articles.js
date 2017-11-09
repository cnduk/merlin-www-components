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


export function onResize(){
    infiniteBodyScrollHeight = document.body.scrollHeight - window.innerHeight;
}

export function disableInfiniteScroll(){
    infiniteScroller.destroy();
    removeEvent(window, 'resize', hookInfiniteResize);

    infiniteScroller = null;
    hookInfiniteResize = null;
}

export function throwError(message, e){
    disableInfiniteScroll();
    throw new Error(message, e);
}

export function getTrigger(scrollY){
    return scrollY >= (infiniteBodyScrollHeight - INFINITE_BOTTOM_THRESHOLD);
}

export function getUrl(pageNumber){
    var url = location.origin + '/xhr' + getStorage('infinite_url');
    var queryValues = {
        page: pageNumber + 1
    };
    return updateQueryString(url, queryValues);
}

export function onInfiniteError( e ){
    throwError('Error trying to load url in infinite scroll', e);
}

export function insertSection(section){
    var docFragment = document.createDocumentFragment();
    var addToFragment = addHtml(docFragment);

    addToFragment(section);

    hook.parentNode.insertBefore(
        docFragment, document.getElementById('infiniteScrollHook'));

    addToFragment = null;
    docFragment = null;
}

export function onInfiniteLoad( e ){

    var responseText = e.originalRequest.responseText;
    var responseJSON = null;
    try {
        responseJSON = JSON.parse(responseText);
    } catch(err){
        throwError('Error trying to parse response JSON', err);
    }

    // Add items to page
    if(responseJSON.data.template) insertSection(responseJSON.data.template);

    // Update any local storage values
    if(responseJSON.data.local_storage){
        responseJSON.data.local_storage.forEach(function(item){
            setStorage(item.key, item.value);
        });
    }

    // Check if we need to stop
    if(responseJSON.data.stop) disableInfiniteScroll();

    // TODO: Page impression tracker
    onResize();

}

export default function init(){
    infiniteScroller = new InfiniteScroll({
        'el': window,
        'throttle': INFINITE_SCROLL_THROTTLE,
        'trigger': getTrigger,
        'url': getUrl
    });
    infiniteScroller.on('loadError', onInfiniteError);
    infiniteScroller.on('loadComplete', onInfiniteLoad);

    onResize();
    onPageLoad(onResize);
    hookInfiniteResize = throttle(onResize, INFINITE_RESIZE_THROTTLE);
    addEvent(window, 'resize', hookInfiniteResize);

    infiniteScroller.enable();
}

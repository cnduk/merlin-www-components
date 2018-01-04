'use strict';

import {
    isAdNative
} from '../utils';
import {
    getParent,
    removeClass,
    removeElement
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    AdManager
} from '@cnbritain/merlin-www-ads';

var CLS_STATE_HIDDEN = 'is-hidden';

export var nativeAdsShift = 0;
export var nativeAdsWaiting = 0;

export function onAdRegister(e) {
    if (isAdNative(e.ad, 'promotion-medium')) {
        e.ad.once('render', onNativeAdRender);
        e.ad.once('render', onAdRenderStop);
        e.ad.once('stop', onAdRenderStop);
        nativeAdsWaiting++;
    }
}

export function onAdRenderStop(e) {
    e.target.off('render', onNativeAdRender);
    e.target.off('render', onAdRenderStop);
    e.target.off('stop', onAdRenderStop);
    nativeAdsWaiting--;
}

export function onNativeAdRender(e) {
    nativeAdsShift++;

    // Remove is-hidden from list item
    var listItem = getParent(e.target.el, '.c-card-list__item--ad');
    removeClass(listItem, CLS_STATE_HIDDEN);

    // Remove last item in card list only if there are already 12 children
    var cardList = getParent(e.target.el, '.c-card-list');
    var lis = cardList.querySelectorAll(':scope > li');
    var adLis = cardList.querySelectorAll(':scope .js-c-card-list__ad');
    var totalCards = lis.length - adLis.length;
    if (totalCards === 12) {
        var lastCard = cardList.children[cardList.children.length - 1];
        removeElement(lastCard);
    }

}

export default function init() {
    AdManager.on('register', onAdRegister);
    AdManager.init();
    AdManager.lazy();
}
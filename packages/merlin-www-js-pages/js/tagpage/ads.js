'use strict';

import {
    getParent,
    removeClass,
    removeElement
} from '@cnbritain/merlin-www-js-utils/js/functions';
import { AdManager, AdUtils } from '@cnbritain/merlin-www-ads';

var CLS_STATE_HIDDEN = 'is-hidden';

export var nativeAdsShift = 0;
export var nativeAdsWaiting = 0;

export default function init(){
    AdManager.on('register', onAdRegister);
    AdManager.init();
    AdManager.lazy();
}

export function isAdNative(ad){
    var adSizes = ad.get('sizes');
    var len = adSizes.length;

    var adType = null;
    while(len--){
        adType = AdUtils.getAdTypeBySize(adSizes[len][0], adSizes[len][1]);
        if(adType !== AdUtils.AD_SIZES.NATIVE) continue;
        if(ad.get('position') !== 'promotion-medium') continue;
        return true;
    }

    return false;
}

export function onAdRegister(e){
    if(isAdNative(e.ad)){
        e.ad.once('render', onNativeAdRender);
        e.ad.once('render', onAdRenderStop);
        e.ad.once('stop', onAdRenderStop);
        nativeAdsWaiting++;
    }
}

export function onAdRenderStop(e){
    e.target.off('render', onNativeAdRender);
    e.target.off('render', onAdRenderStop);
    e.target.off('stop', onAdRenderStop);
    nativeAdsWaiting--;
}

export function onNativeAdRender(e){
    nativeAdsShift++;
    // Remove is-hidden from list item
    var listItem = getParent(e.target.el, '.c-card-list__item--ad');
    removeClass(listItem, CLS_STATE_HIDDEN);
    // Remove last item in card list only if there are already 12 children
    var cardList = getParent(e.target.el, '.c-card-list');
    var lis = cardList.querySelectorAll(':scope > li');
    var adLis = cardList.querySelectorAll(':scope .js-c-card-list__ad');
    var totalCards = lis.length - adLis.length;
    if(totalCards === 12) {
        var lastCard = cardList.children[cardList.children.length - 1];
        removeElement(lastCard);
    }
}

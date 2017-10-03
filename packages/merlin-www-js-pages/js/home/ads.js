'use strict';

import {
    getParent,
    removeClass,
    removeElement
} from '@cnbritain/merlin-www-js-utils/js/functions';
import { AdManager, AdUtils } from '@cnbritain/merlin-www-ads';

var CLS_STATE_HIDDEN = 'is-hidden';

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
    }
}

export function onAdRenderStop(e){
    e.target.off('render', onNativeAdRender);
    e.target.off('render', onAdRenderStop);
    e.target.off('stop', onAdRenderStop);
}

export function onNativeAdRender(e){
    // Remove is-hidden from list item
    var listItem = getParent(e.target.el, '.c-card-list__item--ad');
    removeClass(listItem, CLS_STATE_HIDDEN);
    // Remove last item in card list
    var cardList = getParent(e.target.el, '.c-card-list');
    var lastCard = cardList.children[cardList.children.length - 1];
    removeElement(lastCard);
}

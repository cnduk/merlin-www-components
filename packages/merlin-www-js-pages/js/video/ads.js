'use strict';

import {
    AdManager,
    AdUtils
} from '@cnbritain/merlin-www-ads';

export var nativeAdShift = 0;
export var nativeAdWaiting = 0;

export default function init() {
    AdManager.on('register', onAdRegister);
    AdManager.init();
    AdManager.lazy();
}

export function onAdRegister(e) {
    var adSizes = e.ad.get('sizes');
    var len = adSizes.length;
    while (len--) {
        if (AdUtils.getAdTypeBySize(adSizes[len][0], adSizes[len][1]) ===
            AdUtils.AD_SIZES.NATIVE) {
            e.ad.once('render', onAdRegister);
            e.ad.once('render', onAdRenderStop);
            e.ad.once('stop', onAdRenderStop);
            nativeAdWaiting++;
            break;
        }
    }
}

export function onAdRender() {
    nativeAdShift++;
}

export function onAdRenderStop(e) {
    e.target.off('render', onAdRegister);
    e.target.off('render', onAdRenderStop);
    e.target.off('stop', onAdRenderStop);
    nativeAdWaiting--;
}
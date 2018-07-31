'use strict';

import {
    isAdNative
} from '../utils';
import {
    getParent,
    removeClass,
    removeElement
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {AdManager} from '@cnbritain/merlin-www-ads';

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
}

export default function init() {
    AdManager.on('register', onAdRegister);
    AdManager.init();
    AdManager.lazy();
}
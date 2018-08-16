'use strict';

import {AdManager} from '@cnbritain/merlin-www-ads';
import {isAdNative} from '../utils';

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

export function onNativeAdRender() {
    nativeAdsShift++;
}

export default function init() {
    AdManager.on('register', onAdRegister);
    AdManager.init();
    AdManager.lazy();
}
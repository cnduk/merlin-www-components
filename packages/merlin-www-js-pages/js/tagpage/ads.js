'use strict';

import { AdManager } from '@cnbritain/merlin-www-ads';
import OneTrustManager from '@cnbritain/merlin-www-js-gatracker/js/OneTrustManager';
import { isAdNative } from '../utils';

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
    function onChange() {
        if (this.consentedPerformanceCookies) {
            OneTrustManager.off('change', onChange);
            AdManager.init();
            AdManager.lazy();
        }
    }

    function onReady() {
        if (this.consentedPerformanceCookies) {
            AdManager.init();
            AdManager.lazy();
        } else {
            OneTrustManager.on('change', onChange);
        }
    }

    AdManager.on('register', onAdRegister);

    if (OneTrustManager.ready) {
        if (OneTrustManager.consentedPerformanceCookies) {
            AdManager.init();
            AdManager.lazy();
        } else {
            OneTrustManager.on('change', onChange);
        }
    } else {
        OneTrustManager.once('ready', onReady);
    }
}

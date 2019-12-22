'use strict';

import { AdManager } from '@cnbritain/merlin-www-ads';
import OneTrustManager from '@cnbritain/merlin-www-js-gatracker/js/OneTrustManager';

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

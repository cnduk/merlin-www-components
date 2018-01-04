'use strict';

import {
    getParent,
    removeClass,
    removeElement
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    AdManager
} from '@cnbritain/merlin-www-ads';

import {
    CLS_STATE_IS_HIDDEN
} from '../constants';
import {
    isAdNative
} from '../utils';

export default function init() {
    AdManager.on('register', onAdRegister);
    AdManager.init();
    AdManager.lazy();
}

export function onAdRegister(e) {
    if (isAdNative(e.ad, 'promotion-medium')) {
        e.ad.once('render', onNativeAdRender);
        e.ad.once('render', onAdRenderStop);
        e.ad.once('stop', onAdRenderStop);
    }
}

export function onAdRenderStop(e) {
    e.target.off('render', onNativeAdRender);
    e.target.off('render', onAdRenderStop);
    e.target.off('stop', onAdRenderStop);
}

export function onNativeAdRender(e) {
    // Remove is-hidden from list item
    var listItem = getParent(e.target.el, '.c-card-list__item--ad');
    removeClass(listItem, CLS_STATE_IS_HIDDEN);
    // Remove last item in card list
    var cardList = getParent(e.target.el, '.c-card-list');
    var lastCard = cardList.children[cardList.children.length - 1];
    removeElement(lastCard);
}
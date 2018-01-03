'use strict';

import {
    JS_MAGNIFIER_CONFIG,
    JS_MAGNIFIER_BUTTON
} from './constants';

var previousZoom = null;

export function disableZoom() {
    if (previousZoom) enableZoom();

    var viewportMeta = document.querySelector('meta[name=viewport]');
    previousZoom = viewportMeta.getAttribute('content');
    viewportMeta.setAttribute(
        'content',
        'user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1'
    );
}

export function enableZoom() {
    var viewportMeta = document.querySelector('meta[name=viewport]');
    viewportMeta.setAttribute('content', previousZoom);
    previousZoom = null;
}

export function hasElementMagnifierConfig(el) {
    return !!el.querySelector('.' + JS_MAGNIFIER_CONFIG);
}

export function hasElementMagnifierButton(el) {
    return !!el.querySelector('.' + JS_MAGNIFIER_BUTTON);
}

export function getElementMagnifierConfig(el) {
    var scriptEl = el.querySelector('.' + JS_MAGNIFIER_CONFIG);
    if (!scriptEl) return null;
    try {
        return JSON.parse(scriptEl.textContent);
    } catch (err) {
        console.warn('Magnifier config malformed');
        return null;
    }
}

export function mapValue(value, istart, istop, ostart, ostop) {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}

export function preloadImage(url) {
    return new Promise(function(resolve, reject) {
        var img = new Image();
        img.onload = function() {
            this.onload = null;
            this.onerror = null;
            resolve(url);
        };
        img.onerror = function() {
            this.onload = null;
            this.onerror = null;
            reject(url);
        };
        img.src = url;
    });
}
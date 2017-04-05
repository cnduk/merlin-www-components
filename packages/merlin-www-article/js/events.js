'use strict';

import { createEventTemplate } from '@cnbritain/merlin-www-js-utils/js/functions';

export function add(emitter, article){
    return createEventTemplate('add', emitter, {
        'article': article,
        'infinite': article.isInfinite
    });
}

export function blur(emitter){
    return createEventTemplate('blur', emitter, {
        'bubbles': true
    });
}

export function focus(emitter){
    return createEventTemplate('focus', emitter, {
        'bubbles': true
    });
}

export function imageblur(emitter, imageIndex){
    return createEventTemplate('imageblur', emitter, {
        'image': emitter.images[imageIndex],
        'imageIndex': imageIndex
    });
}

export function imagefocus(emitter, imageIndex){
    return createEventTemplate('imagefocus', emitter, {
        'image': emitter.images[imageIndex],
        'imageIndex': imageIndex
    });
}

export function navNext(emitter){
    return createEventTemplate('next', emitter);
}

export function navPrevious(emitter){
    return createEventTemplate('previous', emitter);
}

export function galleryViewChange(emitter, layoutView){
    return createEventTemplate('viewchange', emitter, {
        "layoutView": layoutView
    });
}

export function expand(emitter){
    return createEventTemplate('expand', emitter);
}

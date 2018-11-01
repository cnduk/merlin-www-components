'use strict';

import {
    createEventTemplate
} from '@cnbritain/merlin-www-js-utils/js/functions';

export function linkClick(emitter, linkType) {
    return createEventTemplate('linkClick', emitter, {
        bubbles: true,
        linkType: linkType
    });
}

export function disable(emitter) {
    return createEventTemplate('disable', emitter, {
        'bubbles': true,
    });
}

export function enable(emitter) {
    return createEventTemplate('enable', emitter, {
        'bubbles': true,
    });
}

export function show(emitter) {
    return createEventTemplate('show', emitter, {
        'bubbles': true,
    });
}

export function hide(emitter) {
    return createEventTemplate('hide', emitter, {
        'bubbles': true,
    });
}

export function fix(emitter) {
    return createEventTemplate('fix', emitter, {
        'bubbles': true,
    });
}

export function unfix(emitter) {
    return createEventTemplate('unfix', emitter, {
        'bubbles': true,
    });
}

export function load(emitter) {
    return createEventTemplate('load', emitter, {
        'bubbles': true
    });
}

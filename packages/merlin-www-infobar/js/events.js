'use strict';

import {
    createEventTemplate
} from '@cnbritain/merlin-www-js-utils/js/functions';

export function linkClick(emitter, linkType) {
    return createEventTemplate('linkClick', emitter, {
        linkType: linkType
    });
}

export function disable(emitter) {
    return createEventTemplate('disable', emitter);
}

export function enable(emitter) {
    return createEventTemplate('enable', emitter);
}

export function show(emitter) {
    return createEventTemplate('show', emitter);
}

export function hide(emitter) {
    return createEventTemplate('hide', emitter);
}

export function fix(emitter) {
    return createEventTemplate('fix', emitter);
}

export function unfix(emitter) {
    return createEventTemplate('unfix', emitter);
}
'use strict';

import {
    createEventTemplate
} from '@cnbritain/merlin-www-js-utils/js/functions';

export function visibilitychange(emitter, state) {
    return createEventTemplate('visibilitychange', emitter, {
        state: state
    });
}

export function update(emitter, scrollY, scrollVelocity) {
    return createEventTemplate('update', emitter, {
        scrollY: scrollY,
        scrollVelocity: scrollVelocity
    });
}

export function pause(emitter) {
    return createEventTemplate('pause', emitter);
}

export function unpause(emitter) {
    return createEventTemplate('unpause', emitter);
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

export function viewchange(emitter, view) {
    return createEventTemplate('viewchange', emitter, {
        view: view
    });
}

export function fix(emitter) {
    return createEventTemplate('fix', emitter);
}

export function unfix(emitter) {
    return createEventTemplate('unfix', emitter);
}
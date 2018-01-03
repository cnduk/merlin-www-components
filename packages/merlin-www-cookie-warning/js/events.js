'use strict';

import {
    createEventTemplate
} from '@cnbritain/merlin-www-js-utils/js/functions';

export function visibilitychange(emitter, state) {
    return createEventTemplate('visibilitychange', emitter, {
        state: state
    });
}

export function remove(emitter) {
    return createEventTemplate('remove', emitter);
}

export function limitexceeded(emitter) {
    return createEventTemplate('limitexceeded', emitter);
}
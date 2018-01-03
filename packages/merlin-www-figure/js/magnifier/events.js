'use strict';

import {
    createEventTemplate
} from '@cnbritain/merlin-www-js-utils/js/functions';

export function close(target, eventData) {
    return createEventTemplate('close', target, eventData);
}

export function open(target, eventData) {
    return createEventTemplate('open', target, eventData);
}

export function resize(target, eventData) {
    return createEventTemplate('resize', target, eventData);
}
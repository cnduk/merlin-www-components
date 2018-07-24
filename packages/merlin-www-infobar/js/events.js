'use strict';

import {
    createEventTemplate
} from '@cnbritain/merlin-www-js-utils/js/functions';

export function linkClick(emitter, linkType) {
    return createEventTemplate('linkClick', emitter, {
        linkType: linkType
    });
}
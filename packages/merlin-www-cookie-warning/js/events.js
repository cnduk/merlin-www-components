'use strict';

import { createEventTemplate } from '@cnbritain/merlin-www-js-utils/js/functions';

function visibilitychange(emitter, state){
    return createEventTemplate('visibilitychange', emitter, {
        state: state
    });
}

function remove(emitter){
    return createEventTemplate('remove', emitter);
}

function limitexceeded(emitter){
    return createEventTemplate('limitexceeded', emitter);
}

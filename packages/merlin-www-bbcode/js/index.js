'use strict';

import img from '@cnbritain/merlin-www-image';
import initTimedContent from './timed-content';
import initConsent, { hydrate } from './consent';

export default {
    /**
     * Initialises any timed-content blocks we find on a page...
     */
    'init': function() {
        img.init();
        initTimedContent();
        initConsent();
    },
    'hydrateConsent': hydrate
};

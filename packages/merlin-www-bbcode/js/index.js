'use strict';

import img from '@cnbritain/merlin-www-image';
import initTimedContent from './timed-content';

export default {
    /**
     * Initialises any timed-content blocks we find on a page...
     */
    'init': function() {
        img.init();
        initTimedContent();
    }
};

'use strict';

/**
 * @module image
 */

import lazySizes from 'lazysizes';

//IE Polyfill for picture element
import 'lazysizes/plugins/respimg/ls.respimg';

// Make sure we dont auto trigger lazySizes instantly
lazySizes.cfg.init = false;
// Marker for the lazyload image
lazySizes.cfg.lazyClass = 'c-image--lazyload';
// Marker for the images to be preloaded after load
lazySizes.cfg.preloadClass = 'c-image--lazypreload';
// Class to be applied when loading
lazySizes.cfg.loadingClass = 'c-image--lazyload-loading';
// Class to be applied when loaded
lazySizes.cfg.loadedClass = 'c-image--lazyload-loaded';

export default {
    /**
     * Initialises the loading of images
     */
    'init': function () {
        lazySizes.init();
    }
};
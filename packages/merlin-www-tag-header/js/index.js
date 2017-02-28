"use strict";

import ShowItemCarousel from '@cnbritain/merlin-www-show-card-carousel';

export default {
    'init': function() {
        var showCarouselEl = document.querySelector('.sh-item-carousel');
        if (showCarouselEl) {
            var showCarousel = new ShowItemCarousel(showCarouselEl);
            showCarousel._init();
        }
    }
};
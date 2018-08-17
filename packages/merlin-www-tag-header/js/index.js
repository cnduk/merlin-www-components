'use strict';

import {
    addEventOnce,
    removeClass
} from '@cnbritain/merlin-www-js-utils/js/functions';
import ShowItemCarousel from '@cnbritain/merlin-www-show-card-carousel';

export default {

    'init': function() {
        var showCarouselEl = document.querySelector('.sh-item-carousel');
        if (showCarouselEl) {
            var showCarousel = new ShowItemCarousel(showCarouselEl);
        }

        var tgHeaderExpandBtn = document.querySelector(
            '.js-tg-header__expand-btn');
        if (tgHeaderExpandBtn) {
            addEventOnce(tgHeaderExpandBtn, 'click', this.expand.bind(this));
        }
    },

    'expand': function() {
        removeClass(
            document.querySelector('.js-tg-header__description'), 'is-closed');
    }

};
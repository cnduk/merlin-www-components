'use strict';

import {
    ajax
} from '@cnbritain/merlin-www-js-utils/js/functions';

import Infobar from './infobar';

var INFOBAR = null;

export default {
    init: function(el) {
        INFOBAR = new Infobar(el);
    },

    get: function() {
        return INFOBAR;
    },

    lazyLoad: function() {
        var lazyLoadEl = document.querySelector('.js-c-infobar-lazy-load');

        if (!lazyLoadEl) return Promise.resolve(null);

        return new Promise(function(resolve) {
            var url = '/xhr/infobar';
            var referrer = document.referrer;

            if (referrer) {
                url += `?referrer=${referrer}`;
            }

            ajax({url: url}).then(function(data) {
                var request = data.request;
                var responseText = request.responseText;
                var jsonResponseText = JSON.parse(responseText);

                var html = jsonResponseText.data.template;

                lazyLoadEl.innerHTML = html;

                this.init(document.querySelector('.js-c-infobar'));

                resolve(INFOBAR);
            }.bind(this));
        }.bind(this));
    }
}
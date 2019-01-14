'use strict';

import EventEmitter from 'eventemitter2';
import {inherit} from '@cnbritain/merlin-www-js-utils/js/functions';
import Newsletter from './newsletter';

function NewsletterManager() {
    EventEmitter.call(this, {
        'wildcard': true
    });

    this.newsletters = [];
}

NewsletterManager.prototype = inherit(EventEmitter.prototype, {
    _handleNewsletterEvents: function _handleNewsletterEvents(eventType, e) {
        if (e.bubbles) this.emit(eventType, e);
    },

    init: function() {
        var newsletterEls = document.querySelectorAll('.js-bb-newsletter');
        for (var i = 0; i < newsletterEls.length; i++) {
            if (!newsletterEls[i].hasAttribute('data-initialised')) {
                var newsletter = new Newsletter(newsletterEls[i]);
                newsletter.onAny(this._handleNewsletterEvents.bind(this));

                this.newsletters.push(newsletter);
            }
        }
    }
});

export default new NewsletterManager();

'use strict';

import EventEmitter from 'eventemitter2';
import {ajax, inherit} from '@cnbritain/merlin-www-js-utils/js/functions';
import {load} from './events';
import SubscribeBar from './subscribe-bar';

// Events
// Loaded
// Open
// Close

function SubscribeBarManager() {
    EventEmitter.call(this, {
        'wildcard': true
    });

    this.isLoaded = false;
    this.subscribeBar = null;
}

SubscribeBarManager.prototype = inherit(EventEmitter.prototype, {

    _handleSubscribeBarEvents: function _handleSubscribeBarEvents(eventType, e) {
        if(e.bubbles) this.emit(eventType, e);
    },

    lazyload: function lazyload() {
        if(this.isLoaded) return;

        // Check if we have the lazyload element
        var lazyLoadEl = document.querySelector('.js-c-subscribe-bar-lazy-load');
        if (!lazyLoadEl) {
            this.isLoaded = true;
            this.emit('load', load(this));
            return;
        }

        // Build xhr url. We need to send the referrer if one is set.
        var url = '/xhr/subscribe-bar';

        ajax({url: url})
            .then(function onLazyload(data) {
                this.isLoaded = true;

                var jsonResponseText = JSON.parse(data.request.responseText);
                var html = jsonResponseText.data.template;
                lazyLoadEl.innerHTML = html;
                this.subscribeBar = new SubscribeBar(
                    document.querySelector('.js-c-subscribe-bar'));

                this.subscribeBar.onAny(this._handleSubscribeBarEvents.bind(this));
                this.subscribeBar.init();

                this.emit('load', load(this));
            }.bind(this), function onLazyloadFail() {
                this.isLoaded = true;

                this.emit('load', load(this));
            }.bind(this));
    }

});

export default SubscribeBarManager;

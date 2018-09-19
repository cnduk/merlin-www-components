'use strict';

import EventEmitter from 'eventemitter2';
import {ajax, inherit} from '@cnbritain/merlin-www-js-utils/js/functions';
import {load} from './events';
import Infobar from './infobar';

// Events
// Loaded
// Open
// Close

function InfobarManager() {
    EventEmitter.call(this, {
        'wildcard': true
    });

    this.isLoaded = false;
    this.infobar = null;
}

InfobarManager.prototype = inherit(EventEmitter.prototype, {

    _handleInfobarEvents: function _handleInfobarEvents(eventType, e){
        if(e.bubbles) this.emit(eventType, e);
    },

    lazyload: function lazyload(){
        if(this.isLoaded) return;

        // Check if we have the lazyload element
        var lazyLoadEl = document.querySelector('.js-c-infobar-lazy-load');
        if (!lazyLoadEl){
            this.isLoaded = true;
            return;
        }

        // Build xhr url. We need to send the referrer if one is set.
        var url = '/xhr/infobar';
        if (document.referrer) {
            url +='?referrer=' + encodeURIComponent(document.referrer);
        }

        ajax({url: url})
            .then(function onLazyload(data) {
                this.isLoaded = true;

                var jsonResponseText = JSON.parse(data.request.responseText);
                var html = jsonResponseText.data.template;
                lazyLoadEl.innerHTML = html;
                this.infobar = new Infobar(
                    document.querySelector('.js-c-infobar'));

                this.emit('load', load(this));
                this.infobar.onAny(this._handleInfobarEvents.bind(this));
                this.infobar.init();
            }.bind(this));
    }

});

export default InfobarManager;

'use strict';

import EventEmitter from 'eventemitter2';
import {inherit} from '@cnbritain/merlin-www-js-utils/js/functions';
import {loadConfig, post} from './utils';
import {load} from './events';
import Infobar from './infobar';

function InfobarManager() {
    EventEmitter.call(this, {wildcard: true});

    this.isLoaded = false;
    this.infobar = null;
}

InfobarManager.prototype = inherit(EventEmitter.prototype, {

    _handleInfobarEvents: function _handleInfobarEvents(eventType, e){
        if(e.bubbles) this.emit(eventType, e);
    },

    lazyload: function lazyload(){
        // Already loaded
        if(this.isLoaded) return;

        // Check if we have the lazyload element
        var lazyLoadEl = document.querySelector('.js-c-infobar-lazy-load');
        if (!lazyLoadEl){
            this.isLoaded = true;
            this.emit('load', load(this));
            return;
        }

        // Load the infobar config
        var config = loadConfig();

        var postData = {
            location: window.location.href,
            message_history: config.messages
        };
        if(document.referrer){
            postData.referrer = document.referrer;
        }

        post('/xhr/infobar', postData)
            .then(function onLazyload(data) {
                this.isLoaded = true;

                var jsonResponseText = JSON.parse(data.request.responseText);
                var html = jsonResponseText.data.template;
                lazyLoadEl.innerHTML = html;
                this.infobar = new Infobar(
                    document.querySelector('.js-c-infobar'));

                this.infobar.onAny(this._handleInfobarEvents.bind(this));
                this.infobar.init();

                this.emit('load', load(this));
            }.bind(this), function onLazyloadFail() {
                this.isLoaded = true;
                this.emit('load', load(this));
            }.bind(this));
    }

});

export default InfobarManager;

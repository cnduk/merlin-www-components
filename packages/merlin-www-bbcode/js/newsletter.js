'use strict';

import EventEmitter from 'eventemitter2';
import {
    addClass,
    addEvent,
    createEventTemplate,
    inherit,
    removeClass,
} from '@cnbritain/merlin-www-js-utils/js/functions';

var IS_HIDDEN_CLS = 'is-hidden';

function Newsletter(el) {
    EventEmitter.call(this);

    this.el = el;

    this.formEl = el.querySelector('.js-bb-newsletter__form');
    this.emailEl = el.querySelector('.js-bb-newsletter__form-text');

    this.contentEl = el.querySelector('.js-bb-newsletter__content');

    this.statusEl = el.querySelector('.js-bb-newsletter__status');
    this.failureEl = el.querySelector('.js-bb-newsletter__failure');
    this.successEl = el.querySelector('.js-bb-newsletter__success');

    addEvent(this.formEl, 'submit', this.onSubmit.bind(this));

    addEvent(this.emailEl, 'blur', function() {
        if (this.checkValidity()) {
            removeClass(this, 'has-error');
        }

        else {
            addClass(this, 'has-error');
        }
    });

    this.el.setAttribute('data-initialised', true);
}

Newsletter.prototype = inherit(EventEmitter.prototype, {

    init: function() {

    },

    onSubmit: function(e) {
        e.preventDefault();

        var formData = new FormData(e.target);

        addClass(this.contentEl, IS_HIDDEN_CLS);
        removeClass(this.statusEl, IS_HIDDEN_CLS);
        removeClass(this.successEl, IS_HIDDEN_CLS);

        var xhr = new XMLHttpRequest();

        xhr.open('POST', '/xhr/newsletters', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    this.emit('signup', signup(this));
                }

                else {
                    // console.log('signup failure');
                }
            }
        }.bind(this);
        xhr.send('email=' + formData.get('email') + '&newsletter=' + formData.get('newsletter'));
    }
});

function signup(emitter) {
    return createEventTemplate('signup', emitter, {
        'bubbles': true
    });
}

export default Newsletter;
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
    this.buttonEl = el.querySelector('.js-bb-newsletter__form-button');

    this.contentEl = el.querySelector('.js-bb-newsletter__content');

    this.statusEl = el.querySelector('.js-bb-newsletter__status');
    this.failureEl = el.querySelector('.js-bb-newsletter__failure');
    this.successEl = el.querySelector('.js-bb-newsletter__success');

    addEvent(this.formEl, 'submit', this.onSubmit.bind(this));

    addEvent(this.emailEl, 'blur', function() {
        if (this.checkValidity()) {
            removeClass(this, 'has-error');
        } else {
            addClass(this, 'has-error');
        }
    });

    this.el.setAttribute('data-initialised', true);
}

Newsletter.prototype = inherit(EventEmitter.prototype, {
    onSubmit: function(e) {
        e.preventDefault();

        // Need to generate date before disabling as the value is not added
        // to the FormData object
        var formData = new FormData(e.target);
        this.emailEl.setAttribute('disabled', true);
        this.buttonEl.setAttribute('disabled', true);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', e.target.getAttribute('action'), true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                addClass(this.contentEl, IS_HIDDEN_CLS);
                removeClass(this.statusEl, IS_HIDDEN_CLS);
                if (xhr.status === 200) {
                    removeClass(this.successEl, IS_HIDDEN_CLS);
                    this.emit('signup', signup(this));
                } else {
                    removeClass(this.failureEl, IS_HIDDEN_CLS);
                }
            }
        }.bind(this);
        xhr.send(formData);
    }
});

function signup(emitter) {
    return createEventTemplate('signup', emitter, {
        'bubbles': true
    });
}

export default Newsletter;
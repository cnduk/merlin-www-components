'use strict';

import EventEmitter from 'eventemitter2';
import {
    addEvent,
    addClass,
    removeClass,
    inherit,
} from '@cnbritain/merlin-www-js-utils/js/functions';

function Newsletter(el) {
    EventEmitter.call(this);

    this.el = el;

    this.formEl = el.querySelector('.js-bb-newsletter__form');
    this.emailEl = el.querySelector('.js-bb-newsletter__form-text');

    addEvent(this.formEl, 'submit', this.onSubmit.bind(this));

    addEvent(this.emailEl, 'blur', function() {
        if (this.checkValidity()) {
            removeClass(this, 'has-error');
        }

        else {
            addClass(this, 'has-error');
        }
    });
}

Newsletter.prototype = inherit(EventEmitter.prototype, {

    init: function() {

    },

    onSubmit: function(e) {
        e.preventDefault();

        var formData = new FormData(e.target);

        var xhr = new XMLHttpRequest();

        xhr.open('POST', '/xhr/newsletters', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    console.log('success');
                    // TODO
                    // Render Success
                }

                else {
                    console.log('failure');
                    // TODO
                    // Render Failure
                }
            }
        }.bind(this);
        xhr.send('email=' + formData.get('email') + '&newsletter=' + formData.get('newsletter'));
    }
});

export default Newsletter;
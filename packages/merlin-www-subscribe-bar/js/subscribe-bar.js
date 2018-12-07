'use strict';

import EventEmitter from 'eventemitter2';
import {
    getCookie,
    inherit,
    setCookie
} from '@cnbritain/merlin-www-js-utils/js/functions';
import NAV from '@cnbritain/merlin-www-main-navigation';
import * as events from './events';

var IS_HIDDEN_CLS = 'is-hidden';
var IS_FIXED_CLS = 'is-fixed';
var IS_DISABLED_CLS = 'is-disabled';

var COOKIE_PAGE_VIEW_DATE = 'cnd_subscribe_bar_pageview_date';
var COOKIE_HASH = 'cnd_subscribe_bar_hash';

function SubscribeBar(el) {
    EventEmitter.call(this);

    this.el = el;

    if (!this.el) {
        throw new Error('Subscribe Bar Element Not Found');
    }

    this.state = {
        isHidden: false,
        isFixed: false,
        isEnabled: false
    };

    this.emailEl = el.querySelector('.js-c-subscribe-bar__form-text');

    this.contentEl = el.querySelector('.js-c-subscribe-bar__content');

    this.statusEl = el.querySelector('.js-c-subscribe-bar__status');
    this.spinnerEl = el.querySelector('.js-c-subscribe-bar__spinner');
    this.successEl = el.querySelector('.js-c-subscribe-bar__success-message');
    this.failureEl = el.querySelector('.js-c-subscribe-bar__failure-message');

    this.formButtonEl = el.querySelector('.js-c-subscribe-bar__form-button');
    this.closeButtonEls = el.querySelectorAll('.js-c-subscribe-bar__close-button');

    this.configEl = el.querySelector('.js-c-subscribe-bar-config');

    if (!this.configEl) {
        throw new Error('Subscribe Bar Config Not Found.');
    }

    this.config = this.configEl.innerHTML;
    this.config = JSON.parse(this.config);

    this.previousHash = getCookie('cnd_subscribe_bar_hash');
    this.currentHash = this.config['hash'];

    this.formButtonEl.addEventListener('click', this.onSubmit.bind(this));

    for (var i = 0; i < this.closeButtonEls.length; i++) {
        this.closeButtonEls[i].addEventListener('click', this.disable.bind(this));
    }

    this.emailEl.addEventListener('invalid', this.invalid.bind(this));

    if (NAV) {
        NAV.on('show', this.show.bind(this));
        NAV.on('hide', this.hide.bind(this));
        NAV.on('fix', this.fix.bind(this));
        NAV.on('unfix', this.unfix.bind(this));
    }
}

SubscribeBar.prototype = inherit(EventEmitter.prototype, {

    init: function() {
        if (this.previousHash !== this.currentHash) {
            setCookie(COOKIE_HASH, this.currentHash);
            setCookie(COOKIE_PAGE_VIEW_DATE, false);
        }

        var viewDateCookie = getCookie(COOKIE_PAGE_VIEW_DATE);
        if (viewDateCookie === null || viewDateCookie === 'false') {
            this.enable();
        }
    },

    show: function() {
        if (!this.state.isHidden) return;

        this.el.classList.remove(IS_HIDDEN_CLS);
        this.state.isHidden = false;

        this.emit('show', events.show(this));
    },

    hide: function() {
        if (this.state.isHidden) return;

        this.el.classList.add(IS_HIDDEN_CLS);
        this.state.isHidden = true;

        this.emit('hide', events.hide(this));
    },

    fix: function() {
        if (this.state.isFixed) return;

        this.el.classList.add(IS_FIXED_CLS);
        this.state.isFixed = true;

        this.emit('fix', events.fix(this));
    },

    unfix: function() {
        if (!this.state.isFixed) return;

        this.el.classList.remove(IS_FIXED_CLS);
        this.state.isFixed = false;

        this.emit('unfix', events.unfix(this));
    },

    enable: function() {
        if (this.state.isEnabled) return;

        this.el.classList.remove(IS_DISABLED_CLS);
        this.state.isEnabled = true;

        this.emit('enable', events.enable(this));
    },

    disable: function() {
        if (!this.state.isEnabled) return;

        this.el.classList.add(IS_DISABLED_CLS);
        this.state.isEnabled = false;

        setCookie(COOKIE_PAGE_VIEW_DATE, true, 30);

        this.emit('disable', events.disable(this));
    },

    invalid: function(e) {
        e.preventDefault();
        this.emailEl.classList.add('has-error');
    },

    onSubmit: function(e) {
        e.preventDefault();

        this.emailEl.classList.remove('has-error');

        var email = this.emailEl.value;

        if (!email) {
            this.emailEl.classList.add('has-error');
            return false;
        }

        this.contentEl.classList.add('is-hidden');
        this.statusEl.classList.remove('is-hidden');

        var xhr = new XMLHttpRequest();

        xhr.open('POST', '/xhr/newsletters', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        var that = this;

        xhr.onreadystatechange = function() {
            if(this.readyState == XMLHttpRequest.DONE) {
                that.spinnerEl.classList.add('is-hidden');

                if (this.status == 200) {
                    var responseText = JSON.parse(this.responseText);
                    if (responseText.success) {
                        that.successEl.classList.remove('is-hidden');
                    }
                }

                else {
                    that.failureEl.classList.remove('is-hidden');
                }
            }
        };
        xhr.send(`email=${email}`);
    }
});

export default SubscribeBar;
'use strict';

import EventEmitter from 'eventemitter2';
import {
    addEvent,
    addClass,
    removeClass,
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
var COOKIE_CONVERTED = 'cnd_subscribe_bar_converted';

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

    this.formEl = el.querySelector('.js-c-subscribe-bar__form');
    this.emailEl = el.querySelector('.js-c-subscribe-bar__form-text');

    this.contentEl = el.querySelector('.js-c-subscribe-bar__content');

    this.statusEl = el.querySelector('.js-c-subscribe-bar__status');
    this.spinnerEl = el.querySelector('.js-c-subscribe-bar__spinner');
    this.successEl = el.querySelector('.js-c-subscribe-bar__success-message');
    this.failureEl = el.querySelector('.js-c-subscribe-bar__failure-message');

    this.closeButtonEls = el.querySelectorAll('.js-c-subscribe-bar__close-button');

    var configEl = el.querySelector('.js-c-subscribe-bar-config');
    if (!configEl) {
        throw new Error('Subscribe Bar Config Not Found.');
    }
    this.config = JSON.parse(configEl.innerHTML);

    this.previousHash = getCookie('cnd_subscribe_bar_hash');
    this.currentHash = this.config['hash'];

    addEvent(this.formEl, 'submit', this.onSubmit.bind(this));

    for (var i = 0; i < this.closeButtonEls.length; i++) {
        addEvent(this.closeButtonEls[i], 'click', this.disable.bind(this));
    }

    addEvent(this.emailEl, 'blur', function(){
        if(this.checkValidity()){
            removeClass(this, 'has-error');
        } else {
            addClass(this, 'has-error');
        }
    });

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

        var convertedCookie = getCookie(COOKIE_CONVERTED);
        if (convertedCookie) {
            return;
        }

        var viewDateCookie = getCookie(COOKIE_PAGE_VIEW_DATE);
        if (viewDateCookie === null || viewDateCookie === 'false') {
            this.enable();
        }
    },

    show: function() {
        if (!this.state.isHidden) return;

        removeClass(this.el, IS_HIDDEN_CLS);
        this.state.isHidden = false;

        this.emit('show', events.show(this));
    },

    hide: function() {
        if (this.state.isHidden) return;

        addClass(this.el, IS_HIDDEN_CLS);
        this.state.isHidden = true;

        this.emit('hide', events.hide(this));
    },

    fix: function() {
        if (this.state.isFixed) return;

        addClass(this.el, IS_FIXED_CLS);
        this.state.isFixed = true;

        this.emit('fix', events.fix(this));
    },

    unfix: function() {
        if (!this.state.isFixed) return;

        removeClass(this.el, IS_FIXED_CLS);
        this.state.isFixed = false;

        this.emit('unfix', events.unfix(this));
    },

    enable: function() {
        if (this.state.isEnabled) return;

        removeClass(this.el, IS_DISABLED_CLS);
        this.state.isEnabled = true;

        this.emit('enable', events.enable(this));
    },

    disable: function() {
        if (!this.state.isEnabled) return;

        addClass(this.el, IS_DISABLED_CLS);
        this.state.isEnabled = false;

        setCookie(COOKIE_PAGE_VIEW_DATE, true, 30);

        this.emit('disable', events.disable(this));
    },

    onSubmit: function(e) {
        e.preventDefault();

        var email = this.emailEl.value;

        addClass(this.contentEl, IS_HIDDEN_CLS);
        removeClass(this.statusEl, IS_HIDDEN_CLS);

        var xhr = new XMLHttpRequest();

        xhr.open('POST', '/xhr/newsletters', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = function() {
            if(xhr.readyState == XMLHttpRequest.DONE) {
                addClass(this.spinnerEl, IS_HIDDEN_CLS);

                if (xhr.status === 200) {
                    removeClass(this.successEl, IS_HIDDEN_CLS);
                    setCookie(COOKIE_CONVERTED, true, 30);
                } else {
                    removeClass(this.failureEl, IS_HIDDEN_CLS);
                }
            }
        }.bind(this);
        xhr.send('email=' + email);
    }
});

export default SubscribeBar;
'use strict';

import EventEmitter from 'eventemitter2';
import {
    addEvent,
    addClass,
    inherit,
    removeClass,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';
import NAV from '@cnbritain/merlin-www-main-navigation';
import {VIEW_LIMIT} from './constants';
import {loadConfig, saveConfig} from './utils';
import * as events from './events';

var IS_HIDDEN_CLS = 'is-hidden';
var IS_FIXED_CLS = 'is-fixed';
var IS_DISABLED_CLS = 'is-disabled';

function SubscribeBar(el) {
    EventEmitter.call(this);

    // Check we have an element
    if(!el) throw new Error('Subscribe Bar Element Not Found');
    this.el = el;

    // Check we have a config
    this.currentConfigHash = null;
    this.parseConfig();

    // Get elements
    this.formEl = el.querySelector('.js-c-subscribe-bar__form');
    this.emailEl = el.querySelector('.js-c-subscribe-bar__form-text');
    this.contentEl = el.querySelector('.js-c-subscribe-bar__content');
    this.statusEl = el.querySelector('.js-c-subscribe-bar__status');
    this.spinnerEl = el.querySelector('.js-c-subscribe-bar__spinner');
    this.successEl = el.querySelector('.js-c-subscribe-bar__success-message');
    this.failureEl = el.querySelector('.js-c-subscribe-bar__failure-message');
    this.closeButtonEls = el.querySelectorAll(
        '.js-c-subscribe-bar__close-button');

    this.state = {
        isHidden: false,
        isFixed: false,
        isEnabled: false
    };

    this._submitListener = null;
    this._disableListener = null;
    this._blurListener = null;
    this.bindListeners();

    if (NAV) {
        NAV.on('show', this.show.bind(this));
        NAV.on('hide', this.hide.bind(this));
        NAV.on('fix', this.fix.bind(this));
        NAV.on('unfix', this.unfix.bind(this));
    }
}

SubscribeBar.prototype = inherit(EventEmitter.prototype, {

    bindListeners: function bindListeners(){
        this._submitListener = this.onSubmit.bind(this);
        addEvent(this.formEl, 'submit', this._submitListener);

        this._disableListener = this.disable.bind(this);
        for (var i = 0; i < this.closeButtonEls.length; i++) {
            addEvent(this.closeButtonEls[i], 'click', this._disableListener);
        }

        this._blurListener = this.onBlur.bind(this);
        addEvent(this.emailEl, 'blur', this._blurListener);
    },

    unbindListeners: function unbindListeners(){
        removeEvent(this.formEl, 'submit', this._submitListener);
        this._submitListener = null;

        for (var i = 0; i < this.closeButtonEls.length; i++) {
            removeEvent(this.closeButtonEls[i], 'click', this._disableListener);
        }
        this._disableListener = null;

        removeEvent(this.emailEl, 'blur', this._blurListener);
        this._blurListener = null;
    },

    parseConfig: function parseConfig(){
        // Check we have a config
        var configEl = this.el.querySelector('.js-c-subscribe-bar-config');
        if (!configEl) throw new Error('Subscribe Bar Config Not Found.');
        try {
            this.config = JSON.parse(configEl.innerHTML);
        } catch(err){
            console.error('Error parsing subscribe bar config!');
            throw err;
        }

        this.currentConfigHash = this.config.hash;
    },

    init: function() {
        var savedConfig = loadConfig();

        // Check if the user has converted
        if(savedConfig.converted){
            this.disable();

        // Check if the config hash has changed
        } else if(savedConfig.configHash !== this.currentConfigHash){
            saveConfig(this.currentConfigHash, false, 1);
            this.enable();

        // Check if the user has exceeded views
        } else if(savedConfig.viewExceeded){
            this.disable();

        // User should see the message and bump view count
        } else {
            saveConfig(
                this.currentConfigHash, false, savedConfig.viewCount + 1);
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

        var savedConfig = loadConfig();
        saveConfig(
            savedConfig.configHash, savedConfig.converted, VIEW_LIMIT);

        this.emit('disable', events.disable(this));
    },

    onSubmit: function(e) {
        e.preventDefault();

        var formData = new FormData(e.target);

        addClass(this.contentEl, IS_HIDDEN_CLS);
        removeClass(this.statusEl, IS_HIDDEN_CLS);

        var xhr = new XMLHttpRequest();

        xhr.open('POST', '/xhr/newsletters', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                addClass(this.spinnerEl, IS_HIDDEN_CLS);

                if (xhr.status === 200) {
                    removeClass(this.successEl, IS_HIDDEN_CLS);
                    setCookie(COOKIE_CONVERTED, true, 30);
                    this.emit('signup', events.signup(this));
                } else {
                    removeClass(this.failureEl, IS_HIDDEN_CLS);
                }
            }
        }.bind(this);
        xhr.send('email=' + formData.get('email') + '&newsletter=' + formData.get('newsletter'));
    }

    onBlur: function(e){
        if (e.target.checkValidity()) {
            removeClass(e.target, 'has-error');
        } else {
            addClass(e.target, 'has-error');
        }
    }

});

export default SubscribeBar;
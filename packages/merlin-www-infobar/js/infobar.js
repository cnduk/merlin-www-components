'use strict';

import EventEmitter from 'eventemitter2';
import {
    addEvent,
    inherit,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';
import NAV from '@cnbritain/merlin-www-main-navigation';
import * as constants from './constants';
import * as events from './events';
import {saveConfig, loadConfig} from './utils';


function Infobar(el) {
    EventEmitter.call(this);

    // Check we have the element
    if (!el) throw new Error('Infobar Element Not Found');
    this.el = el;

    // Check we have a config
    this.currentConfigHash = null;
    this.currentMessageHash = null;
    this.parseConfig();

    // Grab other needed elements
    this.messageEl = el.querySelector('.js-c-infobar__message');
    this.buttonEl = el.querySelector('.js-c-infobar__button');
    this.closeButtonEl = el.querySelector('.js-c-infobar__close-button');

    this.state = {
        isHidden: false,
        isFixed: false,
        isEnabled: false
    };

    this._elementListener = null;
    this._closeButtonListener = null;
    this.bindListeners();

    if (NAV) {
        NAV.on('show', this.show.bind(this));
        NAV.on('hide', this.hide.bind(this));
        NAV.on('fix', this.fix.bind(this));
        NAV.on('unfix', this.unfix.bind(this));
    }
}

Infobar.prototype = inherit(EventEmitter.prototype, {

    bindListeners: function bindListeners(){
        this._elementListener = this.onClick.bind(this);
        addEvent(this.el, 'click', this._elementListener);

        this._closeButtonListener = this.disable.bind(this);
        addEvent(this.closeButtonEl, 'click', this._closeButtonListener);
    },

    unbindListeners: function unbindListeners(){
        removeEvent(this.el, 'click', this._elementListener);
        this._elementListener = null;
        removeEvent(this.closeButtonEl, 'click', this._closeButtonListener);
        this._closeButtonListener = null;
    },

    parseConfig: function parseConfig(){
        // Check we have a config
        var configEl = this.el.querySelector('.js-c-infobar-config');
        if (!configEl) throw new Error('Infobar Config Not Found.');
        try {
            this.config = JSON.parse(configEl.innerHTML);
        } catch(err){
            console.error('Error parsing infobar config!');
            throw err;
        }
        // Set the values
        this.currentConfigHash = this.config.config_hash;
        this.currentMessageHash = this.config.message_hash;
    },

    init: function init(){
        var savedConfig = loadConfig();

        // Check if the config hash has changed
        if(savedConfig.configHash !== this.currentConfigHash){
            savedConfig.messages = {};
            savedConfig.messages[this.currentMessageHash] = 1;
            saveConfig(this.currentConfigHash, savedConfig.messages);
            this.enable();

        // Check if the user has closed this message
        } else if(savedConfig.messages[this.currentMessageHash] === false){
            this.disable();

        // User is seeing the infobar
        } else {
            savedConfig.messages[this.currentMessageHash]++;
            saveConfig(this.currentConfigHash, savedConfig.messages);
            this.enable();
        }
    },

    show: function() {
        if (!this.state.isHidden) return;

        this.el.classList.remove(constants.IS_HIDDEN_CLS);
        this.state.isHidden = false;

        this.emit('show', events.show(this));
    },

    hide: function() {
        if (this.state.isHidden) return;

        this.el.classList.add(constants.IS_HIDDEN_CLS);
        this.state.isHidden = true;

        this.emit('hide', events.hide(this));
    },

    fix: function() {
        if (this.state.isFixed) return;

        this.el.classList.add(constants.IS_FIXED_CLS);
        this.state.isFixed = true;

        this.emit('fix', events.fix(this));
    },

    unfix: function() {
        if (!this.state.isFixed) return;

        this.el.classList.remove(constants.IS_FIXED_CLS);
        this.state.isFixed = false;

        this.emit('unfix', events.unfix(this));
    },

    enable: function() {
        if (this.state.isEnabled) return;

        this.el.classList.remove(constants.IS_DISABLED_CLS);
        this.state.isEnabled = true;

        this.emit('enable', events.enable(this));
    },

    disable: function() {
        if (!this.state.isEnabled) return;

        this.el.classList.add(constants.IS_DISABLED_CLS);
        this.state.isEnabled = false;

        // Load the config, set the message to false so we know its been closed
        var config = loadConfig();
        config.messages[this.currentMessageHash] = false;
        saveConfig(this.currentConfigHash, config.messages);

        // Disable event to let other things know whats going on
        this.emit('disable', events.disable(this));
    },

    onClick: function(e) {
        if (e.target === this.messageEl) {
            this.emit('linkClick', events.linkClick(e.target, 'message'));
        }

        if (e.target === this.buttonEl) {
            this.emit('linkClick', events.linkClick(e.target, 'button'));
        }
    }
});

export default Infobar;
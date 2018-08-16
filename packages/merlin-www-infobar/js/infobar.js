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

var COOKIE_PAGE_VIEW_COUNT = 'cnd_infobar_pageview_count';
var COOKIE_HASH = 'cnd_infobar_hash';

function Infobar(el) {
    EventEmitter.call(this);

    this.el = el;

    if (!this.el) {
        throw new Error('Infobar Element Not Found');
    }

    this.state = {
        isHidden: false,
        isFixed: false,
        isEnabled: false
    };

    this.messageEl = el.querySelector('.js-c-infobar__message');
    this.buttonEl = el.querySelector('.js-c-infobar__button');
    this.closeButtonEl = el.querySelector('.js-c-infobar__close-button');

    this.configEl = el.querySelector('.js-c-infobar-config');

    if (!this.configEl) {
        throw new Error('Infobar Config Not Found.');
    }

    this.config = this.configEl.innerHTML;
    this.config = JSON.parse(this.config);

    this.pageviewLimit = this.config['pageview_limit'];

    this.previousHash = getCookie('cnd_infobar_hash');
    this.currentHash = this.config['hash'];

    if (this.previousHash !== this.currentHash) {
        setCookie(COOKIE_HASH, this.currentHash);

        this.pageviewCount = 0;
        setCookie(COOKIE_PAGE_VIEW_COUNT, this.pageviewCount);
    }

    else {
        this.pageviewCount = parseInt(getCookie(COOKIE_PAGE_VIEW_COUNT), 10);
    }

    if (this.pageviewCount < this.pageviewLimit) {
        this.pageviewCount += 1;
        setCookie(COOKIE_PAGE_VIEW_COUNT, this.pageviewCount);

        this.enable();
    }

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);

    this.fix = this.fix.bind(this);
    this.unfix = this.unfix.bind(this);

    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);

    this.onClick = this.onClick.bind(this);

    this.el.addEventListener('click', this.onClick);

    this.closeButtonEl.addEventListener('click', function() {
        this.disable();
    }.bind(this));

    if (NAV) {
        NAV.on('show', function() {
            this.show();
        }.bind(this));

        NAV.on('hide', function() {
            this.hide();
        }.bind(this));

        NAV.on('fix', function() {
            this.fix();
        }.bind(this));

        NAV.on('unfix', function() {
            this.unfix();
        }.bind(this));
    }
}

Infobar.prototype = inherit(EventEmitter.prototype, {
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

        this.emit('disable', events.disable(this));
    },

    onClick: function(e) {
        if (e.target == this.messageEl) {
            this.emit('linkClick', events.linkClick(e.target, 'message'));
        }

        if (e.target == this.buttonEl) {
            this.emit('linkClick', events.linkClick(e.target, 'button'));
        }
    }
});

export default Infobar;
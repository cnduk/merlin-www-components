'use strict';

import EventEmitter from 'eventemitter2';
import {
    getCookie,
    inherit,
    setCookie
} from "@cnbritain/merlin-www-js-utils/js/functions";
import * as events from './events';

var IS_HIDDEN_CLS = 'is-hidden';

var COOKIE_PAGE_VIEW_COUNT = 'cnd_infobar_pageview_count';
var COOKIE_HASH = 'cnd_infobar_hash';

function Infobar(el) {
    EventEmitter.call(this);

    this.el = el;

    if (!this.el) {
        throw new Error('Infobar Element Not Found');
    }

    this.state = {
        isHidden: true
    };

    this.messageEl = el.querySelector('.js-c-infobar__message');
    this.buttonEl = el.querySelector('.js-c-infobar__btn');

    this.configEl = el.querySelector('.js-c-infobar-config');
    this.config = this.configEl.innerHTML;
    this.config = JSON.parse(this.config);

    if (!this.config) {
        throw new Error('Infobar Config Not Found.');
    }

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

        this.show();
    }

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);

    this.onClick = this.onClick.bind(this);

    this.el.addEventListener('click', this.onClick);
}

Infobar.prototype = inherit(EventEmitter.prototype, {
    show: function() {
        if (!this.state.isHidden) return;

        this.el.classList.remove(IS_HIDDEN_CLS);
        this.state.isHidden = false;
    },

    hide: function() {
        if (this.state.isHidden) return;

        this.el.classList.add(IS_HIDDEN_CLS);
        this.state.isHidden = true;
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
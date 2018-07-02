'use strict';

import EventEmitter from 'eventemitter2';
import {inherit} from '@cnbritain/merlin-www-js-utils/js/functions';
import * as events from './events';

var IS_HIDDEN_CLS = 'is-hidden';
var IS_FIXED_CLS = 'is-fixed';
var IS_OPEN_CLS = 'is-open';

function GalleryNav(el) {
    EventEmitter.call(this, {
        'wildcard': true
    });

    this.el = el;
    this.state = {
        isListView: true,
        isGridView: false
    };

    this.galleryTitleEl = el.querySelector('.js-c-nav__gallery-title');

    this.galleryCountEl = el.querySelector('.js-c-nav__gallery-current');
    this.galleryTotalEl = el.querySelector('.js-c-nav__gallery-total');

    this.galleryIconEl = el.querySelector('.js-c-nav__gallery-icon');
    this.galleryListIconEl = this.galleryIconEl.querySelector('.js-c-nav__list-icon');
    this.galleryGridIconEl = this.galleryIconEl.querySelector('.js-c-nav__grid-icon');

    this.setTitle = this.setTitle.bind(this);
    this.setCount = this.setCount.bind(this);
    this.setTotal = this.setTotal.bind(this);

    this.showListView = this.showListView.bind(this);
    this.hideListView = this.hideListView.bind(this);
    this.toggleListView = this.toggleListView.bind(this);

    this.galleryIconEl.addEventListener('click', this.toggleListView);
}

GalleryNav.prototype = inherit(EventEmitter.prototype, {
    setTitle: function(value) {
        this.galleryTitleEl.innerHTML = value;
        this.galleryTitleEl.setAttribute('title', value);
    },

    setCount: function(value) {
        this.galleryCountEl.innerHTML = value;
    },

    setTotal: function(value) {
        this.galleryTotalEl.innerHTML = value;
    },

    toggleListView: function() {
        if (this.state.isListView) {
            this.hideListView();
        }

        else {
            this.showListView();
        }
    },

    showListView: function() {
        if (this.state.isListView) return;

        this.galleryListIconEl.classList.remove(IS_HIDDEN_CLS);
        this.galleryGridIconEl.classList.add(IS_HIDDEN_CLS);

        this.state.isListView = true;
        this.state.isGridView = false;

        this.emit('viewchange', events.viewchange(this, 'list'));
    },

    hideListView: function() {
        if (this.state.isGridView) return;

        this.galleryListIconEl.classList.add(IS_HIDDEN_CLS);
        this.galleryGridIconEl.classList.remove(IS_HIDDEN_CLS);

        this.state.isListView = false;
        this.state.isGridView = true;

        this.emit('viewchange', events.viewchange(this, 'grid'));
    },
});

export default GalleryNav
'use strict';

import EventEmitter from 'eventemitter2';
import {
    addClass,
    addEvent,
    inherit,
    removeClass
} from '@cnbritain/merlin-www-js-utils/js/functions';

import * as events from './events';

var CLS_GALLERY_TITLE = '.n-main__nav-title';
var CLS_GALLERY_COUNT = '.n-gallery-counter';
var CLS_GALLERY_COUNT_LABEL = '.n-gallery-counter__current';
var CLS_GALLERY_COUNT_MAX = '.n-gallery-counter__total';
var CLS_GALLERY_CLOSE = '.js-gallery-close';
var CLS_GALLERY_TOGGLE = '.n-gallery-toggle';
var CLS_GALLERY_TOGGLE_GRID = '.n-gallery-toggle--grid';
var CLS_GALLERY_TOGGLE_LIST = '.n-gallery-toggle--list';
var CLS_HIDDEN = 'global__hidden';

function GalleryNavigation(el, settings){
    EventEmitter.call(this, {'wildcard': true});

    this.el = el;

    this._galleryCountLabel = this.el.querySelector(CLS_GALLERY_COUNT_LABEL);
    this._galleryCountTotal = this.el.querySelector(CLS_GALLERY_COUNT_MAX);
    this._isGridView = false;

    this._init();
}

GalleryNavigation.prototype = inherit(EventEmitter.prototype, {

    _init: function _init(){
        addEvent(
            this.el.querySelector(CLS_GALLERY_TOGGLE), 'click',
            this._toggleView.bind(this));
    },

    constructor: GalleryNavigation,

    setGalleryCounter: function setGalleryCounter(current, max){
        this._galleryCountLabel.innerHTML = Number(current);

        if(max !== undefined){
            this._galleryCountTotal.innerHTML = Number(max)
        }
    },
    setArticleTitle: function setArticleTitle(title){
        var el = this.el.querySelector(CLS_GALLERY_TITLE);
        el.innerHTML = title;
        el.setAttribute('title', title);
    },
    setCloseUrl: function setCloseUrl(url){
        this.el.querySelector(CLS_GALLERY_CLOSE).setAttribute('href', url);
    },

    displayGridView: function displayGridView(){
        if(this._isGridView) return;
        this._isGridView = true;

        addClass(this.el.querySelector(CLS_GALLERY_TOGGLE_GRID), CLS_HIDDEN);
        removeClass(
            this.el.querySelector(CLS_GALLERY_TOGGLE_LIST), CLS_HIDDEN);
        addClass(this.el.querySelector(CLS_GALLERY_COUNT), CLS_HIDDEN);
        this.emit('viewchange', events.viewchange(this, 'grid'));
    },
    displayListView: function displayListView(){
        if(!this._isGridView) return;
        this._isGridView = false;

        removeClass(
            this.el.querySelector(CLS_GALLERY_TOGGLE_GRID), CLS_HIDDEN);
        addClass(this.el.querySelector(CLS_GALLERY_TOGGLE_LIST), CLS_HIDDEN);
        removeClass(this.el.querySelector(CLS_GALLERY_COUNT), CLS_HIDDEN);
        this.emit('viewchange', events.viewchange(this, 'list'));
    },

    _toggleView: function _toggleView(){
        if(this._isGridView){
            this.displayListView();
        } else {
            this.displayGridView();
        }
    }

});

export default GalleryNavigation;

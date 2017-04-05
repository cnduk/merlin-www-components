'use strict';

import EventEmitter from 'eventemitter2';
import {
    addEventOnce,
    getElementOffset,
    inherit,
    removeClass
} from '@cnbritain/merlin-www-js-utils/js/functions';
import { CLS_INFINITE_BTN, CLS_ARTICLE_GALLERY } from './constants';
import Gallery from './Gallery';
import {
    dispatchSimpleReach,
    dispatchSimpleReachStop,
    getArticleTitle,
    getArticleType,
    getArticleUrl,
    updateSocialEmbeds
} from './utils';
import * as events from './events';

function Article(el, _options){
    EventEmitter.call(this, {'wildcard': true});

    var options = _options || {};

    this._analytics = options.analytics || null;
    this._simplereach = options.simplereach || null;

    this.bounds = null;
    this.el = el;
    this.gallery = null;
    this.manager = options.manager;
    this.properties = {
        "title": getArticleTitle(this.el),
        "url": getArticleUrl(this.el)
    };
    this.type = getArticleType(this.el);

    this.isInfinite = options.infinite || false;

    this._init();
}

Article.prototype = inherit(EventEmitter.prototype, {

    "_init": function(){

        // If article has come from infinite scroll, trigger social embeds to
        // update as the article body might contain embeds.
        if(this.isInfinite) updateSocialEmbeds();

        // SimpleReach setup
        if(this.isInfinite){
            this.on('focus', this.emitSimpleReach.bind(this));
        } else {
            // SimpleReach is fired automatically in the page for the first
            // article. So we listen to the first focus and then after that we
            // have to trigger simplereach ourself.
            this.once('focus', function(){
                this.on('focus', this.emitSimpleReach.bind(this));
            }.bind(this));
        }

        // Check if the article contains a gallery
        var gallery = this.el.querySelector(CLS_ARTICLE_GALLERY);
        if(gallery){
            this.gallery = new Gallery(gallery);
            // Listen to when the article focuses or blurs so we can add and remove
            // the scroll listener as and when needed
            this.on('focus', function(){
                this.gallery.bindImageScrollListener();
                this.gallery.bindNavScrollListener();
                this.gallery.updateImageScroll();
                this.gallery.updateNavScroll();
            }.bind(this));
            this.on('blur', function(){
                this.gallery.unbindImageScrollListener();
                this.gallery.unbindNavScrollListener();
                this.gallery.updateImageScroll();
                this.gallery.updateNavScroll();
            }.bind(this));
        }

        // If the gallery has come in from infinite scroll, it will be wrapped up
        // in .a-infinite.is-closed. This will only display 3 images to prevent
        // loading a heck load. We listen once to the button click allowing
        // the gallery to expand
        if(this.isInfinite && this.gallery !== null){
            addEventOnce(
                this.el.parentNode.querySelector(CLS_INFINITE_BTN),
                'click',
                this.expand.bind(this)
            );
        }

    },

    "constructor": Article,

    "emitSimpleReach": function emitSimpleReach(){
        // Always fire a stop as at the moment we don't keep track if we're in
        // a simplereach article
        dispatchSimpleReachStop();
        if(this._simplereach !== null) dispatchSimpleReach(this._simplereach);
    },

    "expand": function(){
        removeClass(this.el.parentNode, 'is-closed');
        this.resize();
        this.emit('expand', events.expand(this));
    },

    "resize": function resize(){
        this.bounds = getElementOffset(this.el);
        if(this.gallery !== null) this.gallery.resize();
    }

});

export default Article;

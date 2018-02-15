'use strict';

import EventEmitter from 'eventemitter2';
import {
    addEventOnce,
    getElementOffset,
    inherit,
    removeClass
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    CLS_INFINITE_BTN,
    CLS_ARTICLE_GALLERY
} from './constants';
import Gallery from './Gallery';
import {
    bubbleEvent,
    getArticleTitle,
    getArticleType,
    getArticleUrl,
    updateSocialEmbeds
} from './utils';
import * as events from './events';

function Article(el, _options) {
    EventEmitter.call(this, {
        'wildcard': true
    });

    var options = _options || {};

    this.ads = options.ads || null;
    this.analytics = options.analytics || null;
    this.bounds = null;
    this.el = el;
    this.gallery = options.gallery || null;
    this.manager = options.manager;
    this.properties = null;
    this.simplereach = options.simplereach || null;
    this.type = getArticleType(this.el);
    this.isInfinite = options.infinite || false;

    this._init();
}

Article.prototype = inherit(EventEmitter.prototype, {

    '_bindBubblingEvents': function _bindBubblingEvents() {
        // Gallery
        if (this.gallery !== null) {
            bubbleEvent(this.gallery, this, 'viewchange');
            bubbleEvent(this.gallery, this, 'imagefocus');
            bubbleEvent(this.gallery, this, 'imageblur');
        }
    },

    '_getArticleProperties': function _getArticleProperties() {
        this.properties = {
            'title': getArticleTitle(this.el),
            'url': getArticleUrl(this.el)
        };
    },

    '_init': function _init() {

        // Due instagram being a crap script, we stop oembeds from loading
        // in their script and load it in once and trigger instagram.t
        updateSocialEmbeds();

        // Check if the article contains a gallery
        var gallery = this.el.querySelector(CLS_ARTICLE_GALLERY);
        if (this.gallery === null && gallery) {
            this.gallery = new Gallery(gallery, {
                parentArticle: this
            });
            // Listen to when the article focuses or blurs so we can add and remove
            // the scroll listener as and when needed
            this.on('focus', function() {
                this.gallery.bindImageScrollListener();
                this.gallery.bindNavScrollListener();
                this.gallery.updateImageScroll();
                this.gallery.updateNavScroll();
            }.bind(this));
            this.on('blur', function() {
                this.gallery.unbindImageScrollListener();
                this.gallery.unbindNavScrollListener();
                this.gallery.updateImageScroll();
                this.gallery.updateNavScroll();
            }.bind(this));
        } else {
            if (this.gallery !== null) {
                this.gallery.parentArticle = this;
            }
        }

        // If the gallery has come in from infinite scroll, it will be wrapped up
        // in .a-infinite.is-closed. This will only display 3 images to prevent
        // loading a heck load. We listen once to the button click allowing
        // the gallery to expand
        if (this.isInfinite && this.gallery !== null) {
            addEventOnce(
                this.el.querySelector(CLS_INFINITE_BTN),
                'click',
                this.expand.bind(this)
            );
        }

        this._bindBubblingEvents();
        this._getArticleProperties();
    },

    'constructor': Article,

    'expand': function() {
        removeClass(this.el.querySelector(CLS_ARTICLE_GALLERY), 'is-closed');
        this.resize();
        this.emit('expand', events.expand(this));
    },

    'resize': function resize() {
        this.bounds = getElementOffset(this.el);
        if (this.gallery !== null) this.gallery.resize();
    }

});

export default Article;
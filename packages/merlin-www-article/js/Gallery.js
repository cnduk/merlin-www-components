'use strict';

import EventEmitter from 'eventemitter2';
import {
    addClass,
    addEvent,
    addEventOnce,
    delegate,
    getElementOffset,
    getWindowScrollTop,
    hasClass,
    inherit,
    removeClass,
    removeEvent,
    throttle
} from '@cnbritain/merlin-www-js-utils/js/functions';
import ImageFigure from '@cnbritain/merlin-www-figure';

import Article from './Article';
import {
    CLS_INFINITE_BTN,
    CLS_IMAGE_NAVIGATION,
    CLS_ARTICLE_GALLERY_IMAGE,
    CLS_ARTICLE_GALLERY_VIEW_THUMBNAIL,
    CLS_ARTICLE_GALLERY_VIEW_LIST,
    CLS_ARTICLE_GALLERY_THUMBNAIL
} from './constants';
import * as events from './events';
import GalleryImageNavigation from './GalleryImageNavigation';
import ElementScroll from '@cnbritain/merlin-www-js-elementscroll';


var CLS_IS_HIDDEN = 'is-hidden';


/**
 * Gallery image has gained focus
 * @event Gallery#imagefocus
 * @type {Object}
 */

/**
 * Gallery image has blurred
 * @event Gallery#imageblur
 * @type {Object}
 */

/**
 * @Class Gallery
 * @param {HTMLElement}     el          Article Element 'a-main'
 * @param {Object}          options     Gallery options
 */
function Gallery(el, options) {
    EventEmitter.call(this, {'wildcard': true});

    /**
     * Index of the current image that has focus
     * @public
     * @type {Number}
     */
    this.focusedImageIndex = -1;

    this._hooks = {
        "imageScroll": null,
        "navScroll": null,
        "thumbnailClick": null
    };

    /**
     * The bounds of the gallery container
     * @alias galleryBounds
     * @private
     * @memberof! Gallery.prototype
     * @type {Object}
     */
    this.bounds = null;

    this._elementScroll = new ElementScroll(window);

    /**
     * Array of image positions
     * @private
     * @type {Array.<Object>}
     */
    this._imagePositions = null;

    /**
     * Window height half. Used by scroll listener
     * @private
     * @type {Number}
     */
    this._windowHeightHalf = Number.Infinity;

    this.el = el;

    /**
     * Items in the gallery - images and ads
     * @alias items
     * @public
     * @memberof! Gallery.prototype
     * @type {Array.HTMLElement}
     */
    // this.items = toArray(el.querySelectorAll('.a-gallery__images'));

    /**
     * Images in the gallery
     * @alias images
     * @public
     * @memberof! Gallery.prototype
     * @type {Array.HTMLElement}
     */
    this.imageElements = toArray(this.el.querySelectorAll(CLS_ARTICLE_GALLERY_IMAGE));

    /**
     * The gallery navigation arrows
     * @alias imageNavigation
     * @public
     * @memberof! Gallery.prototype
     * @type {GalleryImageNavigation}
     */
    this.imageNavigation = null;
    this._imageNavigationState = 'default';

    /**
     * The gallery section images
     * @alias section
     * @public
     * @memberof! Gallery.prototype
     * @type {HTMLElement}
     */
    this.section = this.el.querySelector('.a-gallery__section');

    this.layoutView = 'list';

    this._init();

}

Gallery.prototype = inherit(EventEmitter.prototype, {

    "constructor": Gallery,

    "_thumbnailClick": function(e){
        var dataIndex = parseInt(
            e.delegateTarget.getAttribute('data-thumbnail-index'), 10);
        var elImage = this.imageElements[dataIndex];

        this.displayListView();
        window.scrollTo(0, getElementOffset(elImage).top - 60);

        // TODO: check if we need this
        // this.resize();
    },

    "_init": function(){
        ImageFigure.init();

        // Image navigation create
        if (this.el.querySelector(CLS_IMAGE_NAVIGATION)) {
            this.imageNavigation = new GalleryImageNavigation(
                this.el.querySelector(CLS_IMAGE_NAVIGATION));
            this.imageNavigation.on('next', function(){
                this.gotoImage(this.focusedImageIndex + 1);
            }.bind(this));
            this.imageNavigation.on('previous', function(){
                this.gotoImage(this.focusedImageIndex - 1);
            }.bind(this));
        }

        // Thumbnail click jump
        this._hooks.thumbnailClick = delegate(
            CLS_ARTICLE_GALLERY_THUMBNAIL, this._thumbnailClick, this);
        addEvent(
            this.el.querySelector(CLS_ARTICLE_GALLERY_VIEW_THUMBNAIL),
            'click',
            this._hooks.thumbnailClick
        );

        this.resize();
    },

    /**
     * Resize calculates new bounds
     * @public
     * @memberof! Gallery.prototype
     */
    'resize': function resize(){
        this.bounds = getElementOffset(this.el);
        this._imagePositions = this.imageElements.map(getElementOffset);
        this._windowHeightHalf = window.innerHeight/2;
        if(this.imageNavigation !== null) this.imageNavigation.resize();

        this.updateImageScroll();
        this.updateNavScroll();
    },

    "bindNavScrollListener": function(){
        if(this.imageNavigation === null || this._hooks.navScroll !== null){
            return;
        }
        this._hooks.navScroll = this.updateNavScroll.bind(this);
        addEvent(window, 'scroll', this._hooks.navScroll);
    },

    "unbindNavScrollListener": function(){
        if(this.imageNavigation === null || this._hooks.navScroll === null){
            return;
        }
        removeEvent(window, 'scroll', this._hooks.navScroll);
        this._hooks.navScroll = null;
    },

    "updateNavScroll": function(){
        if(this.imageNavigation === null) return;

        // NOTE: 60 is the navigation height
        var scrollY = getWindowScrollTop();
        var top = this.bounds.top - 60;
        var bottom = this.bounds.bottom - 60 - this.imageNavigation.bounds.height;

        // Check if at bottom, set absolute
        if(scrollY >= bottom){
            if(this._imageNavigationState === 'absolute') return;
            this._imageNavigationState = 'absolute';
            setAbsolute(
                this.imageNavigation.el,
                (this.bounds.bottom - this.bounds.top - this.imageNavigation.bounds.height) + 'px'
            );
            return;
        }

        // Check if at top, recent to normal
        if(scrollY < top){
            if(this._imageNavigationState === 'default') return;
            this._imageNavigationState = 'default';
            setDefault(this.imageNavigation.el);
            return;
        }

        // Stay as fixed
        if(scrollY >= top){
            if(this._imageNavigationState === 'fixed') return;
            this._imageNavigationState = 'fixed';
            setFixed(this.imageNavigation.el, '60px');
        }
    },

    "gotoImage": function(imageIndex){
        var index = imageIndex;
        if(index < 0){
            index = 0;
        } else if(index > this.imageElements.length - 1){
            index = this.imageElements.length - 1;
        }

        if(index === this.focusedImageIndex) return;

        this._elementScroll.start({
            'x': 0,
            'y': this._imagePositions[index].top
        }, 300, {
            'offset': {
                'x': 0,
                'y': -60
            },
            'relative': false,
            'stopOnUserInput': false
        });
    },

    "bindImageScrollListener": function(){
        if(this._hooks.imageElementscroll !== null) return;
        this._hooks.imageElementscroll = throttle(this.updateImageScroll, 100, this);
        addEvent(window, 'scroll', this._hooks.imageElementscroll);
    },

    "unbindImageScrollListener": function(){
        if(this._hooks.scroll === null) return;
        removeEvent(window, 'scroll', this._hooks.imageElementscroll);
        this._hooks.imageElementscroll = null;
    },

    "updateImageScroll": function(){
        var scrollTop = getWindowScrollTop() + this._windowHeightHalf;

        var i = -1;
        var length = this._imagePositions.length;
        var tmpPosition = null;

        while(++i < length){
            tmpPosition = this._imagePositions[i];

            if(this.focusedImageIndex === i) continue;
            if(tmpPosition.top > scrollTop) continue;
            if(tmpPosition.bottom < scrollTop) continue;

            if(this.focusedImageIndex !== -1){
                this.emit(
                    'imageblur',
                    events.imageblur(this, this.focusedImageIndex)
                );
            }
            this.focusedImageIndex = i;
            this.emit(
                'imagefocus',
                events.imagefocus(this, this.focusedImageIndex)
            );

            // Update image navigation is set
            if(this.imageNavigation !== null){
                if(this.focusedImageIndex === 0){
                    this.imageNavigation.enableNextButton();
                    this.imageNavigation.disablePreviousButton();
                } else if(this.focusedImageIndex === this.imageElements.length - 1){
                    this.imageNavigation.enablePreviousButton();
                    this.imageNavigation.disableNextButton();
                } else {
                    this.imageNavigation.enableNextButton();
                    this.imageNavigation.enablePreviousButton();
                }
            }

            break;
        }
    },

    "displayListView": function(){
        if(this.layoutView === 'list') return;
        this.layoutView = 'list';

        // Hide thumbnails
        addClass(this.el.querySelector(CLS_ARTICLE_GALLERY_VIEW_THUMBNAIL),
            CLS_IS_HIDDEN);
        // Show list
        removeClass(this.el.querySelector(CLS_ARTICLE_GALLERY_VIEW_LIST),
            CLS_IS_HIDDEN);

        if(this.imageNavigation !== null){
            removeClass(this.imageNavigation.el, CLS_IS_HIDDEN);
        }

        this.emit(
            'viewchange', events.galleryViewChange(this, this.layoutView));
    },

    "displayThumbnailView": function(){
        if(this.layoutView === 'thumbnail') return;
        this.layoutView = 'thumbnail';

        // Show thumbnails
        var elThumbnails = this.el.querySelector(CLS_ARTICLE_GALLERY_VIEW_THUMBNAIL);
        removeClass(elThumbnails, CLS_IS_HIDDEN);
        // Hide list
        addClass(this.el.querySelector(CLS_ARTICLE_GALLERY_VIEW_LIST),
            CLS_IS_HIDDEN);

        if(this.imageNavigation !== null){
            addClass(this.imageNavigation.el, CLS_IS_HIDDEN);
        }

        var thumbnailsBound = getElementOffset(elThumbnails);
        var scrollTop = getWindowScrollTop();
        if (thumbnailsBound.top <= scrollTop) {
            window.scrollTo(0, thumbnailsBound.top - 60);
        }

        this.emit(
            'viewchange', events.galleryViewChange(this, this.layoutView));
    },

    /**
     * Toggles list and thumbnail views
     * @public
     * @memberof! Gallery.prototype
     */
    'toggleView': function() {
        if (this.layoutView === 'list') {
            this.displayThumbnailView();
        } else {
            this.displayListView();
        }
    }

});


function setAbsolute(el, top){
    el.style.position = 'absolute';
    el.style.top = top;
}

function setDefault(el){
    removeClass(el, 'is-fixed');
    el.style.position = '';
    el.style.top = '';
}

function setFixed(el, top){
    addClass(el, 'is-fixed');
    el.style.position = 'fixed';
    el.style.top = top;
}


function toArray(collection){
    var len = collection.length;
    var arr = new Array(len);
    while(len--) arr[len] = collection[len];
    return arr;
}

export default Gallery;

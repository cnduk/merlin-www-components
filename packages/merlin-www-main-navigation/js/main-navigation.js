'use strict';

import {
    addClass,
    addEvent,
    debounce,
    fireEvent,
    hasClass,
    getElementOffset,
    getWindowScrollTop,
    removeClass
} from '@cnbritain/merlin-www-js-utils/js/functions';

import {
    hasTouch,
    isAndroid,
    isIOS
} from '@cnbritain/merlin-www-js-utils/js/detect';

import VanishingNavigation from './vanishing-navigation';

import img from '@cnbritain/merlin-www-image';

var RESIZE_DEBOUNCE_MS = 200;
var windowHeightHalf = window.innerHeight/2;
var menuScrollTop = 0;

/**
 * Creates the main navigation
 * @class
 * @param {HTMLElement} el The main navigation element
 */
function MainNavigation(el){

    /**
     * The current gallery article that has focus
     * @private
     * @type {Gallery}
     */
    this._galleryArticle = null;

    /**
     * The navigation element
     * @public
     * @alias el
     * @memberof! MainNavigation.prototype
     * @type {HTMLElement}
     */
    this.el = el;

    /**
     * Cache of dom elements that are reused
     * @alias dom
     * @public
     * @memberof! MainNavigation.prototype
     * @type {Object}
     */
    this.dom = {
        'galleryClose': getGalleryClose(el),
        'galleryCounter': getGalleryCounter(el),
        'galleryTotal': getGalleryTotal(el),
        'hamburger': getHamburger(el),
        'main': el,
        'menu': getHamburgerMenu(el),
        'search': getSearch(el),
        // This is document as the searchbox is not within .n-main
        'searchBox': getSearchBox(document),
        'signpost': getSignpost(el),
        'smallLogo': getSmallLogo(el),
        'sticker': getSticker(el),
        'stickerChild': getStickerChild(el)
    };

    /**
     * Do we have a BIIIIG header logo?
     * @public
     * @alias hasHeaderLogo
     * @memberof! MainNavigation.prototype
     * @type {Boolean}
     */
    this.hasHeaderLogo = hasHeaderLogo(el);

    /**
     * Cache of offsets for elements
     * @public
     * @alias offsets
     * @memberof! MainNavigation.prototype
     * @type {Object}
     */
    this.offsets = {
        'sticker': getElementOffset(this.dom.sticker)
    };

    /**
     * List of states about the navigation
     * @public
     * @alias states
     * @memberof! MainNavigation.prototype
     * @type {Object}
     */
    this.states = {
        'gallery': false,
        'menu': false,
        'stuck': false
    };

    /**
     * Instance of the vanishing header bits
     * @public
     * @alias vanish
     * @memberof! MainNavigation.prototype
     * @type {VanishingNavigation}
     */
    this.vanish = null;

    this._init();
}

MainNavigation.prototype = {

    /**
     * Initialises after construction
     * @private
     */
    '_init': function(){
        // This listener is used to keep track of when the navigation is sticky
        addEvent(window, 'scroll', this.update.bind(this));
        addEvent(document.getElementById('chkNavSearch'), 'change',
            onSearchBoxChange.bind(this));
        // Listener for resizing only when a logoheader is there as it hides
        // on mobile view
        if(this.hasHeaderLogo){
            addEvent(window, 'resize', debounce(function resize_debounce(){
                this.resize();
                this.update();
            }, RESIZE_DEBOUNCE_MS, this));
        }
        // Hamburger menu display
        addEvent(document.getElementById('chkNavHamburger'), 'change',
            onHamburgerChange.bind(this));
        // Fix for touch devices
        // Touch devices wait for the label to focus before firing a click and
        // updating the checkbox. This way we skip the focus and click and
        // jump straight to the touch and fire our own change event
        if(hasTouch){
            addEvent(this.dom.main.querySelector('.n-main__nav-hamburger'),
                'touchstart', function(e){
                e.preventDefault();
                e.stopPropagation();
                var chk = document.getElementById('chkNavHamburger');
                chk.checked = !chk.checked;
                fireEvent(chk, 'change', false, true);
            });
        }

        // Check if we have rendered a gallery navigation
        var elGalleryToggle = this.el.querySelector('.n-gallery-toggle');
        if(elGalleryToggle){
            addEvent(elGalleryToggle, 'click', function() {
                //Emits event to tell counter to toggle
                this._galleryArticle.gallery.toggleView();

                //Recalculates gallery bounds
                //Values used in uppdate to show/hide gallery navigation
                this._galleryArticle.gallery.resize();
            }.bind(this));
        }

        // If the device is ios or android, make the nav have vanish abilities
        // Yes, we're sniffing useragent to make this judgement
        if(isAndroid || isIOS){
            this.vanish = new VanishingNavigation(this);
            this.vanish.enable();
        }

        img.init();
    },

    'constructor': MainNavigation,

    /**
     * Hides the gallery navigation
     * @public
     * @memberof! MainNavigation.prototype
     */
    'hideGalleryNavigation': function(){
        if(!this.states.gallery) return;
        this.states.gallery = false;
        removeClass(this.el.querySelector('.n-gallery-nav'), 'is-visible');
        unpauseVanishingHeader(this);
    },

    /**
     * Hides the gallery navigation counter
     * @public
     * @memberof! MainNavigation.prototype
     */
    'hideGalleryNavigationCounter': function(){
        addClass(this.el.querySelector('.n-gallery-counter'), 'global__hidden');
    },

    /**
     * Hides the mobile menu
     * @public
     * @memberof! MainNavigation.prototype
     */
    'hideHamburgerMenu': function(){
        if(!this.states.menu) return;
        this.states.menu = false;
        removeClass(this.dom.menu, 'is-visible');
        removeClass(document.documentElement, 'has-open-menu');
        removeClass(document.body, 'has-open-menu');
        window.scrollTo(0, menuScrollTop);

        removeClass(this.dom.hamburger.querySelector('.n-main__nav-hamburger__icon'), 'global__hidden');
        addClass(this.dom.hamburger.querySelector('.n-main__nav-hamburger__close-icon'), 'global__hidden');
    },

    /**
     * Hides the grid icon
     * @public
     * @memberof! MainNavigation.prototype
     */
    'hideGridIcon': function() {
        addClass(this.el.querySelector('.n-gallery-toggle--grid'), 'global__hidden');
    },

    /**
     * Hides the list icon
     * @public
     * @memberof! MainNavigation.prototype
     */
    'hideListIcon': function() {
        addClass(this.el.querySelector('.n-gallery-toggle--list'), 'global__hidden');
    },

    /**
     * Hides the search overlay
     * @public
     * @memberof! MainNavigation.prototype
     */
    'hideSearchBox': function(){
        if( !hasClass( this.dom.searchBox, 'has-overlay') ) return;
        removeClass(this.dom.searchBox, 'has-overlay');

        removeClass(this.dom.search.querySelector('.n-main__nav-search__icon'), 'global__hidden');
        addClass(this.dom.search.querySelector('.n-main__nav-search__close-icon'), 'global__hidden');
    },

    /**
     * Hides the small brand logo
     * @public
     * @memberof! MainNavigation.prototype
     */
    'hideSmallLogo': function(){
        if( hasClass( this.dom.smallLogo, 'n-main__nav-logo--hidden' ) ) return;
        addClass(this.dom.smallLogo, 'n-main__nav-logo--hidden');
    },

    'resize': function(){
        this.offsets.sticker = getElementOffset(this.dom.sticker);
        windowHeightHalf = window.innerHeight/2;
    },

    /**
     * Sets the current focused gallery article
     * @param  {Gallery} galleryArticle
     * @public
     * @memberof! MainNavigation.prototype
     */
    'setGalleryArticle': function(galleryArticle){
        this._galleryArticle = galleryArticle;
        if(galleryArticle === null) return;
        this.dom.galleryTotal.innerHTML = galleryArticle.gallery.images.length;

        if (!this._galleryArticle.listenerTree.showList) {
            this._galleryArticle.on('showList', function () {
                this.showGalleryNavigationCounter();
                this.hideListIcon();
                this.showGridIcon();
            }.bind(this));

            this._galleryArticle.on('hideList', function () {
                this.hideGalleryNavigationCounter();
                this.showListIcon();
                this.hideGridIcon();
            }.bind(this));
        }
    },

    /**
     * Sets the url of the gallery close button. This defaults to
     * history.back() when no url it set. It should redirect back to the
     * previous article if coming from an article.
     * @param  {String} url
     */
    'setGalleryClose': function(url){
        this.dom.galleryClose.setAttribute('href', url);
    },

    /**
     * Sets the gallery counter to the value
     * @param  {Number} value
     * @public
     * @memberof! MainNavigation.prototype
     */
    'setGalleryCounter': function(value){
        this.dom.galleryCounter.innerHTML = Number(value);
    },

    /**
     * Sets the signpost to the tag
     * @param  {String} tag
     * @public
     * @memberof! MainNavigation.prototype
     */
    'setSignpost': function(tag) {
        this.dom.signpost.innerHTML = tag;
    },

    /**
     * Shows the gallery navigation
     * @public
     * @memberof! MainNavigation.prototype
     */
    'showGalleryNavigation': function(){
        if(this.states.gallery) return;
        this.states.gallery = true;
        var galleryNav = this.el.querySelector('.n-gallery-nav');
        setGalleryNavigation(galleryNav, this._galleryArticle);
        addClass(galleryNav, 'is-visible');
        pauseVanishingHeader(this);
    },

    /**
     * Show the gallery navigation counter
     * @public
     * @memberof! MainNavigation.prototype
     */
    'showGalleryNavigationCounter': function(){
        removeClass(this.el.querySelector('.n-gallery-counter'), 'global__hidden');
    },

    /**
     * Shows the mobile menu
     * @public
     * @memberof! MainNavigation.prototype
     */
    'showHamburgerMenu': function(){
        if(this.states.menu) return;
        this.states.menu = true;
        menuScrollTop = getWindowScrollTop();
        addClass(this.dom.menu, 'is-visible');
        addClass(document.documentElement, 'has-open-menu');
        addClass(document.body, 'has-open-menu');

        addClass(this.dom.hamburger.querySelector('.n-main__nav-hamburger__icon'), 'global__hidden');
        removeClass(this.dom.hamburger.querySelector('.n-main__nav-hamburger__close-icon'), 'global__hidden');
    },

    /**
     * Shows the grid icon
     * @public
     * @memberof! MainNavigation.prototype
     */
    'showGridIcon': function() {
        removeClass(this.el.querySelector('.n-gallery-toggle--grid'), 'global__hidden');
    },

    /**
     * Shows the list icon
     * @public
     * @memberof! MainNavigation.prototype
     */
    'showListIcon': function() {
        removeClass(this.el.querySelector('.n-gallery-toggle--list'), 'global__hidden');
    },

    /**
     * Shows the search overlay
     * @param  {Boolean} focus Whether to focus the textbox
     */
    'showSearchBox': function(focus){
        if( hasClass( this.dom.searchBox, 'has-overlay') ) return;
        addClass(this.dom.searchBox, 'has-overlay');
        if(focus){
            this.dom.searchBox.getElementsByTagName('input')[0].focus();
        }

        addClass(this.dom.search.querySelector('.n-main__nav-search__icon'), 'global__hidden');
        removeClass(this.dom.search.querySelector('.n-main__nav-search__close-icon'), 'global__hidden');
    },

    /**
     * Shows the small brand logo
     * @public
     */
    'showSmallLogo': function(){
        if( !hasClass( this.dom.smallLogo, 'n-main__nav-logo--hidden' ) ) return;
        removeClass(this.dom.smallLogo, 'n-main__nav-logo--hidden');
    },

    /**
     * Sticks the navigation to the top of the window
     * @public
     */
    'stick': function(){
        if( this.states.stuck ) return;
        this.states.stuck = true;
        addClass(this.dom.stickerChild, 'is-stuck');
        addClass(this.dom.searchBox, 'is-stuck');
        this.dom.sticker.style.height = this.dom.stickerChild.offsetHeight + 'px';
    },

    /**
     * Unsticks the navigation from the top of the window
     * @public
     */
    'unstick': function(){
        if( !this.states.stuck ) return;
        this.states.stuck = false;
        removeClass(this.dom.stickerChild, 'is-stuck');
        removeClass(this.dom.searchBox, 'is-stuck');
        this.dom.sticker.style.height = '';
    },

    /**
     * Updates the current state of the navigation - sticky or gallery nav
     * @public
     * @memberof! MainNavigation.prototype
     */
    'update': function(){
        var scrollY = getWindowScrollTop();

        // Stick and unstick the header
        if( !this.states.stuck && scrollY > this.offsets.sticker.top ){
            this.stick();
            if(this.hasHeaderLogo) this.showSmallLogo();

        } else if( this.states.stuck && scrollY < this.offsets.sticker.top ){
            this.unstick();
            if(this.hasHeaderLogo) this.hideSmallLogo();

        }

        // Check if gallery navigation needs to show or hide
        if(this._galleryArticle === null) return;
        if(this._galleryArticle.gallery.bounds.top > scrollY + windowHeightHalf){
            if(this.states.gallery) this.hideGalleryNavigation();
            return;
        }
        if(this._galleryArticle.gallery.bounds.bottom < scrollY + windowHeightHalf){
            if(this.states.gallery) this.hideGalleryNavigation();
            return;
        }
        if(!this.states.gallery) this.showGalleryNavigation();
    }

};

/**
 * Gets the galler close button
 * @param  {HTMLElement} el
 * @return {HTMLElement}
 */
function getGalleryClose(el){
    return el.querySelector('.js-gallery-close');
}

/**
 * Gets the gallery counter display
 * @param  {HTMLElement} el
 * @return {HTMLElement}
 */
function getGalleryCounter(el){
    return el.querySelector('.n-gallery-counter__current');
}

/**
 * Gets the gallery total display
 * @param  {HTMLElement} el
 * @return {HTMLElement}
 */
function getGalleryTotal(el){
    return el.querySelector('.n-gallery-counter__total');
}

/**
 * Gets the hamburger
 * @param  {HTMLElement} el
 * @return {HTMLElement}
 */
function getHamburger(el){
    return el.querySelector('.n-main__nav-hamburger');
}

/**
 * Gets the hamburger menu element
 * @param  {HTMLElement} el
 * @return {HTMLElement}
 */
function getHamburgerMenu(el){
    return el.querySelector('.n-menu');
}

/**
 * Gets the search element
 * @param  {HTMLElement} el
 * @return {HTMLElement}
 */
function getSearch(el){
    return el.querySelector('.n-main__nav-search');
}

/**
 * Gets the searchbox element
 * @param  {HTMLElement} el
 * @return {HTMLElement}
 */
function getSearchBox(el){
    return el.querySelector('.n-search');
}

/**
 * Gets the signpost element
 * @param  {HTMLElement} el
 * @return {HTMLElement}
 */
function getSignpost(el){
    return el.querySelector('.n-main__nav-signpost');
}

/**
 * Gets the small logo in the navigation
 * @param  {HTMLElement} el
 * @return {HTMLElement}
 */
function getSmallLogo(el){
    return el.querySelector('.n-main__nav-logo');
}

/**
 * Gets the parent sticker element. This element is always relative in case
 * we need to recalculate position
 * @param  {HTMLElement} el
 * @return {HTMLElement}
 */
function getSticker(el){
    return el.querySelector('.n-main__sticker');
}

/**
 * Gets the element that will become fixed
 * @param  {HTMLElement} el
 * @return {HTMLElement}
 */
function getStickerChild(el){
    return el.querySelector('.n-main__sticker-child');
}

/**
 * Checks if there is a large header in the navigation
 * @param  {HTMLElement}  el
 * @return {Boolean}
 */
function hasHeaderLogo(el){
    return !!el.querySelector('.n-main__header');
}

/**
 * Callback for when the hamburger checkbox changes
 * @param  {Object} e Event data
 */
function onHamburgerChange(e){
    if(e.target.checked){
        pauseVanishingHeader(this);
        this.showHamburgerMenu();
    } else {
        unpauseVanishingHeader(this);
        this.hideHamburgerMenu();
    }
}

/**
 * Callback for when the search checkbox changes state
 * @param  {Object} e Event data
 */
function onSearchBoxChange(e){
    if(e.target.checked){
        pauseVanishingHeader(this);
        this.showSearchBox(true);
    } else {
        unpauseVanishingHeader(this);
        this.hideSearchBox();
    }
}

function pauseVanishingHeader(nav){
    if(nav.vanish === null) return;
    nav.vanish.pause();
    nav.vanish.show();
}

function unpauseVanishingHeader(nav){
    if(nav.vanish === null) return;
    nav.vanish.unpause();
}

/**
 * Sets the html elements and attributes on the gallery nav
 * @param {HTMLElement} el             The main navigation
 * @param {Gallery} galleryArticle
 */
function setGalleryNavigation(el, galleryArticle){
    var tmpEl = null;
    var tmpValue = null;
    // Title
    tmpEl = el.querySelector('.n-main__nav-title');
    tmpValue = galleryArticle.el.querySelector('.a-header__title').innerHTML;
    tmpEl.innerHTML = tmpValue;
    tmpEl.setAttribute('title', tmpValue);
    // Gallery count and total
    tmpEl = el.querySelector('.n-gallery-counter__current');
    tmpEl.innerHTML = '1';
}

var MAIN_NAVIGATION;

//Error pages do not have navigation template
if (document.querySelector('.n-main') !== null) {
    MAIN_NAVIGATION = new MainNavigation( document.querySelector('.n-main') )
}

export default MAIN_NAVIGATION;

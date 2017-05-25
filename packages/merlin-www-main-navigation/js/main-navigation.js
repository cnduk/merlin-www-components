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
import img from '@cnbritain/merlin-www-image';

import VanishingNavigation from './vanishing-navigation';
import GalleryNavigation from './gallery-navigation';


var RESIZE_DEBOUNCE_MS = 200;
var CLS_GALLERY_NAV = '.n-gallery-nav';
var CLS_HAMBURGER = '.n-main__nav-hamburger';
var CLS_HAMBURGER_MENU = '.n-menu';
var CLS_SEARCH = '.n-main__nav-search';
var CLS_SEARCH_OVERLAY = '.n-search';
var CLS_SIGNPOST = '.n-main__nav-signpost';
var CLS_LOGO = '.n-main__nav-logo';
var CLS_STICKER = '.n-main__sticker';
var CLS_STICKER_CHILD = '.n-main__sticker-child';
var CLS_HIDDEN = 'global__hidden';
var CLS_STATE_OVERLAY = 'has-overlay';
var CLS_STATE_VISIBLE = 'is-visible';
var CLS_STATE_HIDDEN = 'is-hidden';
var CLS_STATE_STUCK = 'is-stuck';
var CLS_STATE_OPEN_MENU = 'has-open-menu';
var ID_SEARCH_CHECKBOX = 'chkNavSearch';
var ID_HAMBURGER_CHECKBOX = 'chkNavHamburger';

var windowHeightHalf = window.innerHeight/2;
var menuScrollTop = 0;



function muteScroll(duration){
    if(muteScroll._tmr !== null){
        clearTimeout(muteScroll._tmr);
    }
    muteScroll.isMuted = true;
    muteScroll._tmr = setTimeout(function muteScroll_tmr(){
        muteScroll._tmr = null;
        muteScroll.isMuted = false;
    }, duration);
}
muteScroll._tmr = null;
muteScroll.isMuted = false;





/**
 * Creates the main navigation
 * @class
 * @param {HTMLElement} el The main navigation element
 */
function MainNavigation(el){

    /**
     * The navigation element
     * @public
     * @alias el
     * @memberof! MainNavigation.prototype
     * @type {HTMLElement}
     */
    this.el = el;

    /**
     * Do we have a BIIIIG header logo?
     * @public
     * @alias hasHeaderLogo
     * @memberof! MainNavigation.prototype
     * @type {Boolean}
     */
    this.hasHeaderLogo = hasHeaderLogo(el);

    /**
     * Instance of the vanishing header bits
     * @public
     * @alias vanishingNavigation
     * @memberof! MainNavigation.prototype
     * @type {VanishingNavigation}
     */
    this.vanishingNavigation = null;

    this.galleryNavigation = null;

    this._hamburger = this.el.querySelector(CLS_HAMBURGER);
    this._hamburgerMenu = this.el.querySelector(CLS_HAMBURGER_MENU);
    this._search = this.el.querySelector(CLS_SEARCH);
    // This is document as the searchbox is not within .n-main
    this._searchOverlay = document.querySelector(CLS_SEARCH_OVERLAY);
    this._signpost = this.el.querySelector(CLS_SIGNPOST);
    this._logo = this.el.querySelector(CLS_LOGO);
    this._sticker = this.el.querySelector(CLS_STICKER);
    this._stickerChild = this.el.querySelector(CLS_STICKER_CHILD);

    /**
     * Cache of offsets for elements
     * @private
     * @memberof! MainNavigation.prototype
     * @type {Object}
     */
    this._offsets = {
        'sticker': getElementOffset(this._sticker)
    };

    this._isStuck = false;
    this._isGallery = false;
    this._isMenuOpen = false;

    this._galleryScrollY = 0;
    this._isGalleryHidden = false;

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
        addEvent(
            document.getElementById(ID_SEARCH_CHECKBOX), 'change',
            this._onSearchBoxChange.bind(this));

        // Listener for resizing only when a logoheader is there as it hides
        // on mobile view
        if(this.hasHeaderLogo){
            addEvent(window, 'resize', debounce(function resize_debounce(){
                this.resize();
                this.update();
            }, RESIZE_DEBOUNCE_MS, this));
        }

        // Hamburger menu display
        addEvent(document.getElementById(ID_HAMBURGER_CHECKBOX), 'change',
            this._onHamburgerChange.bind(this));

        // Fix for touch devices
        // Touch devices wait for the label to focus before firing a click and
        // updating the checkbox. This way we skip the focus and click and
        // jump straight to the touch and fire our own change event
        if(hasTouch){
            addEvent(this.el.querySelector(CLS_HAMBURGER),
                'touchstart', function(e){
                e.preventDefault();
                e.stopPropagation();
                var chk = document.getElementById(ID_HAMBURGER_CHECKBOX);
                chk.checked = !chk.checked;
                fireEvent(chk, 'change', false, true);
            });
        }

        // If the device is ios or android, make the nav have vanish abilities
        // Yes, we're sniffing useragent to make this judgement
        if(isAndroid || isIOS){
            this.vanishingNavigation = new VanishingNavigation(this.el);
            this.vanishingNavigation.enable();
        }

        if(this.el.querySelector(CLS_GALLERY_NAV)){
            this.galleryNavigation = new GalleryNavigation(
                this.el.querySelector(CLS_GALLERY_NAV));
            this.galleryNavigation.on(
                'viewchange', this._viewchangeMuteScroll.bind(this));
        }

        img.init();

    },

    _viewchangeMuteScroll: function _viewchangeMuteScroll(){
        muteScroll(500);
        this._galleryScrollY = getWindowScrollTop();
    },





    constructor: MainNavigation,



    /**
     * Sets the signpost to the tag
     * @param  {String} tag
     * @public
     * @memberof! MainNavigation.prototype
     */
    setSignpost: function setSignpost(tag) {
        this._signpost.innerHTML = tag;
    },

    resize: function resize(){
        this._offsets.sticker = getElementOffset(this._sticker);
        windowHeightHalf = window.innerHeight/2;
    },


    _galleryHide: function _galleryHide(){
        this._isGalleryHidden = true;
        removeClass(this.el.querySelector(CLS_GALLERY_NAV), CLS_STATE_VISIBLE);
    },

    _galleryShow: function _galleryShow(){
        this._isGalleryHidden = false;
        addClass(this.el.querySelector(CLS_GALLERY_NAV), CLS_STATE_VISIBLE);
    },

    _galleryScroll: function _galleryScroll(scrollY){
        // Not in gallery mode so dont care
        if(!this._isGallery) return;
        if(muteScroll.isMuted) return;

        var scrollVelocity = scrollY - this._galleryScrollY;
        this._galleryScrollY = scrollY;

        if(!this._isGalleryHidden && scrollVelocity < 0){
            return this._galleryHide();
        }

        // Check if we are greater than our min Y
        if(this._isGalleryHidden && scrollVelocity > 0){
            return this._galleryShow();
        }
    },

    /**
     * Hides the gallery navigation
     * @public
     * @memberof! MainNavigation.prototype
     */
    hideGallery: function hideGallery(){
        if(!this._isGallery) return;
        this._isGallery = false;
        removeClass(this.el.querySelector(CLS_GALLERY_NAV), CLS_STATE_VISIBLE);
        this._unpauseVanishingHeader();
    },

    /**
     * Shows the gallery navigation
     * @public
     * @memberof! MainNavigation.prototype
     */
    showGallery: function showGallery(){
        if(this._isGallery) return;
        this._isGallery = true;
        addClass(this.el.querySelector(CLS_GALLERY_NAV), CLS_STATE_VISIBLE);
        this._pauseVanishingHeader();
    },






    /**
     * Sticks the navigation to the top of the window
     * @public
     */
    stick: function stick(){
        if(this._isStuck) return;
        this._isStuck = true;
        addClass(this._stickerChild, CLS_STATE_STUCK);
        addClass(this._searchOverlay, CLS_STATE_STUCK);
        this._sticker.style.height = this._stickerChild.offsetHeight + 'px';
    },

    /**
     * Unsticks the navigation from the top of the window
     * @public
     */
    unstick: function unstick(){
        if(!this._isStuck) return;
        this._isStuck = false;
        removeClass(this._stickerChild, CLS_STATE_STUCK);
        removeClass(this._searchOverlay, CLS_STATE_STUCK);
        this._sticker.style.height = '';
    },

    /**
     * Updates the current state of the navigation - sticky or gallery nav
     * @public
     * @memberof! MainNavigation.prototype
     */
    update: function update(){
        var scrollY = getWindowScrollTop();

        // Stick and unstick the header
        if(!this._isStuck && scrollY > this._offsets.sticker.top){
            this.stick();
            if(this.hasHeaderLogo) this._displayLogo();

        } else if(this._isStuck && scrollY < this._offsets.sticker.top){
            this.unstick();
            if(this.hasHeaderLogo) this._hideLogo();
        }

        this._galleryScroll(scrollY);
    },







    /**
     * Shows the mobile menu
     * @private
     * @memberof! MainNavigation.prototype
     */
    _displayHamburgerMenu: function _displayHamburgerMenu(){
        if(this._isMenuOpen) return;

        this._isMenuOpen = true;

        menuScrollTop = getWindowScrollTop();
        addClass(this._hamburgerMenu, CLS_STATE_VISIBLE);
        addClass(document.documentElement, CLS_STATE_OPEN_MENU);
        addClass(document.body, CLS_STATE_OPEN_MENU);

        addClass(this._hamburger.querySelector('.n-main__nav-hamburger__icon'), CLS_HIDDEN);
        removeClass(this._hamburger.querySelector('.n-main__nav-hamburger__close-icon'), CLS_HIDDEN);
    },

    /**
     * Hides the mobile menu
     * @private
     * @memberof! MainNavigation.prototype
     */
    _hideHamburgerMenu: function _hideHamburgerMenu(){
        if(!this._isMenuOpen) return;

        this._isMenuOpen = false;

        removeClass(this._hamburgerMenu, CLS_STATE_VISIBLE);
        removeClass(document.documentElement, CLS_STATE_OPEN_MENU);
        removeClass(document.body, CLS_STATE_OPEN_MENU);
        window.scrollTo(0, menuScrollTop);

        removeClass(this._hamburger.querySelector('.n-main__nav-hamburger__icon'), CLS_HIDDEN);
        addClass(this._hamburger.querySelector('.n-main__nav-hamburger__close-icon'), CLS_HIDDEN);
    },





    /**
     * Hides the search overlay
     * @public
     * @memberof! MainNavigation.prototype
     */
    _hideSearchOverlay: function _hideSearchOverlay(){
        if( !hasClass( this._searchOverlay, CLS_STATE_OVERLAY) ) return;
        removeClass(this._searchOverlay, CLS_STATE_OVERLAY);

        removeClass(this._search.querySelector('.n-main__nav-search__icon'), CLS_HIDDEN);
        addClass(this._search.querySelector('.n-main__nav-search__close-icon'), CLS_HIDDEN);
    },

    /**
     * Shows the search overlay
     * @param  {Boolean} focus Whether to focus the textbox
     */
    _displaySearchOverlay: function _displaySearchOverlay(focus){
        if( hasClass( this._searchOverlay, CLS_STATE_OVERLAY) ) return;
        addClass(this._searchOverlay, CLS_STATE_OVERLAY);
        if(focus){
            this._searchOverlay.getElementsByTagName('input')[0].focus();
        }

        addClass(this._search.querySelector('.n-main__nav-search__icon'), CLS_HIDDEN);
        removeClass(this._search.querySelector('.n-main__nav-search__close-icon'), CLS_HIDDEN);
    },




    /**
     * Shows the small brand logo
     * @public
     */
    _displayLogo: function _displayLogo(){
        if(!hasClass(this._logo, CLS_STATE_HIDDEN)) return;
        removeClass(this._logo, CLS_STATE_HIDDEN);
    },

    /**
     * Hides the small brand logo
     * @public
     * @memberof! MainNavigation.prototype
     */
    _hideLogo: function _hideLogo(){
        if(hasClass(this._logo, CLS_STATE_HIDDEN)) return;
        addClass(this._logo, CLS_STATE_HIDDEN);
    },




    _onHamburgerChange: function _onHamburgerChange(e){
        if(e.target.checked){
            this._pauseVanishingHeader();
            this._displayHamburgerMenu();
        } else {
            this._unpauseVanishingHeader();
            this._hideHamburgerMenu();
        }
    },
    _onSearchBoxChange: function _onSearchBoxChange(e){
        if(e.target.checked){
            this._pauseVanishingHeader();
            this._displaySearchOverlay(true);
        } else {
            this._unpauseVanishingHeader();
            this._hideSearchOverlay();
        }
    },


    _pauseVanishingHeader: function _pauseVanishingHeader(){
        if(this.vanishingNavigation === null) return;
        this.vanishingNavigation.pause();
        this.vanishingNavigation.show();
    },
    _unpauseVanishingHeader: function _unpauseVanishingHeader(){
        if(this.vanishingNavigation === null) return;
        this.vanishingNavigation.unpause();
    }


};

/**
 * Checks if there is a large header in the navigation
 * @param  {HTMLElement}  el
 * @return {Boolean}
 */
function hasHeaderLogo(el){
    return !!el.querySelector('.n-main__header');
}


var MAIN_NAVIGATION;

//Error pages do not have navigation template
if (document.querySelector('.n-main') !== null) {
    MAIN_NAVIGATION = new MainNavigation( document.querySelector('.n-main') )
}

export default MAIN_NAVIGATION;

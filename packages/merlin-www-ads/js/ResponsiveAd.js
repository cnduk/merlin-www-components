/**
 *
 *   ####  #####  ###### ###### ##### # #    #  ####   ####
 *  #    # #    # #      #        #   # ##   # #    # #
 *  #      #    # #####  #####    #   # # #  # #       ####
 *  #  ### #####  #      #        #   # #  # # #  ###      #
 *  #    # #   #  #      #        #   # #   ## #    # #    #
 *   ####  #    # ###### ######   #   # #    #  ####   ####
 *
 * You are about to dive into the wonderful world of responsive adverts! A lot
 * of magic and spooky things used to happen, un-documented things. However
 * I have gone through (and survived) the previous codebase to produce something
 * a little bit cleaner? And also document.
 *
 * It's dangerous to go alone so take this...
 * (https://www.youtube.com/watch?v=0m9QUoW5KnY)
 *
 * Hours wasted: too long :(
 *
 * The ad configuration might contain keys so you have to check if they exist
 * before using them. They also might be set to null which would be the same
 * as not having the key.
 *
 *
 * Extra note:
 * This has been ported over from GQ. It's really messy at the moment as I've
 * had to tweak a lot of bits to get it flexible and working with all the rest
 * of brands that might use it.
 *
 *
 * Background Image
 * Selector: .responsive-ad__background
 * =============================================================================
 * The background image of the advert is ALWAYS 100% wide. The image can be
 * positioned anywhere on the Y axis. We convert the adConfig values to a
 * percentage to prevent us from needing to update anyting during a resize
 * event.
 *
 *
 * Logos
 * Selector: .responsive-ad__logo
 * =============================================================================
 * All the logo (buttons are included in this) use this as a base class. There
 * are modifiers that will hide and show this item using media queries in the
 * template. When the window of the ad changes dimensions, a recalculate
 * function is fired that will update the height, left and top of the logo.
 *
 *
 * Video
 * Selector: .responsive-ad__video
 * =============================================================================
 * Sometimes there will be a video accompanying the advert. It will use HTML5
 * video if it can, however for older browsers it will fallback to using flash
 * generously provided by the glorious FlowPlayer. There is also an overlay
 * container (.responsive-ad__video__overlay) that is in front of the video to
 * help catch any click/touch events. The video uses ResponsiveAdVideo class
 * to contain and manage it.
 *
 *
 * Example responsive adverts
 * =============================================================================
 * Name: Tiffany & Co
 * Adsite: uk.n5574.test
 * AdZone: GQNew_Test
 * -----------------------------------------------------------------------------
 * Name: Tom Ford Noir (Pushup)
 * Adsite: uk.n5574.test
 * AdZone: GQNew_Test_3
 */


"use strict";

// var TEST_ADCONFIG = {"backgroundFixed": true,"backgroundColour": "#0ca071","backgroundRepeat": false,"fixedHeightLogos":true,"preventExpansion":false,"logos":[{"normal":{"visibleOnMobile":true,"visibleOnDesktop":true,"visibleWhenExpanded":true,"visibleWhenContracted":false,"widthPx":390,"heightPx":293,"leftPercent":1.2166714449541285,"topPercent":10.127314814814815,"leftPixelAdjust":0,"topPixelAdjust":0,"heightPercent":null,"src":"http://digital-assets.condenast.co.uk/co/ads/adbuilder/2015/07/28_asd_853548_550612","widthPercent":17.779960707269154},"name":"Cool kid"},{"name":"balls","owner":"advert","normal":{"visibleOnMobile":true,"visibleOnDesktop":true,"visibleWhenExpanded":false,"visibleWhenContracted":true,"widthPx":331,"heightPx":162,"leftPercent":7.967436974789916,"topPercent":19.800420168067227,"leftPixelAdjust":0,"topPixelAdjust":0,"heightPercent":null,"maxHeightPixels":1000,"maxWidthPercent":100,"src":"http://digital-assets.condenast.co.uk/co/ads/adbuilder/2015/07/28_asd_853548_910317","widthPercent":21.776315789473685},"mobileOverridePosition":{"widthPercent":null,"heightPercent":54,"leftPercent":41.98227611940298,"topPercent":28.283514492753625,"leftPixelAdjust":0,"topPixelAdjust":0}},{"name":"hello lady","owner":"advert","normal":{"visibleOnMobile":true,"visibleOnDesktop":true,"visibleWhenExpanded":true,"visibleWhenContracted":true,"widthPx":290,"heightPx":256,"leftPercent":88.11952354874042,"topPercent":0,"leftPixelAdjust":0,"topPixelAdjust":0,"heightPercent":33.214285714285715,"maxHeightPixels":1000,"maxWidthPercent":100,"src":"http://digital-assets.condenast.co.uk/co/ads/adbuilder/2015/07/28_asd_853548_010371","widthPercent":null}},{"owner":"advert","name":"Play button","normal":{"visibleOnMobile":true,"visibleOnDesktop":true,"visibleWhenContracted":true,"visibleWhenExpanded":false,"widthPx":70,"heightPx":70,"leftPercent":93.38632852729145,"topPercent":83.83851931330472,"leftPixelAdjust":0,"topPixelAdjust":0,"heightPercent":null,"src":"http://cnda.condenast.co.uk/co/ads/adbuilder/playbutton.png","widthPercent":4.605263157894736}},{"owner":"advert","name":"Pause button","normal":{"visibleOnMobile":true,"visibleOnDesktop":true,"visibleWhenContracted":false,"visibleWhenExpanded":true,"widthPx":70,"heightPx":70,"leftPercent":3,"topPercent":95,"leftPixelAdjust":0,"topPixelAdjust":0,"widthPercent":4.5,"src":"http://cnda.condenast.co.uk/co/ads/adbuilder/pausebutton.png"},"clickAction":"pauseVideoAndCollapse"},{"owner":"advert","name":"Play button","normal":{"visibleOnMobile":true,"visibleOnDesktop":true,"visibleWhenContracted":true,"visibleWhenExpanded":false,"widthPx":70,"heightPx":70,"leftPercent":50,"topPercent":50,"leftPixelAdjust":0,"topPixelAdjust":0,"heightPercent":20,"src":"http://cnda.condenast.co.uk/co/ads/adbuilder/playbutton.png"}},{"owner":"advert","name":"Pause button","normal":{"visibleOnMobile":true,"visibleOnDesktop":true,"visibleWhenContracted":false,"visibleWhenExpanded":true,"widthPx":70,"heightPx":70,"leftPercent":3,"topPercent":95,"leftPixelAdjust":0,"topPixelAdjust":0,"widthPercent":4.5,"src":"http://cnda.condenast.co.uk/co/ads/adbuilder/pausebutton.png"},"clickAction":"pauseVideoAndCollapse"}],"videoSrcMp4":"http://digital-assets.condenast.co.uk/co/ads/adbuilder/2015/07/28_asd_853548_449428_mp4high","videoSrcMp4Below720":"http://digital-assets.condenast.co.uk/co/ads/adbuilder/2015/07/28_asd_853548_449428_mp4low","videoSrcWebM":"http://digital-assets.condenast.co.uk/co/ads/adbuilder/2015/07/28_asd_853548_449428_webmhigh","backgroundFocalBottom":447.5618860510806,"backgroundFocalTop":447.5618860510806,"backgroundImageSrc":"http://digital-assets.condenast.co.uk/co/ads/adbuilder/2015/07/28_asd_853548_282043","backgroundWidthPx":1520,"backgroundHeightPx":860,"backgroundShouldClipWidth":false,"panelColour":"#000","panelLeft":true,"panelLogoExpandedSrc":"","panelLogoMarginLeft":20,"panelLogoMarginRight":20,"panelLogoSrc":"","panelMinWidth":0,"panelWidthPercent":0,"meta":{"advertName":"asd"},"videoSrcMp4Below640":"http://digital-assets.condenast.co.uk/co/ads/adbuilder/2015/07/28_asd_853548_449428_mp4low640","videoWidth":1520,"videoHeight":855,"videoAutoplay":true,"clickUrl":"http://www.condenast.co.uk"};

// var TEST_ADCONFIG = {"fixedHeightLogos":true,"preventExpansion":true,"logos":[{"name":"panel?","owner":"advert","normal":{"visibleOnMobile":false,"visibleOnDesktop":true,"visibleWhenExpanded":true,"visibleWhenContracted":true,"widthPx":207,"heightPx":334,"leftPercent":7.470588235294118,"topPercent":100,"leftPixelAdjust":0,"topPixelAdjust":0,"heightPercent":98.23529411764706,"maxHeightPixels":1000,"maxWidthPercent":100,"src":"http://digital-assets.condenast.co.uk/co/ads/adbuilder/2015/07/30_panels_321078_211484"},"positions":{"1400":{"heightPercent":98.23529411764706,"leftPercent":19.215210849799,"topPercent":38.66668701171875,"leftPixelAdjust":0,"topPixelAdjust":0}}},{"name":"Overlay 2","owner":"advert","normal":{"visibleOnMobile":true,"visibleOnDesktop":false,"visibleWhenExpanded":true,"visibleWhenContracted":true,"widthPx":269,"heightPx":466,"leftPercent":88.5392441860465,"topPercent":71.15384615384616,"leftPixelAdjust":0,"topPixelAdjust":0,"heightPercent":137.05882352941177,"maxHeightPixels":1000,"maxWidthPercent":100,"src":"http://digital-assets.condenast.co.uk/co/ads/adbuilder/2015/07/30_panels_321078_672493"},"mobileOverridePosition":{"heightPercent":137.05882352941177,"leftPercent":8.402489626556017,"topPercent":94.72128378378379,"leftPixelAdjust":0,"topPixelAdjust":0},"positions":{"350":{"heightPercent":137.05882352941177,"leftPercent":86.40387444080653,"topPercent":100,"leftPixelAdjust":0,"topPixelAdjust":0},"500":{"heightPercent":137.05882352941177,"leftPercent":0,"topPercent":100,"leftPixelAdjust":0,"topPixelAdjust":0}}},{"name":"Overlay 3","owner":"advert","normal":{"visibleOnMobile":true,"visibleOnDesktop":true,"visibleWhenExpanded":true,"visibleWhenContracted":true,"widthPx":635,"heightPx":694,"leftPercent":95,"topPercent":80,"leftPixelAdjust":0,"topPixelAdjust":0,"heightPercent":204.1176470588235,"maxHeightPixels":1000,"maxWidthPercent":100,"src":"http://digital-assets.condenast.co.uk/co/ads/adbuilder/2015/07/30_panels_321078_833089"},"positions":{"350":{"leftPercent":95,"topPercent":80,"leftPixelAdjust":0,"topPixelAdjust":0,"heightPercent":70},"500":{"leftPercent":100,"topPercent":100,"leftPixelAdjust":0,"topPixelAdjust":0,"heightPercent":70},"900":{"leftPercent":95,"topPercent":80,"leftPixelAdjust":0,"topPixelAdjust":0,"heightPercent":null,"widthPercent":6.315789473684211},"1400":{"leftPercent":58.22747595377123,"topPercent":77.12899299517069,"leftPixelAdjust":0,"topPixelAdjust":0,"heightPercent":70},"1401":{"leftPercent":95,"topPercent":80,"leftPixelAdjust":0,"topPixelAdjust":0,"heightPercent":70}}}],"videoSrcMp4":null,"videoSrcMp4Below720":null,"videoSrcWebM":null,"backgroundFocalBottom":90.74224021592443,"backgroundFocalTop":90.74224021592443,"backgroundFocals":{"350": 72.421875,"1400": 257.35551330798478,"900": 324.45000000000005},"backgroundImageSrc":"http://digital-assets.condenast.co.uk/co/ads/adbuilder/2015/07/30_panels_321078_858385","backgroundWidthPx":500,"backgroundHeightPx":281,"backgroundShouldClipWidth":false,"panelColour":"#000","panelLeft":true,"panelLogoExpandedSrc":"","panelLogoMarginLeft":20,"panelLogoMarginRight":20,"panelLogoSrc":"","panelMinWidth":0,"panelWidthPercent":0,"meta":{"advertName":"panels?"},"backgroundFixed":false,"backgroundColour":"#0ca071","backgroundRepeat":false,"videoSrcMp4Below640":null,"videoWidth":null,"videoHeight":null,"videoAutoplay":null,"isMobile":true,"clickUrl":"http://www.condenast.co.uk"};






import Ad from './Ad';
import {
    AD_SIZES,
    AD_STATES,
    setAdStateToRendered,
    setAdStateToDestroyed,
    setAdStateToStopped
} from './Utils';
import {
    isAndroid,
    isIOS
} from '@cnbritain/merlin-www-js-utils/js/detect';
import {
    addClass,
    addEvent,
    clamp,
    cloneArray,
    cloneObjectDeep,
    exitFullscreen,
    getParent,
    hasOwnProperty,
    inherit,
    removeClass,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';
import template from "../templates/responsive-ad.mustache";
import ResponsiveAdVideo from './ResponsiveAdVideo';

var IGNORE_RESIZE_EVENT = false;
var EVENT_CLICK = "click";

/**
 * Creates a responsive advert
 * @class
 * @param {String} id      The element id
 * @param {Object} options
 */
function ResponsiveAd(el, manager, options){
    Ad.call(this, el, manager, options);

    // Debug mode is for the ad builder. Prevents extra listeners that might
    // conflict with the builder from running.
    this._debug = typeof options.debug === "boolean" ? options.debug : false;
    // This stores cache dom elements
    this._elementCache = null;
    this._eventHooks = {};
    this._expandedAtStart = false;
    // This keeps track of if we have already added the tracking pixels
    this._expandPixels = false;
    this._frameDocument = null;
    this._frameElement = null;
    this._frameWindow = null;
    // This is the current height of the iframe
    this._windowHeight = 0;
    // This is the current width of the iframe
    this._windowWidth = 0;
    // Create this key in the data object
    this._properties.adConfig = null;
    // This holds the current responsive ad dimension set. Also create this key
    this._properties.responsiveDimensions = null;
    this.video = null;

    // Set the default adType to legacy responsive ads
    // This solves some issues in IE due onSlotRenderEnded firing before
    // the slot has rendered
    this.type = AD_SIZES.RESPONSIVE;

}
ResponsiveAd.prototype = inherit( Ad.prototype, {

    /**
     * Attaches the responsive ad listeners
     * @private
     */
    "_bindResponsiveAdListeners": function(){
        this._eventHooks.resize = function(){
            if(IGNORE_RESIZE_EVENT){
                IGNORE_RESIZE_EVENT = false;
                this.recalculate();
                return;
            }
            this.resize();
        }.bind(this);
        addEvent( this._frameWindow, "resize", this._eventHooks.resize );
        if( !this._debug ){
            this._eventHooks.handleClick = this._handleClick.bind(this);
            addEvent(
                this._frameDocument.getElementsByTagName('body')[0],
                EVENT_CLICK, this._eventHooks.handleClick);
        }
    },

    /**
     * Attaches the listeners for the video
     * @private
     */
    "_bindVideoListeners": function(){
        if( this.video === null ) return;
        this._eventHooks.videoEnded = this._onVideoEnded.bind(this);
        this.video.on( "ended", this._eventHooks.videoEnded );
        if( isIOS ){
            this._eventHooks.iosfullscreenEnd = this._onIOSFullscreenEnd.bind(this);
            addEvent(
                this.video.video,
                "webkitendfullscreen",
                this._eventHooks.iosfullscreenEnd
            );
        }
    },

    /**
     * Event listener for when a click/touchend is fired on the advert iframe
     * @private
     * @param  {Object} e Event data
     */
    "_handleClick": function( e ){

        var adConfig = this.get( "adConfig" );
        var target = e.target;
        if( !adConfig.preventExpansion ){

            // If there is video and the video is NOT ready, dont do anything
            if( this.video && !this.video.isReady ) return;

            if( !this.isExpanded ){
                this.expandPanel();
            } else {
                this._resetExpandedVideo();
                this.contractPanel();
                if( !target.hasAttribute("data-pausebutton") ||
                    target.getAttribute("data-pausebutton") === "false" ){
                    openUrl( adConfig.clickUrl );
                    if( this.video !== null && !adConfig.videoLoop ){
                        this.video.stop();
                    }
                }
            }

            this.recalculate();

        } else {
            openUrl( adConfig.clickUrl );
        }

    },

    /**
     * Event listener for the video responsive ads. This ONLY affects iOS. This
     * is fired when the video comes out of fullscreen mode
     * @private
     */
    "_onIOSFullscreenEnd": function(){
        this.contractPanel();
        // Due to iOS not allowing us to open a new window when the video closes,
        // we can only redirect the page. This is horrible and should probably
        // look into a workaround or something else.
        openUrl( this.get( "adConfig" ).clickUrl, true );
    },

    /**
     * Event listener for when the video has finished playing.
     * @private
     */
    "_onVideoEnded": function(){
        // If the video finishes and we started with it expanded, dont show
        // the advert
        this._resetExpandedVideo();
        this.contractPanel();
        // We fire this just in case the device is iOS
        exitFullscreen( this.video.video );
        // Recalculate bits positions
        this.recalculate();
    },

    /**
     * Resets the video when we started expanded. So unmutes.
     */
    "_resetExpandedVideo": function(){
        if( !this._expandedAtStart ) return;
        this._expandedAtStart = false;
        this.video.unmute();
    },

    /**
     * Removes responsive advert listeners
     * @private
     */
    "_unbindResponsiveAdListeners": function(){
        // Quit early if we do not have a framewindow
        if( this._frameWindow === null ) return;
        removeEvent( this._frameWindow, "resize", this._eventHooks.resize );
        this._eventHooks.resize = null;
        if( !this._debug ){
            removeEvent( this._frameWindow, EVENT_CLICK, this._eventHooks.handleClick );
            this._eventHooks.handleClick = null;
        }
    },

    /**
     * Removes video listeners
     * @private
     */
    "_unbindVideoListeners": function(){
        if( this.video === null ) return;
        this.video.removeAllListeners();
        this._eventHooks.videoEnded = null;
        if( isIOS ){
            removeEvent(
                this.video.video,
                "webkitendfullscreen",
                this._eventHooks.iosfullscreenEnd
            );
            this._eventHooks.iosfullscreenEnd = null;
        }
    },

    /**
     * @constructor
     */
    "constructor": ResponsiveAd,

    /**
     * Closes the panel. This is only allowed if there is a video in the advert
     */
    "contractPanel": function(){
        if( this.get( "adConfig" ).preventExpansion || !this.isExpanded ) return;

        if( !this.get("adConfig").videoLoop ){
            this._windowHeight = this.get( "responsiveDimensions" )[1];
            this._frameElement.style.height = this._windowHeight + "px";
            removeClass( this._frameDocument.body, "is-expanded" );
            this.isExpanded = false;
            if( this.video !== null ){
                this.video.hide();
                this.video.pause();
            }
        }

        this.emit( "contract", this._windowHeight );
    },

    /**
     * Destroys the responsive ad
     */
    "destroy": function( keepElement ){

        // Quit early if already destroyed
        if( this.destroyed ) return;

        this._unbindVideoListeners();
        this._unbindResponsiveAdListeners();

        this._elementCache = null;
        this._eventHooks = {};
        this._frameDocument = null;
        this._frameElement = null;
        this._frameWindow = null;

        this.set( "adConfig", null );
        this.set( "responsiveDimensions", null );
        this.isExpanded = false;

        Ad.prototype.destroy.call( this, keepElement );
    },

    /**
     * Expands/opens up the panel. This is only allowed if there is a video in
     * the advert
     */
    "expandPanel": function(){
        if( this.get( "adConfig" ).preventExpansion || this.isExpanded ) return;

        this._frameElement.style.height = "";
        var frameExpandedHeight = getExpandedAdvertHeight( this );
        this._windowHeight = frameExpandedHeight;
        this._frameElement.style.height = frameExpandedHeight + "px";
        addClass( this._frameDocument.body, "is-expanded" );

        this.isExpanded = true;
        insertExpandPixelTracking( this );
        if( this.video !== null ){
            this.video.show();
            this.video.play();
        }

        this.emit( "expand", frameExpandedHeight );

    },

    /**
     * Gets the dom elements associated with the ad. At time of writing, this
     * is only used in the ad builder
     * @return {Object}
     */
    "getDom": function(){
        if( this._elementCache !== null ) return this._elementCache;

        var cache = {};

        // Logos
        cache.logos = cloneArray( this._frameDocument.querySelectorAll(".responsive-ad__logo") );
        // Inneradvert & Advert
        cache.advert = this._frameDocument.querySelector(".responsive-ad__container");
        // Iframe window
        cache.window = this._frameWindow;
        /**
         * Background is different. It can either be .responsive-ad__background
         * or the parent container of the iframe if the background is fixed.
         */
        if( this.get( "adConfig" ).backgroundFixed === true ){
            cache.background = this._frameElement.parentNode;
        } else {
            cache.background = this._frameDocument.querySelector(".responsive-ad__background");
        }

        return ( this._elementCache = cache );
    },

    /**
     * Recalculates the position of all the logos in the advert
     * @param {Number} logoIndex
     */
    "recalculate": function( logoIndex ){

        // Logo position and sizing
        var logoOffset = null;
        var domLogos = this._frameDocument.querySelectorAll(".responsive-ad__logo");
        var domLogo = null;
        var styleAttributes = null;

        if( typeof logoIndex === "number" ){
            onEachLogo.call( this, this.get( "adConfig" ).logos[ logoIndex ], logoIndex );
        } else {
            this.get( "adConfig" ).logos.forEach(onEachLogo.bind(this));
            // Update the background focal point if theres been a change
            this.updateBackgroundConfig( this.get( "adConfig" ) );
        }

        this.emit( "recalculate" );

        function onEachLogo( logoConfig, index ){
            domLogo = domLogos[ index ];
            logoOffset = getLogoOffsets( logoConfig, this );
            styleAttributes = {
                "left": logoOffset.left + "%",
                "top": logoOffset.top + "%"
            };
            // If we are changing to the expanded advert, don't set the height
            // as it will make the images wider too.
            styleAttributes.height = logoOffset.height + "px";
            setInlineStyles( domLogo, styleAttributes );
        }

    },

    /**
     * Renders the advert
     * @param  {Object} adConfig
     */
    "render": function( adConfig ){

        if( adConfig !== undefined ){
            if( this.get( "adConfig" ) ){
                this.destroy( true );
            }
            this.set( "adConfig", adConfig );
        }
        if( !this.get( "adConfig" ) ){
            throw new TypeError("adConfig has not been defined");
        }

        // DEBUG OVERWRITE
        // This is removed in minification
        // this._properties.adConfig = TEST_ADCONFIG;
        // console.log( this._properties.adConfig );

        var adContainer = null;
        var iframe = null;
        var frameContent = null;
        var tmpBlock = null;

        // Reset the element cache
        this._elementCache = null;

        // Store important stuff
        this._frameElement = iframe = this.el.getElementsByTagName("iframe")[0];
        this._frameDocument = this._frameElement.contentDocument ||
                              this._frameElement.contentWindow.document;
        this._frameWindow = this._frameDocument.defaultView ||
                            this._frameDocument.parentWindow;

        var hasVideo = !!( this.get( "adConfig" ).videoSrcMp4 ||
                           this.get( "adConfig" ).videoSrcWebM );

        // Render the advert. This does NOT include positioning as we trigger
        // a recalculate later on
        var templateData = {
            "backgroundImage": false,
            "hasVideo": hasVideo,
            "isLegacy": isLegacy( this ),
            "logos": processLogoConfig( this.get( "adConfig" ) )
        };
        if( this.get( "adConfig" ).backgroundFixed !== true ){
            templateData.backgroundImage = processBackgroundImageConfig(
                this.get( "adConfig" ),
                this.get( "responsiveDimensions" )
            );
        } else {
            applyBackgroundToIframe(
                this._frameElement,
                processBackgroundImageConfig(
                    this.get( "adConfig" ),
                    this.get( "responsiveDimensions" )
                )
            );
        }
        adContainer = document.createElement("div");
        setInlineStyles(adContainer, { "height": "100%" });
        adContainer.innerHTML = template( templateData );

        frameContent = this._frameDocument.getElementsByTagName("body")[0];
        frameContent.appendChild( adContainer );

        // Add data-ad-rendered-into attribute to body for ad builder
        frameContent.setAttribute(
            "data-ad-rendered-into",
            this._frameElement.getAttribute( "id" )
        );

        // Create the video element if we need to
        if( hasVideo ){
            this.video = new ResponsiveAdVideo(
                adContainer.querySelector(".responsive-ad__video"),
                {
                    "autoplay": !!this.get( "adConfig" ).expandedAtStart,
                    "loop": !!this.get("adConfig").videoLoop,
                    "mp4": this.get( "adConfig" ).videoSrcMp4,
                    "muted": !!this.get( "adConfig" ).expandedAtStart,
                    "webm": this.get( "adConfig" ).videoSrcWebM
                }
            );
        }

        this._bindResponsiveAdListeners();
        this._bindVideoListeners();
        this.resize();

        // Fixed some kind of resize issue
        // We're getting rid of this code soon so fuck it
        setTimeout(function(){
            this.recalculate();
            this.resize();
        }.bind(this), 1);

        /**
         * Some of the adverts will start open when you come to the page. They
         * are muted so we don't have to worry about SURPRISE SOUND!
         * http://i.imgur.com/aa7EjUO.gif
         */
        this._expandedAtStart = this.get( "adConfig" ).expandedAtStart;
        if( this._expandedAtStart && !(isAndroid || isIOS) ){
            this.expandPanel();
            this.recalculate();
        }

        this.emit( "render" );

    },

    /**
     * Works out the new dimensions of the advert. If there are changes, it
     * fires a recalculate
     */
    "resize": function(){
        if( this._frameWindow === null ) return;
        var width = this._frameWindow.innerWidth;
        var dimensions = ResponsiveAd.getDimensionsFromWidth(
            width,
            isLegacy( this )
        );
        this._windowWidth = width;
        this._windowHeight = dimensions[1];

        // If we are still in the same dimensions, do nought
        if( this.get( "responsiveDimensions" ) &&
            this.get( "responsiveDimensions" )[0] === dimensions[0] &&
            this.get( "responsiveDimensions" )[1] === dimensions[1] &&
            !this.isExpanded ) return;

        // New size, new life
        this.set( "responsiveDimensions", dimensions );
        if( !this.isExpanded ){
            this._frameElement.style.height = dimensions[1] + "px";
        } else {
            IGNORE_RESIZE_EVENT = true;
            this._frameElement.style.height = "";
            this._windowHeight = getExpandedAdvertHeight( this );
            this._frameElement.style.height = this._windowHeight + "px";
        }
        // Recalculate new position changes
        this.recalculate();
        this.emit("resize");
    },

    "updateBackgroundConfig": function( config ){
        if( this.get( "adConfig" ) === null ) return;
        // Cache the previous fixed value as if that has changed, we gotta
        // do a whole lot more stuff
        var previousBackgroundFixed = this.get( "adConfig" ).backgroundFixed;
        // Update the master config
        this.set( "adConfig", updateBackgroundKeys( this.get( "adConfig" ), config ) );
        // Updates!
        var backgroundImageConfig = processBackgroundImageConfig( this.get( "adConfig" ), this.get( "responsiveDimensions" ) );
        // Fixed background staying fixed
        if( previousBackgroundFixed && this.get( "adConfig" ).backgroundFixed === true ){
            applyBackgroundToIframe( this._frameElement, backgroundImageConfig );

        // Previously fixed, no longer fixed
        } else if( previousBackgroundFixed && this.get( "adConfig" ).backgroundFixed !== true ){
            resetBackgroundOnIframe( this._frameElement );
            applyBackgroundToElement(
                this._frameDocument.querySelector(".responsive-ad__background"),
                backgroundImageConfig
            );

        // Not fixed and now is
        } else if( !previousBackgroundFixed && this.get( "adConfig" ).backgroundFixed === true ){
            resetBackgroundOnIframe( this._frameDocument.querySelector(".responsive-ad__background") );
            applyBackgroundToIframe( this._frameElement, backgroundImageConfig );

        // Not fixed and still isnt
        } else if( !previousBackgroundFixed && this.get( "adConfig" ).backgroundFixed !== true ){
            var backgroundElement = this._frameDocument.querySelector(".responsive-ad__background");
            var styles = {};
            if( backgroundImageConfig.url !== false ){
                styles.backgroundImage = "url(" + backgroundImageConfig.url + ")";
            }
            if( backgroundImageConfig.colour !== false ){
                styles.backgroundColor = backgroundImageConfig.colour;
            }
            if( backgroundImageConfig.y !== false ){
                styles.backgroundPosition = "0 " + backgroundImageConfig.y + "%";
            }
            if( backgroundImageConfig.repeat !== false ){
                styles.backgroundRepeat = backgroundImageConfig.repeat;
            }
            setInlineStyles( backgroundElement, styles );

        // WAAAAAAT
        } else {
            throw "DIZ SHUD NOT HAPEN!!!";
        }
    },

    "updateLogoConfig": function( logoIndex, config ){
        if( this.get( "adConfig" ) === null ) return;
        if( logoIndex < 0 || logoIndex > this.get( "adConfig" ).logos.length - 1 ){
            throw new RangeError( "logoIndex must be between 0 and " + this.get( "adConfig" ).logos.length - 1 );
        }
        this.get( "adConfig" ).logos[ logoIndex ] = config;
        this.recalculate( logoIndex );
    }

} );

/**
 * The allowed advert sizes for new responsive ads
 * Item 0 - Width
 * Item 1 - Percentage ratio
 * @static
 * @type {Array}
 */
ResponsiveAd.ADVERT_SIZES = [
    [350, 1.25],
    [500, 1.05],
    [900, 0.7],
    [1400, 0.275],
    [1401, 0.225]
];

/**
 * The allowed advert sizes for legacy ads
 * @static
 * @type {Array}
 */
ResponsiveAd.LEGACY_ADVERT_SIZES = [
    [320, 100],
    [400, 125],
    [500, 156],
    [630, 141],
    [760, 170],
    [1000, 224],
    [1200, 268],
    [1400, 313],
    [1520, 340]
];

/**
 * The maximum width the mobile override will work on
 * @static
 * @type {Number}
 */
ResponsiveAd.MOBILE_MAX_WIDTH_INCL = 500;

/**
 * Converts a normal ad to a responsive one
 * @param  {Ad} ad
 * @return {ResponsiveAd}
 */
ResponsiveAd.inheritFrom = function( ad ){
    // If the ad passed through is already a ResponsiveAd, dont do anything
    if( ad instanceof ResponsiveAd ) return ad;
    // Make the responsive ad
    var options = ad.get();
    var responsiveAd = new ResponsiveAd(ad.el, ad.manager, options);
    responsiveAd._all = cloneObjectDeep(ad._all);
    responsiveAd._conf = cloneObjectDeep(ad._conf);
    responsiveAd._events = cloneObjectDeep(ad._events);
    responsiveAd.slot = ad.slot;
    // Update managers and groups
    ad.manager.slots[ad.id] = responsiveAd;
    if(ad.group !== null){
        responsiveAd.group = ad.group;
        responsiveAd.group.slots[ad.id] = responsiveAd;
    }
    // Update state
    switch(ad.state){
        case AD_STATES.RENDERED:
            setAdStateToRendered(responsiveAd);
            break;
        case AD_STATES.DESTROYED:
            setAdStateToDestroyed(responsiveAd);
            break;
        case AD_STATES.STOPPED:
            setAdStateToStopped(responsiveAd);
            break;
    }
    return responsiveAd;
};

/**
 * Calculates the responsive advert dimensions. This is taken from
 * LEGACY_ADVERT_SIZES or ADVERT_SIZES
 * @static
 * @param  {Number} width
 * @param  {Boolean} isLegacy
 * @param  {Boolean} isGroup Whether we want group rather than converted size
 * @return {Array.<Number>}       The dimension
 */
ResponsiveAd.getDimensionsFromWidth = function( width, isLegacy, isGroup ){
    var adSizes = ResponsiveAd.ADVERT_SIZES;
    if( isLegacy ){
        adSizes = ResponsiveAd.LEGACY_ADVERT_SIZES;
    }
    var i = -1;
    var length = adSizes.length;
    while( ++i < length ){
        if( width <= adSizes[ i ][0] ){
            if( isLegacy || isGroup === true ){
                return adSizes[ i ].slice( 0 );
            }
            return calculateHeight( adSizes[ i ] );
        }
    }
    if( isLegacy || isGroup === true ){
        return adSizes[ length - 1 ].slice( 0 );
    } else {
        return calculateHeight( adSizes[ length - 1 ] );
    }

    /**
     * Calculates the height of the dimensions. This only changes anything if
     * we are not using legacy sizes as the second variable in the dimension
     * array is a ratio
     * @param  {Array.<Number>} adSize
     * @return {Array.<Number>}
     */
    function calculateHeight( adSize ){
        var height = width * adSize[1];
        return [ width, height ];
    }

};

// Legacy
window.GptAdSlots = true;

// TODO: this is basically the same as applyBackgroundToIframe so probably merge
// the two functions
function applyBackgroundToElement( backgroundElement, backgroundConfig ){
    var styles = {
        "backgroundRepeat": "no-repeat"
    };
    if( isDefined( backgroundConfig.url ) ){
        styles.backgroundImage = "url(" + backgroundConfig.url + ")";
    }
    if( isDefined( backgroundConfig.colour ) ){
        styles.backgroundColor = backgroundConfig.colour;
    }
    if( isDefined( backgroundConfig.y ) ){
        styles.backgroundPosition = "0 " + backgroundConfig.y + "%";
    }
    if( isDefined( backgroundConfig.repeat ) &&
        backgroundConfig.repeat === true ){
        // TODO: this doesnt seem correct?
        styles.backgroundSize = "cover";
        styles.backgroundRepeat = "repeat";
    }
    setInlineStyles( backgroundElement, styles );
}

/**
 * Applies css background styles onto an iframe
 * NOTE: We actually apply the styles onto the iframe's parent as there is
 * currently a bug with background-attachment: fixed with video in the frame
 * page. https://code.google.com/p/chromium/issues/detail?id=517055
 *
 * @param  {HTMLNode} frameElement
 * @param  {Object} backgroundConfig
 */
function applyBackgroundToIframe( frameElement, backgroundConfig ){
    var styles = {
        "backgroundRepeat": "no-repeat"
    };
    if( isDefined( backgroundConfig.url ) ){
        styles.backgroundImage = "url(" + backgroundConfig.url + ")";
        styles.backgroundAttachment = "fixed";
    }
    if( isDefined( backgroundConfig.colour ) ){
        styles.backgroundColor = backgroundConfig.colour;
    }
    if( isDefined( backgroundConfig.repeat ) &&
        backgroundConfig.repeat === true ){
        // TODO: this doesnt seem correct?
        styles.backgroundSize = "cover";
        styles.backgroundRepeat = "repeat";
    }
    setInlineStyles( frameElement.parentNode, styles );
}

/**
 * Calculates the height of the advert when expanded. This value is either
 * based off of the video ratio or backgroundImage ratio
 * @param  {ResponsiveAd} responsiveAd
 * @return {Number}
 */
function getExpandedAdvertHeight( responsiveAd ){
    var adConfig  = responsiveAd.get( "adConfig" );
    var ratio = 0;
    // IE11: at some point, the window gets a width. apparently that is not
    // when we first do this function. To solve issues, we grab the innerWidth
    // again and assign it to the responsiveAd to cache
    var width = responsiveAd._windowWidth = responsiveAd._frameWindow.innerWidth;
    // If we have a video, set the height based on the video ratio
    if( typeof adConfig.videoWidth === 'number' ){
        width = clamp( 0, adConfig.videoWidth, width );
        ratio = width / adConfig.videoWidth;
        return Math.floor( adConfig.videoHeight * ratio );
    } else {
        width = clamp( 0, adConfig.backgroundWidthPx, width );
        ratio = width / adConfig.backgroundWidthPx;
        return Math.floor( adConfig.backgroundHeightPx * ratio );
    }
}

/**
 * Calculates the logo offset
 * @param  {Object} logoConfig
 * @param  {ResponsiveAd} responsiveAd
 * @return {Object}
 */
function getLogoOffsets( logoConfig, responsiveAd ){

    /**
     * This whole position and dimension thing is crazy. Pull up your socks,
     * tuck in your shirt, get a snack, and hold my hand.
     */

    var CURRENT_DIMENSIONS = responsiveAd.get( "responsiveDimensions" );
    // mobileOverridePosition does not contain heightPx or widthPx so this will
    // always come from normal
    var logoRatio = logoConfig.normal.heightPx / logoConfig.normal.widthPx;
    var logoHeightPercent = 0;
    var logoHeightPx = 0;
    var logoWidthPx = 0;

    /**
     * mobileOverridePosition
     * =========================================================================
     * In the ad builder, the user positions the logo. However if the user
     * changes the position in any of the mobile views, it triggers some
     * mobile override information. This only applies if the view is <= 500,
     * contains the override key and is not using the new responsive layout.
     */

    var logoSizeConfig = logoConfig.normal;
    var bandSizeWidth = ResponsiveAd.getDimensionsFromWidth(
        CURRENT_DIMENSIONS[0],
        isLegacy( responsiveAd ),
        true
    )[0];
    // If its not the new responsive layout, check to see if we are using
    // the mobileOverrides
    if( ( !hasOwnProperty( responsiveAd.get( "adConfig" ), "isMobile" ) ||
          !responsiveAd.get( "adConfig" ).isMobile ) &&
        hasOwnProperty( logoConfig, "mobileOverridePosition" ) &&
        responsiveAd._windowWidth <= ResponsiveAd.MOBILE_MAX_WIDTH_INCL ){

        logoSizeConfig = logoConfig.mobileOverridePosition;

    // Using the new responsive layout. Check to see if there is a breakpoint
    // width change
    } else if( responsiveAd.get( "adConfig" ).isMobile === true &&
               hasOwnProperty( logoConfig, "positions" ) &&
               hasOwnProperty( logoConfig.positions, bandSizeWidth ) ){

        logoSizeConfig = logoConfig.positions[ bandSizeWidth ];
    }

    /**
     * Logo height
     * =========================================================================
     * Everything is based off of the image height! Everything! This is
     * because the height only changes when we hit a new dimension category
     * instead of constantly changing with the window width. This height has to
     * be a fixed pixel value as it would be affected when the advert becomes
     * expanded.
     */

    logoHeightPercent = logoSizeConfig.heightPercent;
    if( logoHeightPercent === null || logoHeightPercent === undefined ){
        var tmpWidthPx = CURRENT_DIMENSIONS[0] *
                         ( logoSizeConfig.widthPercent / 100 );
        var tmpHeightPx = tmpWidthPx * logoRatio;
        logoHeightPercent = ( tmpHeightPx / CURRENT_DIMENSIONS[1] ) * 100;
    }

    logoHeightPx = CURRENT_DIMENSIONS[1] * ( logoHeightPercent / 100 );
    logoHeightPx = responsiveAd._windowHeight * ( logoHeightPercent / 100 );
    // Check if the logo is too big
    if(logoHeightPx > logoSizeConfig.heightPx){
        logoHeightPx = logoSizeConfig.heightPx;
    }
    // Work out the width based from the height ^
    logoWidthPx = logoHeightPx / logoRatio;


    /**
     * Logo left and top
     * =========================================================================
     * The position of the logo uses the logo's height and width along with
     * leftPercent and topPercent.
     */
    var logoLeft = 0;
    var logoTop = 0;

    // We use the windowHeight here instead of the CURRENT_DIMENSIONS as if
    // the window is expanding, we need the top to move but want everything
    // else to stay the same.
    logoTop = ( responsiveAd._windowHeight - logoHeightPx ) *
              ( logoSizeConfig.topPercent / 100 );
    logoTop = ( logoTop / responsiveAd._windowHeight ) * 100;

    logoLeft = ( CURRENT_DIMENSIONS[0] - logoWidthPx ) *
               ( logoSizeConfig.leftPercent / 100 );
    logoLeft = ( logoLeft / CURRENT_DIMENSIONS[0] ) * 100;

    return {
        "height": logoHeightPx,
        "left": logoLeft,
        "top": logoTop
    };
}

/**
 * Checks if a value is not null or undefined
 * @param  {*}  value
 * @return {Boolean}
 */
function isDefined( value ){
    return value !== null && value !== undefined;
}

/**
 * Detects if the advert is a legacy
 * @param  {ResponsiveAd}  ad
 * @return {Boolean}
 */
function isLegacy( ad ){
    if( ad.get( "adConfig" ).isMobile !== undefined ){
        // Invert the isMobile value as true means we are using the new sizes,
        // but in this sense we're asking if its old. I should probably change
        // this?
        return !ad.get( "adConfig" ).isMobile;
    }
    return true;
}

/**
 * Inserts tracking pixels for when the advert expands
 * @param  {ResponsiveAd} responsiveAd
 */
function insertExpandPixelTracking( responsiveAd ){

    if( responsiveAd._expandPixels ) return;
    responsiveAd._expandPixels = true;

    var adConfig = responsiveAd.get( "adConfig" );
    if( adConfig.onExpandPixelSrcs !== undefined &&
        adConfig.onExpandPixelSrcs.length > 0 ){
        var img = null;
        adConfig.onExpandPixelSrcs.forEach(function(src){
            // Sometimes the src might be an empty string, if so, don't add
            // the bloody thing
            if( src === "" ) return;

            img = new Image();
            img.className = "responsive-ad__pixel-tracking";
            img.src = src;
            responsiveAd._frameDocument.body.appendChild( img );
        });
        img = null;
    }

}

/**
 * Opens the url in a new window or redirects the page. If the url is blank,
 * it will not open the window
 * @param  {String} url
 * @param  {Boolean} redirect
 */
function openUrl( url, redirect ){
    if( !url ) return;
    if( redirect ){
        window.top.location.href = url;
    } else {
        window.open( url );
    }
}

/**
 * Parses the adConfig and return an object containing backgroundImage
 * information for the template render
 * @param  {Object} adConfig
 * @return {Object}
 */
function processBackgroundImageConfig( adConfig, currentDimensions ){

    var currentWidth = null;

    var bgColour = isDefined( adConfig.backgroundColour ) ?
                   adConfig.backgroundColour :
                   false;

    var bgRepeat = isDefined( adConfig.backgroundRepeat ) ?
                   adConfig.backgroundRepeat :
                   false;

    var url = isDefined( adConfig.backgroundImageSrc ) ?
              adConfig.backgroundImageSrc :
              false;

    var y = 0;
    if( url !== false && currentDimensions ){

        /**
         * What is focal top?
         * It is the vertical middle pixel of the image that is in the vertical
         * middle of the advert.
         */
        var focalTop = adConfig.backgroundFocalTop;
        if( hasOwnProperty( adConfig, 'backgroundFocals' ) &&
            hasOwnProperty( adConfig.backgroundFocals, currentDimensions[0] ) ){
            focalTop = adConfig.backgroundFocals[ currentDimensions[0] ];
        }

        var advertCentre = currentDimensions[1] / 2;
        var sizeRatio = currentDimensions[0] / adConfig.backgroundWidthPx;
        focalTop *= sizeRatio;
        if( focalTop > advertCentre ){
            var difference = advertCentre - focalTop;
            var backgroundTop = difference / (currentDimensions[1] + advertCentre);
            y = backgroundTop * -100;
        }

    }

    return {
        "colour": bgColour,
        "repeat": bgRepeat,
        "url": url,
        "y": y
    };
}

/**
 * Converts the adConfig.logos into a simple structure for the template render
 * @param  {Object} adConfig
 * @return {Array.<Object>}
 */
function processLogoConfig( adConfig ){
    var cls = "";
    return adConfig.logos.map(onMapLogo);
    function onMapLogo( logoConfig ){
        cls = "";
        if( logoConfig.normal.visibleWhenContracted ){
            cls += " responsive-ad__logo--contracted";
        }
        if( logoConfig.normal.visibleWhenExpanded ){
            cls += " responsive-ad__logo--expanded";
        }
        if( logoConfig.normal.visibleOnMobile ){
            cls += " responsive-ad__logo--mobile";
        }
        if( logoConfig.normal.visibleOnDesktop ){
            cls += " responsive-ad__logo--desktop";
        }
        if( logoConfig.clickAction === "pauseVideoAndCollapse" ){
            cls += " responsive-ad__logo--pause";
        }
        return {
            "cls": cls,
            "isPauseButton": ( logoConfig.clickAction === "pauseVideoAndCollapse" ),
            "url": logoConfig.normal.src
        };
    }
}

function resetBackgroundOnIframe( frameElement ){
    setInlineStyles( frameElement.parentNode, {
        "backgroundAttachment": "",
        "backgroundColor": "",
        "backgroundImage": "",
        "backgroundRepeat": "",
        "backgroundSize": ""
    });
}

/**
 * Sets the inline styles of an element
 * @param {HTMLNode} el
 * @param {Object} styles
 */
function setInlineStyles( el, styles ){
    for( var key in styles ){
        if( hasOwnProperty( styles, key ) ){
            el.style[ key ] = styles[ key ];
        }
    }
}

function updateBackgroundKeys( masterConfig, newConfig ){
    var keys = [
        "backgroundColour",
        "backgroundFixed",
        "backgroundFocalBottom",
        "backgroundFocalTop",
        "backgroundFocals",
        "backgroundHeightPx",
        "backgroundImageSrc",
        "backgroundRepeat",
        "backgroundShouldClipWidth",
        "backgroundWidthPx",
    ];
    keys.forEach(function eachKey(key){
        // Check if the newConfig has the key. If not, remove it from masterConfig
        if( !hasOwnProperty( newConfig, key ) ){
            delete masterConfig[ key ];
        } else {
            masterConfig[ key ] = newConfig[ key ];
        }
    });
    return masterConfig;
}

export default ResponsiveAd;
'use strict';


import EventEmitter from 'eventemitter2';
import {
    addClass,
    addEvent,
    inherit,
    removeClass,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';

var VIDEO_EVENTS = {
    'ENDED': 'ended',
    'PAUSE': 'pause',
    'PLAY': 'play',
    'RENDER': 'render',
    'STOP': 'stop',
    'off': function( el, type, fn ){
        removeEvent( el, type, fn );
    },
    'on': function( el, type, fn ){
        return addEvent( el, type, fn );
    }
};

/**
 * Destroy event
 * When the video has been told to destroy itself; clearing event listeners
 * and removing itself from the dom
 *
 * @event ResponsiveAdVideo#destroy
 */

/**
 * Ended event
 * When the video has reached the end of itself
 *
 * @event ResponsiveAdVideo#ended
 */

/**
 * Mute event
 * When the video has become muted
 *
 * @event RepsonsiveAdVideo#mute
 */

/**
 * Pause event
 * When the video has been told to pause
 *
 * @event ResponsiveAdVideo#pause
 */

/**
 * Play event
 * When the video has been told to play
 *
 * @event ResponsiveAdVideo#play
 */

/**
 * Ready event
 * When the videos is ready to start being used. This will be fired after the
 * render event
 *
 * @event ResponsiveAdVideo#ready
 */

/**
 * Render event
 * When the video has successfully rendered its content
 *
 * @event ResponsiveAdVideo#render
 */

/**
 * Stop event
 * When the video has been told to stop
 *
 * @event ResponsiveAdVideo#stop
 */

/**
 * Unmute event
 * When the video has become unmuted
 *
 * @event ResponsiveAdVideo#unmute
 */

/**
 * ResponsiveAdVideo class
 * @constructor
 * @param {HTMLNode} el
 * @param {Object} videoOptions
 */
function ResponsiveAdVideo( el, videoOptions ){
    EventEmitter.call( this );

    this._autoplay = videoOptions.autoplay;
    this._eventHooks = {};
    this._loop = videoOptions.loop;
    this._rendered = false;

    this.el = el;
    this.isMuted = videoOptions.muted === undefined ? false : videoOptions.muted;
    this.isReady = false;
    this.isVisible = false;
    this.options = videoOptions;
    this.video = null;

    this._render();
}

ResponsiveAdVideo.prototype = inherit( EventEmitter.prototype, {

    /**
     * Binds events to the video player
     * @private
     */
    '_bindEvents': function(){
        this._eventHooks.ended = this._onVideoEnded.bind(this);
        VIDEO_EVENTS.on( this.video, VIDEO_EVENTS.ENDED, this._eventHooks.ended );
    },

    /**
     * Fired when the video has finished playing
     * @private
     */
    '_onVideoEnded': function(){
        this.stop();
        this.emit( 'ended' );
    },

    /**
     * Renders the player
     * @private
     */
    '_render': function(){

        if( this._rendered ) this._unbindEvents();

        this.many( 'ready', 1, this._bindEvents.bind(this) );

        this.video = this._renderHTML5Video();

        this._rendered = true;
        this.emit( 'render' );

    },

    /**
     * Renders the HTML5 video version
     * @private
     * @return {HTMLNode} The video player
     */
    '_renderHTML5Video': function(){

        var videoElement = document.createElement('video');

        /**
         * Note: older chromes struggle to fire loadedmetadata and loadeddata
         * video events when there are multiple same videos on the web page.
         * Appending a cache bust tricks it into firing them
         */
        videoElement.appendChild( createVideoSource( 'video/webm',
            cacheBuster(this.options.webm) ) );
        videoElement.appendChild( createVideoSource( 'video/mp4',
            cacheBuster(this.options.mp4) ) );
        if( this._autoplay ){
            videoElement.setAttribute( 'autoplay', true );
        }
        if( this.isMuted ){
            videoElement.setAttribute( 'muted', true );
        }
        if( this._loop ){
            videoElement.setAttribute( 'loop', true );
        }
        addEvent( videoElement, 'loadedmetadata', onLoadedData.bind(this) );

        this.el.appendChild( videoElement );

        function onLoadedData(){
            removeEvent( videoElement, 'loadedmetadata', onLoadedData );
            this.isReady = true;
            this.emit('ready');
        }

        return videoElement;
    },

    /**
     * Unbinds any events attached to the player
     * @private
     */
    '_unbindEvents': function(){
        VIDEO_EVENTS.off( this.video, VIDEO_EVENTS.ENDED, this._eventHooks.ended );
        this._eventHooks.ended = null;
    },

    /**
     * @constructor
     */
    'constructor': ResponsiveAdVideo,

    /**
     * Destroys the video player
     * @fires ResponsiveAdVideo#destroy
     */
    'destroy': function(){
        if( this._rendered ) this._unbindEvents();
        this.el.parentNode.removeChild( this.el );
        this.emit( 'destroy' );
    },

    /**
     * Hides the video player
     */
    'hide': function(){
        if( !this.isVisible ) return;
        this.isVisible = false;
        removeClass( this.el, 'responsive-ad__video--visible' );
    },

    /**
     * Mutes the video
     * @fires ResponsiveAdVideo#mute
     */
    'mute': function(){
        if( this.isMuted || this.video === null ) return;
        this.video.setAttribute( 'muted', true );
        this.emit( 'mute' );
    },

    /**
     * Pauses the video player
     * @fires ResponsiveAdVideo#pause
     */
    'pause': function(){
        if( !this.isReady ) return;
        this.video.pause();
        this.emit( 'pause' );
    },

    /**
     * Plays the video player
     * @fires ResponsiveAdVideo#play
     */
    'play': function(){
        if( !this.isReady ) return;
        this.video.play();
        this.emit( 'play' );
    },

    /**
     * Shows the video player
     */
    'show': function(){
        if( this.isVisible ) return;
        this.isVisible = true;
        addClass( this.el, 'responsive-ad__video--visible' );
    },

    /**
     * Stops the video player
     * @fires ResponsiveAdVideo#stop
     */
    'stop': function(){
        if( !this.isReady ) return;
        this.video.pause();
        this.video.currentTime = 0;
        this.emit( 'stop' );
    },

    /**
     * Toggles the mute on the video
     */
    'toggleMute': function(){
        if( this.isMuted ) return this.unmute();
        this.mute();
    },

    /**
     * Umutes the video
     * @fires RepsonsiveAdVideo#unmute
     */
    'unmute': function(){
        if( !this.isMuted || this.video === null ) return;
        this.video.setAttribute( 'muted', false );
        this.emit( 'unmute' );
    }

});

/**
 * Appends a random piece of crap at the end of url
 * @param  {String} url
 * @return {String}
 */
function cacheBuster(url){
    return url + '?' + Math.random();
}

/**
 * Create a <source> element
 * @param  {String} type
 * @param  {String} src
 * @return {HTMLNode}
 */
function createVideoSource( type, src ){
    var sourceElement = document.createElement('source');
    sourceElement.setAttribute( 'type', type );
    sourceElement.setAttribute( 'src', src );
    return sourceElement;
}

export default ResponsiveAdVideo;
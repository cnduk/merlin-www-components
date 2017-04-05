'use strict';

import {
    addEvent,
    ajax,
    createEventTemplate,
    getScrollTop,
    inherit,
    removeEvent,
    throttle
} from '@cnbritain/merlin-www-js-utils/js/functions';
import EventEmitter from 'eventemitter2';


/**
 * Enable event
 * @event  InfiniteScroll#enable
 * @type  {Object}
 */

/**
 * Destroy event
 * @event  InfiniteScroll#destroy
 * @type  {Object}
 */

/**
 * Disable event
 * @event  InfiniteScroll#disable
 * @type  {Object}
 */

/**
 * LoadComplete event
 * @event  InfiniteScroll#loadComplete
 * @type  {Object}
 * @property  {Object}  data  The XMLHttpRequest data
 * @property  {Object}  originalRequest  The XMLHttpRequest
 */

/**
 * LoadError event
 * @event  InfiniteScroll#loadError
 * @type  {Object}
 * @property  {Object}  data  The XMLHttpRequest data
 * @property  {Object}  originalRequest  The XMLHttpRequest
 */

/**
 * Loading event
 * @event  InfiniteScroll#loading
 * @type  {Object}
 * @property  {String}  url  The url that is being loaded
 */

/**
 * Pause event
 * @event  InfiniteScroll#pause
 * @type  {Object}
 */

/**
 * Resume event
 * @event  InfiniteScroll#resume
 * @type  {Object}
 */

/**
 * @class InfiniteScroll
 * @param {Object} config Configuration
 * @param {Number|Null} config.throttle The throttle speed in milliseconds
 * @param {Function} config.trigger The trigger function that checks when to
 *                                  load the url
 * @param {Function|String} config.url The url to load
 */
function InfiniteScroll( config ){
    EventEmitter.call( this );

    /**
     * Internal cache of listeners
     * @private
     * @type {Object}
     */
    this._hooks = {};

    /**
     * Loading state
     * @private
     * @type {Boolean}
     */
    this._loading = false;

    /**
     * Page counter
     * @private
     * @type {Number}
     */
    this._pageCounter = 0;

    /**
     * Throttle speed. Defaults to 0 (no throttle)
     * @private
     * @type {Number}
     */
    this._throttle = 0;

    /**
     * Trigger functions for checking when to load the url
     * @private
     * @type {Function}
     */
    this._trigger = config.trigger;

    /**
     * Function that will build the url
     * @private
     * @type {Function}
     */
    this._urlBuilder = null;

    if(typeof config.throttle === 'number'){
        this._throttle = config.throttle;
    }
    if(typeof config.url === 'function'){
        this._urlBuilder = config.url;
    } else {
        this._urlBuilder = constant(config.url);
    }

    /**
     * Element the scroll event is listening on
     * @type {HTMLElement|Window}
     */
    this.el = config.el;

    /**
     * Enabled state
     * @type {Boolean}
     */
    this.isEnabled = false;

    /**
     * Paused state
     * @type {Boolean}
     */
    this.isPaused = false;

}
InfiniteScroll.prototype = inherit( EventEmitter.prototype, {

    /**
     * Binds the scroll listeners to the element
     * @private
     */
    '_bind': function(){
        if( this._throttle > 0 ){
            this._hooks.onScroll = throttle( this.update, this._throttle, this );
        } else {
            this._hooks.onScroll = this.update.bind(this);
        }
        addEvent( this.el, 'scroll', this._hooks.onScroll );
    },

    /**
     * Creates the url and starts to load it
     * @private
     * @emits InfiniteScroll#loading
     */
    '_loadUrl': function(){
        var url = this._urlBuilder( ++this._pageCounter );
        this._loading = true;
        this.emit( 'loading', createEventTemplate('loading', this, {
            'url': url
        }));
        ajax({
            'url': url
        }).then(
            onLoadSuccess.bind(this),
            onLoadError.bind(this)
        );
    },

    /**
     * Unbinds the scroll listener
     * @private
     */
    '_unbind': function(){
        removeEvent( this.el, 'scroll', this._hooks.onScroll );
        this._hooks.onScroll = null;
    },

    /**
     * Destroys the infinite scroller
     * @public
     * @memberof! InfiniteScroll.prototype
     * @emits InfiniteScroll#destroy
     */
    'destroy': function(){
        this.disable();
        this.el = null;
        this.emit('destroy', createEventTemplate('destroy', this));
        this.removeAllListeners();
    },

    /**
     * Disables the infinite scroller. This unbinds the scroll listener.
     * @public
     * @memberof! InfiniteScroll.prototype
     * @emits InfiniteScroll#disable
     */
    'disable': function(){
        if( !this.isEnabled ) return;
        this.isEnabled = false;
        this._unbind();
        this.emit('disable', createEventTemplate('disable', this));
    },

    /**
     * Enables the infinite scroller. This binds the scroll listener.
     * @public
     * @memberof! InfiniteScroll.prototype
     * @emits InfiniteScroll#enable
     */
    'enable': function(){
        if( this.isEnabled ) return;
        this.isEnabled = true;
        this._bind();
        this.emit('enable', createEventTemplate('enable', this));
    },

    /**
     * Pauses the infinite scroller
     * @public
     * @memberof! InfiniteScroll.prototype
     * @emits InfiniteScroll#pause
     */
    'pause': function(){
        this.isPaused = true;
        this.emit('pause', createEventTemplate('pause', this));
    },

    /**
     * Resumes the infinite scroller
     * @public
     * @memberof! InfiniteScroll.prototype
     * @emits InfiniteScroll#resume
     */
    'resume': function(){
        this.isPaused = false;
        this.emit('resume', createEventTemplate('resume', this));
    },

    /**
     * Updates the scroll position. This will run the trigger that is set and
     * if that succeeds, it will begin loading the url
     * @public
     * @memberof! InfiniteScroll.prototype
     */
    'update': function(){
        if( this._loading || this.isPaused || !this.isEnabled ) return;
        var scrollY = getScrollTop( this.el );
        if( this._trigger( scrollY ) ){
            this._loadUrl();
        }
    }

} );

/**
 * Returns a function that will always provide a constant value
 * @param  {*} value The constant value
 * @return {Function}
 */
function constant(value){
    return function constant_inner(){
        return value;
    };
}

/**
 * Listener for when the ajax request errors. It emits an loadEror event.
 * @this InfiniteScroll
 * @emits InfiniteScroll#loadError
 * @param  {Object} data The data back from the ajax promise
 * @param  {String} data.event  The event data from the XMLHttpRequest
 * @param  {String} data.request  The original request from XMLHttpRequest
 */
function onLoadError(data){
    this.emit('loadError', createEventTemplate('loadError', this, {
        'data': data.event,
        'originalRequest': data.request
    }) );
    this._loading = false;
}

/**
 * Listener for when the ajax request succeeds. It emits a load event.
 * @this InfiniteScroll
 * @emits InfiniteScroll#load
 * @param  {Object} data The data back from the ajax promise
 * @param  {String} data.event  The event data from the XMLHttpRequest
 * @param  {String} data.request  The original request from XMLHttpRequest
 */
function onLoadSuccess(data){
    this.emit('loadComplete', createEventTemplate('loadComplete', this, {
        'data': data.event,
        'originalRequest': data.request
    }));
    this._loading = false;
}

export default InfiniteScroll;

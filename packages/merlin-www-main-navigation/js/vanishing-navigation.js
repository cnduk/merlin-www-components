'use strict';

import {
    addClass,
    addEvent,
    getWindowScrollTop,
    removeClass,
    removeEvent,
    throttle
} from '@cnbritain/merlin-frontend-utils-js/js/functions';

var CLS_VANISH = 'n-vanishing-nav';
var CLS_VANISH_HIDDEN = 'is-hidden';
var MIN_HIDDEN_Y = 400;
var THROTTLE_MS = 300;

function VanishingNavigation(mainNavigation){
    this._lastScrollY = 0;
    this._offsetY = 0;
    this._scrollHook = null;
    this.navigation = mainNavigation;
    this.states = {
        'enabled': false,
        'paused': false,
        'visible': true
    };
}

VanishingNavigation.prototype = {

    'constructor': VanishingNavigation,

    'destroy': function(){
        this.disable();
        this.navigation = null;
        this.states = null;
    },

    'disable': function(){
        if(!this.states.enabled) return;
        this.states.enabled = false;

        removeClass(this.navigation.el, CLS_VANISH);
        removeEvent(window, 'scroll', this._scrollHook);
        this._scrollHook = null;
    },

    'enable': function(){
        if(this.states.enabled) return;
        this.states.enabled = true;

        addClass(this.navigation.el, CLS_VANISH);
        this._scrollHook = throttle(this.update, THROTTLE_MS, this);
        addEvent(window, 'scroll', this._scrollHook);
    },

    'hide': function(){
        if(!this.states.visible) return;
        this.states.visible = false;
        addClass(this.navigation.el, CLS_VANISH_HIDDEN);
    },

    'pause': function(){
        this.states.paused = true;
    },

    'show': function(){
        if(this.states.visible) return;
        this.states.visible = true;
        removeClass(this.navigation.el, CLS_VANISH_HIDDEN);
    },

    'unpause': function(){
        this.states.paused = false;
    },

    'update': function(){
        if(this.states.paused) return;

        var scrollY = getWindowScrollTop();
        var scrollVelocity = scrollY - this._lastScrollY;
        this._lastScrollY = scrollY;

        // Check if we are in the min Y
        if( scrollY - this._offsetY <= MIN_HIDDEN_Y ){
            if( !this.states.visible ) this.show();
            return;
        }

        // Check if we're scrolling up and visible
        if( !this.states.visible && scrollVelocity < 0 ){
            return this.show();
        }

        // Check if we are greater than our min Y
        if( this.states.visible && scrollVelocity > 0 ){
            return this.hide();
        }
    }

};

export default VanishingNavigation;
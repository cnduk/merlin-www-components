'use strict';

import EventEmitter from 'eventemitter2';
import {
    addEvent,
    inherit,
    removeClass,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';
import * as events from './events';

var CLS_NEXT_BUTTON = '.g-image-nav__btn--next';
var CLS_PREVIOUS_BUTTON = '.g-image-nav__btn--previous';

function GalleryImageNavigation(el){
    EventEmitter.call(this, {'wildcard': true});
    this.el = el;
    this.height = 0;

    this._init();
}

GalleryImageNavigation.prototype = inherit(EventEmitter.prototype, {

    "_init": function(){
        var btn = this.el.querySelector(CLS_NEXT_BUTTON);
        if(btn){
            addEvent(btn, 'click', function(){
                this.emit('next', events.navNext(this));
            }.bind(this));
        }

        btn = this.el.querySelector(CLS_PREVIOUS_BUTTON);
        if(btn){
            addEvent(btn, 'click', function(){
                this.emit('previous', events.navPrevious(this));
            }.bind(this));
        }

        removeClass(this.el, 'is-hidden');

        this.resize();
    },

    "constructor": GalleryImageNavigation,

    "disableNextButton": function(){
        var btn = this.el.querySelector(CLS_NEXT_BUTTON);
        if(btn) btn.setAttribute('disabled', true);
    },

    "disablePreviousButton": function(){
        var btn = this.el.querySelector(CLS_PREVIOUS_BUTTON);
        if(btn) btn.setAttribute('disabled', true);
    },

    "enableNextButton": function(){
        var btn = this.el.querySelector(CLS_NEXT_BUTTON);
        if(btn) btn.removeAttribute('disabled');
    },

    "enablePreviousButton": function(){
        var btn = this.el.querySelector(CLS_PREVIOUS_BUTTON);
        if(btn) btn.removeAttribute('disabled');
    },

    "resize": function(){
        this.height = this.el.offsetHeight;
    }

});

export default GalleryImageNavigation;

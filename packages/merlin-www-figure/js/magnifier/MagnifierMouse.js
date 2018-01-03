'use strict';

import EventEmitter from 'eventemitter2';

import {
    addClass,
    addEvent,
    addEventOnce,
    clamp,
    inherit,
    removeClass,
    removeElement,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';

import * as events from './events';
import {
    JS_MAGNIFIER_BUTTON,
    CLS_MAGNIFIER,
    CLS_HAS_MAGNIFIER,
    CLS_IS_HIDDEN
} from './constants';
import {
    CLS_FIGURE_TOOLBAR
} from '../constants';
import {
    getElementMagnifierConfig,
    mapValue,
    preloadImage
} from './utils';

function MagnifierMouse(el, options) {
    EventEmitter.call(this);

    var _options = options || {};

    this._containerPosition = null;
    this._hooks = {};
    this._magnifierConfig = getElementMagnifierConfig(el);
    this._magnifierLayer = null;

    // The element should be .c-figure
    this.el = el;
    this.isOpen = false;
    this.padding = {
        'bottom': _options.paddingBottom || 0,
        'left': _options.paddingLeft || 0,
        'right': _options.paddingRight || 0,
        'top': _options.paddingTop || 0
    };

    this.resize();
}

MagnifierMouse.prototype = inherit(EventEmitter.prototype, {

    '_bind': function() {
        this._bindDOM();
        this._bindEvents();
        this._bindStyles();
    },

    '_bindDOM': function() {
        var magnifierLayer = this._magnifierLayer = document.createElement('div');
        magnifierLayer.className = [CLS_MAGNIFIER, CLS_IS_HIDDEN].join(' ');
        magnifierLayer.setAttribute('title', 'Click to close');
        magnifierLayer.style.backgroundImage = 'url(' + this._magnifierConfig.url + ')';
        this.el.querySelector('.c-figure__wrapper').appendChild(magnifierLayer);

        // Force repaint :(
        var w = magnifierLayer.offsetWidth; // eslint-disable-line no-unused-vars

        preloadImage(this._magnifierConfig.url)
            .then(function(url) {
                magnifierLayer.style.backgroundImage = 'url(' + url + ')';
                removeClass(magnifierLayer, CLS_IS_HIDDEN);
            });
    },

    '_bindEvents': function() {
        // Click to close
        this._hooks.onLayerClick = this.close.bind(this);
        addEventOnce(this._magnifierLayer, 'click', this._hooks.onLayerClick);
        // Mousemove to pan
        this._hooks.onLayerMousemove = this._onLayerMousemove.bind(this);
        addEvent(this._magnifierLayer, 'mousemove', this._hooks.onLayerMousemove);
    },

    '_bindStyles': function() {
        addClass(this.el, CLS_HAS_MAGNIFIER);
        addClass(this.el.querySelector('.' + CLS_FIGURE_TOOLBAR), CLS_IS_HIDDEN);
    },

    '_onLayerMousemove': function(e) {
        this.pan(
            e.pageX - this._containerPosition.left,
            e.pageY - this._containerPosition.top
        );
    },

    '_unbind': function() {
        this._unbindStyles();
        this._unbindEvents();
        this._unbindDOM();
    },

    '_unbindDOM': function() {
        // We remove on the timer so we can transition the fade
        addClass(this._magnifierLayer, CLS_IS_HIDDEN);
        setTimeout(function() {
            removeElement(this._magnifierLayer);
            this._magnifierLayer = null;
        }.bind(this), 500);
    },

    '_unbindEvents': function() {
        // Shouldnt need to removeEvent but just to be safes
        removeEvent(this._magnifierLayer, 'click', this._hooks.onLayerClick);
        this._hooks.onLayerClick = null;
        // Pan
        removeEvent(this._magnifierLayer, 'mousemove', this._hooks.onLayerMousemove);
        this._hooks.onLayerMousemove = null;
    },

    '_unbindStyles': function() {
        removeClass(this.el, CLS_HAS_MAGNIFIER);
        // Show the share buttons
        removeClass(this.el.querySelector('.' + CLS_FIGURE_TOOLBAR), CLS_IS_HIDDEN);
    },

    'close': function() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this._unbind();
        this.emit('close', events.close(this));
    },

    'constructor': MagnifierMouse,

    'destroy': function() {
        this.close();
        this.removeAllListeners();
        this.el = null;
    },

    'open': function() {
        if (this.isOpen) return;

        this.isOpen = true;
        this._bind();
        // Pan to the center
        this.pan(
            this._containerPosition.width / 2,
            this._containerPosition.height / 2
        );
        this.emit('open', events.open(this));
    },

    'pan': function(x, y) {
        var left = this.padding.left;
        var right = this._containerPosition.width - this.padding.right - this.padding.left;
        var top = this.padding.top;
        var bottom = this._containerPosition.height - this.padding.bottom - this.padding.top;

        var positionX = clamp(left, right, x);
        var positionY = clamp(top, bottom, y);

        var percX = mapValue(positionX, left, right, 0, 100);
        var percY = mapValue(positionY, top, bottom, 0, 100);

        this._magnifierLayer.style.backgroundPosition = percX + '% ' + percY + '%';
    },

    'resize': function() {
        this._containerPosition = getPosition(this.el);
        this.emit('resize', events.resize(this));
    }

});

function getPosition(el) {
    var width = el.offsetWidth;
    var height = el.offsetHeight;
    var left = 0;
    var top = 0;
    if (el.offsetParent) {
        do {
            left += el.offsetLeft;
            top += el.offsetTop;
        } while (el = el.offsetParent); //eslint-disable-line no-cond-assign
    }
    return {
        'height': height,
        'left': left,
        'top': top,
        'width': width
    };
}

MagnifierMouse.bindElement = function(el, options) {
    // Get zoom button
    var button = el.querySelector('.' + JS_MAGNIFIER_BUTTON);
    var magnifier = null;
    addEvent(button, 'click', function(e) {
        e.preventDefault();

        magnifier = new MagnifierMouse(el, options);
        magnifier.open();

        magnifier.once('close', function() {
            magnifier.destroy();
            magnifier = null;
        });

        return false;
    });
};

export default MagnifierMouse;
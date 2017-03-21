'use strict';

import EventEmitter from 'eventemitter2';
import Hammer from 'hammerjs';
import overlayTemplate from '../../templates/magnifier-touch.mustache';

import {
    addEvent,
    addEventOnce,
    assign,
    clamp,
    inherit,
    removeClass,
    removeElement,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';

import {
    JS_MAGNIFIER_BUTTON,
    JS_MAGNIFIER_BUTTON_CLOSE,
    JS_MAGNIFIER_BUTTON_ZOOM_IN,
    JS_MAGNIFIER_BUTTON_ZOOM_OUT,
    CLS_MAGNIFIER,
    CLS_MAGNIFIER_FULLSCREEN,
    CLS_MAGNIFIER_IMAGE,
    CLS_HAS_MAGNIFIER,
    CLS_IS_HIDDEN
} from './constants';
import * as events from './events';
import { disableZoom, enableZoom, getElementMagnifierConfig } from './utils';

function MagnifierTouch(el, options) {
    EventEmitter.call(this);

    var _magnifierConfig = getElementMagnifierConfig(el);

    var _options = assign({
        "maxScale": 2,
        "minScale": calculateMinScale(
            _magnifierConfig.width, _magnifierConfig.height),
        "scaleIncrement": 0.25
    }, _options);

    this._containerPosition = null;
    this._hammer = null;
    this._hooks = {};
    this._magnifierConfig = _magnifierConfig;
    this._magnifierLayer = null;
    this._magnifierImage = null;
    this._transform = {
        "scale": 1,
        "tmpScale": 1,
        "tmpX": 0,
        "tmpY": 0,
        "x": 0,
        "y": 0
    };

    this.el = el;
    this.isOpen = false;
    this.maxScale = _options.maxScale;
    this.minScale = _options.minScale;
    this.scaleIncrement = _options.scaleIncrement;

    this.resize();
}

MagnifierTouch.prototype = inherit(EventEmitter.prototype, {

    "_bindDom": function() {
        this._magnifierLayer = document.createElement("div");
        this._magnifierLayer.className = [
            CLS_MAGNIFIER,
            CLS_MAGNIFIER_FULLSCREEN
        ].join(' ');
        this._magnifierLayer.innerHTML = overlayTemplate({
            "image_url": this._magnifierConfig.url
        });
        document.body.appendChild(this._magnifierLayer);

        this._magnifierImage = this._magnifierLayer.querySelector(
            '.' + CLS_MAGNIFIER_IMAGE);
    },

    "_bindEvents": function() {
        this._hammer = new Hammer(this._magnifierLayer, {});
        this._hammer.get("pinch").set({ "enable": true });

        this._hooks.onClose = this.close.bind(this);
        this._hooks.onZoomIn = this.zoomIn.bind(this);
        this._hooks.onZoomOut = this.zoomOut.bind(this);
        this._hooks.onPanPinch = this._onPanPinch.bind(this);

        var btnClose = this._magnifierLayer.querySelector(
            '.' + JS_MAGNIFIER_BUTTON_CLOSE);
        var btnZoomIn = this._magnifierLayer.querySelector(
            '.' + JS_MAGNIFIER_BUTTON_ZOOM_IN);
        var btnZoomOut = this._magnifierLayer.querySelector(
            '.' + JS_MAGNIFIER_BUTTON_ZOOM_OUT);

        addEvent(btnClose, "touchend", this._hooks.onClose);
        addEvent(btnZoomIn, "touchend", this._hooks.onZoomIn);
        addEvent(btnZoomOut, "touchend", this._hooks.onZoomOut);

        this._hammer.on('pan pinch panend pinchend', this._hooks.onPanPinch);
    },

    "_onPanPinch": function(e){
        var scale = this._transform.scale;
        var x = this._transform.x;
        var y = this._transform.y;

        // Scale
        if(e.scale !== 1){
            scale = this._transform.scale * e.scale;
            scale = clamp(this.minScale, this.maxScale, scale);
        }

        // Position
        x = this._transform.x + e.deltaX;
        y = this._transform.y + e.deltaY;
        var clampedPosition = clampPosition(
            x,
            y,
            scale,
            this._magnifierConfig.width,
            this._magnifierConfig.height
        );
        if(clampedPosition){
            x = clampedPosition.x;
            y = clampedPosition.y;
        }

        this._setImageTransform(x, y, scale);

        if(e.type == 'pinchend' || e.type == 'panend'){
            this._transform.scale = scale;
            this._transform.x = x;
            this._transform.y = y;
        }
    },

    "_setImageTransform": function(x, y, scale) {
        var transform = [
            "translate3d(" + x + "px, " + y + "px, 0)",
            "scale3d(" + scale + ", " + scale + ", 1)"
        ];
        setTransform(this._magnifierImage, transform.join(" "));
    },

    "_unbindDom": function() {
        this._magnifierImage = null;
        removeElement(this._magnifierLayer);
        this._magnifierLayer = null;
    },

    "_unbindEvents": function() {

        var btnClose = this._magnifierLayer.querySelector(
            '.' + JS_MAGNIFIER_BUTTON_CLOSE);
        var btnZoomIn = this._magnifierLayer.querySelector(
            '.' + JS_MAGNIFIER_BUTTON_ZOOM_IN);
        var btnZoomOut = this._magnifierLayer.querySelector(
            '.' + JS_MAGNIFIER_BUTTON_ZOOM_OUT);

        removeEvent(btnClose, "touchend", this._hooks.onClose);
        removeEvent(btnZoomIn, "touchend", this._hooks.onZoomIn);
        removeEvent(btnZoomOut, "touchend", this._hooks.onZoomOut);

        this._hammer.off('pan pinch panend pinchend', this._hooks.onPanPinch);

        this._hooks.onClose = null;
        this._hooks.onZoomIn = null;
        this._hooks.onZoomOut = null;
        this._hooks.onPanPinch = null;

        this._hammer.destroy();
        this._hammer = null;
    },

    "close": function() {
        if(!this.isOpen) return;

        this.isOpen = false;

        enableZoom();
        this._unbindEvents();
        this._unbindDom();

        this.emit("close", events.close(this));
    },

    "constructor": MagnifierTouch,

    "destroy": function() {
        this.close();
        this.removeAllListeners();
        this.el = null;
    },

    "open": function() {
        if(this.isOpen) return;

        this.isOpen = true;

        disableZoom();
        this._bindDom();
        this._bindEvents();

        this.zoom(this.minScale);
        this.emit("open", events.open(this));
    },

    "resize": function() {
        this.emit("resize", events.resize(this));
    },

    "zoom": function(scale){
        var _scale = clamp(this.minScale, this.maxScale, scale);
        var _x = this._transform.x;
        var _y = this._transform.y;

        var clampedPosition = clampPosition(
            _x,
            _y,
            _scale,
            this._magnifierConfig.width,
            this._magnifierConfig.height
        );
        if(clampedPosition) {
            _x = clampedPosition.x;
            _y = clampedPosition.y;
        }

        this._setImageTransform(_x, _y, _scale);

        this._transform.scale = _scale;
        this._transform.x = _x;
        this._transform.y = _y;
    },

    "zoomIn": function() {
        this.zoom(this._transform.scale + this.scaleIncrement);
    },

    "zoomOut": function() {
        this.zoom(this._transform.scale - this.scaleIncrement);
    }

});

MagnifierTouch.bindElement = function(el, options){
    // Get zoom button
    var button = el.querySelector('.' + JS_MAGNIFIER_BUTTON);
    var magnifier = null;
    addEvent(button, 'touchend', function(e){
        e.preventDefault();

        magnifier = new MagnifierTouch(el, options);
        magnifier.open();

        magnifier.once('close', function(){
            magnifier.destroy();
            magnifier = null;
        });

        return false;
    });
};

export default MagnifierTouch;

function calculateMinScale(imageWidth, imageHeight){
    var minScale = 1;
    var outerPadding = 25;
    // Landscape
    if( imageWidth > imageHeight ){
        minScale = ( window.innerWidth - outerPadding - outerPadding ) /
            imageWidth;
    // Portrait or square
    } else {
        minScale = ( window.innerHeight - outerPadding - outerPadding ) /
        imageHeight;
    }
    return minScale;
}

function clampPosition(_x, _y, scale, imageWidth, imageHeight) {
    var maxX = Math.ceil(scale * imageWidth / 2);
    var maxY = Math.ceil(scale * imageHeight / 2);
    var thisX = _x;
    var thisY = _y;
    var isClamped = false;

    if(thisX > maxX) {
        thisX = maxX;
        isClamped = true;
    } else if(thisX < -maxX) {
        thisX = -maxX;
        isClamped = true;
    }

    if(thisY > maxY) {
        thisY = maxY;
        isClamped = true;
    } else if(thisY < -maxY) {
        thisY = -maxY;
        isClamped = true;
    }

    if(!isClamped) return false;
    return {
        "x": thisX,
        "y": thisY
    };
}

function setTransform(el, prop) {
    el.style.transform = prop;
    el.style.oTransform = prop;
    el.style.msTransform = prop;
    el.style.mozTransform = prop;
    el.style.webkitTransform = prop;
}

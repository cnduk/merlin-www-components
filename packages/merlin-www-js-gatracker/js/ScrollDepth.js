
import EventEmitter from 'eventemitter2';
import {
    addEvent,
    createEventTemplate,
    debounce,
    getElementOffset,
    getObjectValues,
    getWindowScrollTop,
    inherit,
    removeEvent,
    throttle
} from '@cnbritain/merlin-www-js-utils/js/functions';

var RE_PIXELS = new RegExp('(\\d+)px', 'i');
var RE_PERCENT = new RegExp('(\\d+)%', 'i');


function Marker(label, offsetTop){
    this.hit = false;
    this.label = label;
    this.offsetTop = offsetTop;
}
Marker.prototype = {
    constructor: Marker,
    test: function test(scrollTop){
        if(scrollTop >= this.offsetTop){
            this.hit = true;
            return true;
        } else {
            return false;
        }
    }
};


function ScrollDepth(article, focusElement, markers){
    EventEmitter.call(this, {wildcard: true});
    this.article = article;
    this.focusElement = focusElement;
    this.focusElementBounds = null;
    this.offset = 0;
    this._rawMarkers = markers;
    this._markers = null;
    this._listeners = {
        scroll: null,
        resize: null
    };
    this._destroyed = false;
}

ScrollDepth.prototype = inherit(EventEmitter.prototype, {
    _processMarkers: function _processMarkers(){
        if(this._markers === null){
            this._markers = [];
            this._rawMarkers.forEach(function(value, index){
                // Pixel check
                if(RE_PIXELS.test(value)){
                    var px = parseInt(value.match(RE_PIXELS)[0], 10);
                    this._markers[index] = new Marker(value, px);

                // Percent check
                } else if(RE_PERCENT.test(value)){
                    var percent = parseInt(value.match(RE_PERCENT)[0], 10) / 100;
                    var offsetTop = Math.round(this.focusElementBounds.height * percent);
                    this._markers[index] = new Marker(value, offsetTop);

                // Queryselector
                } else {
                    var el = this.focusElement.querySelector(value);
                    if(el === null){
                        throw new Error(
                            'Cannot find element from selector: ', value);
                    }
                    var offsetTop = getElementOffset(el).top;
                    this._markers[index] = new Marker(value, offsetTop);
                }
            }.bind(this));
        } else {
            this._rawMarkers.forEach(function(value, index){
                // If the marker has already been hit, skip it
                if(this._markers[index].hit) return;

                // Don't need to do anything for this
                if(RE_PIXELS.test(value)){
                    return;

                } else if(RE_PERCENT.test(value)){
                    var percent = parseInt(value.match(RE_PERCENT)[0], 10) / 100;
                    var offsetTop = Math.round(this.focusElementBounds.height * percent);
                    this._markers[index].offsetTop = offsetTop;

                // Queryselector
                } else {
                    var el = this.focusElement.querySelector(value);
                    if(el === null){
                        throw new Error(
                            'Cannot find element from selector: ', value);
                    }
                    var offsetTop = getElementOffset(el).top;
                    this._markers[index].offsetTop = offsetTop;
                }
            }.bind(this));
        }
    },
    constructor: ScrollDepth,
    bindListeners: function bindListeners(){
        this._listeners.scroll = throttle(this.scroll, 200, this);
        addEvent(window, 'scroll', this._listeners.scroll);
        this._listeners.resize = debounce(this.resize, 200, this);
        addEvent(window, 'resize', this._listeners.resize);
    },
    unbindListeners: function unbindListeners(){
        removeEvent(window, 'scroll', this._listeners.scroll);
        this._listeners.scroll = null;
        removeEvent(window, 'resize', this._listeners.resize);
        this._listeners.resize = null;
    },
    resize: function resize(){
        // Due to debounce, need to check if the scroll depth has been
        // destroyed.
        if(this._destroyed) return;
        this.focusElementBounds = getElementOffset(this.focusElement);
        this._processMarkers();
    },
    scroll: function scroll(){
        if(this._destroyed) return;
        // TODO: do we need to include the nav height in this?
        var scrollTop = getWindowScrollTop() + this.offset;
        scrollTop -= this.focusElementBounds.top;

        if(scrollTop < 0) return;

        var i = 0;
        var len = this._markers.length;
        var marker = null;
        for(; i<len; i++) {
            marker = this._markers[i];
            if(!marker.hit && marker.test(scrollTop)){
                this.emit('hit', createEventTemplate('hit', this.article, {
                    marker: marker,
                    scrollDepth: this
                }));
            }
        }
    },
    disable: function disable(){
        this.unbindListeners();
    },
    enable: function enable(){
        this.resize();
        this.bindListeners();
        this.scroll();
    },
    destroy: function destroy(){
        this._destroyed = true;
        this.emit('destroy', createEventTemplate('destroy', this));
        this.unbindListeners();
        this.article = this.focusElement = this.focusElementBounds = null;
        this.markers = this._listeners = null;
        this.removeAllListeners();
    }
});

export default ScrollDepth;

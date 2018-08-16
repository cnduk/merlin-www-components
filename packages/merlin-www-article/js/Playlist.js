'use strict';

import EventEmitter from 'eventemitter2';
import {
    addClass,
    addEvent,
    addHtml,
    debounce,
    delegate,
    getElementOffset,
    inherit,
    removeClass,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';
import InfiniteScroll from '@cnbritain/merlin-www-js-infinitescroll';
import * as events from './events';
import {
    getStorage,
    setStorage
} from './utils';

var CLS_CARD_LIST = '.js-a-video__playlist';
var CLS_CARD_LIST_ITEM = '.js-a-video__playlist-item';

function Playlist(el) {
    EventEmitter.call(this, {
        'wildcard': true
    });

    this._hooks = {
        resize: null
    };
    this._infiniteScroll = null;

    this.bounds = null;
    this.el = el;
    this.selectedIndex = 0;
    this.videoConfigs = [];

    this._init();
}

Playlist.prototype = inherit(EventEmitter.prototype, {

    _bindPlayerListeners: function _bindPlayerListeners() {
        var delegateFn = delegate(CLS_CARD_LIST_ITEM, function(e) {
            if (this.videoConfigs.length === 0) return;
            e.preventDefault();
            var index = getElementIndex(e.delegateTarget);
            this.select(index);
        }, this);
        addEvent(this.el, 'click', delegateFn);
    },

    _init: function _init() {
        this._bindPlayerListeners();
        this.resize();
    },

    _onListLoadError: function _onListLoadError() {
        // TODO: Error handle
    },

    _onListLoadSuccess: function _onListLoadSuccess(e) {

        var responseText = e.originalRequest.responseText;
        var responseJSON = null;
        try {
            responseJSON = JSON.parse(responseText);
        } catch (err) {
            this.disableInfiniteScroll();
            throw new Error('Error trying to parse response JSON', err);
        }
        if (!responseJSON.hasOwnProperty('data')) return;
        responseJSON = responseJSON.data;

        // Check that there is markup in the response or that we're not being told
        // to stop. There should be but just to be safe
        if (!responseJSON.hasOwnProperty('template')) {
            this.disableInfiniteScroll();
            return;

        } else if (responseJSON.stop) {
            this.disableInfiniteScroll();
        }

        var docFragment = document.createDocumentFragment();
        var addHtmlToFragment = addHtml(docFragment);
        addHtmlToFragment(responseJSON.template);
        addChildrenToNode(
            this.el.querySelector(CLS_CARD_LIST),
            docFragment.children[0].children
        );

        // Update any local storage values
        if (responseJSON.local_storage) {
            responseJSON.local_storage.forEach(function(item) {
                if (/playlist_json$/.test(item.key)) {
                    this.videoConfigs = this.videoConfigs.concat(
                        item.value);
                } else {
                    setStorage(item.key, item.value);
                }
            }.bind(this));
        }

        // Trigger resize
        this.resize();
    },

    constructor: Playlist,

    disableInfiniteScroll: function disableInfiniteScroll() {
        if (this._infiniteScroll === null) return;

        this._infiniteScroll.disable();
        this._infiniteScroll.removeAllListeners();
        this._infiniteScroll = null;

        removeEvent(window, 'resize', this._hooks.resize);
        this._hooks.resize = null;
    },

    enableInfiniteScroll: function enableInfiniteScroll() {
        if (this._infiniteScroll !== null) return;

        this._infiniteScroll = new InfiniteScroll({
            'el': this.el.querySelector('.a-video__sidebar__list'),
            'throttle': 150,
            'trigger': function infiniteScrollTrigger(scrollY) {
                return (this.el.scrollHeight / 2) < scrollY;
            },
            'url': function infiniteScrollUrl(pageCounter) {
                var url = getStorage('playlist_infinite_url');
                return location.origin + url + '?page=' + (pageCounter + 1);
            }
        });

        this._infiniteScroll.on(
            'loadError', this._onListLoadError.bind(this));
        this._infiniteScroll.on(
            'loadComplete', this._onListLoadSuccess.bind(this));
        this._infiniteScroll.enable();

        this._hooks.resize = debounce(this.resize, 200, this);
        addEvent(window, 'resize', this._hooks.resize);
    },

    loadConfigs: function loadConfigs() {
        var configs = getPlaylistJson();
        if (configs) {
            this.videoConfigs = configs;
        }
    },

    resize: function resize() {
        this.bounds = getElementOffset(this.el);
    },

    select: function select(index) {
        if (index === this.selectedIndex) {
            this.emit(
                'videoselect', events.videoselect(this, this.selectedIndex));
            return;
        }

        var selector = CLS_CARD_LIST_ITEM + ':nth-child(' +
            (this.selectedIndex + 1) + ')';
        if (this.selectedIndex > -1) {
            removeClass(this.el.querySelector(selector), 'is-active');
            // NOTE: do not need to update the section
            // removeClass(this.elSection.querySelector(selector), 'is-active');
        }

        this.selectedIndex = index;
        selector = CLS_CARD_LIST_ITEM + ':nth-child(' +
            (this.selectedIndex + 1) + ')';
        addClass(this.el.querySelector(selector), 'is-active');
        // NOTE: do not need to update the section
        // addClass(this.elSection.querySelector(selector), 'is-active');

        this.emit('videochange', events.videochange(this, this.selectedIndex));
    }

});

export default Playlist;

function getElementIndex(el) {
    var parent = el.parentNode;
    var len = parent.children.length;
    while (len--)
        if (parent.children[len] === el) return len;
    return -1;
}

function getPlaylistJson() {
    return getStorage('playlist_json');
}

function addChildrenToNode(node, children) {
    var i = -1;
    var len = children.length;
    while (++i < len) node.appendChild(children[0]);
}
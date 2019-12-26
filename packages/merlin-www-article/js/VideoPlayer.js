'use strict';
/* globals Optanon */

import EventEmitter from 'eventemitter2';
import {
    addEvent,
    delegate,
    inherit
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    CLS_ARTICLE_VIDEO_PLAYER,
    CLS_ARTICLE_VIDEO_PLAYER_PLAYLIST
} from './constants';
import { bubbleEvent, loadYoutubeSubscribe } from './utils';
import Playlist from './Playlist';

function VideoPlayer(el) {
    EventEmitter.call(this, {
        wildcard: true
    });

    this.el = el;
    this.playlist = null;

    this._init();
}

VideoPlayer.prototype = inherit(EventEmitter.prototype, {
    _bubbleEvents: function() {
        if (this.playlist !== null) {
            bubbleEvent(this.playlist, this, 'videoselect');
            bubbleEvent(this.playlist, this, 'videochange');
        }
    },

    _handlePreferences: function(e) {
        e.preventDefault();
        this.displayOneTrust();
        return false;
    },

    _init: function _init() {
        var sidebarPlaylist = this.el.querySelector(
            CLS_ARTICLE_VIDEO_PLAYER_PLAYLIST
        );
        if (sidebarPlaylist) {
            this.playlist = new Playlist(sidebarPlaylist);
        }

        this._bubbleEvents();
        loadYoutubeSubscribe();

        addEvent(
            this.el,
            'click',
            delegate(
                '.a-video__consent-preferences',
                this._handlePreferences.bind(this)
            )
        );
    },

    constructor: VideoPlayer,

    resize: function resize() {
        if (this.playlist !== null) this.playlist.resize();
    },

    displayOneTrust: function displayOneTrust() {
        Optanon.ToggleInfoDisplay();
    }
});

var el = document.querySelector(CLS_ARTICLE_VIDEO_PLAYER);
var video = null;
if (el) {
    video = new VideoPlayer(el, {});
}
export default video;

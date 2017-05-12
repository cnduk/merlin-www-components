'use strict';

import EventEmitter from 'eventemitter2';
import { inherit } from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    CLS_ARTICLE_VIDEO_PLAYER,
    CLS_ARTICLE_VIDEO_PLAYER_PLAYLIST,
    CLS_ARTICLE_VIDEO_SECTION_PLAYLIST
} from './constants';
import { bubbleEvent } from './utils';
import Playlist from './Playlist';

function VideoPlayer(el, options){
    EventEmitter.call(this, {'wildcard': true});

    this.el = el;
    this.playlist = null;

    this._init();
}

VideoPlayer.prototype = inherit(EventEmitter.prototype, {

    _bubbleEvents: function(){
        if(this.playlist !== null){
            bubbleEvent(this.playlist, this, 'videoselect');
            bubbleEvent(this.playlist, this, 'videochange');
        }
    },

    _init: function _init(){
        var sidebarPlaylist = this.el.querySelector(
            CLS_ARTICLE_VIDEO_PLAYER_PLAYLIST);
        if(sidebarPlaylist){
            var sectionPlaylist = this.el.parentNode.querySelector(
                CLS_ARTICLE_VIDEO_SECTION_PLAYLIST);
            this.playlist = new Playlist(sidebarPlaylist, sectionPlaylist);
        }

        this._bubbleEvents();
    },

    constructor: VideoPlayer

});


var el = document.querySelector(CLS_ARTICLE_VIDEO_PLAYER);
var video = null;
if(el){
    video = new VideoPlayer(el, {});
}
export default video;

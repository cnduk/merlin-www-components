'use strict';

import EventEmitter from 'eventemitter2';
import {
    addClass,
    addEvent,
    delegate,
    inherit,
    removeClass
} from '@cnbritain/merlin-www-js-utils/js/functions';
import * as events from './events';
import { getStorage } from './utils';

var CLS_CARD_LIST_ITEM = '.js-c-card-list__item';

function Playlist(elPlayer, elSection, options){
    EventEmitter.call(this, {'wildcard': true});

    this.elPlayer = elPlayer;
    this.elSection = elSection;
    this.selectedIndex = 0;
    this.videoConfigs = [];

    this._init();
}

Playlist.prototype = inherit(EventEmitter.prototype, {

    _bindPlayerListeners: function _bindPlayerListeners(){
        var delegateFn = delegate(CLS_CARD_LIST_ITEM, function(e){
            if(this.videoConfigs.length === 0) return;
            e.preventDefault();
            var index = getElementIndex(e.delegateTarget);
            this.select(index);
        }, this);
        addEvent(this.elPlayer, 'click', delegateFn);
    },

    _bindSectionListeners: function _bindSectionListeners(){
        var delegateFn = delegate(CLS_CARD_LIST_ITEM, function(e){
            if(this.videoConfigs.length === 0) return;
            e.preventDefault();
            var index = getElementIndex(e.delegateTarget);
            this.select(index);
        }, this);
        addEvent(this.elSection, 'click', delegateFn);
    },

    _init: function _init(){
        this._bindPlayerListeners();
        this._bindSectionListeners();
    },

    constructor: Playlist,

    loadConfigs: function loadConfigs(){
        var configs = getPlaylistJson();
        if(configs){
            this.videoConfigs = configs;
        }
    },

    select: function select(index){
        if(index === this.selectedIndex){
            this.emit(
                'videoselect', events.videoselect(this, this.selectedIndex));
            return;
        }

        var selector = CLS_CARD_LIST_ITEM +':nth-child(' +
            (this.selectedIndex + 1) + ')';
        if(this.selectedIndex > -1){
            removeClass(this.elPlayer.querySelector(selector), 'is-active');
            removeClass(this.elSection.querySelector(selector), 'is-active');
        }

        this.selectedIndex = index;
        selector = CLS_CARD_LIST_ITEM +':nth-child(' +
            (this.selectedIndex + 1) + ')';
        addClass(this.elPlayer.querySelector(selector), 'is-active');
        addClass(this.elSection.querySelector(selector), 'is-active');

        this.emit('videochange', events.videochange(this, this.selectedIndex));
    }

});

export default Playlist;

function getElementIndex(el){
    var parent = el.parentNode;
    var len = parent.children.length;
    while(len--) if(parent.children[len] === el) return len;
    return -1;
}

function getPlaylistJson(){
    return getStorage('cnd_vg_playlist_json');
}

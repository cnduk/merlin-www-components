'use strict';

import {
    loadTeadLibrary
} from './Utils';

import {
    cloneObjectDeep
} from '@cnbritain/merlin-www-js-utils/js/functions';

var InreadAd = {

    'render': function(ad, json){

        var config = cloneObjectDeep(json);
        config.slot = '#' + ad.id;
        config.callbacks = {
            'ad': log('ad'),
            'finish': onAdFinish.bind(ad),
            'skip': log('skip'),
            'mute': log('mute'),
            'unmute': log('unmute'),
            'pause': log('pause'),
            'play': log('play'),
            'loaded': log('loaded'),
            'launch': onAdLaunch.bind(ad)
        };

        if( window.teads ){
            window.teads = {};
        }

        loadTeadLibrary();
        window._ttf.push(config);

    }

};

function log(/*type*/){
    return function(){
        // console.log(type, this, arguments);
    };
}

function onAdFinish(){
    setTimeout(this.destroy.bind(this), 2000);
}

function onAdLaunch(){
    this.el.innerHTML = '';
}

export default InreadAd;
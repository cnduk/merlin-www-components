'use strict';

import { ArticleManager, VideoPlayer } from '@cnbritain/merlin-www-article';
import { getStorage } from '../utils';

export default function init(){
    if(VideoPlayer.playlist !== null){
        VideoPlayer.playlist.loadConfigs();
        if(!getStorage('playlist_infinite_stop')){
            VideoPlayer.playlist.enableInfiniteScroll();
        }
    }

    var articleEl = document.querySelector('.a-main');

    var simplereachConfig = null;
    if(window.__reach_config){
        simplereachConfig = window.__reach_config;
    }

    ArticleManager.add(articleEl, {
        'analytics': getStorage('anal_config'),
        'infinite': false,
        'simplereach': simplereachConfig
    });
}

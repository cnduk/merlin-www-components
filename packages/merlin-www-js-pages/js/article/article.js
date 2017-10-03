'use strict';

import {
    addEvent,
    debounce,
    getWindowScrollTop,
    throttle
} from '@cnbritain/merlin-www-js-utils/js/functions';
import MainNavigation from '@cnbritain/merlin-www-main-navigation/js/main-navigation';
import { ArticleManager } from '@cnbritain/merlin-www-article';
import { isArticleGallery } from '@cnbritain/merlin-www-article/js/utils';
import { ARTICLE_TYPES } from '@cnbritain/merlin-www-article/js/constants';
import { getStorage, setStorage } from '../utils.js';

var articleGallery = null;
var windowHeightHalf = window.innerHeight/2;

export default function init(){

    ArticleManager.on('focus', onArticleFocus);
    ArticleManager.on('blur', onArticleBlur);
    ArticleManager.on('imagefocus', onGalleryImageFocus);
    if(getStorage('infinite_stop') === true){
        ArticleManager.disableInfiniteScroll();
    } else {
        ArticleManager.enableInfiniteScroll();
    }

    var articleEl = document.querySelector('.a-main');
    var simplereachConfig = null;
    if(window.__reach_config){
        simplereachConfig = window.__reach_config;
    }

    ArticleManager.add(articleEl, {
        'ads': getStorage('ad_config'),
        'analytics': getStorage('anal_config'),
        'infinite': false,
        'simplereach': simplereachConfig
    });

    if(MainNavigation.galleryNavigation !== null){
        MainNavigation.galleryNavigation.on(
            'viewchange', onNavigationViewChange);
    }

    addEvent(window, 'scroll', throttle(onWindowScroll, 100));
    addEvent(window, 'resize', debounce(onWindowResize, 200));

}

export function onArticleBlur(e){
    if(isArticleGallery(e.target)){
        articleGallery = null;
    }
}

export function onArticleFocus(e){

    var article = e.target;
    var isGallery = isArticleGallery(article);

    if(isGallery){
        var gallery = article.gallery;

        if(gallery.layoutView === 'list'){
            MainNavigation.galleryNavigation.displayListView();
        } else {
            MainNavigation.galleryNavigation.displayGridView();
        }

        MainNavigation.galleryNavigation.setArticleTitle(
            article.properties.title);
        MainNavigation.galleryNavigation.setGalleryCounter(
            1, article.gallery.imageElements.length);
        articleGallery = article;
    }

}

export function onGalleryImageFocus(e){
    MainNavigation.galleryNavigation.setGalleryCounter(e.imageIndex + 1);
}

export function onNavigationViewChange(e){
    if(articleGallery === null) return;
    if(e.view === 'grid'){
        articleGallery.gallery.displayThumbnailView();
    } else {
        articleGallery.gallery.displayListView();
    }
    ArticleManager.resize(0);
}

export function onWindowResize(){
    windowHeightHalf = window.innerHeight/2;
}

export function onWindowScroll(){
    if(articleGallery === null) return;
    var scrollY = getWindowScrollTop();
    if(articleGallery.gallery.bounds.top > scrollY + windowHeightHalf){
        MainNavigation.hideGallery();
        return;
    }
    if(articleGallery.gallery.bounds.bottom < scrollY + windowHeightHalf){
        MainNavigation.hideGallery();
        return;
    }
    MainNavigation.showGallery();
}

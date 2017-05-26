'use strict';

import EventEmitter from 'eventemitter2';
import {
    addEvent,
    addHtml,
    assign,
    cloneObjectDeep,
    debounce,
    getWindowScrollTop,
    inherit,
    insertBefore,
    onPageLoad,
    removeEvent,
    throttle
} from '@cnbritain/merlin-www-js-utils/js/functions';
import { hasHistory } from '@cnbritain/merlin-www-js-utils/js/detect';
import InfiniteScroll from '@cnbritain/merlin-www-js-infinitescroll';
import {
    ARTICLE_TYPES,
    CLS_ARTICLE_VIDEO_BODY,
    CLS_ARTICLE_VIDEO_EMBED
} from './constants';
import {
    bubbleEvent,
    getArticleType,
    getStorage,
    setStorage
} from './utils';
import * as events from './events';
import Article from './Article';
import VideoPlayer from './VideoPlayer';

var INFINITE_BOTTOM_THRESHOLD = 500;
var INFINITE_RESIZE_DEBOUNCE = 500;

function ArticleManager(){
    EventEmitter.call(this, { "wildcard": true });

    this._hooks = {
        "resize": null,
        "scroll": null
    };
    this._infiniteScroll = null;
    this._pageHeight = Number.Infinity;
    this._windowHeight = Number.Infinity;

    this.articles = [];
    this.focusedIndex = -1;

    this._init();
}

ArticleManager.prototype = inherit(EventEmitter.prototype, {

    "_triggerFocusBlur": function(index){
        var article = null;
        var eve = null;

        if(this.focusedIndex !== -1){
            article = this.articles[this.focusedIndex];
            eve = events.blur(article);
            article.emit('blur', eve);
            this.emit('blur', eve);
        }

        this.focusedIndex = index;
        article = this.articles[index];
        eve = events.focus(article);
        article.emit('focus', eve);
        this.emit('focus', eve);
    },

    "_onVideoChange": function _onVideoChange(e){

        var config = VideoPlayer.playlist.videoConfigs[e.videoIndex];

        // Render video
        document.querySelector(CLS_ARTICLE_VIDEO_EMBED).innerHTML = config.embed;

        // Render body content
        document.querySelector(CLS_ARTICLE_VIDEO_BODY).innerHTML = config.content;

        // Update article data-attrs
        var articleEl = document.querySelector('.a-main');
        articleEl.setAttribute('data-article-uid', config.data_uid);
        articleEl.setAttribute('data-article-url', config.data_url);

        // Create article if needs to be
        var article = this.getArticleByUid(config.data_uid);
        var index = -1;
        if(!article){
            article = this.add(articleEl, {
                analytics: config.config_analytics,
                isInfinite: true,
                simplereach: config.config_simplereach
            });
            index = this.articles.length - 1;
        } else {
            index = this.articles.indexOf(article);
        }

        // Focus and blur events
        this._triggerFocusBlur(index);
        this._triggerFocusBlur(index);
    },

    "_init": function _init(){

        // Resize
        onPageLoad(this.resize.bind(this, 0));

        // Video changes
        if(VideoPlayer !== null){
            bubbleEvent(VideoPlayer, this, 'videoselect');
            bubbleEvent(VideoPlayer, this, 'videochange');
            VideoPlayer.on('videochange', this._onVideoChange.bind(this));
        }

        this.on('focus', onArticleFocus);
    },

    "_bindArticleBubbles": function _bindArticleBubbles(article){
        bubbleEvent(article, this, 'focus');
        bubbleEvent(article, this, 'blur');
        bubbleEvent(article, this, 'imagefocus');
        bubbleEvent(article, this, 'imageblur');
        bubbleEvent(article, this, 'viewchange');
        bubbleEvent(article, this, 'expand');
    },

    "add": function add(el, _options){
        var config = assign({
            'ads': null,
            'analytics': null,
            'infinite': false,
            'simplereach': null
        }, cloneObjectDeep(_options), {
            'manager': this
        });

        var article = new Article(el, config);
        this._bindArticleBubbles(article);
        article.resize();

        this.articles.push(article);
        this.emit('add', events.add(this, article));

        return article;
    },

    "constructor": ArticleManager,

    "disableInfiniteScroll": function disableInfiniteScroll(){
        if(this._infiniteScroll === null) return;

        this._infiniteScroll.disable();
        this._infiniteScroll.removeAllListeners();
        this._infiniteScroll = null;

        removeEvent(window, 'resize', this._hooks.resize);
        this._hooks.resize = null;

        removeEvent(window, 'scroll', this._hooks.scroll);
        this._hooks.scroll = null;
    },

    "enableInfiniteScroll": function enableInfiniteScroll(){
        if(this._infiniteScroll !== null) return;

        // Scroll listener for focus and blur events
        this._hooks.scroll = throttle(onWindowScroll, 33, this);
        addEvent(window, 'scroll', this._hooks.scroll);

        this._infiniteScroll = new InfiniteScroll({
            "el": window,
            "trigger": infiniteScrollTrigger.bind(this),
            "url": infiniteScrollUrl
        });

        this._infiniteScroll.on("loadError", onInfiniteLoadError.bind(this));
        this._infiniteScroll.on("loadComplete",
            onInfiniteLoadComplete.bind(this));
        this._infiniteScroll.enable();

        this._hooks.resize = debounce(
            this.resize, INFINITE_RESIZE_DEBOUNCE, this);
        addEvent(window, 'resize', this._hooks.resize);
    },

    "getArticleByUid": function getArticleByUid(uid){
        var length = this.articles.length;
        while(length--){
            if(this.articles[length].uid === uid) return this.articles[length];
        }
        return false;
    },

    "resize": function resize(_start, _length){
        if(arguments.length === 0) return;

        this._pageHeight = document.body.scrollHeight - window.innerHeight;
        this._windowHeight = window.innerHeight/2;

        var start = _start < 0 ? 0 : parseInt(_start);
        var length = (
            _length === undefined ? this.articles.length : parseInt(_length));
        if(length < 1) return;

        var articles = this.articles.slice(start, start + length);
        articles.forEach(function article_resize(article){
            article.resize();
        });
    }

});

var manager = new ArticleManager();
export default manager;


function infiniteScrollTrigger(scrollY){
    return scrollY >= this._pageHeight - INFINITE_BOTTOM_THRESHOLD;
}


function infiniteScrollUrl(){
    var referralUid = validateArticleUid(
        getStorage('article_referral_uid'));
    var excludeUid = validateArticleUid(
        getStorage('article_exclude_uid'));
    return (
        location.origin + '/xhr/article/next?referral_uid=' +
        referralUid + '&exclude_uid=' + excludeUid);
}


/**
 * Makes sure that our article uid only contains characters we allow
 * @param  {String} articleUid
 * @return {String}
 */
function validateArticleUid(articleUid){
    return String(articleUid).replace(/[\W]/gi, '');
}

/**
 * Window scroll callback. Calculates when an article is view and emits focus
 * and blur events on the article
 * @this ArticleManager
 */
function onWindowScroll(){
    var scrollTop = getWindowScrollTop();

    var articlesLength = this.articles.length;
    var tmpArticle = null;
    var i = -1;
    while(++i < articlesLength){
        tmpArticle = this.articles[i];

        // If the tmp is the one that is currently focused, skip it
        if(this.focusedIndex === i) continue;

        // Check if tmp.top is over half the screen or bottom is halfway in
        if(tmpArticle.bounds.top > scrollTop + this._windowHeight) continue;
        if(tmpArticle.bounds.bottom < scrollTop + this._windowHeight) continue;

        // This article is in screen. Fire blur if focus article already set
        this._triggerFocusBlur(i);
        break;
    }

}

function onInfiniteLoadError(e){
    this.disableInfiniteScroll();
    throw new Error('Failed at getting the next article', e);
}

function onInfiniteLoadComplete(e){

    var responseText = e.originalRequest.responseText;
    var responseJSON = null;
    try {
        responseJSON = JSON.parse(responseText);
    } catch(err){
        this.disableInfiniteScroll();
        throw new Error('Error trying to parse response JSON', err);
    }
    if(!responseJSON.hasOwnProperty('data')) return;
    responseJSON = responseJSON.data;

    // Check that there is markup in the response or that we're not being told
    // to stop. There should be but just to be safe
    if(!responseJSON.hasOwnProperty('template')){
        this.disableInfiniteScroll();
        return;

    } else if(responseJSON.stop){
        this.disableInfiniteScroll();
    }

    var docFragment = document.createDocumentFragment();
    var addHtmlToFragment = addHtml(docFragment);

    // Create the article
    addHtmlToFragment(responseJSON.template);

    // Add the article to the page
    insertBefore(docFragment, document.getElementById('infiniteScrollHook'));

    // Add the article to the manager
    var articleEl = document.querySelectorAll('.a-main');
    articleEl = articleEl[articleEl.length - 1];

    var ads = null;
    if(responseJSON.hasOwnProperty('config_ad') && responseJSON.config_ad !== null){
        ads = responseJSON.config_ad.data;
    }

    var analytics = null;
    if(responseJSON.hasOwnProperty('config_analytics') && responseJSON.config_analytics !== null){
        analytics = responseJSON.config_analytics.data;
    }

    var simplereach = null;
    if(responseJSON.hasOwnProperty('config_simplereach') && responseJSON.config_simplereach !== null){
        simplereach = responseJSON.config_simplereach.data;
    }

    var article = this.add(articleEl, {
        'ads': ads,
        'analytics': analytics,
        'infinite': true,
        'simplereach': simplereach
    });

    // Update any local storage values
    if(responseJSON.local_storage){
        responseJSON.local_storage.forEach(function(item){
            setStorage(item.key, item.value);
        });
    }

    // Trigger resize
    this.resize(0);

    // Var cleanup on aisle 3
    docFragment = null;
    addHtmlToFragment = null;
}

function onArticleFocus(e){
    var article = e.target;
    var url = article.properties.url + location.search;
    if (hasHistory) history.replaceState({}, article.properties.title, url);
    document.title = article.properties.title;
}

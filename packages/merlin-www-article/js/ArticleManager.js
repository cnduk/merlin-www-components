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
import InfiniteScroll from '@cnbritain/merlin-www-js-infinitescroll';
import { ARTICLE_TYPES } from './constants';
import {
    getArticleType,
    getStorage,
    setStorage
} from './utils';
import * as events from './events';
import Article from './Article';

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
    this.focusArticle = null;
}

ArticleManager.prototype = inherit(EventEmitter.prototype, {

    "init": function init(){
        // Infinite scroll
        this._infiniteScroll = new InfiniteScroll({
            "el": window,
            "trigger": infiniteScrollTrigger.bind(this),
            "url": infiniteScrollUrl
        });

        // Scroll listener for focus and blur events
        this._hooks.scroll = throttle(onWindowScroll, 33, this);
        addEvent(window, 'scroll', this._hooks.scroll);

        // Resize
        onPageLoad(this.resize.bind(this, 0));

        // Enable infinite scroll
        this.enableInfiniteScroll();
    },

    "add": function add(el, _options){
        var config = assign({
            'analytics': null,
            'infinite': false,
            'simplereach': null
        }, cloneObjectDeep(_options), {
            'manager': this
        });

        var article = new Article(el, config);
        article.resize();

        this.articles.push(article);
        this.emit('add', events.add(this, article));

        return article;
    },

    "constructor": ArticleManager,

    "disableInfiniteScroll": function disableInfiniteScroll(){
        this._infiniteScroll.disable();
        this._infiniteScroll.removeAllListeners();

        removeEvent(window, 'resize', this._hooks.resize);
        this._hooks.resize = null;
    },

    "enableInfiniteScroll": function enableInfiniteScroll(){
        this._infiniteScroll.on("loadError", onInfiniteLoadError.bind(this));
        this._infiniteScroll.on("loadComplete",
            onInfiniteLoadComplete.bind(this));
        this._infiniteScroll.enable();

        this._hooks.resize = debounce(
            this.resize, INFINITE_RESIZE_DEBOUNCE, this);
        addEvent(window, 'resize', this._hooks.resize);
    },

    "resize": function resize(_start, _length){
        this._pageHeight = document.body.scrollHeight - window.innerHeight;
        this._windowHeight = window.innerHeight/2;

        if(arguments.length === 0) return;

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
    var eve = null;
    while(++i < articlesLength){
        tmpArticle = this.articles[i];

        // If the tmp is the one that is currently focused, skip it
        if(this.focusArticle === tmpArticle) continue;

        // Check if tmp.top is over half the screen or bottom is halfway in
        if(tmpArticle.bounds.top > scrollTop + this._windowHeight) continue;
        if(tmpArticle.bounds.bottom < scrollTop + this._windowHeight) continue;

        // This article is in screen. Fire blur if focus article already set
        if(this.focusArticle !== null){
            eve = events.blur(this.focusArticle);
            this.focusArticle.emit('blur', eve);
            this.emit('blur', eve);
        }

        this.focusArticle = tmpArticle;
        eve = events.focus(this.focusArticle);
        this.focusArticle.emit('focus', eve);
        this.emit('focus', eve);
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
    var article = this.add(articleEl, {
        'analytics': responseJSON.analytics_config,
        'infinite': true,
        'simplereach': responseJSON.simplereach_config
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

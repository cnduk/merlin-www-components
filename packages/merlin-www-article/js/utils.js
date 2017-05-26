'use strict';
/* globals SPR */

import CONFIG_BRAND from '@cnbritain/merlin-www-common';
import {
    getNamespaceKey,
    loadScript,
    loadSocialScripts
} from '@cnbritain/merlin-www-js-utils/js/functions';
import { ARTICLE_TYPES } from './constants';


/**
 * Bubbles an event from the src to the dest
 * @param  {Object} src
 * @param  {Object} dest
 * @param  {String} type
 */
export function bubbleEvent(src, dest, type){
    src.on(type, function bubbleEvent_inner(e){
        if(!e.bubbles) return;
        dest.emit(type, e);
    });
}

/**
 * Checks if Simplereach is in the global namespace
 * @return {Boolean} [description]
 */
export function hasSimpleReach(){
    return 'SPR' in window;
}

/**
 * Loads the Simplereach script
 * @return {Promise}
 */
export function loadSimplereach(){
    var url = (document.location.protocol +
        '//d8rk54i4mohrb.cloudfront.net/js/reach.js');
    return loadScript(url);
}

/**
 * Dispatches a simplereach collect
 * @param  {Object} config simple reach config
 */
export function dispatchSimpleReachCollect(config){
    if(hasSimpleReach()) SPR.Reach.collect(config);
}

/**
 * Dispatches a simplereach stop
 */
export function dispatchSimpleReachStop(){
    if(hasSimpleReach()) SPR.stop();
}

/**
 * Dispatches either a simplereach collect or stop. If no config is set, it
 * will trigger a simplereach stop.
 * @param  {Object|null} config simplereach config
 * @return {Promise}
 */
export function dispatchSimpleReach(config){
    if(hasSimpleReach()){
        if(!config){
            dispatchSimpleReachStop();
        } else {
            dispatchSimpleReachCollect(config);
        }
        return Promise.resolve();
    } else {
        return loadSimplereach()
            .then(function dispatchSimpleReach_inner(){
                if(!config){
                    dispatchSimpleReachStop();
                } else {
                    dispatchSimpleReachCollect(config);
                }
                return Promise.resolve();
            });
    }
}

/**
 * Updates social embeds in an article so they can render
 * @return {Promise}
 */
export function updateSocialEmbeds(){
    return loadSocialScripts()
        .then(function updateSocialEmbeds_inner(){
            // Instagram
            window.instgrm.Embeds.process();

            // Twitter
            window.twttr.widgets.load();

            // Facebook
            window.FB.init({
                "version": 'v2.3',
                "xfbml": true
            });

            // Vine dont need to do anything as it uses postMessage and
            // maintains itself

            // Imgur, taken pretty much from their script
            if(window.imgurEmbed.createIframe){
                window.imgurEmbed.createIframe();
            } else {
                window.imgurEmbed.tasks++;
            }

            return Promise.resolve();
        }, function updateSocialEmbeds_error(){
            console.error('Error', arguments);
        })['catch'](function updateSocialEmbeds_catch(){
            console.error('Error', arguments);
        });
}

/**
 * Get the article title
 * @param  {HTMLElement} el
 * @return {String}    title of the article
 */
export function getArticleTitle(el){
    return el.querySelector('.a-header__title').innerText;
}

/**
 * Get the url of the article
 * @param  {HTMLElement} el
 * @return {String}    url of the article
 */
export function getArticleUrl(el){
    return el.getAttribute('data-article-url');
}

/**
 * Get the type of the article
 * @param  {HTMLElement} el
 * @return {Number}
 */
export function getArticleType(el){
    var articleType = el.getAttribute('data-article-type');
    if(!articleType) return ARTICLE_TYPES.UNKNOWN;
    articleType = articleType.toUpperCase();
    if(ARTICLE_TYPES.hasOwnProperty(articleType)){
        return ARTICLE_TYPES[articleType];
    }
    return ARTICLE_TYPES.UNKNOWN;
}

/**
 * Gets the value from local storage
 * @param  {String} key
 * @return {*}
 */
export function getStorage(key){
    var cnd = getNamespaceKey(CONFIG_BRAND.abbr);
    var prefix = cnd + '_';
    var storeKey = key;
    if(key.substr(0, prefix.length) !== prefix){
        storeKey = prefix + storeKey;
    }
    return window[cnd].Store.get(storeKey);
}

/**
 * Sets the key value in localstorage
 * @param {String} key
 * @param {*} value
 */
export function setStorage(key, val){
    var cnd = getNamespaceKey(CONFIG_BRAND.abbr);
    var prefix = cnd + '_';
    var storeKey = key;
    if(key.substr(0, prefix.length) !== prefix){
        storeKey = prefix + storeKey;
    }
    return window[cnd].Store.set(storeKey, val);
}

/**
 * Checks if an article is of type gallery
 * @param  {Article}  article
 * @return {Boolean}
 */
export function isArticleGallery(article){
    return article.type === ARTICLE_TYPES.GALLERY ||
        article.type === ARTICLE_TYPES['SHOW-SUMMARY'];
}

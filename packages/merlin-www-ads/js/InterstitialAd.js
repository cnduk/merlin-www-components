'use strict';

import GATracker from '@cnbritain/merlin-www-js-gatracker';
import {
    addClass,
    addEvent,
    assign,
    debounce,
    hasOwnProperty,
    isDefined,
    removeClass,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';

var AD_FLUFF = 12;
var DEFAULT_AD_DATA = {
    "linkUrl": '',
    "lowImgSrc": '',
    "hiImgSrc": '',
    "videoSrcMp4": ''
};
var LARGE_AD_HEIGHT = 600;
var LARGE_AD_WIDTH = 1000;
var SMALL_AD_HEIGHT = 400;
var SMALL_AD_WIDTH = 700;
var CLS_PLAYER_BTN = 'js-ad-video-btn';
var CLS_PLAYER_VIDEO = 'js-ad-video-player';

var InterstitialAd = {

    'render': function(ad, _json, gptSizeInfo){

        var json = assign({}, DEFAULT_AD_DATA, _json);

        if(json === null && gptSizeInfo === null){
            // TODO: empty ad?
            return;
        }

        var isLarge = isAdLarge(ad.el, json);
        var hasVideo = json.videoSrcMp4 !== '';
        var adDimensions = getAdSize(json, isLarge);

        if(json === null && gptSizeInfo !== null){
            // Dunno what this is meant to do but its coming over from legacy
            renderVisualAd(ad, json, isLarge);
        } else if(hasVideo){
            renderVideoAd(ad, json, isLarge);
        } else {
            renderImageAd(ad, json, isLarge);
        }

        // Analytics
        fireAnalytics('InterstitialAdDisplayed', 'BespokeRendered');

    }

};

/**
 * Fires analytics
 * @param  {String} action
 * @param  {String} label
 */
function fireAnalytics(action, label){
    GATracker.SendAll( GATracker.SEND_HITTYPES.EVENT, {
        "eventCategory": "Gallery",
        "eventAction": action,
        "eventLabel": label
    });
}

/**
 * Gets the size of the Ad
 * @param  {Object}  json
 * @param  {Boolean} isLargeAd
* @return {Object}
 */
function getAdSize( json, isLargeAd ){

    var height = isDefined(json.manHeight) ? json.manHeight : null;
    var width = isDefined(json.manWidth) ? json.manWidth : null;

    if( isLargeAd && ( !isDefined( height ) || !isDefined( width ) ) ){
        if( !isDefined( height ) ){
            height = LARGE_AD_HEIGHT;
        }
        if( !isDefined( width ) ){
            width = LARGE_AD_WIDTH;
        }
    } else if( !isLargeAd && ( !isDefined( height ) || !isDefined( width ) ) ){
        if( !isDefined( height ) ){
            height = SMALL_AD_HEIGHT;
        }
        if( !isDefined( width ) ){
            width = SMALL_AD_WIDTH;
        }
    }

    return {
        "height": height,
        "width": width
    };
}

/**
 * Updates the specified url to include a cachebuster
 * @param  {String} url
 * @return {String}
 */
function getCacheBustUrl(url) {
    var cacheBustUrl = '';
    if (url && url.length) {
        var cacheBustUrlKvp = Math.random() + '=' + Math.random();
        if (url.indexOf('?') !== -1) {
            // URL already has a querystring
            cacheBustUrl = url.replace(/\?/, '?' + cacheBustUrlKvp + '&');
        } else if (url.indexOf('#') !== -1) {
            // URL has anchor in it, querystring must be before that
            cacheBustUrl = url.replace(/#/, '?' + cacheBustUrlKvp + '#');
        } else {
            // URL does not have an anchor or a querystring.
            cacheBustUrl = url + '?' + cacheBustUrlKvp;
        }
    }
    return cacheBustUrl;
}

/**
 * Get the url of the image from adConfig
 * @param  {Object}  adConfig
 * @param  {Boolean} isLargeAd
 * @return {String}
 */
function getImageUrl( adConfig, isLargeAd ){
    if( isLargeAd && adConfig.hiImgSrc !== "" ) return adConfig.hiImgSrc;
    if( adConfig.lowImgSrc === "" ) return adConfig.hiImgSrc;
    return adConfig.lowImgSrc;
}

/**
 * Gets the elements of the video player
 * @param  {HTMLElement} el
 * @return {Object}
 */
function getPlayerElements(el){
    return {
        'button': el.querySelector('.' + CLS_PLAYER_BTN),
        'video': el.querySelector('.' + CLS_PLAYER_VIDEO)
    };
}

function insertVideoSource(nodeVideo, mp4){
    var isInserted = false;
    return function(autoplay){
        if(isInserted) return;
        isInserted = true;

        var nodeSource = document.createElement("source");
        nodeSource.setAttribute("src", mp4);
        nodeSource.setAttribute("type", "video/mp4");
        nodeSource.setAttribute("webkit-playsinline", "true");
        nodeSource.setAttribute("autoplay", autoplay);
        nodeVideo.appendChild(nodeSource);
    };
}

/**
 * Works out if the ad is going to be large
 * @param  {HTMLNode}  el
 * @param  {Object}  adConfig
 * @return {Boolean}
 */
function isAdLarge( el, json ){
    return (
        isSpaceAvailableForLargeAd( el ) && (
            json.hiImgSrc !== "" || json.lowImgSrc !== "" ||
            json.videoSrcMp4 !== ""));
}

/**
 * Works out if there is enough room to fit a large ad
 * @param  {HTMLNode}  el
 * @return {Boolean}
 */
function isSpaceAvailableForLargeAd( el ){
    return el.offsetHeight >= LARGE_AD_HEIGHT &&
        el.offsetWidth >= (LARGE_AD_WIDTH + AD_FLUFF);
}

/**
 * Listener to be fired when a video is clicked
 * Internally caches the video node and url
 *
 * @param  {HTMLNode} videoNode
 * @param  {String} url
 * @return {Function}           Curried listener
 */
function onVideoClick( ad, url ){
    window.open(url);
    stopVideo(ad);
}

/**
 * Plays the video ad and hides the button
 * @param  {Ad} ad
 */
function playVideo(ad){
    var els = getPlayerElements(ad.el);
    addClass(els.button, 'global__hidden');
    els.video.play();
}

/**
 * Stops a video from playing and resets the elements
 * @param  {Ad} ad
 */
function stopVideo(ad){
    var els = getPlayerElements(ad.el);
    removeClass(els.button, 'global__hidden');
    els.video.pause();
    els.video.currentTime = 0;
    els.video.load();
}

/**
 * Renders the image advert
 * @param  {Ad}  ad
 * @param  {Object}  json
 * @param  {Boolean} isLarge
 */
function renderImageAd(ad, json, isLarge){
    var imageUrl = getImageUrl(json, isLarge);
    var html = ('<img src="' + getCacheBustUrl(imageUrl) +
        '" style="display:block;width:100%;" />');
    if(json.linkUrl){
        html = '<a href="' + json.linkUrl + '" target="_top">' + html + '</a>';
    }
    ad.el.innerHTML = html;
}

/**
 * Renders the video advert
 * @param  {Ad}  ad
 * @param  {Object}  json
 * @param  {Boolean} isLarge
 */
function renderVideoAd(ad, json, isLarge){
    // Render
    var fragment = document.createDocumentFragment();

    var nodeVideo = document.createElement("video");
    var insertVidSource = insertVideoSource(nodeVideo, json.videoSrcMp4);
    setStyle(nodeVideo, {
        'width': '100%'
    });
    nodeVideo.className = CLS_PLAYER_VIDEO;
    var posterImage = getImageUrl(json);
    if( posterImage !== "" ){
        nodeVideo.setAttribute("poster", posterImage);
    } else {
        insertVidSource(false);
    }
    fragment.appendChild(nodeVideo);

    // Play button
    var playButton = new Image();
    playButton.src = 'http://cnda.condenast.co.uk/co/ads/adbuilder/playbutton.png';
    playButton.className = CLS_PLAYER_BTN;
    setStyle(playButton, {
        'left': '50%',
        'margin': '-35px 0 0 -35px',
        'position': 'absolute',
        'top': '50%'
    });
    fragment.appendChild(playButton);

    // Adding into the page
    ad.el.innerHTML = '';
    ad.el.appendChild(fragment);
    setStyle(ad.el, {
        'position': 'relative'
    });

    // Events
    // - Click
    if(json.linkUrl !== ''){
        var els = getPlayerElements(ad.el);
        addEvent(els.video, 'click', function(){
            if(els.video.paused){
                insertVidSource(true);
                playVideo(ad);
            } else {
                onVideoClick(ad, json.linkUrl);
            }
        });
        addEvent(els.video, 'ended', function(){
            stopVideo(ad);
        });
        addEvent(els.button, 'click', function(){
            insertVidSource(true);
            playVideo(ad);
        });
    }

}

/**
 * Renders a visual ad whatever that might be?
 */
function renderVisualAd(){
    throw new Error('Not sure what this is supposed to render');
}

/**
 * Sets inline styles on an element
 * @param {HTMLElement} el
 * @param {Object} styles Object of styles
 */
function setStyle(el, styles){
    for(var key in styles){
        if(!hasOwnProperty(styles, key)) continue;
        el.style[key] = styles[key];
    }
}

export default InterstitialAd;
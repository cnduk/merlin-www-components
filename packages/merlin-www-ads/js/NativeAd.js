'use strict';

import {
    AD_STATES,
    setAdStateToDestroyed,
    setAdStateToRendered,
    setAdStateToStopped
} from './Utils';
import {
    ajax,
    createEventTemplate,
    removeElement
} from '@cnbritain/merlin-www-js-utils/js/functions';

/**
 * Struct for native ad sizes
 * @constant
 * @type {Object}
 */
var NATIVE_AD_SIZES = {
    'UNKNOWN': -1,
    'SMALL': 0,
    'MEDIUM': 1,
    'LARGE': 2
};

/**
 * The url for native ad template generation
 * @constant
 * @type {String}
 */
var TEMPLATE_NATIVE_AD_URL = location.origin + '/xhr/ads/native';

/**
 * @module NativeAd
 */
var NativeAd = {

    /**
     * Converts a normal Ad to a NativeAd
     * @param  {Ad} ad
     * @return {NativeAd}
     */
    'inheritFrom': function(ad){
        // Add extra properties to the ad
        ad._properties.nativeSize = NATIVE_AD_SIZES.UNKNOWN;

        // Update state
        switch(ad.state){
        case AD_STATES.RENDERED:
            setAdStateToRendered(ad);
            break;
        case AD_STATES.DESTROYED:
            setAdStateToDestroyed(ad);
            break;
        case AD_STATES.STOPPED:
            setAdStateToStopped(ad);
            break;
        }
        return ad;
    },

    /**
     * Renders the ad with the native ad json
     * @param  {Ad} ad
     * @param  {Object} json
     */
    'render': function(ad, json){
        // Set size
        ad.set('nativeSize', getNativeAdSize(ad));

        // Render template from xhr
        ajax({
            'url': getNativeAdTemplateUrl(
                getNativeAdSizeName(ad.get('nativeSize')),
                ad.get('nativeStyle'), json),
        }).then(function(e){
            var responseJson = null;
            try {
                responseJson = JSON.parse(e.request.responseText);
            } catch(err){
                throw new SyntaxError('Error parsing native ads json', e);
            }
            this.el.innerHTML = responseJson.template;

            // Update links on the card
            // Ad url
            this.el.querySelector('.c-card__link, .c-feature__link').setAttribute(
                'href', json.LinkUrl);
            // Tracking pixel
            if(json.ImpressionTrackingUrl){
                this.el.querySelector('.js-native-ad__pixel').setAttribute(
                    'src', json.ImpressionTrackingUrl);
            } else {
                removeElement(this.el.querySelector('.js-native-ad__pixel'));
            }

            this.emit('render', createEventTemplate('render', this));
        }.bind(ad));
    }

};

/**
 * Works out what size the native ad is
 * @param  {NativeAd} nad
 * @return {Number}
 */
function getNativeAdSize(nad){
    switch(nad.get('position')){
    case 'promotion-large':
        return NATIVE_AD_SIZES.LARGE;
    case 'promotion-medium':
        return NATIVE_AD_SIZES.MEDIUM;
    case 'promotion-small':
        return NATIVE_AD_SIZES.SMALL;
    default:
        return NATIVE_AD_SIZES.UNKNOWN;
    }
}

/**
 * Gets the size name of the native ad
 * @param  {Number} index
 * @return {String}
 */
function getNativeAdSizeName(index){
    switch(index){
    case NATIVE_AD_SIZES.UNKNOWN:
        return 'unknown';
    case NATIVE_AD_SIZES.SMALL:
        return 'small';
    case NATIVE_AD_SIZES.MEDIUM:
        return 'medium';
    case NATIVE_AD_SIZES.LARGE:
        return 'large';
    }
}

/**
 * Creates a template url
 * @param  {Size} size
 * @param  {Object} json
 * @return {String}
 */
function getNativeAdTemplateUrl(size, styleIndex, json){
    // We dont set an ad_url and tracking url as this will allow us to use
    // cloudfront cache. We dynamically set the url and tracking pixel bits
    // later on
    return TEMPLATE_NATIVE_AD_URL + '/' + size + objectToQueryString({
        'title': json.Title,
        'brand': json.Brand,
        'teaser_short': json.Teaser,
        'image_uid': json.ImageUID,
        'style': styleIndex
    });
}

/**
 * Converts an object into an encoded string
 * @param  {Object} obj
 * @return {String}
 */
function objectToQueryString(obj){
    var qs = [];
    var key = '';
    for(key in obj){
        if(!obj.hasOwnProperty(key)) continue;
        qs.push(encodeURIComponent(key) + '=' + encodeValue(obj[key]));
    }
    return '?' + qs.join('&');

    function encodeValue(value){
        if(typeof value === 'object'){
            return encodeURIComponent(JSON.stringify(value));
        }
        return encodeURIComponent(value);
    }
}

export default NativeAd;

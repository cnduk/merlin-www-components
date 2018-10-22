'use strict';
/* globals DocumentTouch */

/**
 * @module detect
 */

var userAgent = navigator.userAgent;
var platform = navigator.platform;


/**
 * Creates an object with user agent information
 * @url http://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
 * @return {Object}
 */
export var getUserAgent = (function getUserAgent() {
    var ua = userAgent,
        tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return {
            name: 'IE',
            version: parseFloat(tem[1] || '')
        };
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR\/(\d+)/);
        if (tem !== null) {
            return {
                name: 'Opera',
                version: parseFloat( tem[1] )
            };
        }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) !== null) {
        M.splice(1, 1, tem[1]);
    }
    return {
        name: M[0],
        version: parseFloat( M[1] )
    };
})();

/**
 * window.history support
 * @type {Boolean}
 */
export var hasHistory = !!( 'history' in window && typeof window.history.replaceState === 'function' );

/**
 * Touch support
 * @type {Boolean}
 */
export var hasTouch = !!('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch);

/**
 * Android useragent sniff
 * @type {Boolean}
 */
export var isAndroid = /Android/i.test( userAgent );

/**
 * iOS useragent sniff
 * @type {Boolean}
 */
export var isIOS = /(iPad|iPhone|iPod touch)/i.test( userAgent );

/**
 * Linux useragent sniff
 * @type {Boolean}
 */
export var isLinux = /Linux/i.test( platform );

/**
 * Macintoch useragent sniff
 * @type {Boolean}
 */
export var isMac = /Mac/i.test( platform );

/**
 * Windows useragent sniff
 * @type {Boolean}
 */
export var isWindows = /Win/i.test( platform );

/**
 * Box model support
 * @return {Boolean}
 */
export var supportBoxModel = (function supportBoxModel(){
    var div = document.createElement('div');
    var body = document.getElementsByTagName('body')[0];
    div.style.width = div.style.paddingLeft = '1px';
    body.appendChild( div );
    var support = div.offsetWidth === 2;
    body.removeChild( div );
    div = null;
    return support;
})();

/**
 * HTML5 video support
 * @return {Boolean}
 */
export var supportsHTML5Video = (function supportsHTML5Video(){
    var video = document.createElement('video');
    return video && video.play;
})();

/**
 * Check is cookies are enabled
 * @return {Boolean}
 */
export var hasCookiesEnabled = (function hasCookiesEnabled(){
    if (navigator.cookieEnabled) return true;
    document.cookie = 'cnd_cookie_detect=1';
    var hasCookie = document.cookie.indexOf('cnd_cookie_detect=') != -1;
    document.cookie = 'cnd_cookie_detect=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
    return hasCookie;
})();

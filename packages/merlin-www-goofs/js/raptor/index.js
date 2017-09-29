"use strict";

/**
 * In memory of https://github.com/acrogenesis/raptorize
 * I refuse to load jquery for it.
 */

var AUDIO_ID = "elRaptorShriek";
var RAPTOR_ID = "imgRaptor";
var KEYS = [38,38,40,40,37,39,37,39,66,65];
var INLINE_CSS = "@-webkit-keyframes raptor{0%{bottom:-500px;}70%{bottom:0;right:0%;}100%{bottom:0;right:110%;}}@keyframes raptor{0%{bottom:-500px;}70%{bottom:0;right:0%;}100%{bottom:0;right:110%;}}.do-the-raptor{-webkit-animation-duration:3s;-ms-animation-duration:3s;-moz-animation-duration:3s;-o-animation-duration:3s;animation-duration:3s;-webkit-animation-name:raptor;-ms-animation-name:raptor;-moz-animation-name:raptor;-o-animation-name:raptor;animation-name:raptor;}";

var hasElements = false;
var hasListeners = false;
var keysLeft = null;

function addStyles(){
    var styles = createTag("style", {"type": "text/css"});
    if (styles.styleSheet){
      styles.styleSheet.cssText = INLINE_CSS;
    } else {
      styles.appendChild( document.createTextNode( INLINE_CSS ) );
    }
    document.head.appendChild( styles );
}

function createRaptorElement(){
    var raptor = createTag( "img", {
        "id": RAPTOR_ID,
        "src": "../static/img/raptor.png",
        "style": "position: fixed; bottom: -500px; right: 0%; z-index: 10"
    });
    return raptor;
}

function createSoundElement(){
    var audioEl = createTag( "audio", {
        "id": AUDIO_ID,
        "preload": "auto"
    });
    var mp3Source = createTag( "source", {
        "src": "../static/sounds/raptor-sound.mp3"
    });
    var oggSource = createTag( "source", {
        "src": "../static/sounds/raptor-sound.ogg"
    });
    audioEl.appendChild( mp3Source );
    audioEl.appendChild( oggSource );
    return audioEl;
}

function createTag( name, attrs ){
    var node = document.createElement( name );
    if( attrs === undefined ) return node;
    for( var key in attrs ){
        if( !attrs.hasOwnProperty( key ) ) continue;
        node.setAttribute( key, attrs[ key ] );
    }
    return node;
}

function destroy(){
    removeListeners();
    removeElements();
    keysLeft.length = 0;
    KEYS.length = 0;
}

function fireAnalytics(){
    GATracker.SendAll( GATracker.SEND_HITTYPES.EVENT, {
        'eventCategory': 'Secrets',
        'eventAction': 'Raptor found'
    });
}

function init(){
    reset();
    window.addEventListener( "keydown", onKeyDown );
    hasListeners = true;
}

function onKeyDown( e ){
    if( e.keyCode === keysLeft[0] ){
        keysLeft.shift();
        if( keysLeft.length > 0 ) return;
        removeListeners();
        raptor();
    } else {
        if( keysLeft.length === KEYS.length ) return;
        reset();
    }
}

function raptor(){
    addStyles();

    var sound = createSoundElement();
    var rap = createRaptorElement();
    hasElements = true;

    document.body.appendChild( sound );
    document.body.appendChild( rap );

    var forceRedraw = rap.offsetWidth;
    rap.className = "do-the-raptor";

    tryCatch(function(){ sound.play(); });
    sound = null;
    rap = null;

    // fireAnalytics();

    setTimeout( destroy, 6000 );
}

function removeElement( node ){
    if( !node || !node.parentNode ) return;
    node.parentNode.removeChild( node );
}

function removeElements(){
    if( !hasElements ) return;
    removeElement( document.getElementById( AUDIO_ID ) );
    removeElement( document.getElementById( RAPTOR_ID ) );
}

function removeListeners(){
    if( !hasListeners ) return;
    window.removeEventListener( "keydown", onKeyDown );
}

function reset(){
    keysLeft = KEYS.slice(0);
}

function tryCatch( fn, _errFn ){
    var errFn = _errFn || function(){};
    try {
        fn();
    } catch( e ){
        errFn( e );
    }
}

export default init;

'use strict';

function createDom(char){
  var parent = document.createElement('div');
  parent.setAttribute('aria-hidden', true);
  parent.className = 'cookies';

  var cookie = null;
  for(var i = 0; i < 10; i++){
    cookie = document.createElement('div');
    cookie.className = 'cookie';
    cookie.innerHTML = char;
    parent.appendChild(cookie);
  }
  cookie = null;
  return parent;
}

function createStyles(){
  var style = document.createElement('style');
  var css = '@-webkit-keyframes cookies-fall{0%{top:-10%}100%{top:100%}}@-webkit-keyframes cookies-shake{0%,100%{-webkit-transform:translateX(0);transform:translateX(0)}50%{-webkit-transform:translateX(80px);transform:translateX(80px)}}@keyframes cookies-fall{0%{top:-10%}100%{top:100%}}@keyframes cookies-shake{0%,100%{transform:translateX(0)}50%{transform:translateX(80px)}}.cookie{width:20px;height:20px;position:fixed;top:-10%;z-index:9999;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;-webkit-animation-name:cookies-fall,cookies-shake;-webkit-animation-duration:10s,3s;-webkit-animation-timing-function:linear,ease-in-out;-webkit-animation-iteration-count:infinite,infinite;-webkit-animation-play-state:running,running;animation-name:cookies-fall,cookies-shake;animation-duration:10s,3s;animation-timing-function:linear,ease-in-out;animation-iteration-count:infinite,infinite;animation-play-state:running,running}.cookie:nth-of-type(0){left:1%;-webkit-animation-delay:0s,0s;animation-delay:0s,0s}.cookie:nth-of-type(1){left:10%;-webkit-animation-delay:1s,1s;animation-delay:1s,1s}.cookie:nth-of-type(2){left:20%;-webkit-animation-delay:6s,.5s;animation-delay:6s,.5s}.cookie:nth-of-type(3){left:30%;-webkit-animation-delay:4s,2s;animation-delay:4s,2s}.cookie:nth-of-type(4){left:40%;-webkit-animation-delay:2s,2s;animation-delay:2s,2s}.cookie:nth-of-type(5){left:50%;-webkit-animation-delay:8s,3s;animation-delay:8s,3s}.cookie:nth-of-type(6){left:60%;-webkit-animation-delay:6s,2s;animation-delay:6s,2s}.cookie:nth-of-type(7){left:70%;-webkit-animation-delay:2.5s,1s;animation-delay:2.5s,1s}.cookie:nth-of-type(8){left:80%;-webkit-animation-delay:1s,0s;animation-delay:1s,0s}.cookie:nth-of-type(9){left:90%;-webkit-animation-delay:3s,1.5s;animation-delay:3s,1.5s}';
  style.setAttribute('type', 'text/css');
  if(style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  return style;
}

export default function cookieflakes(){
    document.head.appendChild(createStyles());
    document.body.appendChild(createDom('🍪'));
}

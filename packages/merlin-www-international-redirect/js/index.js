"use strict";

import EventEmitter from 'eventemitter2';
import {
    addEvent,
    addEventOnce,
    createEventTemplate,
    inherit,
    removeElement,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';

var CLS_INTERNATIONAL_REDIRECT = 'c-int-redirect';
var CLS_INTERNATIONAL_LINK = 'c-int-redirect__list__item a';
var ID_DISPLAY = 'chkIntRedirectDisplay';

function InternationalRedirect(){
    EventEmitter.call(this, { 'wildcard': true });

    this.el = document.querySelector('.' + CLS_INTERNATIONAL_REDIRECT);

    if(this.el !== null){
        this.emit('visibilityChange', eventVisibilityChange(this, 'visible'));
        applyListeners(this);
    }
}

InternationalRedirect.prototype = inherit(EventEmitter.prototype, {
    'constructor': InternationalRedirect,
    'destroy': function(){
        removeListeners(this);
        removeElement(this.el);
        this.el = null;
        this.removeAllListeners();
    }
});

function eventLinkType(target, type){
    return createEventTemplate(type, target, {
        'country': target.innerText,
        'url': target.getAttribute('href')
    });
}

function eventVisibilityChange(target, visibility){
    return createEventTemplate('visibilityChange', target, {
        'visibility': visibility
    });
}

function applyListeners(inst){
    // Visibility change - hidden
    var chkDisplay = document.getElementById(ID_DISPLAY);
    chkDisplay._hookChange = onCheckboxVisibleChange.bind(inst);
    addEventOnce(chkDisplay, 'change', chkDisplay._hookChange);
    // Hover and click events
    var links = toArray(inst.el.querySelectorAll('.' + CLS_INTERNATIONAL_LINK));
    links.forEach(function(link){
        link._hookClick = onLinkClick.bind(inst);
        link._hookMouseover = onLinkHover.bind(inst);
        addEventOnce(link, 'click', link._hookClick);
        addEvent(link, 'mouseover', link._hookMouseover);
    });
}

function onCheckboxVisibleChange(){
    this.emit('visibilityChange', eventVisibilityChange(this, 'hidden'));
    this.destroy();
}

function onLinkClick(e){
    this.emit('linkClick', eventLinkType(e.target, 'linkClick'));
    e.target._hookClick = null;
}

function onLinkHover(e){
    this.emit('linkHover', eventLinkType(e.target, 'linkHover'));
}

function removeListeners(inst){
    // Visibility change - hidden
    var chkDisplay = document.getElementById(ID_DISPLAY);
    removeEvent(chkDisplay, 'change', chkDisplay._hookChange);
    chkDisplay._hookChange = null;
    // Hover and click events
    var links = toArray(inst.el.querySelectorAll('.' + CLS_INTERNATIONAL_LINK));
    links.forEach(function(link){
        removeEvent(link, 'click', link._hookClick);
        removeEvent(link, 'mouseover', link._hookMouseover);
        link._hookClick = null;
        link._hookMouseover = null;
    });
}

function toArray(collection){
    var len = collection.length;
    var arr = new Array(len);
    while(len--) arr[len] = collection[len];
    return arr;
}

export default new InternationalRedirect();

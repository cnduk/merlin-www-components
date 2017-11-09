'use strict';

import { addEvent } from '@cnbritain/merlin-www-js-utils/js/functions';
import GATracker from '@cnbritain/merlin-www-js-gatracker';

var JS_GATRACKED_LINK = '.js-gatracked-link';

var analyticsEventKeys = {
    // attribute key: value key
    'data-analytics-event-action': 'action',
    'data-analytics-event-category': 'category',
    'data-analytics-event-label': 'label'
};

export function getAnalyticEventAttributes(el){
    var attrs = {};
    Object.keys(analyticsEventKeys).forEach(function(attrKey){
        if(el.hasAttribute(attrKey)){
            attr[analyticsEventKeys[attrKey]] = el.getAttribute(attrKey);
        } else {
            attr[analyticsEventKeys[attrKey]] = null;
        }
    });
    return attrs;
}

export function sendEvent(e){
    var attrs = getAnalyticEventAttributes(this);

    GATracker.SendAll(GATracker.SEND_HITTYPES.EVENT, {
        'eventAction': attrs.action,
        'eventCategory': attrs.category,
        'eventLabel': attrs.label,
        'transport': 'beacon'
    });
}

export default function init(){
    var trackedLinks = document.querySelectorAll(JS_GATRACKED_LINK);
    if(trackedLinks.length === 0) return;

    var len = trackedLinks.length;
    while(len--) addEvent(trackedLinks[len], 'click', sendEvent);
}

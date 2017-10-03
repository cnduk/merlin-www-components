'use strict';

import { addEvent } from '@cnbritain/merlin-www-js-utils/js/functions';
import GATracker from '@cnbritain/merlin-www-js-gatracker';

export default function init(){
    var trackedLinks = document.querySelectorAll('.js-gatracked-link');
    if(trackedLinks.length < 1) return;
    var len = trackedLinks.length;
    while(len--){
        addEvent(trackedLinks[len], 'click', sendEvent);
    }
}

export function sendEvent(e){
    var target = this;
    var analyticsAction = target.getAttribute('data-analytics-event-action');
    var analyticsCategory = target.getAttribute(
        'data-analytics-event-category');
    var analyticsLabel = target.getAttribute('data-analytics-event-label');
    GATracker.SendAll(GATracker.SEND_HITTYPES.EVENT, {
        'eventAction': analyticsAction,
        'eventCategory': analyticsCategory,
        'eventLabel': analyticsLabel,
        'transport': 'beacon'
    });
}

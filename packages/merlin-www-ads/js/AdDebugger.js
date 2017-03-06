'use strict';

import AdManager from './AdManager';
import { AD_STATES } from './Utils';
import template from "../templates/debug-ad.mustache";

function AdDebugger(){}

AdDebugger.prototype = {

    'clear': function(){
        for(var key in AdManager.slots){
            if(!AdManager.slots.hasOwnProperty(key)) continue;
            if(!isAdDebugging(AdManager.slots[key])) continue;
            clearDebugAd(AdManager.slots[key]);
        }
    },

    'constructor': AdDebugger,

    'debug': function(force){
        for(var key in AdManager.slots){
            if(!AdManager.slots.hasOwnProperty(key)) continue;
            if(!force && isAdDebugging(AdManager.slots[key])) continue;
            if(AdManager.slots[key].state !== AD_STATES.RENDERED) continue;
            if(force) clearDebugAd(AdManager.slots[key]);
            renderDebugAd(AdManager.slots[key]);
        }
    }

};

function clearDebugAd(ad){
    // Remove the debug data attribute
    ad.el.removeAttribute('data-ad-debug');

    var debugEl = ad.el.parentNode.querySelector('.ad-debug');
    debugEl.parentNode.removeChild(debugEl);
}

function isAdDebugging(ad){
    return ad.el.hasAttribute('data-ad-debug');
}

function renderDebugAd(ad){
    // Set the debug data attribute
    ad.el.setAttribute('data-ad-debug', 'true');

    var debugElement = document.createElement('div');

    // Generate a neater sizemap for the template
    var sizeMapping = ad.get('sizemap');
    if(sizeMapping !== null){
        sizeMapping = {
            'values': sizeMapping.map(function(size){
                return {
                    'key': size[0].join('x'),
                    'values': size[1].map(function(adSize){
                        return adSize.join('x');
                    })
                };
            })
        };
    }

    var adValues = ad.get('values');
    if(adValues){
        adValues = JSON.stringify(adValues);
    }

    debugElement.innerHTML = template({
        'creativeId': ad.get('creativeId'),
        'dfp': ad.get('dfp'),
        'id': ad.id,
        'lineItemId': ad.get('lineItemId'),
        'renderedSize': ad.renderedSize.join('x'),
        'position': ad.get('position'),
        'sizeMapping': sizeMapping,
        'sizes': ad.get('sizes').map(function(size){
            return size.join('x');
        }),
        'values': adValues
    });

    ad.el.parentNode.appendChild(debugElement.firstChild);

}

export default new AdDebugger();
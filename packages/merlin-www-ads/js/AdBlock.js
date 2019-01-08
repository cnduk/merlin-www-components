
import {
    createEventTemplate,
    removeClass
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    getAdTypeBySize,
    setAdStateToRendered,
    setAdStateToStopped
} from './Utils';

var RENDERERS = {

    '728x90': function renderLeaderboard(ad){
        var renderedDom = document.createElement('div');
        renderedDom.innerHTML = '<img src="/static/img/adblock-LB.png" />';
        ad.el.appendChild(renderedDom);
    },

    '300x250': function renderMPU(ad){
        var renderedDom = document.createElement('div');
        renderedDom.innerHTML = '<img src="/static/img/adblock-MPU.png" />';
        ad.el.appendChild(renderedDom);
    },

    '300x600': function renderMPU(ad){
        var renderedDom = document.createElement('div');
        renderedDom.innerHTML = '<img src="/static/img/adblock-DS.png" />';
        ad.el.appendChild(renderedDom);
    }

};

var AdBlock = {

    render: function render(ad){
        // console.group('AdBlock Rendering');
        // console.log('Ad', ad);

        // Work out which size to use. For this we need to look at sizemap
        // property and sizes. If no sizemap is defined, take the first value
        // in sizes. When using the sizemap, we need to check what window
        // dimensions are.
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var adSizeMap = ad.get('sizemap');
        var adSizes = ad.get('sizes');
        var adDimension = null;
        if(adSizeMap === null){
            if(Array.isArray(adSizes[0])){
                adDimension = adSizes[0];
            } else {
                adDimension = adSizes;
            }
        } else {
            var i = adSizeMap.length;
            var tmp = null;
            while(i--){
                tmp = adSizeMap[i];
                if(tmp[0][0] < windowWidth && tmp[0][1] < windowHeight){
                    adDimension = tmp[1][0];
                    break;
                }
            }
        }
        // console.log('Size', adDimension);
        var dimensionKey = adDimension[0] + 'x' + adDimension[1];

        // Render the ad if we have a template set up for it. Otherwise fire
        // a stop event to remove things.
        var renderEvent = 'error';
        if(RENDERERS.hasOwnProperty(dimensionKey)){
            RENDERERS[dimensionKey](ad);
            renderEvent = 'render';
            setAdStateToRendered(ad);
            ad.set('creativeId', 'Custom Ad Block Message');
            ad.set('lineItemId', 'Custom Ad Block Message');
            ad.renderedSize = adDimension;
            ad.type = getAdTypeBySize(adDimension[0], adDimension[1]);
            removeClass(ad.el.parentNode.parentNode, 'is-hidden');

        } else {
            // console.warn('No renderer found for: ' + dimensionKey);
            setAdStateToStopped(ad);
            renderEvent = 'stop';
        }

        ad.emit(renderEvent, createEventTemplate(renderEvent, ad, {
            'originalEvent': null
        }));
        ad.manager.emit(renderEvent, createEventTemplate(renderEvent, ad.manager, {
            'ad': ad,
            'originalEvent': null
        }));

        // console.groupEnd();
    }

};

export default AdBlock;

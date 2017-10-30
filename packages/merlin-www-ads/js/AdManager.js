'use strict';
/* globals googletag */

import Ad from './Ad';
import AdGroup from './AdGroup';
import EventEmitter from 'eventemitter2';

import {
    addEvent,
    assign,
    cloneArray,
    createEventTemplate,
    getWindowScrollTop,
    inherit,
    not,
    onPageLoad,
    onPageReady,
    randomUUID,
    removeClass,
    removeEvent,
    throttle
} from '@cnbritain/merlin-www-js-utils/js/functions';

import {
    AD_STATES,
    getAdTypeBySize,
    getSlot,
    isElInitialised,
    loadAdLibraries,
    loadGPTLibrary,
    parseAdAttributes,
    pushToGoogleTag,
    refreshGPT,
    refreshRubicon,
    registerGPT,
    registerRubicon,
    registerPrebid,
    renderGPT,
    setAdStateToRendered,
    setAdStateToStopped
} from './Utils';

var AD_CLS = '.ad__container';
var AD_LAZYLOAD_THRESHOLD = 100;
var windowHeight = window.innerHeight;
var lazyloadInitialised = false;

function AdManager(){
    EventEmitter.call(this, { 'wildcard': true });

    this._hooks = {};
    this._lazyloadGroups = [];

    this.groups = {};
    this.initialised = false;
    this.slots = {};
}

AdManager.prototype = inherit(EventEmitter.prototype, {

    'constructor': AdManager,

    'createAd': function(el, options){
        var config = options || {};
        return new Ad(el, this,config);
    },

    'display': function(el){
        var adAttributes = parseAdAttributes(el);
        el.setAttribute('id', 'ad_' + randomUUID());
        var ad = this.createAd(el, adAttributes);
        return this.register(ad)
            .then(function(){
                return this.render(ad);
            }.bind(this))
            .then(function(){
                return this.refresh(ad);
            }.bind(this));
    },

    /**
     * Gets all the ad slots
     * @param  {Object} options
     * @param  {String} options.cls  The class of the advert slots
     * @param  {String} options.el   The element to query elements for
     * @param  {Function}  options.filter  The filter functions
     * @return {Array.<HTMLElement>}
     */
    'getSlots': function getSlots(options){
        var _options = assign({
            'cls': AD_CLS,
            'el': document,
            'filter': null
        }, options);
        var arr = cloneArray(_options.el.querySelectorAll(_options.cls));
        if(!_options.filter) return arr;
        return arr.filter(_options.filter);
    },

    /**
     * Initialises the AdManager
     * @return {Promise}
     */
    'init': function init(){
        if(this.initialised) return Promise.resolve();

        this.initialised = true;

        return loadAdLibraries()
            .then(function(){
                pushToGoogleTag(function init_googletag(res){
                    // Doing this means we have to fire a refresh event when we want an
                    // ad. This allows us to do SRA but also roadblocks and single
                    // request ads like in-reads
                    googletag.pubads().disableInitialLoad();
                    // Single page request to allow roadblocks
                    googletag.pubads().enableSingleRequest();
                    googletag.pubads().enableAsyncRendering();
                    googletag.pubads().collapseEmptyDivs( true );
                    googletag.enableServices();
                    // Events
                    googletag.pubads().addEventListener(
                        "slotRenderEnded", onSlotRenderEnded.bind(this));
                    res();
                }.bind(this));
            }.bind(this));

    },

    'lazy': function(el){
        autoPilot.call(this, el);
        return Promise.resolve();
    },

    'refresh': function(ads, changeCorrelator){
        return refreshRubicon(ads)
            .then(function(){
                return refreshGPT(ads, changeCorrelator);
            })
            .catch(function(err){
                console.error('There was an error refreshing the ads');
                throw err;
            });
    },

    'register': function register(ad){
        if(Array.isArray(ad)){
            return Promise.all(ad.map(this.register));
        }
        return registerRubicon(ad)
            .then(function(){ return registerPrebid(ad); })
            .then(function(){ return registerGPT(ad); })
            .catch(function(err){
                console.error('There was an error registering the ads');
                throw err;
            });
    },

    'render': function(ad){
        // NOTE: we don't emit a render event here as onSlotRenderEnded
        // will trigger stopped or render for us
        if(Array.isArray(ad)){
            return Promise.all(ad.map(this.render))
                .catch(function(err){
                    console.error('There was an error rendering the ads');
                    throw err;
                });
        }
        return renderGPT(ad)
            .catch(function(err){
                console.error('There was an error rendering the ads');
                throw err;
            });
    },

    'update': function(){
        var scrollY = getWindowScrollTop();
        var winBounds = {
            'bottom': scrollY + windowHeight,
            'top': scrollY
        };

        var groupsLength = this._lazyloadGroups.length;
        var group = null;
        while(groupsLength--){
            group = this._lazyloadGroups[groupsLength];

            // Check if the group is on screen
            if(!intersects(winBounds, group._bounds)) continue;
            // Check the ads are registered
            if(!hasGroupAdsRegistered(group)) continue;
            // Load the ads
            lazyloadGroup(group);
            // Remove from list
            this._lazyloadGroups.splice(groupsLength, 1);
        }

        // No lazyload groups are left so clear the events
        if(this._lazyloadGroups.length === 0){
            deinitialiseLazyload.call(this);
        }
    },

    /**
     * Updates the correlator
     * @return {Promise}
     */
    'updateCorrelator': function updateCorrelator(){
        return pushToGoogleTag(function updateCorrelator_googletag(){
            googletag.pubads().updateCorrelator();
        });
    }

});

function autoPilot(_el){
    var el = _el || document;
    var slotEls = this.getSlots({ 'el': el, 'filter': not(isElInitialised) });
    var adsAttributes = slotEls.map(parseAdAttributes);

    if(slotEls.length === 0) return;

    // Create the ads
    var ads = slotEls.map(function mapElsToSlots(el, index){
        el.setAttribute('id', 'ad_' + randomUUID());
        return this.createAd(el, adsAttributes[index]);
    }.bind(this));

    // Group into render groups
    var adGroups = groupAds(this, ads);

    /**
     * !lazyload
     * - register
     * - render
     * - refresh
     *
     * lazyload
     * - register
     * - wait for in view
     *     - render
     *     - refresh
     */

    //Register everything
    var chain = Promise.resolve()
        .then(function(){
            return Promise.all(adGroups.map(groupRegister));
        });

    // Render and refresh everything that is not lazyloading
    // The first item in the partition will be lazyload:false
    var groupPartition = partition(adGroups, function(item){
        return item.lazyload === false;
    });
    if(groupPartition[1].length > 0){
        this._lazyloadGroups = this._lazyloadGroups.concat(
            groupPartition[1].slice(0));
    }

    chain
        .then(function(){
            return Promise.all(groupPartition[0].map(groupRender));})
        .then(function(){
            return Promise.all(groupPartition[0].map(groupRefresh));});

    // Check if we need to initialise for lazyloading
    if(this._lazyloadGroups.length > 0){
        initialiseLazyload.call(this);
        chain.then(this.update.bind(this));
    }

}

function deinitialiseLazyload(){
    if(!lazyloadInitialised) return;
    lazyloadInitialised = false;
    removeEvent(window, 'resize', this._hooks.resize);
    removeEvent(window, 'scroll', this._hooks.scroll);
    this._hooks.resize = null;
    this._hooks.scroll = null;
}

function groupAds(manager, ads){
    var groups = {};
    var groupsArr = [];

    // Create and add to the groups
    var groupKey = '';
    var adOrder = 0;
    ads.forEach(function eachAdGroup(ad){
        adOrder = ad.get('order');
        groupKey = ad.get('group');

        if(groupKey){
            createGroup(groupKey, adOrder).add(ad);
        } else {
            createGroup(randomUUID(), adOrder).add(ad);
        }
    });

    // Order the groups by priority
    for(groupKey in groups){
        if(!groups.hasOwnProperty(groupKey)) continue;
        groupsArr.push(groups[groupKey]);
    }
    groupsArr.sort(function sortByOrder(a, b){ return a.order - b.order; });

    return groupsArr.map(function getGroup(group){ return group.group; });

    function createGroup(name, order){
        // If group already exists
        if(groups.hasOwnProperty(name)) return groups[name].group;

        // Create the group
        groups[name] = {
            'group': new AdGroup(manager, { 'id': name }),
            'order': order
        };
        return groups[name].group;
    }
}

function initialiseLazyload(){
    if(lazyloadInitialised) return;
    lazyloadInitialised = true;
    this._hooks.resize = throttle(onWindowResize, 500, this);
    this._hooks.scroll = throttle(this.update, 300, this);
    addEvent(window, 'resize', this._hooks.resize);
    addEvent(window, 'scroll', this._hooks.scroll);
    onPageReady(onWindowResize.bind(this));
    onPageLoad(onWindowResize.bind(this));
}


function onSlotRenderEnded(e){
    var ad = this.slots[e.slot.getSlotElementId()];
    var renderEvent = 'error';

    // Ad has already been destroyed, forget about it
    if(ad === null) return;

    // If the slot is empty or we have told the ad to stop before
    // (Blank advert), fire a stop event
    if( e.isEmpty || ad.state === AD_STATES.STOPPED ){
        setAdStateToStopped(ad, e);
        renderEvent = 'stop';
    } else {
        setAdStateToRendered(ad, e);
        ad.set('creativeId', e.creativeId);
        ad.set('lineItemId', e.lineItemId);
        ad.renderedSize = e.size.slice(0);
        ad.type = getAdTypeBySize(e.size[0], e.size[1]);
        removeClass(ad.el.parentNode.parentNode, 'is-hidden');
        renderEvent = 'render';
    }

    ad.emit(renderEvent, createEventTemplate(renderEvent, ad, {
        'originalEvent': e
    }));
    ad.manager.emit(renderEvent, createEventTemplate(renderEvent, ad.manager, {
        'ad': ad,
        'originalEvent': e
    }));
}

function groupRefresh(group){
    return group.refresh();
}

function groupRegister(group){
    return group.register();
}

function groupRender(group){
    return group.render();
}

function groupResize(group){
    return group.resize();
}

function hasGroupAdsRegistered(group){
    for(var key in group.slots){
        if(group.slots[key].state < AD_STATES.REGISTERED) return false;
    }
    return true;
}

function intersects(winBounds, groupBounds){
    var top = groupBounds.top - AD_LAZYLOAD_THRESHOLD;
    var bottom = groupBounds.bottom + AD_LAZYLOAD_THRESHOLD;

    if(top < winBounds.top && bottom < winBounds.top) return false;
    if(top > winBounds.bottom && bottom > winBounds.bottom) return false;

    return true;
}

function lazyloadGroup(group){
    return Promise.resolve()
        .then(function(){ return groupRender(group); })
        .then(function(){ return groupRefresh(group); });
}

function onWindowResize(){
    this._lazyloadGroups.forEach(groupResize);
    windowHeight = window.innerHeight;
    this.update();
}

function partition(list, fn){
    var result = new Array(2);
    result[0] = [];
    result[1] = [];

    if(list.length < 1) return result;

    var i = -1;
    var len = list.length;
    var item = null;

    while(++i < len){
        item = list[i];
        if(fn(item)){
            result[0].push(item);
        } else {
            result[1].push(item);
        }
    }

    item = null;
    return result;
}

export default new AdManager();
'use strict';

import {
    addEvent,
    debounce,
    hasClass,
    getNamespaceKey,
    getParent,
    getParentUntil,
    removeClass
} from '@cnbritain/merlin-www-js-utils/js/functions';
import { ArticleManager } from '@cnbritain/merlin-www-article';
import { ARTICLE_TYPES } from '@cnbritain/merlin-www-article/js/constants';
import { AdManager } from '@cnbritain/merlin-www-ads';
import {
    Group,
    Manager,
    Obstacle,
    Scroll,
    Stick
} from '@cnbritain/merlin-www-js-sticky';
import { toArray } from '../utils';

var CLS_STICK_GROUP = '.stick-group';
var CLS_STICK_WRAPPER = '.stick-wrapper';
var CLS_STICK_OBSTACLE = '.stick-block';

var articleScroller = null;
var debouncedUpdateAll = debounce(updateAll, 200);


export default function init() {
    articleScroller = new Scroll(window);
    addEvent(window, 'resize', debounce(onWindowResize, 150));

    ArticleManager.on("add", onArticleAdd);

    AdManager.on('render', onAdRender);
    AdManager.on('stop', onAdStop);

    onWindowResize();
}


export function isSticky(item){
    return item instanceof Stick;
}


export function pauseScroller(){
    articleScroller.children.forEach(function(group){
        group.children.forEach(function(item){
            if(isSticky(item)) item._setInitial(true);
        });
    });
    articleScroller.pause();
}

export function unpauseScroller(){
    articleScroller.children.forEach(function(group){
        group.children.forEach(function(item){
            if(isSticky(item)) item._setNeutral(true);
        });
    });
    articleScroller.resume();
}

export function onWindowResize(){
    if(window.innerWidth < 1024){
        pauseScroller();
    } else {
        unpauseScroller();

        Manager.recalculate();
        articleScroller.sortChildren();
        articleScroller.update();
    }
}







export function itemHasId( id ){
    return function( item ){
        var block = item.el.querySelector(".ad-container");
        return block && block.hasAttribute("id") &&
            block.getAttribute("id") === id;
    };
}


export function onAdRender(){
    articleScroller.recalculate(true);
    articleScroller.sortChildren(true);
}

export function onAdStop(e){
    // Check if the ad is an obstacle
    var item = Manager.obstacles.filter(itemHasId(e.ad.id));
    // No items? Check sticky items.
    if(item.length === 0){
        item = Manager.stickies.filter(itemHasId(e.ad.id));
    }
    if(item.length === 0){
        return;
    } else {
        item = item[0];
    }

    var group = item.group;
    group.removeChild(item);
    item.destroy();
    group.recalculate(true);
    group.sortChildren();
}








export function updateAll(){
    Manager.recalculate();
    articleScroller.sortChildren(true);
    articleScroller.update();
}

export function createStickyItems(nodeGroup, nodeStick, nodeObstacles){
    var stickGroup = null;
    var stickItems = null;
    var stickObstacles = null;

    if( nodeGroup instanceof Group ){
        stickGroup = nodeGroup;
    } else {
        stickGroup = new Group(nodeGroup);
    }

    if(nodeStick){
        stickItems = Stick.createStick(nodeStick);
        stickItems.forEach(function eachStickItem(item, index){
            item.offset.top = 60;
            if(index !== stickItems.length - 1){
                item.offset.bottom = 60;
            } else {
                item.offset.bottom = 100;
            }
        });
        stickGroup.addChildren(stickItems, { "sort": false });
    }

    if( nodeObstacles ){
        stickObstacles = Obstacle.createObstacle(nodeObstacles);
        stickGroup.addChildren(stickObstacles, { "sort": false });
    }

    articleScroller.addChild(stickGroup);
    stickGroup.recalculate(true);
    stickGroup.sortChildren();

    return {
        "group": stickGroup,
        "obstacles": stickObstacles,
        "sticky": stickItems
    };
}


export function hasChildren(el){
    return el.children.length > 0;
}

export function onArticleAdd(e){
    var currentArticle = e.article;
    var stickGroup = currentArticle.el.querySelector(CLS_STICK_GROUP);
    var stickyWrappers = null;
    var stickyObstacles = null;
    var stickyConfig = null;

    if(!currentArticle.isInfinite || currentArticle.type === ARTICLE_TYPES.ARTICLE){
        stickyWrappers = currentArticle.el.querySelectorAll(CLS_STICK_WRAPPER);
        stickyObstacles = currentArticle.el.querySelectorAll(CLS_STICK_OBSTACLE);

        createStickyItems(stickGroup, stickyWrappers, stickyObstacles);
        debouncedUpdateAll();

    } else if(currentArticle.type === ARTICLE_TYPES.GALLERY && currentArticle.isInfinite){

        stickyWrappers = [currentArticle.el.querySelector(
            CLS_STICK_WRAPPER)];
        stickyObstacles = currentArticle.el.querySelectorAll(CLS_STICK_OBSTACLE);
        stickyConfig = createStickyItems(
            stickGroup, stickyWrappers, stickyObstacles);
        debouncedUpdateAll();

        currentArticle.once("expand", function(){
            var group = stickyConfig.group;
            var wrappers = toArray(currentArticle.el.querySelectorAll(
                CLS_STICK_WRAPPER)).filter(hasChildren);
            var obstacles = currentArticle.el.querySelectorAll(
                CLS_STICK_OBSTACLE);
            createStickyItems(group, wrappers, obstacles);
            stickyConfig = null;
            debouncedUpdateAll();
        });
    }
}

'use strict';

import {
    addEvent,
    debounce,
    hasClass
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    ArticleManager
} from '@cnbritain/merlin-www-article';
import {
    ARTICLE_TYPES
} from '@cnbritain/merlin-www-article/js/constants';
import {
    AdManager
} from '@cnbritain/merlin-www-ads';
import {
    Group,
    Manager,
    Obstacle,
    Scroll,
    Stick
} from '@cnbritain/merlin-www-js-sticky';

import {
    CLS_STICK_GROUP,
    CLS_STICK_WRAPPER,
    CLS_STICK_OBSTACLE
} from '../constants';
import {
    toArray
} from '../utils';

var articleScroller = null;
var debouncedUpdateAll = debounce(updateAll, 300);


export default function init() {
    articleScroller = new Scroll(window);
    addEvent(window, 'resize', debounce(onWindowResize, 150));

    ArticleManager.on('add', onArticleAdd);

    AdManager.on('render', onAdRender);
    AdManager.on('stop', onAdStop);

    onWindowResize();
}


export function isSticky(item) {
    return item instanceof Stick;
}


export function pauseScroller() {
    articleScroller.children.forEach(function(group) {
        group.children.forEach(function(item) {
            if (isSticky(item)) item._setInitial(true);
        });
    });
    articleScroller.pause();
}

export function unpauseScroller() {
    articleScroller.children.forEach(function(group) {
        group.children.forEach(function(item) {
            if (isSticky(item)) item._setNeutral(true);
        });
    });
    articleScroller.resume();
}

export function onWindowResize() {
    if (window.innerWidth < 1024) {
        pauseScroller();
    } else {
        unpauseScroller();

        Manager.recalculate();
        articleScroller.sortChildren();
        articleScroller.update();
    }
}



export function itemHasId(id) {
    return function(item) {
        var block = item.el.querySelector('.ad__container');
        return block && block.hasAttribute('id') &&
            block.getAttribute('id') === id;
    };
}


export function onAdRender() {
    articleScroller.recalculate(true);
    articleScroller.sortChildren(true);
}

export function onAdStop(e) {
    // Check if the ad is an obstacle
    var item = Manager.obstacles.filter(itemHasId(e.ad.id));
    // No items? Check sticky items.
    if (item.length === 0) {
        item = Manager.stickies.filter(itemHasId(e.ad.id));
    }
    if (item.length === 0) {
        return;
    } else {
        item = item[0];
    }

    var group = item.group;
    group.removeChild(item);
    item.destroy();
    updateAll();
}



export function updateAll() {
    Manager.recalculate();
    articleScroller.sortChildren(true);
    articleScroller.update();
}

export function createStickyItems(nodeGroup, nodeStick, nodeObstacles) {
    var stickGroup = null;
    var stickItems = null;
    var stickObstacles = null;

    if (nodeGroup instanceof Group) {
        stickGroup = nodeGroup;
    } else {
        stickGroup = new Group(nodeGroup);
    }

    if (nodeStick) {
        stickItems = Stick.createStick(nodeStick);
        stickItems.forEach(function eachStickItem(item, index) {
            item.offset.top = 60;
            if (index !== stickItems.length - 1) {
                item.offset.bottom = 60;
            } else {
                item.offset.bottom = 100;
            }
        });
        stickGroup.addChildren(stickItems, {
            'sort': false
        });
    }

    if (nodeObstacles) {
        stickObstacles = Obstacle.createObstacle(nodeObstacles);
        stickGroup.addChildren(stickObstacles, {
            'sort': false
        });
    }

    articleScroller.addChild(stickGroup);
    stickGroup.recalculate(true);
    stickGroup.sortChildren();

    return {
        'group': stickGroup,
        'obstacles': stickObstacles,
        'sticky': stickItems
    };
}

export function hasChildren(el) {
    return el.children.length > 0;
}

export function filterStoppedAds(el){
    if(!hasClass(el, 'ad__main')) return true;
    var container = el.querySelector('.ad__container');
    if(!container.hasAttribute('data-ad-stopped')) return true;
    return container.getAttribute('data-ad-stopped') !== 'true';
}

export function createStickyArticleBody(article){
    var stickGroup = article.el.querySelector('.a-body' + CLS_STICK_GROUP);
    if(!stickGroup) return;
    var stickyWrappers = toArray(stickGroup.querySelectorAll(
        CLS_STICK_WRAPPER)).filter(filterStoppedAds);
    var stickyObstacles = toArray(stickGroup.querySelectorAll(
        CLS_STICK_OBSTACLE)).filter(filterStoppedAds);

    createStickyItems(stickGroup, stickyWrappers, stickyObstacles);
}

export function createStickyGallery(article){
    var stickGroup = article.el.querySelector(
        '.js-g-view-list' + CLS_STICK_GROUP);
    if(!stickGroup) return;
    var stickyWrappers = toArray(stickGroup.querySelectorAll(
        CLS_STICK_WRAPPER)).filter(filterStoppedAds);
    var stickyObstacles = toArray(stickGroup.querySelectorAll(
        CLS_STICK_OBSTACLE)).filter(filterStoppedAds);

    createStickyItems(stickGroup, stickyWrappers, stickyObstacles);
}

export function onArticleAdd(e) {
    var currentArticle = e.article;

    // Create sticky for article body if it exists
    createStickyArticleBody(currentArticle);

    // If gallery, create sticky if not from infinite scroll, otherwise, create
    // on expand event
    if(currentArticle.type === ARTICLE_TYPES.GALLERY){
        if(currentArticle.isInfinite){
            currentArticle.once('expand', function() {
                createStickyGallery(currentArticle);
                debouncedUpdateAll();
            });
        } else {
            createStickyGallery(currentArticle);
        }
    }

    debouncedUpdateAll();

}

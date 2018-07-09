'use strict';

import {
    addEvent,
    debounce,
    hasClass,
    getParent
} from '@cnbritain/merlin-www-js-utils/js/functions';
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
import MainNavigation from '@cnbritain/merlin-www-main-navigation';
import {
    toArray
} from '../utils';

var stickyScroller = null;

export function createStickGroup(el) {

    if (!hasClass(el, 'stick-group')) return;

    var group = new Group(el);
    var stickies = Stick.createStick(el.querySelectorAll('.stick-wrapper'));

    group.addChildren(stickies, {
        'sort': false
    });
    var navHeight = MainNavigation.el.offsetHeight;
    group.children.forEach(function(child) {
        child.offset.top = navHeight;
    });

    stickyScroller.addChild(group);
    stickyScroller.recalculate(true);
}

export default function init() {
    // If the page is a curated list and then dont want to display the latest,
    // we wont have a stick group so check before hand
    var stickGroups = document.querySelectorAll('.stick-group');
    if (stickGroups.length === 0) return;

    stickyScroller = new Scroll(window);
    toArray(stickGroups).map(createStickGroup);

    AdManager.on('render', onStickRender);
    AdManager.on('stop', onStickStop);
    addEvent(window, 'resize', debounce(stickyResize, 300));
    stickyResize();
}

export function onStickRender(e) {

    var parentGroup;
    var parentGroupIndex;

    if (hasClass(e.ad.el.parentNode.parentNode, 'stick-block')) {
        parentGroup = getParent(e.ad.el, '.stick-group');
        if (parentGroup) {
            parentGroupIndex = Manager.hasGroup(parentGroup, true);
            if (parentGroupIndex > -1) {
                var group = Manager.groups[parentGroupIndex];
                var obs = Obstacle.createObstacle(
                    [e.ad.el.parentNode.parentNode]);
                obs.forEach(function(o) {
                    o.recalculate();
                });
                group.addChildren(obs, {
                    'sort': true
                });
            }
        }
    }

    // Find group the ad is in (even if it isnt sticky as it may have pushed
    // things down) and recalc just that group
    parentGroup = getParent(e.ad.el, '.stick-group');
    if (parentGroup) {
        // Find the parent in the Manager
        parentGroupIndex = Manager.hasGroup(parentGroup, true);
        if (parentGroupIndex > -1) {
            Manager.groups[parentGroupIndex].recalculate(true);
            Manager.groups[parentGroupIndex].sortChildren();
        }

        // If we dont have a parent, recalc all the groups for the moment
    } else {
        Manager.groups.forEach(function(group) {
            group.recalculate(true);
            group.sortChildren();
        });
    }

    // Recalc the scroller as we are likely to be taller
    stickyScroller.recalculate();
    stickyScroller.update();
}
export function onStickStop(e) {

    // Check if the ad is a stick element
    var stickElement = getParent(e.ad.el, '.stick-wrapper');
    if (!stickElement) return;

    // Remove element from the group
    stickElement = Manager.hasStick(stickElement, true);
    if (stickElement === -1) return;
    stickElement = Manager.stickies[stickElement];
    if (stickElement.group === null) return;
    stickElement.group.removeChild(stickElement);
    stickyScroller.update();
}

export function stickyResize() {
    if (!stickyScroller.isPaused && window.innerWidth < 1024) {
        stickyScroller.children.forEach(function(group) {
            group.children.forEach(function(item) {
                if (item._setInitial) item._setInitial(true);
            });
        });
        stickyScroller.pause();
        return;
    }

    if (stickyScroller.isPaused && window.innerWidth >= 1024) {
        stickyScroller.children.forEach(function(group) {
            group.children.forEach(function(item) {
                if (item._setNeutral) item._setNeutral(true);
            });
        });
        stickyScroller.resume();
    }

    stickyScroller.recalculate(true);
    stickyScroller.update();
}
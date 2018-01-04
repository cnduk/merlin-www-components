'use strict';

import {
    addEvent,
    debounce,
    getParent
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    AdManager
} from '@cnbritain/merlin-www-ads';
import {
    Group,
    Manager,
    Scroll,
    Stick
} from '@cnbritain/merlin-www-js-sticky';
import MainNavigation from '@cnbritain/merlin-www-main-navigation/js/main-navigation';

var stickyScroller = null;

export default function init() {
    stickyScroller = new Scroll(window);
    createStickGroup(document.querySelector('.c-card-section--v-articles.stick-group'));

    AdManager.on('render', onStickRender);
    AdManager.on('stop', onStickStop);

    addEvent(window, 'resize', debounce(resize, 300));
    resize();
}

export function resize() {

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

export function createStickGroup(el) {
    if (!el) return;

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

export function onStickRender(e) {
    // Find group the ad is in (even if it isnt sticky as it may have pushed
    // things down) and recalc just that group
    var parentGroup = getParent(e.ad.el, '.stick-group');
    if (parentGroup) {
        // Find the parent in the Manager
        var parentGroupIndex = Manager.hasGroup(parentGroup, true);
        if (parentGroupIndex > -1) {
            Manager.groups[parentGroupIndex].recalculate(true);
        }

        // If we dont have a parent, recalc all the groups for the moment
    } else {
        Manager.groups.forEach(function(group) {
            group.recalculate(true);
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
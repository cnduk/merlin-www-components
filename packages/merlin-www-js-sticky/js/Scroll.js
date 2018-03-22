'use strict';

import EventEmitter from 'eventemitter2';
import Group from './Group';
import Manager from './Manager';
import Obstacle from './Obstacle';
import Stick from './Stick';

import {
    assign,
    getElementOffset,
    getScrollTop,
    inherit,
    throttle,
} from '@cnbritain/merlin-www-js-utils/js/functions';

function Scroll(el, _options) {
    var options = assign({}, _options);

    /**
     * @inheritance
     */
    EventEmitter.call(this);

    /**
     * @public
     */
    this.children = [];
    this.el = el;
    this.isPaused = false;
    this.offset = {
        'bottom': 0,
        'left': 0,
        'right': 0,
        'top': 0
    };
    this.position = {
        'left': 0,
        'top': 0
    };
    this.size = {
        'height': 0,
        'width': 0
    };

    /**
     * @private
     */
    this._eventHooks = {};
    this._lastScrollY = 0;

    /**
     * Bind a scroll event. Check if we are needing to throttle it or if we only
     * need to bind the event.
     */
    if (options.throttle !== undefined) {
        // Type check please
        if (typeof options.throttle !== 'number') {
            throw new TypeError('throttle must be of type number');
        }
        this._eventHooks.scroll = throttle(this.update,
            options.throttle, this);
    } else {
        this._eventHooks.scroll = this.update.bind(this);
    }
    this.el.addEventListener('scroll', this._eventHooks.scroll);

    /* Add the scroll item to the manager */
    Manager.addScroll(this);

}

Scroll.prototype = inherit(EventEmitter.prototype, {

    '_updateDown': function(group, scrollY) {
        // console.log('Down');

        var children = group.children;
        var i = -1;
        var length = children.length;
        var child = null;
        var nextChild = null;
        var nextChildTop = 0;
        var childTotalHeight = 0;

        while (++i < length) {
            child = children[i];

            if (isObstacle(child)) continue;

            nextChild = getNextChildInGroup(child.group, children, i + 1);

            if (child.state === Stick.STATE_NEUTRAL) {

                if (nextChild) {
                    nextChildTop = nextChild.position.top - nextChild.offset.top;
                    childTotalHeight = child.size.height + child.offset.top + child.offset.bottom;
                    if (nextChildTop <= scrollY + childTotalHeight) {
                        child._setAbsolute(nextChildTop - childTotalHeight);
                        continue;
                    }
                }

                if (child.group) {
                    childTotalHeight = child.size.height + child.offset.top + child.offset.bottom;
                    if (child.group.position.top + child.group.size.height <= scrollY + childTotalHeight) {
                        child._setAbsolute(child.group.position.top + child.group.size.height - childTotalHeight);
                        continue;
                    }
                }

                if (child.position.top - child.offset.top <= scrollY) {
                    child._setFixed();
                    continue;
                }

                child._setInitial();
                continue;
            }

            // Initial state needing to be fixed
            if (child.state === Stick.STATE_INITIAL) {
                if (child.position.top - child.offset.top <= scrollY) {
                    child._setFixed();
                    continue;
                }
            }

            // Fixed state about to hit the next child
            if (child.state === Stick.STATE_FIXED && nextChild) {
                nextChildTop = nextChild.position.top - nextChild.offset.top;
                childTotalHeight = child.size.height + child.offset.top + child.offset.bottom;
                if (nextChildTop <= scrollY + childTotalHeight) {
                    child._setAbsolute(nextChildTop - childTotalHeight);
                }
                continue;
            }

            // Fixed state about to hit the group bottom
            if (child.state === Stick.STATE_FIXED && child.group) {
                childTotalHeight = child.size.height + child.offset.top + child.offset.bottom;
                if (child.group.position.top + child.group.size.height <= scrollY + childTotalHeight) {
                    child._setAbsolute(child.group.position.top + child.group.size.height - childTotalHeight);
                    continue;
                }
            }

        }


    },

    '_updateNeutral': function(group, scrollY) {
        group.children.forEach(function(child) {
            if (child._setNeutral) child._setNeutral();
        });
        this._updateDown(group, scrollY);
    },

    '_updateUp': function(group, scrollY) {
        // console.log('Up');

        var children = group.children;
        var length = children.length;
        var child = null;
        var nextChild = null;
        var nextChildTop = 0;
        var childTotalHeight = 0;

        while (length--) {
            child = children[length];

            if (isObstacle(child)) continue;

            // Fixed state going to initial state
            if (child.state === Stick.STATE_FIXED) {
                if (child.position.top - child.offset.top > scrollY) {
                    child._setInitial();
                    continue;
                }
            }

            // Absolute child coming out of range of next child
            if (child.state === Stick.STATE_ABSOLUTE) {

                if (child.position.top - child.offset.top > scrollY) {
                    child._setInitial();
                    continue;
                }

                nextChild = getNextChildInGroup(child.group, children, length + 1);
                if (nextChild &&
                    (nextChild.state === Stick.STATE_INITIAL || isObstacle(nextChild))) {
                    nextChildTop = nextChild.position.top - nextChild.offset.top;
                    childTotalHeight = child.size.height + child.offset.top + child.offset.bottom;
                    if (nextChildTop > scrollY + childTotalHeight) {
                        child._setFixed();
                    }
                }

            }

            // Absolute child coming out of range of the bottom of the group
            if (child.state === Stick.STATE_ABSOLUTE && child.group && isLastInGroup(child, children)) {
                childTotalHeight = child.size.height + child.offset.top + child.offset.bottom;
                if (child.group.position.top + child.group.size.height > scrollY + childTotalHeight) {
                    child._setFixed();
                    continue;
                }
            }

        }

    },

    'addChild': function(item, _options) {
        if (!isGroup(item))
            throw new TypeError('item must be of type Group');
        if (this.hasChild(item)) return false;

        // Defaults
        var options = assign({
            'silent': false,
            'sort': true
        }, _options);

        // Check if the item already belongs to a group
        // applyStickToGroup( item, this );

        // Check if the item is already part of a scroller
        applyItemToScroll(item, this);

        this.children.push(item);
        if (!options.silent) this.emit('add', item);
        if (options.sort) this.sortChildren();
    },

    'addChildren': function(items, _options) {
        var options = assign({
            'silent': false,
            'sort': true
        }, _options);
        var sortOption = options.sort;
        options.sort = false;
        var i = -1;
        var length = items.length;
        while (++i < length) {
            this.addChild(items[i], options);
        }
        if (sortOption) this.sortChildren();
    },

    'constructor': Scroll,

    'hasChild': function(item, returnIndex) {
        if (!item) return false;
        if (!isGroup(item)) return false;
        var index = this.children.indexOf(item);
        if (returnIndex) return index;
        return index !== -1;
    },

    'insertChild': function(item, index, _options) {
        if (index < 0 || index > this.children.length - 1) return false;
        if (!isGroup(item)) throw new
        TypeError('item must be of type Group');
        if (this.hasChild(item)) return false;

        // Defaults
        var options = assign({
            'silent': false,
            'sort': true
        }, _options);

        // Check if the item already belongs to a group
        // applyStickToGroup( item, this );

        // Check if the item is already part of a scroller
        applyItemToScroll(item, this);

        this.children.splice(index, 0, item);
        if (!options.silent) this.emit('insert', item, index);
        if (options.sort) this.sortChildren();
    },

    'pause': function() {
        if (this.isPaused) return;
        this.isPaused = true;
        if (!this.silent) this.emit('pause');
    },

    'recalculate': function(includeChildren) {
        var bounds = getElementOffset(this.el);
        this.size.height = bounds.height;
        this.size.width = bounds.width;
        this.position.left = bounds.left;
        this.position.top = bounds.top;
        if (includeChildren) {
            this.children.forEach(function(child) {
                child.recalculate(includeChildren);
            });
        }
    },

    'removeChild': function(item, _options) {
        var index = -1;
        if ((index = this.hasChild(item, true)) === -1) return false;

        var options = assign({
            'silent': false,
        }, _options);

        item.scroll = null;

        this.children.splice(index, 1);
        if (!options.silent) this.emit('remove', item);
    },

    'resume': function() {
        if (!this.isPaused) return;
        this.isPaused = false;
        if (!this.silent) this.emit('resume');
    },

    'sortChildren': function(includeChildren) {
        if (this.children.length > 1) {
            this.children.sort(function(a, b) {
                return a.position.top - b.position.top;
            });
        }
        if (includeChildren) {
            this.children.forEach(function(group) {
                group.sortChildren(true);
            });
        }
        this.emit('sort', this.children);
    },

    'update': function() {
        // If its paused, dont update
        if (this.isPaused) return;

        var lastScrollY = this._lastScrollY;
        var scrollY = getScrollTop(this.el);
        var scrollDirection = getScrollDirection(scrollY, lastScrollY);
        this._lastScrollY = scrollY;

        var fn = null;
        if (scrollDirection === 'down') {
            fn = this._updateDown.bind(this);
        } else if (scrollDirection === 'up') {
            fn = this._updateUp.bind(this);
        } else {
            fn = this._updateNeutral.bind(this);
        }
        var screenRect = {
            'bottom': scrollY + this.size.height,
            'top': scrollY
        };
        var onScreenGroups = this.children.filter(isGroupOnScreen(screenRect));
        if (onScreenGroups.length === 0) {
            onScreenGroups = this.children;
        }
        onScreenGroups.forEach(function updateGroups(group) {
            fn(group, scrollY);
        });

        this.emit('update', scrollY, lastScrollY, scrollDirection);
    }

});


function applyItemToScroll(item, scroll) {
    if (item.scroll !== null) {
        item.scroll.removeChild(item);
    }
    item.scroll = scroll;
}

function isGroupOnScreen(screenRect) {
    return function isGroupOnScreen_inner(child) {
        return child.isOnScreen(screenRect);
    };
}

function getNextChildInGroup(group, children, start) {
    var i = start - 1;
    var length = children.length;
    while (++i < length) {
        if (children[i].group === group) return children[i];
    }
    return false;
}

function getScrollDirection(scrollY, lastScrollY) {
    if (scrollY > lastScrollY) return 'down';
    if (scrollY < lastScrollY) return 'up';
    return 'neutral';
}

function isLastInGroup(child, children) {
    var group = child.group;
    if (!group) return true;
    var i = -1;
    var length = children.length;
    var childIndex = -1;
    while (++i < length) {
        if (children[i] === child) {
            childIndex = i;
        } else if (children[i].group === group && childIndex !== -1) {
            return false;
        }
    }
    return true;
}

function isGroup(item) {
    return item instanceof Group;
}

function isObstacle(item) {
    return item instanceof Obstacle;
}

// function isStick( item ){
//     return item instanceof Stick;
// }


export default Scroll;
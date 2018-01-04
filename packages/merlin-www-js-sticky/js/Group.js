'use strict';

import EventEmitter from 'eventemitter2';
import Manager from './Manager';
import Obstacle from './Obstacle';
import Stick from './Stick';

import {
    assign,
    getElementOffset,
    inherit
} from '@cnbritain/merlin-www-js-utils/js/functions';

function Group(el){
    /**
     * @inheritance
     */
    EventEmitter.call( this );

    /**
     * @public
     */
    this.children = [];
    this.el = el;
    this.position = {
        'left': 0,
        'top': 0
    };
    this.scroll = null;
    this.size = {
        'height': 0,
        'width': 0
    };

    /* Add to manager so we can easily find duplicates */
    Manager.addGroup( this );

}

Group.prototype = inherit( EventEmitter.prototype, {

    'addChild': function( item, _options ){
        if( !isStick( item ) && !isObstacle( item ) ) throw new
            TypeError('item must be of type Stick');
        if( this.hasChild( item ) ) return false;

        // Defaults
        var options = assign( {
            'silent': false,
            'sort': true
        }, _options );

        // Check if the item already belongs to a group
        applyStickToGroup( item, this );

        this.children.push( item );
        if( !options.silent ) this.emit( 'add', item );
        if( options.sort ) this.sortChildren();
    },

    'addChildren': function( items, _options ){
        var options = assign( {
            'silent': false,
            'sort': true
        }, _options);
        var sortOption = options.sort;
        options.sort = false;
        var i = -1;
        var length = items.length;
        while( ++i < length ){
            this.addChild( items[ i ], options );
        }
        if( sortOption ) this.sortChildren();
    },

    'constructor': Group,

    'destroy': function(){
        this.el = null;
        this.children.length = 0;
        this.children = null;
        this.removeAllListeners();
        Manager.removeGroup( this );
    },


    'hasChild': function( item, returnIndex ){
        if( !item ) return false;
        if( !isStick( item ) && !isObstacle( item ) ) return false;
        var index = this.children.indexOf( item );
        if( returnIndex ) return index;
        return index !== -1;
    },

    'insertChild': function( item, index, _options ){
        if( index < 0 || index > this.children.length - 1 ) return false;
        if( !isStick( item ) && !isObstacle( item ) ) throw new
            TypeError('item must be of type Stick');
        if( this.hasChild( item ) ) return false;

        // Defaults
        var options = assign( {
            'silent': false,
            'sort': true
        }, _options );

        // Check if the item already belongs to a group
        applyStickToGroup( item, this );

        this.children.splice( index, 0, item );
        if( !options.silent ) this.emit( 'insert', item, index );
        if( options.sort ) this.sortChildren();
    },

    'isOnScreen': function( viewBounds ){
        if( viewBounds.top > this.position.top + this.size.height ) return false;
        if( viewBounds.bottom < this.position.top ) return false;
        return true;
    },

    'recalculate': function( includeChildren ){
        var bounds = getElementOffset( this.el );
        this.size.height = bounds.height;
        this.size.width = bounds.width;
        this.position.left = bounds.left;
        this.position.top = bounds.top;
        if( includeChildren ){
            this.children.forEach(recalculateItem);
        }
    },

    'removeChild': function( item, _options ){
        var index = -1;
        if( ( index = this.hasChild( item, true ) ) === -1 ) return false;

        var options = assign( {
            'silent': false,
        }, _options );

        item.group = null;
        this.children.splice( index, 1 );
        if( !options.silent ) this.emit( 'remove', item );
        return true;
    },

    'sortChildren': function(){
        if( this.children.length > 1 ){
            this.children.sort(function( a, b ){
                return a.position.top - b.position.top;
            });
        }
        this.emit( 'sort', this.children );
    }

} );

function applyStickToGroup( item, group ){
    if( item.group !== null ){
        item.group.removeChild( item );
    }
    item.group = group;
}

function isObstacle( item ){
    return item instanceof Obstacle;
}

function isStick( item ){
    return item instanceof Stick;
}

function recalculateItem( item ){
    return item.recalculate();
}

export default Group;
"use strict";

import EventEmitter from 'eventemitter2';
import Group from './Group';
import Manager from './Manager';

import {
    assign,
    getElementOffset,
    inherit
} from '@cnbritain/merlin-www-js-utils/js/functions';

var id = 0;

function Item( el, _options ){

    var options = assign( {
        "group": null
    }, _options );

    /**
     * @inheritance
     */
    EventEmitter.call( this );

    /**
     * @public
     */
    this.el = el;
    this.id = id++;
    this.group = options.group;
    this.offset = {
        "bottom": 0,
        "left": 0,
        "right": 0,
        "top": 0
    };
    this.position = {
        "left": 0,
        "top": 0
    };
    this.size = {
        "height": 0,
        "width": 0
    };

    /**
     * @private
     */

    // Get the item group
    var groupElement = getElement( this.group );
    var foundIndex = false;
    if( groupElement ){
        if( ( foundIndex = Manager.hasGroup( groupElement, true ) ) !== -1 ){
            this.group = Manager.groups[ foundIndex ];
        } else {
            this.group = new Group( this.group );
            this.group.recalculate();
        }
    }
    foundIndex = null;
    groupElement = null;

}

Item.prototype = inherit(EventEmitter.prototype, {

    "constructor": Item,

    "destroy": function(){
        this.removeAllListeners();
        this.el = null;
        this.group = null;
        this.offset = null;
        this.position = null;
        this.size = null;
    },

    "recalculate": function(){
        var bounds = getElementOffset( this.el );
        this.size.height = bounds.height;
        this.size.width = bounds.width;
        this.position.left = bounds.left;
        this.position.top = bounds.top;
    }

} );

function getElement( thing ){
    if( typeof thing === "string" ) return document.querySelector( thing );
    if( thing instanceof HTMLElement ) return thing;
    return;
}

export default Item;
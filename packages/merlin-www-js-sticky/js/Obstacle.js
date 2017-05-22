"use strict";

import Item from './Item';
import Manager from './Manager';

import {
    assign,
    inherit
} from '@cnbritain/merlin-www-js-utils/js/functions';

function Obstacle( el, _options ){

    /**
     * @inheritance
     */
    Item.call( this, el, _options );

    /* Add the scroll item to the manager */
    Manager.addObstacle( this );

}

Obstacle.prototype = inherit(Item.prototype, {

    "constructor": Obstacle,

    "destroy": function(){
        Manager.removeObstacle( this );
        Item.prototype.destroy.call( this );
    }

} );

Obstacle.createObstacle = function( base, _options ){
    var els = null;
    if( typeof base === "string" ){
        els = toArray( document.querySelectorAll( base ) );
    } else {
        els = toArray( base );
    }

    if( els.length === 0 ) return els;

    var options = assign( {}, _options );
    var length = els.length;
    while( length-- ){
        if( Manager.hasObstacle( els[ length ] ) ) continue;
        els[ length ] = new Obstacle( els[ length ], options );
    }
    els = els.filter(function(el){ return el instanceof Obstacle; });

    return els;
};

function toArray(collection){
    var len = collection.length;
    var o = new Array(len);
    while(len--) o[len] = collection[len];
    return o;
}

export default Obstacle;
'use strict';

import Item from './Item';
import Manager from './Manager';

import {
    assign,
    addClass,
    inherit,
    removeClass
} from '@cnbritain/merlin-www-js-utils/js/functions';

function Stick( el, _options ){

    /**
     * @inheritance
     */
    Item.call( this, el, _options );

    /**
     * @public
     */
    this.state = Stick.STATE_INITIAL;

    /**
     * @private
     */
    this._elStick = this.el.querySelector( '.stick-element' );
    this._elWrapper = this.el;
    this._absoluteTop = 0;

    // Throw error if we cant find a stick element
    if( !this._elStick ){
        throw new TypeError('element does not contain a .stick-element');
    }

    /* Add the scroll item to the manager */
    Manager.addStick( this );

}

Stick.prototype = inherit(Item.prototype, {

    '_setAbsolute': function( top, silent ){
        if( this.state === Stick.STATE_ABSOLUTE ) return;
        this.state = Stick.STATE_ABSOLUTE;
        this._absoluteTop = top;

        swapClass( this._elStick, 'stick-element--fixed',
            'stick-element--absolute' );
        swapClass( this._elWrapper, 'stick-wrapper--fixed',
            'stick-wrapper--absolute' );

        setStyles( this._elWrapper, {
            'height': this.size.height + 'px'
        });
        setStyles( this._elStick, {
            'marginTop': '',
            'position': 'relative',
            'top': (this._absoluteTop - this.position.top + this.offset.top) + 'px'
        });

        if( !silent ) this.emit( 'statechange', this.state );
    },

    '_setFixed': function( silent ){
        if( this.state === Stick.STATE_FIXED ) return;
        this.state = Stick.STATE_FIXED;

        swapClass( this._elStick, 'stick-element--absolute',
            'stick-element--fixed' );
        swapClass( this._elWrapper, 'stick-wrapper--absolute',
            'stick-wrapper--fixed' );

        setStyles( this._elWrapper, {
            'height': this.size.height + 'px'
        });
        setStyles( this._elStick, {
            'marginTop': -(this.position.top - this.offset.top) + 'px',
            'position': 'fixed',
            'top': ''
        });

        if( !silent ) this.emit( 'statechange', this.state );
    },

    '_setInitial': function( silent ){
        if( this.state === Stick.STATE_INITIAL ) return;
        this.state = Stick.STATE_INITIAL;

        removeClass( this._elStick, 'stick-element--absolute' );
        removeClass( this._elStick, 'stick-element--fixed' );
        removeClass( this._elWrapper, 'stick-wrapper--absolute' );
        removeClass( this._elWrapper, 'stick-wrapper--fixed' );

        setStyles( this._elWrapper, {
            'height': ''
        });
        setStyles( this._elStick, {
            'marginTop': '',
            'position': '',
            'top': ''
        });

        if( !silent ) this.emit( 'statechange', this.state );
    },

    '_setNeutral': function( silent ){
        if( this.state === Stick.STATE_NEUTRAL ) return;
        this.state = Stick.STATE_NEUTRAL;
        if( !silent ) this.emit( 'statechange', this.state );
    },

    'constructor': Item,

    'destroy': function(){
        this.state = null;
        this._elStick = null;
        this._elWrapper = null;
        this._absoluteTop = 0;
        Manager.removeStick( this );
        Item.prototype.destroy.call( this );
    },

    'recalculate': function(){
        var state = this.state;
        this._setInitial( true );

        Item.prototype.recalculate.call( this );

        switch( state ){
        case Stick.STATE_FIXED:
            this._setFixed( true );
            break;
        case Stick.STATE_ABSOLUTE:
            this._setAbsolute( this._absoluteTop, true );
            break;
        }
    },

    'updateOffset': function( offset ){
        this.offset = assign({}, this.offset, {
            'bottom': 0,
            'left': 0,
            'right': 0,
            'top': 0
        }, offset);

        switch( this.state ){
        case Stick.STATE_FIXED:
            setStyles( this._elStick, {
                'marginTop': -(this.position.top - this.offset.top) + 'px'
            });
            break;
        case Stick.STATE_ABSOLUTE:
            setStyles( this._elStick, {
                'top': (this._absoluteTop - this.position.top + this.offset.top) + 'px'
            });
            break;
        }
    }

} );

Stick.createStick = function( base, _options ){
    var els = null;
    if( typeof base === 'string' ){
        els = toArray( document.querySelectorAll( base ) );
    } else if( isArray( base ) ){
        els = base.slice(0);
    } else if( base instanceof HTMLElement ){
        els = [ base ];
    } else {
        els = toArray( base );
    }

    if( els.length === 0 ) return els;

    var options = assign( {}, _options );
    var length = els.length;
    while( length-- ){
        if( Manager.hasStick( els[ length ] ) ) continue;
        els[ length ] = new Stick( els[ length ], options );
    }
    els = els.filter(function(el){ return el instanceof Stick; });

    return els;
};

Stick.getStateTitleFromIndex = function( index ){
    switch( index ){
    case 0:
        return 'Initial';
    case 1:
        return 'Fixed';
    case 2:
        return 'Absolute';
    case 3:
        return 'Neutral';
    default:
        return 'Unknown';
    }
};

Stick.STATE_INITIAL = 0;
Stick.STATE_FIXED = 1;
Stick.STATE_ABSOLUTE = 2;
Stick.STATE_NEUTRAL = 3;

function isArray(thing){
    return Object.prototype.toString.call(thing) === '[object Array]';
}

function setStyles( el, styles ){
    for(var key in styles){
        if(!styles.hasOwnProperty(key)) continue;
        assignStyle(styles[key], key);
    }
    function assignStyle( value, key ){
        el.style[ key ] = value;
    }
}

function swapClass( el, classA, classB ){
    removeClass( el, classA );
    addClass( el, classB );
}

function toArray(collection){
    var len = collection.length;
    var o = new Array(len);
    while(len--) o[len] = collection[len];
    return o;
}

export default Stick;
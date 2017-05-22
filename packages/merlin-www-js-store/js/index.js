'use strict';

/**
 * @module store
 */

import store from 'store';

var exportedStore = store;
if( !store.enabled ){
    /**
     * Create a real basic fallback so we just store information in an object.
     * This mimics the same methods as store.
     * @ignore
     */
    var exportedStoreData = {};
    exportedStore = {

        /**
         * Clears all the data
         * @static
         * @function clear
         */
        'clear': function(){
            exportedStoreData = {};
        },

        /**
         * Loops over each item stored
         * @static
         * @function forEach
         * @param  {Function} callback
         */
        'forEach': function( callback ){
            for( var key in exportedStoreData ){
                if( exportedStoreData.hasOwnProperty( key ) ){
                    callback( key, this.get( key ) );
                }
            }
        },

        /**
         * Gets the value
         * @static
         * @function get
         * @param  {String} key
         * @param  {*} defaultVal Default value if key is not found
         * @return {*}
         */
        'get': function( key, defaultVal ){
            var val = store.deserialize(exportedStoreData[key]);
            return (val === undefined ? defaultVal : val);
        },

        /**
         * Gets all the data
         * @function getAll
         * @static
         * @return {Object}
         */
        'getAll': function(){
            var ret = {};
            for( var key in exportedStoreData ){
                if( exportedStoreData.hasOwnProperty( key ) ){
                    ret[ key ] = store.deserialize( exportedStoreData[ key ] );
                }
            }
            return ret;
        },

        /**
         * Removes an item from the data
         * @function remove
         * @static
         * @param  {String} key
         */
        'remove': function( key ){
            exportedStoreData[ key ] = null;
            delete exportedStoreData[ key ];
        },

        /**
         * Sets a value
         * @function set
         * @static
         * @param  {String} key
         * @param  {*} val
         * @return {*}     The value
         */
        'set': function( key, val ){
            if (val === undefined) {
                return this.remove( key );
            }
            exportedStoreData[key] = store.serialize(val);
            return val;
        }

    };
}

export default exportedStore;

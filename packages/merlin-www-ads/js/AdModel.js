'use strict';

import {
    cloneObjectDeep,
    hasOwnProperty
} from '@cnbritain/merlin-www-js-utils/js/functions';

/**
 * Creates an AdModel
 * @class AdModel
 * @param {Object} defaults Default values that will be set
 */
function AdModel(defaults){
    if(!defaults){
        throw new TypeError('defaults must be set');
    }

    /**
     * Model properties
     * @private
     * @type {Object}
     */
    this._properties = cloneObjectDeep(defaults);
}

AdModel.prototype = {

    /**
     * Clears all the properties
     * @public
     * @memberof! AdModel.prototype
     */
    'clear': function(){
        var key = '';
        for(key in this._properties){
            if(!hasOwnProperty(this._properties, key)) continue;
            this._properties[key] = null;
        }
        this._properties = {};
    },

    'constructor': AdModel,

    /**
     * Gets the property or throws an error if the key doesn't exist
     * @public
     * @memberof! AdModel.prototype
     * @param  {String} key
     * @return {*}
     */
    'get': function get(key){
        if(arguments.length === 0) return cloneObjectDeep(this._properties);
        hasProperty(this, key);
        return this._properties[key];
    },

    /**
     * Sets the property or throws an error if the key doesn't exist
     * @public
     * @memberof! AdModel.prototype
     * @param {Object|String} key
     * @param {*} value
     */
    'set': function set(key, value){
        if(typeof key !== 'string'){
            for(var k in key){
                if(hasOwnProperty(key, k)){
                    this.set(k, key[k]);
                }
            }
            return;
        }
        hasProperty(this, key);
        this._properties[key] = value;
    }

};

export default AdModel;

/**
 * Checks if the model's properties contains a specified key. If there is no
 * key set, then it will throw a reference error.
 * @param  {AdModel}  model The ad model to check against
 * @param  {String}  key   The key to check the properties for
 * @return {Boolean}
 */
function hasProperty(model, key){
    if( !model._properties.hasOwnProperty(key) ){
        throw new ReferenceError(key + ' is not a valid property');
    }
    return true;
}

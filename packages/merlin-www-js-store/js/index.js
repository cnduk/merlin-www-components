'use strict';


function serialize(obj){
    return JSON.stringify(obj);
}

function deserialize(value, defaultValue){
    if(!value) return defaultValue;

    var newValue = null;
    try {
        newValue = JSON.parse(value);
    } catch(e){
        newValue = defaultValue;
    }

    if(newValue !== undefined) return newValue;
    return defaultValue;
}

var exportedStoreData = {};
var exportedStore = {

    /**
     * Clears all the data
     * @static
     * @function clear
     */
    'clear': function() {
        exportedStoreData = {};
    },

    /**
     * Loops over each item stored
     * @static
     * @function forEach
     * @param  {Function} callback
     */
    'forEach': function(callback) {
        for (var key in exportedStoreData) {
            if (exportedStoreData.hasOwnProperty(key)) {
                callback(key, this.get(key));
            }
        }
    },

    /**
     * Gets the value
     * @static
     * @function get
     * @param  {String} key
     * @param  {*} defaultValue Default value if key is not found
     * @return {*}
     */
    'get': function(key, defaultValue) {
        return deserialize(exportedStoreData[key], defaultValue);
    },

    /**
     * Gets all the data
     * @function getAll
     * @static
     * @return {Object}
     */
    'getAll': function() {
        var ret = {};
        for (var key in exportedStoreData) {
            if (exportedStoreData.hasOwnProperty(key)) {
                ret[key] = deserialize(exportedStoreData[key]);
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
    'remove': function(key) {
        exportedStoreData[key] = null;
        delete exportedStoreData[key];
    },

    /**
     * Sets a value
     * @function set
     * @static
     * @param  {String} key
     * @param  {*} val
     * @return {*}     The value
     */
    'set': function(key, val) {
        if (val === undefined) {
            return this.remove(key);
        }
        exportedStoreData[key] = serialize(val);
        return val;
    }

};

export default exportedStore;
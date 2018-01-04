'use strict';

import Combobox from '@cnbritain/merlin-www-js-combobox';
import {
    isAndroid,
    isIOS
} from '@cnbritain/merlin-www-js-utils/js/detect';
import {
    addEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';

function onChangeHandler() {
    //TODO: Find out if there's a nicer way of doing this in the current codes
    if (this.value) {
        window.location.href = this.value;
    }
}

export default {
    'init': function() {
        var comboboxElements = toArray(document.querySelectorAll('select'));
        var length = comboboxElements.length;
        var comboboxes = new Array(length);

        comboboxElements.forEach(function(el, index) {
            var comboSettings = {
                'placeholder': el.getAttribute('data-placeholder') || false,
                'searchable': false
            };

            if (!(isIOS || isAndroid) &&
                el.hasAttribute('data-searchable') &&
                el.getAttribute('data-searchable') === 'true') {
                comboSettings.searchable = true;
            }

            addEvent(el, 'change', onChangeHandler);

            comboboxes[index] = new Combobox(el, comboSettings);
        });
    }
};

function toArray(collection) {
    var len = collection.length;
    var arr = new Array(len);
    var i = -1;
    while (++i < len) arr[i] = collection[i];
    return arr;
}
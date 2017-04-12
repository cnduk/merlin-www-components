'use strict';

import EventEmitter from 'eventemitter2';
import { isIOS } from '@cnbritain/merlin-frontend-utils-js/js/detect';
import {
    addClass,
    addEvent,
    assign,
    fireEvent,
    hasClass,
    inherit,
    isDefined,
    removeClass,
    removeEvent
} from '@cnbritain/merlin-frontend-utils-js/js/functions';

var KEYBOARD_CODES = {
    'ALT': 18,
    'ARROW_DOWN': 40,
    'ARROW_LEFT': 37,
    'ARROW_RIGHT': 39,
    'ARROW_UP': 38,
    'BACKSPACE': 8,
    'CTRL': 17,
    'DEL': 46,
    'END': 35,
    'ENTER': 13,
    'ESC': 27,
    'HOME': 36,
    'META': 91,
    'PAGEDOWN': 34,
    'PAGEUP': 33,
    'SHIFT': 16,
    'SPACE': 32,
    'TAB': 9
};

function Combobox(el, _options) {
    EventEmitter.call(this);

    var options = assign({
        'placeholder': false,
        'searchable': false,
        'darkMode': false
    }, _options);

    this._button = null;
    this._container = null;
    this._hooks = {};
    this._input = null;
    this._list = null;
    this._options = null;
    this._optionValues = null;
    this._searchable = options.searchable;
    this._selectedElement = null;
    this._tmrCloseList = null;

    this.id = ++Combobox.UUID;
    this.el = el;
    this.selectedIndex = -1;
    this.isOpen = false;
    this.value = null;

    this._render(options);
    this._bindEvents();
    this.select(this.el.selectedIndex, true, true);
    if (options.searchable && options.placeholder !== false) {
        this._input.value = '';
    }
}

Combobox.prototype = inherit(EventEmitter.prototype, {
    'constructor': Combobox,

    '_bindEvents': function() {
        if (this._searchable || !isIOS) {
            this._hooks.buttonMouseDown = this._onButtonMouseDown.bind(this);
            this._hooks.comboBlur = this._onComboBlur.bind(this);
            this._hooks.comboFocus = this._onComboFocus.bind(this);
            this._hooks.inputInput = this._onComboInput.bind(this);
            this._hooks.inputKeyDown = this._onComboKeyDown.bind(this);
            this._hooks.inputKeyPress = this._onComboKeyPress.bind(this);
            this._hooks.inputKeyUp = this._onComboKeyUp.bind(this);
            this._hooks.optionClick = this._onOptionClick.bind(this);

            addEvent(this._button, 'mousedown', this._hooks.buttonMouseDown);

            addEvent(this._input, 'blur', this._hooks.comboBlur);
            addEvent(this._input, 'input', this._hooks.inputInput);
            addEvent(this._input, 'keydown', this._hooks.inputKeyDown);
            addEvent(this._input, 'keypress', this._hooks.inputKeyPress);
            addEvent(this._input, 'keyup', this._hooks.inputKeyUp);
            addEvent(this._input, 'mousedown', this._hooks.buttonMouseDown);

            addEvent(this._list, 'click', this._hooks.optionClick);
            addEvent(this._list, 'focus', this._hooks.comboFocus);
        } else {
            this._hooks.buttonMouseDownIOS = this._onButtonMouseDownIOS.bind(this);
            this._hooks.comboBlurIOS = this._onComboBlurIOS.bind(this);
            this._hooks.comboChangeIOS = this._onComboChangeIOS.bind(this);

            addEvent(this._container, 'click', this._hooks.buttonMouseDownIOS);

            addEvent(this.el, 'blur', this._hooks.comboBlurIOS);
            addEvent(this.el, 'change', this._hooks.comboChangeIOS);
        }
    },

    '_onButtonMouseDown': function(e) {
        this.toggleList();
        this._input.focus();

        return stopEvent(e);
    },

    '_onButtonMouseDownIOS': function() {
        disableZoom();
        this.el.focus();
    },

    '_onComboBlur': function(e) {
        /**
         * We need to use a timer for this otherwise we close the list before
         * an item has been clicked preventing a select.
         */
        if (this.isOpen) {
            this._tmrCloseList = setTimeout(function() {
                this._tmrCloseList = null;
                this.closeList();
            }.bind(this),50);
        }

        return stopEvent(e);
    },

    '_onComboBlurIOS': function() {
        enableZoom();
    },

    '_onComboChangeIOS': function() {
        var index = this.el.selectedIndex;
        var option = this._optionValues[ index ];
        this.selectedIndex = index;
        // Update our label
        this._input.value = option.label;
        // Update our value
        this.value = option.value || option.label;
    },

    '_onComboFocus': function(e) {
        clearTimeout(this._tmrCloseList);
        this._input.focus();

        return stopEvent(e);
    },

    '_onComboInput': function() {
        fireEvent(this.el, 'input');
    },

    '_onComboKeyDown': function(e) {
        var currentSelectedIndex = this._selectedElement.getAttribute('data-index');
        var nextSelectedIndex = null;

        switch(e.keyCode) {

            case KEYBOARD_CODES.TAB:
                this.select(currentSelectedIndex);
                if (this.isOpen) { this.closeList(); }
                return;

            case KEYBOARD_CODES.ESC:
                this._input.value = this._optionValues[ this.selectedIndex ].label;
                this._input.select();
                if (this.isOpen) { this.closeList(); }
                return stopEvent(e);

            case KEYBOARD_CODES.ENTER:
                if (e.shiftKey || e.altKey || e.ctrlKey) return;
                if (!this.isOpen) {
                    this.openList();
                } else {
                    this.select(currentSelectedIndex);
                    this.closeList();
                }
                return stopEvent(e);

            case KEYBOARD_CODES.ARROW_UP:
                if (e.shiftKey || e.ctrlKey) return;
                if (e.altKey) {
                    if (this.isOpen) this.select(currentSelectedIndex);
                    this.toggleList();
                } else {
                    currentSelectedIndex = indexOf(this._options,
                        this._selectedElement);
                    nextSelectedIndex = currentSelectedIndex - 1;

                    if (nextSelectedIndex < 0) return;

                    unselectOption(this._selectedElement);
                    this._selectedElement = this._options[ nextSelectedIndex ];
                    addClass(this._selectedElement, 'cbo__option--selected');
                    setScrollTop(this._list, this._selectedElement);
                    this._input.value = (this._optionValues[
                        this._selectedElement.getAttribute('data-index') ].label);
                    this._input.select();

                }
                return stopEvent(e);

            case KEYBOARD_CODES.ARROW_DOWN:
                if (e.shiftKey || e.ctrlKey) return;
                if (e.altKey) {
                    if (this.isOpen) this.select(currentSelectedIndex);
                    this.toggleList();
                } else {
                    currentSelectedIndex = indexOf(this._options,
                        this._selectedElement);
                    nextSelectedIndex = currentSelectedIndex + 1;

                    if (nextSelectedIndex >= this._options.length) return;

                    unselectOption(this._selectedElement);
                    this._selectedElement = this._options[ nextSelectedIndex ];
                    addClass(this._selectedElement, 'cbo__option--selected');
                    setScrollTop(this._list, this._selectedElement);
                    this._input.value = (this._optionValues[
                        this._selectedElement.getAttribute('data-index') ].label);
                    this._input.select();
                }
            return stopEvent(e);
        }
    },

    '_onComboKeyPress': function(e) {
        switch(e.keyCode) {
            case KEYBOARD_CODES.ARROW_DOWN:
            case KEYBOARD_CODES.ARROW_UP:
            case KEYBOARD_CODES.ENTER:
                return stopEvent(e);
        }

        return true;
    },

    '_onComboKeyUp': function(e) {
        switch(e.keyCode) {
            case KEYBOARD_CODES.ALT:
            case KEYBOARD_CODES.ARROW_DOWN:
            case KEYBOARD_CODES.ARROW_LEFT:
            case KEYBOARD_CODES.ARROW_RIGHT:
            case KEYBOARD_CODES.ARROW_UP:
            case KEYBOARD_CODES.CTRL:
            case KEYBOARD_CODES.DEL:
            case KEYBOARD_CODES.END:
            case KEYBOARD_CODES.ENTER:
            case KEYBOARD_CODES.ESC:
            case KEYBOARD_CODES.HOME:
            case KEYBOARD_CODES.META:
            case KEYBOARD_CODES.SHIFT:
            case KEYBOARD_CODES.TAB:
                return true;
        }

        if (e.ctrlKey || e.metaKey) return true;

        var inputValue = this._input.value;
        var searchRegEx = new RegExp('^' + inputValue, 'i');
        var optionValue = null;

        // Update the options based on the search criteria
        this._options = this._list.children;
        toArray(this._options).forEach(function(option){
            removeClass(option, 'cbo--hidden');
        });

        if (inputValue.length === 0) {
            if (this.isOpen) this._list.scrollTop = 0;
        } else {
            this._options = toArray(this._options).filter(function(option, index) {
                optionValue = this._optionValues[ index ];
                if (!optionValue.disabled && searchRegEx.test(optionValue.label)) {
                    return true;
                }
                if (!hasClass(option, 'cbo--hidden')) {
                    addClass(option, 'cbo--hidden');
                }
                return false;
            }.bind(this));
            optionValue = null;
        }

        if (this._options.length > 0) {
            /**
             * This stuff will autocomplete fill the textbox and select the
             * remaining characters. We have turned this off as it was creating
             * issues if you typed at different speeds.
             */
            // var firstOption = this._optionValues[
            //     this._options[0].getAttribute('data-index')
            // ];
            // var firstValue = firstOption.label;
            // var selectStart = inputValue.length;
            // var selectEnd = firstValue.length;
            // if (e.keyCode !== KEYBOARD_CODES.BACKSPACE) {
            //     this._input.value = firstValue;
            // }
            // selectText(this._input, selectStart, selectEnd);
            unselectOption(this._selectedElement);
            this._selectedElement = this._options[0];
            addClass(this._selectedElement, 'cbo__option--selected');
        }

        if (!this.isOpen) this.openList();

        return stopEvent(e);
    },

    '_onOptionClick': function(e) {
        if (e.target.tagName === 'LI') {
            this.select(getElementIndex(e.target));
            this._input.focus();
            this.closeList();

            return stopEvent(e);
        }
    },

    '_render': function(options) {
        var hasPlaceholder = options.placeholder !== false;
        var isSearchable = options.searchable;
        var darkMode = options.darkMode;

        // Get the combobox values
        this._optionValues = getOptions(this.el);

        // Hide the combobox
        this.el.style.display = 'none';

        // Render our stuff
        var container = createElement('div', {
            'cls': darkMode ? 'cbo cbo--dark' : 'cbo',
            'html': isSearchable ? '<svg xmlns="http://www.w3.org/2000/svg" class="cbo__search" viewBox="0 0 10 10"><path d="M.7 3.9A3.22 3.22 0 0 1 3.9.7 3.14 3.14 0 0 1 7 3.9 3.08 3.08 0 0 1 3.8 7 3.12 3.12 0 0 1 .7 3.9M10 9.3L6.9 6.2a3.57 3.57 0 0 0 .8-2.3A3.9 3.9 0 0 0 3.8 0 3.82 3.82 0 0 0 0 3.9a3.8 3.8 0 0 0 3.8 3.8 3.57 3.57 0 0 0 2.3-.8L9.2 10z"/></svg>' : ''
        });

        var inputAttrs = {
            'aria-autocomplete': 'inline',
            'aria-labelledby': '',
            'aria-owns': 'cbo-list-' + this.id,
            'role': 'combobox',
            'tabindex': '0',
            'type': 'text'
        };
        if (!isSearchable) {
            inputAttrs['aria-readonly'] = true;
            inputAttrs.readonly = true;
        }
        if (hasPlaceholder) {
            inputAttrs.placeholder = options.placeholder;
        }
        this._input = createElement('input', {
            'attrs': inputAttrs,
            'cls': 'cbo__input'
        });
        var label = createElement('div', {
            'attrs': {
                'id': 'cbo-button-label-' + this.id
            },
            'cls': 'cbo--hidden',
            'html': 'Open list of designers'
        });
        this._button = createElement('button', {
            'attrs': {
                'aria-controls': 'cbo-list-' + this.id,
                'aria-labelledby': 'cbo-button-label-' + this.id,
                'tabindex': '-1'
            },
            'cls': 'cbo__button',
            'html': '<svg width=\'9px\' height=\'7px\'><polygon fill=\'#9C9B9B\' points=\'6,0 2.6,0 0,0 4.3,6.8 8.6,0 \'/><g><polygon fill=\'none\' stroke=\'#9C9B9B\' stroke-miterlimit=\'10\' points=\'2.6,0 0,0 4.3,6.8 8.6,0 6,0\'/></g></svg>'
        });

        if (isSearchable || !isIOS) {
            this._list = createElement('ul', {
                'attrs': {
                    'aria-expanded': 'false',
                    'id': 'cbo-list-' + this.id,
                    'role': 'listbox',
                    'tabindex': '-1'
                },
                'cls': 'cbo__options'
            });
            append(this._list, createListItems(this._optionValues));
            this._options = this._list.children;

        } else {
            this.el.style.display = '';
            this.el.style.position = 'absolute';
            this.el.style.left = '-100em';
            this.el.style.top = '-100em';
        }

        append(container, this._input);
        append(container, label);
        append(container, this._button);
        if (isSearchable || !isIOS) {
            append(container, this._list);
        }
        append(this.el.parentNode, container);

        this._container = container;
    },

    '_unbindEvents': function() {
        if (this._searchable || !isIOS) {
            this._hooks.buttonMouseDown = null;
            this._hooks.comboBlur = null;
            this._hooks.comboFocus = null;
            this._hooks.inputInput = null;
            this._hooks.inputKeyDown = null;
            this._hooks.inputKeyPress = null;
            this._hooks.inputKeyUp = null;
            this._hooks.optionClick = null;

            removeEvent(this._button, 'mousedown', this._hooks.buttonMouseDown);

            removeEvent(this._input, 'blur', this._hooks.comboBlur);
            removeEvent(this._input, 'input', this._hooks.inputInput);
            removeEvent(this._input, 'keydown', this._hooks.inputKeyDown);
            removeEvent(this._input, 'keypress', this._hooks.inputKeyPress);
            removeEvent(this._input, 'keyup', this._hooks.inputKeyUp);
            removeEvent(this._input, 'mousedown', this._hooks.buttonMouseDown);

            removeEvent(this._list, 'click', this._hooks.optionClick);
            removeEvent(this._list, 'focus', this._hooks.comboFocus);
        } else {
            this._hooks.buttonMouseDownIOS = null;
            this._hooks.comboBlurIOS = null;
            this._hooks.comboChangeIOS = null;

            removeEvent(this._container, 'click', this._hooks.buttonMouseDownIOS);

            removeEvent(this.el, 'blur', this._hooks.comboBlurIOS);
            removeEvent(this.el, 'change', this._hooks.comboChangeIOS);
        }
    },

    'closeList': function() {
        this.isOpen = false;

        this._list.style.display = '';
        this._list.setAttribute('aria-expanded', 'false');

        this.emit('closeList');
    },

    'destroy': function() {
        this._unbindEvents();

        // Remove element
        this._container.parentNode.removeChild(this._container);

        this._button = null;
        this._container = null;
        this._hooks = null;
        this._input = null;
        this._list = null;
        this._options = null;
        this._optionValues = null;
        this._selectedElement = null;
        this._tmrCloseList = null;

        // Show combobox
        this.el.style.display = '';
        this.el = null;
    },

    'openList': function() {
        this.isOpen = true;

        this._list.style.display = 'block';
        this._list.setAttribute('aria-expanded', 'true');
        setScrollTop(this._list, this._selectedElement);

        this.emit('openList');
    },

    'select': function(index, silent, force) {
        if (this.selectedIndex === index ) return;
        if (index < 0 || index >= this._optionValues.length) return;

        var option = this._optionValues[ index ];
        if (!force && option.disabled) return;
        this.selectedIndex = index;

        if (this._searchable || !isIOS) {
            unselectOption(this._selectedElement);
            this._selectedElement = this._list.children[ index ];
            addClass(this._selectedElement, 'cbo__option--selected');
        }

        // Update the combobox
        this.el.selectedIndex = index;

        // Update our label
        this._input.value = option.label;

        // Update our value
        this.value = option.value || option.label;

        if (!silent) {
            fireEvent(this.el, 'change');
        }
    },

    'toggleList': function() {
        if (this.isOpen) {
            this.closeList();
        } else {
            this.openList();
        }
    }
});

Combobox.UUID = -1;

function append(parent, child) {
    parent.appendChild(child);
}

function createElement(type, options) {
    if (!options) return document.createElement(type);
    var container = document.createElement(type);
    if (options.cls !== undefined) container.className = options.cls;
    if (options.attrs !== undefined) {
        for(var key in options.attrs) {
            if (options.attrs.hasOwnProperty(key)) {
                container.setAttribute(key, options.attrs[ key ]);
            }
        }
    }
    if (options.html !== undefined) container.innerHTML = options.html;
    return container;
}

function createListItems(optionValues) {
    var fragment = document.createDocumentFragment();
    var i = -1;
    var length = optionValues.length;
    var cls = '';
    var attrs = {};
    while(++i < length) {
        cls = 'cbo__option';
        attrs = {
            'data-index': i,
            'role': 'option'
        };
        if (isDefined(optionValues[ i ].value)) {
            attrs.value = optionValues[ i ].value;
        }
        if (optionValues[ i ].disabled) {
            cls += ' cbo__option--disabled';
        }
        append(fragment, createElement('li', {
            'attrs': attrs,
            'cls': cls,
            'html': optionValues[ i ].label
        }));
    }
    return fragment;
}

function disableZoom() {
    var metaViewport = document.querySelector('meta[name=viewport]');
    metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
}

function enableZoom() {
    var metaViewport = document.querySelector('meta[name=viewport]');
    metaViewport.setAttribute('content', 'width=device-width, initial-scale=1');
}

function getElementIndex(el) {
    var children = el.parentNode.children;
    var length = children.length;
    while(length--) {
        if (children[ length ] === el) return length;
    }
    return -1;
}

function getOptions(combobox) {
    var elOptions = combobox.getElementsByTagName('option');
    var elOption = null;
    var length = elOptions.length;
    var options = new Array(length);
    while(length--) {
        elOption = elOptions[ length ];
        options[ length ] = {
            'disabled': !!elOption.hasAttribute('disabled'),
            'label': getText(elOption),
            'value': elOption.getAttribute('value')
        };
    }
    return options;
}

function getText(el) {
    return el.textContent || el.innerText;
}

function indexOf(collection, item) {
    if (collection.indexOf) {
        return collection.indexOf(item);
    }
    var length = collection.length;
    while(length--) {
        if (collection[ length ] === item) return length;
    }
    return -1;
}

function selectText(node, start, end) {
    if (node.setSelectionRange) {
        return node.setSelectionRange(start, end);
    }
    if (node.createTextRange) {
        var range = node.createTextRange();
        range.collapse(true);
        range.moveEnd('character', start);
        range.moveStart('character', end);
        range.select();
        return;
    }
    if (node.selectionStart) {
        node.selectionStart = start;
        node.selectionEnd = end;
    }
}

function setScrollTop(scrollNode, optionNode) {
    scrollNode.scrollTop = optionNode.offsetTop;
}

function stopEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}

function toArray(collection){
    var len = collection.length;
    var arr = new Array(len);
    while(len--) arr[len] = collection[len]
    return arr;
}

function unselectOption(option) {
    if (!isDefined(option)) return;
    removeClass(option, 'cbo__option--selected');
}

export default Combobox;

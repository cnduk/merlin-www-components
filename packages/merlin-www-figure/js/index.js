'use strict';

import img from '@cnbritain/merlin-www-image';
import {
    hasTouch
} from '@cnbritain/merlin-www-js-utils/js/detect';
import {
    addClass,
    addEvent,
    hasClass,
    getParent,
    removeClass,
    toggleClas,
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    CLS_FIGURE,
    CLS_FIGURE_CONTAINER,
    CLS_FIGURE_TOOLBAR
} from './constants';
import {
    hasElementMagnifierConfig,
    hasElementMagnifierButton
} from './magnifier/utils';
import Magnifier from './magnifier/index';

export default {

    /**
     * Initialises the loading of images
     */
    'init': function() {
        img.init();
        initialiseFigures();
    }

};

function initialiseFigures() {
    var figureEls = document.querySelectorAll('.' + CLS_FIGURE);
    if (!figureEls) return;

    var i = -1;
    var len = figureEls.length;
    while (++i < len) {
        if (isFigureInitialised(figureEls[i])) continue;
        setFigureInitialised(figureEls[i]);
        initialiseMagnifier(figureEls[i]);
        initialiseToolbarToggle(figureEls[i]);
    }
}

function initialiseMagnifier(el) {
    // Check for config and the magnifier button
    var hasConfig = hasElementMagnifierConfig(el);
    var hasButton = hasElementMagnifierButton(el);
    if (hasConfig && hasButton) {
        Magnifier.bindElement(el);
    }
}

function initialiseToolbarToggle(el) {
    if (!hasTouch) return;
    initBackgroundBlur();
    removeClass(el, 'is-hover');
    addClass(el, 'is-touch');
    var isFocused = true;
    addEvent(el.querySelector('.' + CLS_FIGURE_CONTAINER), 'click', function(e) {
        isFocused = !isFocused;
        if (isFocused) {
            this.querySelector('.' + CLS_FIGURE_TOOLBAR).focus();
        } else {
            this.querySelector('.' + CLS_FIGURE_TOOLBAR).blur();
        }
        e.stopPropagation();
    });
}

var hasBackgroundBlur = false;

function initBackgroundBlur() {
    if (hasBackgroundBlur) return;
    hasBackgroundBlur = true;
    addEvent(document.body, 'touchend', function(e) {
        if (hasClass(document.activeElement, CLS_FIGURE_TOOLBAR)) {
            var parent = getParent(e.target, '.' + CLS_FIGURE_TOOLBAR);
            if (!parent || !hasClass(parent, CLS_FIGURE_TOOLBAR)) {
                document.activeElement.blur();
            }
        }
    });
}

function isFigureInitialised(el) {
    return el.hasAttribute('data-figure-initialised');
}

function setFigureInitialised(el) {
    el.setAttribute('data-figure-initialised', true);
}
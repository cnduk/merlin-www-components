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
    CLS_IS_VISIBLE,
    CLS_FIGURE,
    CLS_FIGURE_CONTAINER,
    CLS_FIGURE_TOOLBAR,
    CLS_FIGURE_TOOLBAR_MORE
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

var focusedFigure = null;

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

    initBackgroundBlur();
}

function initialiseMagnifier(el) {
    // Check for config and the magnifier button
    var hasConfig = hasElementMagnifierConfig(el);
    var hasButton = hasElementMagnifierButton(el);
    if (hasConfig && hasButton) {
        Magnifier.bindElement(el);
    }
}

var hasBackgroundBlur = false;
var focusedFigure = null;

function focusFigure(elFigure){
    focusedFigure = elFigure;
    elFigure.setAttribute('is-focused', true);
    addClass(elFigure.querySelector('.' + CLS_FIGURE_TOOLBAR), CLS_IS_VISIBLE);
}

function blurFigure(elFigure){
    elFigure.removeAttribute('is-focused');
    removeClass(
        elFigure.querySelector('.' + CLS_FIGURE_TOOLBAR), CLS_IS_VISIBLE);
    focusedFigure = null;
}

function preventDefault(e){
    e.preventDefault();
}

function initialiseToolbarToggle(el) {
    if (!hasTouch) return;

    removeClass(el, 'is-hover');
    addClass(el, 'is-touch');

    addEvent(el.querySelector('.' + CLS_FIGURE_TOOLBAR), 'focus', focusFigure);
    addEvent(el.querySelector('.' + CLS_FIGURE_TOOLBAR), 'blur', blurFigure);

    addEvent(el.querySelector('.' + CLS_FIGURE_CONTAINER), 'click', function(e) {
        var isFocused = Boolean(this.getAttribute('is-focused'));

        if(!isFocused) {
            focusFigure(this);
        } else {
            blurFigure(this);
        }
    });

    addEvent(
        el.querySelector('.' + CLS_FIGURE_TOOLBAR_MORE + ' a'), 'click',
        preventDefault);
}

function initBackgroundBlur() {
    if (hasBackgroundBlur) return;

    hasBackgroundBlur = true;
    addEvent(document.body, 'touchend', function(e) {
        if(focusedFigure !== null){
            var parent = getParent(e.target, '.' + CLS_FIGURE_CONTAINER);
            // If the parent also happens to be a figure, ignore triggering
            // a blur because the figure will do it
            if(focusedFigure === parent) return;
            blurFigure(focusedFigure);
        }
    });
}

function isFigureInitialised(el) {
    return el.hasAttribute('data-figure-initialised');
}

function setFigureInitialised(el) {
    el.setAttribute('data-figure-initialised', true);
}
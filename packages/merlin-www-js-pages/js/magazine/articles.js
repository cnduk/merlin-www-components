'use strict';

import {
    addClass,
    addEvent,
    addHtml,
    ajax,
    removeClass,
    removeEvent,
    updateQueryString
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    ID_MAGAZINE_ARTICLES_BUTTON,
    ID_MAGAZINE_ARTICLES_HOOK
} from '../constants';
import { getStorage, appendChildren } from '../utils';

var CLS_HIDDEN = 'global__hidden';

var nextArticlePage = 1;
var isLoadingArticles = false;


export default function init() {
    var btn = document.getElementById(ID_MAGAZINE_ARTICLES_BUTTON);
    if (!btn) return;

    addEvent(btn, 'click', getMoreArticles);
    removeClass(btn.parentNode, CLS_HIDDEN);
}

export function getUrl(month, year, page) {
    return updateQueryString('/xhr/magazine/articles', {
        year: Number(year),
        month: Number(month),
        page: Number(page)
    });
}

export function disableAjax() {
    removeEvent(
        document.getElementById(ID_MAGAZINE_ARTICLES_BUTTON),
        'click',
        getMoreArticles
    );
}

export function onAjaxError() {
    disableAjax();
    throw new Error('Error trying to load more articles');
}

export function insertArticles(section){
    var docFragment = document.createDocumentFragment();
    var addToFragment = addHtml(docFragment);

    var hook = document.getElementById(ID_MAGAZINE_ARTICLES_HOOK);
    hook = hook.previousElementSibling.querySelector('.c-card-section ul');

    addToFragment(section);
    appendChildren(hook, docFragment.querySelectorAll('.c-card-list__item'));
}

export function onAjaxSuccess(e) {
    var responseText = e.request.responseText;
    var responseJSON = null;
    try {
        responseJSON = JSON.parse(responseText);
    } catch (err) {
        console.error('Error trying to parse response ajax response');
        throw err;
    }

    // Add items to page
    if (responseJSON.data.template) insertArticles(responseJSON.data.template);

    // Check if we need to stop
    if (responseJSON.data.stop) {
        disableAjax();
    } else {
        removeClass(
            document.getElementById(ID_MAGAZINE_ARTICLES_BUTTON).parentNode,
            CLS_HIDDEN
        );
    }
    isLoadingArticles = false;
}

export function getMoreArticles() {
    if (isLoadingArticles) return;
    isLoadingArticles = true;

    // Hide the button
    addClass(document.getElementById(ID_MAGAZINE_ARTICLES_BUTTON), CLS_HIDDEN);

    // Load the content
    var issueMonth = getStorage('magazine_month');
    var issueYear = getStorage('magazine_year');
    ajax({
        url: getUrl(issueMonth, issueYear, ++nextArticlePage)
    }).then(onAjaxSuccess, onAjaxError);
}

'use strict';

import {
    addClass,
    addEvent,
    addHtml,
    ajax,
    getNamespaceKey,
    removeClass,
    removeEvent
} from '@cnbritain/merlin-www-js-utils/js/functions';
import { getStorage } from '../utils';


var CLS_HIDDEN = 'global__hidden';
var ID_BUTTON_ARTICLES = 'btnMagazineMoreArticles';
var ID_HOOK_ARTICLES = 'moreArticlesHook';

var moreArticlesPage = 1;
var isLoadingArticles = false;


export default function init() {
    var btn = document.getElementById(ID_BUTTON_ARTICLES);
    if (!btn) return;

    addEvent(btn, 'click', getMoreArticles);
    removeClass(btn.parentNode, CLS_HIDDEN);
}

export function appendChildren(el, children){
    var i = -1;
    var len = children.length;
    while(++i < len) el.appendChild(children[i]);
}

export function disableMoreArticles() {
    removeEvent(
        document.getElementById(ID_BUTTON_ARTICLES), 'click', getMoreArticles);
}

export function onMoreArticleError() {
    disableMoreArticles();
    throw new Error('Error trying to load more articles');
}

export function insertArticles(section){
    var docFragment = document.createDocumentFragment();
    var addToFragment = addHtml(docFragment);

    var hook = document.getElementById(ID_HOOK_ARTICLES);
    hook = hook.previousElementSibling.querySelector('.c-card-section ul');

    addToFragment(section);
    appendChildren(hook, docFragment.querySelectorAll('.c-card-list__item'));
}

export function onMoreArticleSuccess(e) {
    var responseText = e.request.responseText;
    var responseJSON = null;
    try {
        responseJSON = JSON.parse(responseText);
    } catch (err) {
        console.error('Error trying to parse response JSON');
        throw err;
    }

    // Add items to page
    if (responseJSON.data.template) insertArticles(responseJSON.data.template);

    // Check if we need to stop
    if (responseJSON.data.stop) {
        disableMoreArticles();
    } else {
        removeClass(document.getElementById(ID_BUTTON_ARTICLES).parentNode,
            CLS_HIDDEN);
    }
    isLoadingArticles = false;
}

export function getMoreArticlesUrl(month, year, page) {
    return ('/xhr/magazine/articles?year=' + Number(year) + '&month=' +
        Number(month) + '&page=' + Number(page));
}

export function getMoreArticles() {
    if (isLoadingArticles) return;
    isLoadingArticles = true;

    // Hide the button
    addClass(document.getElementById(ID_BUTTON_ARTICLES), CLS_HIDDEN);

    // Load the content
    var issueMonth = getStorage('magazine_month');
    var issueYear = getStorage('magazine_year');
    ajax({
        url: getMoreArticlesUrl(issueMonth, issueYear, ++moreArticlesPage)
    }).then(onMoreArticleSuccess, onMoreArticleError);
}

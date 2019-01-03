'use strict';

import {
    addEvent,
    addHtml,
    ajax,
    removeClass,
    removeElement,
    removeEvent,
    updateQueryString
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {appendChildren, getStorage, setStorage} from '../utils';

var CLS_HIDDEN = 'global__hidden';

var nextArticlePage = 1;
var hasCoverStory = false;
var btnMoreArticles = null;


export default function init() {
    btnMoreArticles = document.querySelector('.js-mag-articles');
    if (!btnMoreArticles) return;

    hasCoverStory = getStorage('magazine_cover_story_uid') !== null;
    addEvent(btnMoreArticles, 'click', onMoreArticleClick);
    removeClass(btnMoreArticles, CLS_HIDDEN);
}


export function getUrl(month, year, page, coverStoryUid) {
    var queryValues = {
        year: Number(year),
        month: Number(month),
        page: Number(page)
    };

    if (coverStoryUid !== null && coverStoryUid !== false) {
        queryValues['exclude_uid'] = coverStoryUid;

    } else if (hasCoverStory) {
        queryValues['shift'] = -1;
    }

    return updateQueryString('/xhr/magazine/articles', queryValues);
}


export function disableAjax() {
    // Remove any trace of the button
    removeEvent(btnMoreArticles, 'click', onMoreArticleClick);
    removeElement(btnMoreArticles);
    btnMoreArticles = null;
}


export function onAjaxError() {
    disableAjax();
    throw new Error('Error trying to load more articles');
}


export function insertArticles(section) {
    // Create the card doms
    var docFragment = document.createDocumentFragment();
    var addToFragment = addHtml(docFragment);
    addToFragment(section);

    // Add to the card list
    appendChildren(
        document.querySelector('.c-card-section--mag-articles ul'),
        docFragment.querySelectorAll('.js-c-card-section__card-listitem')
    );

    // Clean up
    docFragment = addToFragment = null;
}


export function onAjaxSuccess(e) {
    // Get the json response
    var responseText = e.request.responseText;
    var responseJSON = null;
    try {
        responseJSON = JSON.parse(responseText);
    } catch (err) {
        console.error('Error trying to parse response ajax response');
        disableAjax();
        throw err;
    }

    // Add items to page
    if (responseJSON.data.template) insertArticles(responseJSON.data.template);

    // Update any local storage values
    if (responseJSON.data.local_storage) {
        responseJSON.data.local_storage.forEach(function(item) {
            setStorage(item.key, item.value);
        });
    }

    // Check if we need to stop
    if (responseJSON.data.stop) {
        disableAjax();
    } else {
        btnMoreArticles.removeAttribute('disabled');
    }
}


export function onMoreArticleClick(e) {
    e.preventDefault();

    // Set button to disabled
    e.target.setAttribute('disabled', true);

    // Load the content
    var issueMonth = getStorage('magazine_month');
    var issueYear = getStorage('magazine_year');
    var coverStoryUid = getStorage('magazine_cover_story_uid');
    var url = getUrl(issueMonth, issueYear, ++nextArticlePage, coverStoryUid);
    ajax({url: url}).then(onAjaxSuccess, onAjaxError);
}

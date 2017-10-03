"use strict";

import CONFIG_BRAND from '@cnbritain/merlin-www-common';
import { getNamespaceKey } from '@cnbritain/merlin-www-js-utils/js/functions';
import figure from '@cnbritain/merlin-www-figure';
import { ArticleManager } from '@cnbritain/merlin-www-article';

import init as initStickyItems from './sticky';
import init as initArticle from './article';
import init as initAnalytics from './analytics';
import init as initAds from './ads';
import init as initCookieWarning from './cookie-warning';

export function init(){
    figure.init();
    initStickyItems();
    initAnalytics();
    initArticle();
    initAds();
    initCookieWarning();

    // Global namespace stuffs
    // Don't just use the abbreviation in case something else in the page
    // overwrites it
    window[getNamespaceKey(CONFIG_BRAND.abbr)].ArticleManager = ArticleManager;
}

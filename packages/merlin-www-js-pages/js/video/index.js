'use strict';

import CONFIG_BRAND from '@cnbritain/merlin-www-common';
import {
    getNamespaceKey
} from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    ArticleManager
} from '@cnbritain/merlin-www-article';
import {
    default as initAds
} from './ads';
import {
    default as initArticle
} from './article';
import {
    default as initInfinite
} from './infinite';
import {
    default as initSticky
} from './sticky';

export default function init() {
    initAds();
    initArticle();
    initInfinite();
    initSticky();

    // Global namespace stuffs
    // Don't just use the abbreviation in case something else in the page
    // overwrites it
    window[getNamespaceKey(CONFIG_BRAND.abbr)].ArticleManager = ArticleManager;

}
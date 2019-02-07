'use strict';

import figure from '@cnbritain/merlin-www-figure';
import {
    ArticleManager
} from '@cnbritain/merlin-www-article';

import {
    default as initStickyItems
} from './sticky';
import {
    default as initArticle
} from './article';
import {
    default as initAnalytics
} from './analytics';
import {
    default as initAds
} from './ads';
import {
    getGlobalNamespace
} from '../utils';

export default function init() {
    figure.init();
    initStickyItems();
    initAnalytics();
    initArticle();
    initAds();

    // Global namespace stuffs
    // Don't just use the abbreviation in case something else in the page
    // overwrites it
    getGlobalNamespace().ArticleManager = ArticleManager;
}
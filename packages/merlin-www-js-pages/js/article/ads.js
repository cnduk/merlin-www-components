'use strict';

import {
    debounce,
    hasClass,
    getParent,
    removeClass
} from '@cnbritain/merlin-www-js-utils/js/functions';

import {
    AdManager,
    AdUtils
} from '@cnbritain/merlin-www-ads';
import {
    ArticleManager
} from '@cnbritain/merlin-www-article';
import {
    ARTICLE_TYPES
} from '@cnbritain/merlin-www-article/js/constants';

var debouncedRecalculateArticleSize = debounce(recalculateArticleSize, 300);

export default function init() {
    // If an ad in the article page fires a stop, remove it from the page
    AdManager.on('render', onAdRender);
    AdManager.on('stop', onAdStop);

    ArticleManager.on('add', onArticleAdd);
    ArticleManager.on('expand', onArticleExpand);

    AdManager.init();
    AdManager.lazy();
}

export function recalculateArticleSize() {
    var start = ArticleManager.focusedIndex;
    var length = ArticleManager.articles.length;
    ArticleManager.resize(start, length);

    if (ArticleManager.focusedIndex > -1) {
        var focusArticle = ArticleManager.articles[ArticleManager.focusedIndex];
        if (focusArticle.type === ARTICLE_TYPES.GALLERY) {
            focusArticle.gallery.imageNavigation.resize();
        }
    }
}

export function renderTopStoriesAd(ad) {
    var listItem = getParent(ad.el, '.js-c-card-list__item');
    removeClass(listItem, 'is-hidden');
}

export function onAdRender(e) {
    if (hasClass(e.ad.el.parentNode, 'js-ad-top-stories')) {
        renderTopStoriesAd(e.ad);
    }
    debouncedRecalculateArticleSize();
}

export function onAdStop(e) {
    // Top stories ad
    if (hasClass(e.ad.el.parentNode, 'js-ad-top-stories')) return;

    // Remove it from the page
    var ad = getParent(e.ad.el, '.ad--article');
    e.ad.destroy();
    if (ad.parentNode) ad.parentNode.removeChild(ad);
    debouncedRecalculateArticleSize();
}

export function onArticleExpand(e) {
    var article = e.target;
    AdManager.lazy(article.el);
    ArticleManager.resize(ArticleManager.articles.indexOf(article));
}

export function firePageImpression(e) {
    var article = e.target;
    if (article.ads === null) return;
    var impressionElement = AdUtils.createPageImpressionElement(
        article.ads.ad_unit, article.ads.ad_zone, article.ads.key_values);
    document.body.appendChild(impressionElement);
    AdManager.display(impressionElement);
}

export function onArticleAdd(e) {
    var article = e.article;

    if (article.type === ARTICLE_TYPES.GALLERY) {
        if (article.isInfinite) {
            AdManager.display(getHeaderAd(article.el, true));
        } else {
            AdManager.lazy();
        }
    } else {
        if (e.infinite) {
            AdManager.display(getHeaderAd(article.el));
            AdManager.lazy(article.el);
        } else {
            AdManager.lazy();
        }
    }

    if (e.infinite) {
        e.article.once('focus', firePageImpression);
    }

}

export function getHeaderAd(el, isGallery) {
    if (isGallery) {
        return el.parentNode.previousElementSibling.querySelector(
            '.ad__container');
    } else {
        return el.previousElementSibling.querySelector('.ad__container');
    }
}
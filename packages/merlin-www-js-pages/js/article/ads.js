'use strict';

import {
    debounce,
    getParent,
    assign,
} from '@cnbritain/merlin-www-js-utils/js/functions';
import { AdManager, AdUtils } from '@cnbritain/merlin-www-ads';
import { ArticleManager } from '@cnbritain/merlin-www-article';
import { ARTICLE_TYPES } from '@cnbritain/merlin-www-article/js/constants';
import OneTrustManager from '@cnbritain/merlin-www-js-gatracker/js/OneTrustManager';

var debouncedRecalculateArticleSize = debounce(recalculateArticleSize, 300);

export default function init() {
    // If an ad in the article page fires a stop, remove it from the page
    AdManager.on('render', onAdRender);
    AdManager.on('stop', onAdStop);

    ArticleManager.on('add', onArticleAdd);
    ArticleManager.on('expand', onArticleExpand);

    function onChange() {
        if (this.consentedPerformanceCookies) {
            OneTrustManager.off('change', onChange);
            AdManager.init();
            AdManager.lazy();
        }
    }

    function onReady() {
        if (this.consentedPerformanceCookies) {
            AdManager.init();
            AdManager.lazy();
        } else {
            OneTrustManager.on('change', onChange);
        }
    }

    if (OneTrustManager.ready) {
        if (OneTrustManager.consentedPerformanceCookies) {
            AdManager.init();
            AdManager.lazy();
        } else {
            OneTrustManager.on('change', onChange);
        }
    } else {
        OneTrustManager.once('ready', onReady);
    }
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

export function onAdRender() {
    debouncedRecalculateArticleSize();
}

export function onAdStop(e) {
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

    if (!('PAGE_IMPRESSION_TRACKER' in AdManager.instanceCounts)) {
        // start at 2 because there's already one on the page from before
        // the infinite scroller. that plus this == 2
        AdManager.instanceCounts['PAGE_IMPRESSION_TRACKER'] = 2;
    }

    var instance = AdManager.instanceCounts['PAGE_IMPRESSION_TRACKER'];
    var ad_zone = [article.ads.ad_network_id, article.ads.ad_zone].join('/');
    var ad_unit = ['legacy', article.ads.ad_unit, article.ads.key_values.content_type, instance].join('/');
    var key_values = assign(article.ads.key_values, {
        'slot_position': 'legacy',
        'slot_instance': instance,
        'slot_name': 'legacy_' + instance,
    });
    var impressionElement = AdUtils.createPageImpressionElement(
        ad_unit,
        ad_zone,
        key_values
    );
    document.body.appendChild(impressionElement);
    AdManager.display(impressionElement);
    AdManager.instanceCounts['PAGE_IMPRESSION_TRACKER']++;
}

export function onArticleAdd(e) {
    var article = e.article;

    if (e.infinite) {
        AdManager.display(getHeaderAd(article.el));
        AdManager.lazy(article.el);
    } else {
        AdManager.lazy();
    }

    if (e.infinite) {
        e.article.once('focus', firePageImpression);
    }
}

export function getHeaderAd(el) {
    return el.querySelector('.da__container');
}

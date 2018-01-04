'use strict';

import CookieWarning from '@cnbritain/merlin-www-cookie-warning';
import {
    ArticleManager
} from '@cnbritain/merlin-www-article';

export default function init() {
    if (CookieWarning.el !== null) {
        CookieWarning.once('remove', onCookieRemove);
        ArticleManager.on('add', onArticleAdd);
    }
}

export function onCookieRemove() {
    ArticleManager.off('add', onArticleAdd);
}

export function onArticleAdd() {
    CookieWarning.incrementCounter();
}
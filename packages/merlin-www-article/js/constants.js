'use strict';

/**
 * Enum for article types
 * @readonly
 * @enum {Number}
 */
export var ARTICLE_TYPES = {
    'UNKNOWN': -1,
    'ARTICLE': 0,
    'GALLERY': 1,
    'VIDEO': 2,
    'SHOW-SUMMARY': 3
};

export var CLS_ARTICLE_GALLERY = '.js-a-gallery';
export var CLS_ARTICLE_GALLERY_IMAGE = '.js-g-image';
export var CLS_ARTICLE_GALLERY_THUMBNAIL = '.js-g-view-thumbnail';
export var CLS_ARTICLE_GALLERY_VIEW_LIST = '.js-g-view-list';
export var CLS_ARTICLE_GALLERY_VIEW_THUMBNAIL = '.js-g-view-thumbnails';
export var CLS_ARTICLE_VIDEO_BODY = '.js-a-video-body';
export var CLS_ARTICLE_VIDEO_EMBED = '.js-v-player-embed';
export var CLS_ARTICLE_VIDEO_PLAYER = '.js-v-player';
export var CLS_ARTICLE_VIDEO_PLAYER_PLAYLIST = '.js-v-player-playlist';
export var CLS_ARTICLE_VIDEO_SECTION_PLAYLIST = '.js-v-section-playlist';
export var CLS_IMAGE_NAVIGATION = '.js-g-image-nav';
export var CLS_INFINITE_BTN = '.js-a-gallery__message-btn';
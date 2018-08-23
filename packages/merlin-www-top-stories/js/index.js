'use strict';

import {
    ajax,
    updateQueryString
} from '@cnbritain/merlin-www-js-utils/js/functions';
import Card from '@cnbritain/merlin-www-card';
import {getTestAdValues} from '@cnbritain/merlin-www-ads/js/Utils';
import TopStoriesNavigation from './TopStoriesNavigation';

var TOP_STORIES = [];

function sanitiseArticleUid(uid){
    return uid.replace(/[^\w\d]/gi, '');
}

export default {

    /**
     * Initialises the top stories. This displays the arrows for scrolling the
     * list and lazyloads the images on the cards
     */
    init: function(options) {

        // Javascript running so display the navigation
        var topStories = document.querySelectorAll('.c-top-stories');
        var _options = options || {};
        var nav = null;

        for(var i=0, len = topStories.length; i < len; i++){
            nav = new TopStoriesNavigation(topStories[i], _options);
            TOP_STORIES.push(nav);
        }

        nav = null;

        // Trigger the cards to load
        Card.init();

    },

    get: function(){
        return TOP_STORIES;
    },

    lazyLoad: function() {

        var lazyLoadEl = document.querySelector('.js-c-top-stories-lazy-load');

        if (!lazyLoadEl) return Promise.resolve(null);

        return new Promise(function(resolve){
            var articleUid = lazyLoadEl.getAttribute('data-article-uid');

            var testAdValues = getTestAdValues();
            // Remove ad values that are null
            var qs = Object.keys(testAdValues).reduce(function(prev, cur){
                if(testAdValues[cur] !== null) prev[cur] = testAdValues[cur];
                return prev;
            }, {});
            qs['article_uid'] = sanitiseArticleUid(articleUid);
            var url = updateQueryString('/xhr/top-stories', qs);

            ajax({url: url}).then(function(data) {
                var request = data.request;
                var responseText = request.responseText;
                var jsonResponseText = JSON.parse(responseText);

                var html = jsonResponseText.data.template;

                lazyLoadEl.innerHTML = html;

                this.init({scrollOffset: 30});

                var ts = this.get();
                if(ts.length > 0){
                    ts[0].showNavigation();
                    ts[0].disableScroll();
                }

                resolve(ts[0]);
            }.bind(this));
        }.bind(this));
    }
};

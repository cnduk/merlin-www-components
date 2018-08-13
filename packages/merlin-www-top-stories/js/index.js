'use strict';

import Card from '@cnbritain/merlin-www-card';
import TopStoriesNavigation from './TopStoriesNavigation';
import {
    ajax
} from '@cnbritain/merlin-www-js-utils/js/functions';

var TOP_STORIES = [];

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

        if (!lazyLoadEl) return;

        var html = '';

        ajax({
            url: '/xhr/top-stories'
        })
        .then(function(data) {
            var request = data.request;
            var responseText = request.responseText;
            var jsonResponseText = JSON.parse(responseText);

            var html = jsonResponseText.data.template;

            lazyLoadEl.innerHTML = html;
        });

        this.init({
            scrollOffset: 30
        });

        var ts = this.get();
        if(ts.length > 0){
            ts[0].showNavigation();
            ts[0].disableScroll();
        }
    }
};

'use strict';

import Card from '@cnbritain/merlin-www-card';
import TopStoriesNavigation from './TopStoriesNavigation';

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
    }

};

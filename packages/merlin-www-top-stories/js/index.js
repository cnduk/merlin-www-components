'use strict';

import Card from '@cnbritain/merlin-www-card';
import TopStoriesNavigation from './TopStoriesNavigation';

var TopStoryList = [];

export default {

    /**
     * Initialises the top stories. This displays the arrows for scrolling the
     * list and lazyloads the images on the cards
     */
    'init': function(options) {

        // Javascript running so display the navigation
        var topStories = document.querySelectorAll('.c-top-stories');
        var length = topStories.length;
        var _options = options || {};
        var nav = null;

        while (length--) {
            nav = new TopStoriesNavigation(topStories[length], _options);
            TopStoryList.push(nav);
        }

        nav = null;

        // Trigger the cards to load
        Card.init();

    }

};

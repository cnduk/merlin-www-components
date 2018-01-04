'use strict';

import ShowFinder from '@cnbritain/merlin-www-show-finder';
import ShowSummary from '@cnbritain/merlin-www-show-summary';

import {
    default as initAds
} from './ads';
import {
    default as initInfinite
} from './infinite';
import {
    default as initSticky
} from '../tagpage/sticky';

export default function init() {
    initAds();
    ShowFinder.init();
    ShowSummary.init();
    initSticky();
    initInfinite();
}
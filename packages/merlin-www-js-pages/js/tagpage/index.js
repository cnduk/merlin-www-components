'use strict';

import TagHeader from '@cnbritain/merlin-www-tag-header';
import { default as initAds } from './ads';
import { default as initInfinite } from './infinite';
import { default as initSticky } from './sticky';

export default function init(){
    TagHeader.init();
    initAds();
    initInfinite();
    initSticky();
}

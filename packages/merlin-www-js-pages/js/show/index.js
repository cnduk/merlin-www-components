'use strict';

import { default as initAds } from './ads';
import { default as initInfinite } from './infinite';

export default function init(){
    initAds();
    initInfinite();
}

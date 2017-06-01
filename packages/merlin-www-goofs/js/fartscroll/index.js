'use strict';
/* globals fartscroll */

import { loadScript } from '@cnbritain/merlin-www-js-utils/js/functions';

export default function startthefarts(){
    loadScript("http://code.onion.com/fartscroll.js").then(function(){
        window.fartscroll();
    });
}

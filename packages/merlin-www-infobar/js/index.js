'use strict';

import Infobar from './infobar';

var INFOBAR;

if (document.querySelector('.js-c-infobar')) {
    INFOBAR = new Infobar(document.querySelector('.js-c-infobar'));
}

export default INFOBAR;
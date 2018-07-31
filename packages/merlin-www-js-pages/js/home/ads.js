'use strict';

import {AdManager} from '@cnbritain/merlin-www-ads';

export default function init() {
    AdManager.init();
    AdManager.lazy();
}

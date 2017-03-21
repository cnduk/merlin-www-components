'use strict';

import { hasTouch } from '@cnbritain/merlin-www-js-utils/js/detect';

import ElementMagnifyMouse from './MagnifierMouse';
import ElementMagnifyTouch from './MagnifierTouch';

var ElementMagnify = ElementMagnifyMouse;

if(hasTouch) ElementMagnify = ElementMagnifyTouch;
export default ElementMagnify;

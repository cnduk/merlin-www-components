import { deleteCookie } from '@cnbritain/merlin-www-js-utils/js/functions';
import {
    default as CookieWarning,
    COOKIE_DIALOG_CLOSED,
    COOKIE_DIALOG_COUNT
 } from '../js/index';

deleteCookie(COOKIE_DIALOG_COUNT);
deleteCookie(COOKIE_DIALOG_CLOSED);

document.body.style.height = '300px';

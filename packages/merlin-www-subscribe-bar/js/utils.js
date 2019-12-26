import {
    getCookie,
    setCookie
} from '@cnbritain/merlin-www-js-utils/js/functions';
import OneTrustManager from '@cnbritain/merlin-www-js-gatracker/js/OneTrustManager';
import { COOKIE_CONFIG_HASH, COOKIE_EXPIRES, VIEW_LIMIT } from './constants';

export function saveConfig(configHash, converted, viewCount) {
    if (!OneTrustManager.ready || !OneTrustManager.consentedStrictlyCookies)
        return;
    var config = {
        configHash: configHash,
        converted: !!converted,
        viewCount: viewCount,
        viewExceeded: viewCount >= VIEW_LIMIT
    };
    setCookie(COOKIE_CONFIG_HASH, JSON.stringify(config), COOKIE_EXPIRES);
}

export function loadConfig(){
    var config = getCookie(COOKIE_CONFIG_HASH);
    if(config){
        try {
            config = JSON.parse(config);
        } catch(err){
            console.error('Error parsing config!');
            console.error(err);
            config = {
                configHash: null,
                converted: false,
                viewCount: 0,
                viewExceeded: false
            };
        }
    } else {
        config = {
            configHash: null,
            converted: false,
            viewCount: 0,
            viewExceeded: false
        };
    }
    return config;
}
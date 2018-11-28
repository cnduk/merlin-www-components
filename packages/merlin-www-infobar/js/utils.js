
import {getCookie, setCookie} from '@cnbritain/merlin-www-js-utils/js/functions';
import {COOKIE_CONFIG_HASH, COOKIE_EXPIRES} from './constants';

export function saveConfig(configHash, messages){
    var config = {
        configHash: configHash,
        messages: messages
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
            config = {configHash: null, messages: {}};
        }
    } else {
        config = {configHash: null, messages: {}};
    }
    return config;
}

export function post(url, postData){
    return new Promise(function( resolve, reject ){
        var request = new XMLHttpRequest();
        request.onreadystatechange = function( e ){
            if(request.readyState === 4){
                request.onreadystatechange = null;
                if(request.status === 200){
                    resolve({'event': e, 'request': request});
                } else {
                    reject({'event': e, 'request': request});
                }
            }
        };

        request.open('POST', url);
        // Add referrer as cloudfront sucks up the referrer
        request.setRequestHeader('rollbar-referrer', document.location.href);
        request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        request.send(JSON.stringify(postData));
    });
}

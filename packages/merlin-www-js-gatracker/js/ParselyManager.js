import EventEmitter from 'eventemitter2';
import {
    inherit
} from '@cnbritain/merlin-www-js-utils/js/functions';
import { ArticleManager } from '@cnbritain/merlin-www-article';

function ParselyManager() {
    EventEmitter.call(this, {
        wildcard: true
    });
    this.id = null;
    this.hasLoadedScript = false;
}

ParselyManager.prototype = inherit(EventEmitter.prototype, {
    constructor: ParselyManager,

    init: function init(id) {
        this.id = id;
    },

    loadScript: function loadScript() {
        if (this.hasLoadedScript) return;
        if (this.id === null) {
            console.warn('Missing Parsely ID');
        }

        (function () {
            window.PARSLEY = window.PARSLEY || {
                onload: function () {
                    ArticleManager.on('urlchange', function (e) {
                        window.PARSLEY.beacon.trackPageView({
                            url: e.url,
                            urlref: e.ref_url,
                            js: 1,
                        });
                    });

                    return true;
                }
            };

            var script = document.createElement('script');

            script.type = 'text/javascript';
            script.id = 'parsely-cfg';
            script.src = '//cdn.parsely.com/keys/' + this.id + '/p.js';

            document.body.appendChild(script);
        })();

        this.hasLoadedScript = true;
    }
});

export default new ParselyManager();
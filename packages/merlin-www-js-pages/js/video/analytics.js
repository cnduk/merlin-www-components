
import GATracker from '@cnbritain/merlin-www-js-gatracker';
import {ArticleManager} from '@cnbritain/merlin-www-article';

export function sendPageview(article) {
    // Reset all custom dimensions first to make sure we dont leak any previous
    // dimensions from older articles
    GATracker.ResetCustomDimensions();
    GATracker.SetAll(article.analytics);
    GATracker.SendAll(GATracker.SEND_HITTYPES.PAGEVIEW);
    console.log("SENT PAGEVIEW");
}

function onArticleFocus(e){
    console.log("onArticleFocus", e);
    var article = e.target;

    // Update the analytics to include ad block changes
    article.analytics[GATracker.getDimensionByIndex('AD_BLOCKER')] = String(!window.ads_not_blocked);
    sendPageview(article);
}

export default function initAnalytics(){
    ArticleManager.on('focus', onArticleFocus);
}

import {
    insertBefore,
    removeElement
} from '@cnbritain/merlin-www-js-utils/js/functions';
import OneTrustManager from '@cnbritain/merlin-www-js-gatracker/js/OneTrustManager';

var CLS_TEMPLATE = '.bb-embed__template';

function isHydrated(el) {
    return el.hasAttribute('is-hydrated');
}

function hasConsent(consentType) {
    if (
        consentType === 'STRICTLY' &&
        OneTrustManager.consentedStrictlyCookies
    ) {
        return true;
    } else if (
        consentType === 'PERFORMANCE' &&
        OneTrustManager.consentedPerformanceCookies
    ) {
        return true;
    } else if (
        consentType === 'FUNCTIONAL' &&
        OneTrustManager.consentedFunctionalCookies
    ) {
        return true;
    } else if (
        consentType === 'TARGETING' &&
        OneTrustManager.consentedTargetingCookies
    ) {
        return true;
    } else if (
        consentType === 'SOCIAL_MEDIA' &&
        OneTrustManager.consentedSocialNetworkCookies
    ) {
        return true;
    } else {
        return false;
    }
}

function hydrateTemplate(element) {
    // console.log('hydrating template', element.content);
    element.setAttribute('is-hydrated', true);
    // NOTE: i thought i was going to need to do something wacky to load the
    // scripts but they just work :shrug:
    var bbcodeElement = document.importNode(element.content.children[0], true);
    insertBefore(bbcodeElement, element.parentNode);
    removeElement(element.parentNode);
}

function hydrate() {
    var templates = document.querySelectorAll(CLS_TEMPLATE);
    var template = null;
    for (var i = 0; i < templates.length; i++) {
        template = templates[i];
        if (
            !isHydrated(template) &&
            hasConsent(template.parentNode.getAttribute('data-consent-type'))
        ) {
            hydrateTemplate(template);
        }
    }
}

function onReady() {
    OneTrustManager.on('change', onChange);
    hydrate();
}

function onChange() {
    hydrate();
}

var isInitialiased = false;

export default function() {
    if (isInitialiased) {
        hydrate();
        return;
    }

    if (OneTrustManager.ready) {
        OneTrustManager.on('change', onChange);
        hydrate();
    } else {
        OneTrustManager.once('ready', onReady);
    }
    isInitialiased = true;
}

export { hydrate };

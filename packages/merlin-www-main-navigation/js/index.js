import Nav from './nav';

var NAV;

if (document.querySelector('.js-c-nav')) {
    NAV = new Infobar(document.querySelector('.js-c-nav'));
}

export default NAV;
import Nav from './nav';

var NAV;

if (document.querySelector('.js-c-nav')) {
    NAV = new Nav(document.querySelector('.js-c-nav'));
}

export default NAV;
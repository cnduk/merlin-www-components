var IS_HIDDEN_CLS = 'is-hidden';
var IS_FIXED_CLS = 'is-fixed';
var IS_OPEN_CLS = 'is-open';

function GalleryNav(el) {
    this.el = el;
    this.state = {
        isListView: true,
        isGridView: false
    };

    this.galleryTitleEl = el.querySelector('.js-c-nav__gallery-title');

    this.galleryCountEl = el.querySelector('.js-c-nav__gallery-current');
    this.galleryTotalEl = el.querySelector('.js-c-nav__gallery-total');

    this.galleryIconEl = el.querySelector('.js-c-nav__gallery-icon');
    this.galleryListIconEl = this.galleryIconEl.querySelector('.js-c-nav__list-icon');
    this.galleryGridIconEl = this.galleryIconEl.querySelector('.js-c-nav__grid-icon');

    this.setTitle = this.setTitle.bind(this);
    this.setCount = this.setCount.bind(this);
    this.setTotal = this.setTotal.bind(this);

    this.showListView = this.showListView.bind(this);
    this.hideListView = this.hideListView.bind(this);
    this.toggleListView = this.toggleListView.bind(this);

    this.galleryIconEl.addEventListener('click', this.toggleListView);
}

GalleryNav.prototype.setTitle = function(value) {
    this.galleryTitleEl.innerHTML = value;
};

GalleryNav.prototype.setCount = function(value) {
    this.galleryCountEl.innerHTML = value;
};

GalleryNav.prototype.setTotal = function(value) {
    this.galleryTotalEl.innerHTML = value;
};

GalleryNav.prototype.toggleListView = function() {
    if (this.state.isListView) {
        this.hideListView();
    }

    else {
        this.showListView();
    }
};

GalleryNav.prototype.showListView = function() {
    if (this.state.isListView) return;

    this.galleryListIconEl.classList.remove(IS_HIDDEN_CLS);
    this.galleryGridIconEl.classList.add(IS_HIDDEN_CLS);

    this.state.isListView = true;
    this.state.isGridView = false;
};

GalleryNav.prototype.hideListView = function() {
    if (this.state.isGridView) return;

    this.galleryListIconEl.classList.add(IS_HIDDEN_CLS);
    this.galleryGridIconEl.classList.remove(IS_HIDDEN_CLS);

    this.state.isListView = false;
    this.state.isGridView = true;
};

export default GalleryNav
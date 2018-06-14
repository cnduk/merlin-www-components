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


function Nav(el) {
    this.el = el;
    this.state = {
        isFixed: false,
        isOpen: false,
        isHidden: false,
        isSearchOpen: false,
        isGalleryHidden: true
    };

    this.currentY = 0;
    this.previousY = 0;

    this.scrollDirection = null;
    this.scrollUpCount = 0;
    this.scrollDownCount = 0;

    this.elOffsetTop = el.offsetTop;

    this.searchEl = el.querySelector('.js-c-nav__search');

    this.searchIconEl = el.querySelector('.js-c-nav__search-icon');
    this.searchOpenIconEl = this.searchIconEl.querySelector('.js-c-nav__open-icon');
    this.searchCloseIconEl = this.searchIconEl.querySelector('.js-c-nav__close-icon');

    this.toggleIconEl = el.querySelector('.js-c-nav__toggle-icon');
    this.toggleOpenIconEl = this.toggleIconEl.querySelector('.js-c-nav__open-icon');
    this.toggleCloseIconEl = this.toggleIconEl.querySelector('.js-c-nav__close-icon');

    this.galleryEl = el.querySelector('.js-c-nav__gallery');

    if (this.galleryEl) {
        this.galleryNav = new GalleryNav(this.galleryEl);
    }

    this.logoEl = el.querySelector('.js-c-nav__logo');

    this.fix = this.fix.bind(this);
    this.unfix = this.unfix.bind(this);
    this.togglefix = this.togglefix.bind(this);

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.toggleOpen = this.toggleOpen.bind(this);

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.toggleShow = this.toggleShow.bind(this);

    this.openSearch = this.openSearch.bind(this);
    this.closeSearch = this.closeSearch.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);

    this.showGallery = this.showGallery.bind(this);
    this.hideGalery = this.hideGallery.bind(this);
    this.toggleGallery = this.toggleGallery.bind(this);

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);

    window.addEventListener('scroll', this.onScroll);
    window.addEventListener('resize', this.onResize);

    this.toggleIconEl.addEventListener('click', this.toggleOpen);
    this.searchIconEl.addEventListener('click', this.toggleSearch);
}

Nav.prototype.fix = function() {
    if (this.state.isFixed) return;

    this.el.classList.add(IS_FIXED_CLS);
    this.logoEl.classList.remove(IS_HIDDEN_CLS);
    this.state.isFixed = true;
};

Nav.prototype.unfix = function() {
    if (!this.state.isFixed) return;

    this.el.classList.remove(IS_FIXED_CLS);
    this.logoEl.classList.add(IS_HIDDEN_CLS);
    this.state.isFixed = false;
};

Nav.prototype.togglefix = function() {
    if (window.scrollY >= this.elOffsetTop) {
        if (!this.state.isFixed) {
            this.fix();
        }
    }

    else {
        if (this.state.isFixed) {
            this.unfix();
        }
    }

    this.isScrolling = false;
    this.isResizing = false;
};

Nav.prototype.open = function() {
    if (this.state.isOpen) return;

    document.body.style.overflow = 'hidden';
    this.el.classList.add(IS_OPEN_CLS);

    this.toggleOpenIconEl.classList.add(IS_HIDDEN_CLS);
    this.toggleCloseIconEl.classList.remove(IS_HIDDEN_CLS);

    this.state.isOpen = true;
};

Nav.prototype.close = function() {
    if (!this.state.isOpen) return;

    document.body.style.overflow = '';
    this.el.classList.remove(IS_OPEN_CLS);

    this.toggleOpenIconEl.classList.remove(IS_HIDDEN_CLS);
    this.toggleCloseIconEl.classList.add(IS_HIDDEN_CLS);

    this.state.isOpen = false;
};

Nav.prototype.toggleOpen = function() {
    if (!this.state.isOpen) {
        this.open();
    }

    else {
        this.close();
    }
};

Nav.prototype.show = function() {
    if (!this.state.isHidden) return;

    this.el.classList.remove(IS_HIDDEN_CLS);
    this.state.isHidden = false;
};

Nav.prototype.hide = function() {
    if (this.state.isHidden) return;

    this.el.classList.add(IS_HIDDEN_CLS);
    this.state.isHidden = true;
};

Nav.prototype.toggleShow = function() {
    if (this.scrollDirection == 'down') {
        if (this.scrollDownCount >= 60) {
            if (!this.state.isHidden) {
                this.hide();
            }
        }
    }

    if (this.scrollDirection == 'up') {
        if (this.scrollUpCount >= 1) {
            if (this.state.isHidden) {
                this.show();
            }
        }
    }

    this.isScrolling = false;
    this.isResizing = false;
};

Nav.prototype.openSearch = function() {
    if (this.state.isSearchOpen) return;

    this.searchEl.classList.remove(IS_HIDDEN_CLS);

    this.searchOpenIconEl.classList.add(IS_HIDDEN_CLS);
    this.searchCloseIconEl.classList.remove(IS_HIDDEN_CLS);

    this.state.isSearchOpen = true;
};

Nav.prototype.closeSearch = function() {
    if (!this.state.isSearchOpen) return;

    this.searchEl.classList.add(IS_HIDDEN_CLS);

    this.searchOpenIconEl.classList.remove(IS_HIDDEN_CLS);
    this.searchCloseIconEl.classList.add(IS_HIDDEN_CLS);

    this.state.isSearchOpen = false;
};

Nav.prototype.toggleSearch = function() {
    if (!this.state.isSearchOpen) {
        this.openSearch();
    }

    else {
        this.closeSearch();
    }
};

Nav.prototype.showGallery = function() {
    if (!this.state.isGalleryHidden) return;

    this.galleryEl.classList.remove(IS_HIDDEN_CLS);

    this.state.isGalleryHidden = false;
};

Nav.prototype.hideGallery = function() {
    if (this.state.isGalleryHidden) return;

    this.galleryEl.classList.add(IS_HIDDEN_CLS);

    this.state.isGalleryHidden = false;
};

Nav.prototype.toggleGallery = function() {
    if (this.state.isGalleryHidden) {
        this.showGallery();
    }

    else {
        this.hideGallery();
    }
};

Nav.prototype.onScroll = function() {
    if (!this.isScrolling) {
        this.isScrolling = true;

        this.previousY = this.currentY;
        this.currentY = window.scrollY;

        if (this.currentY > this.previousY) {
            this.scrollDirection = 'down';
            this.scrollUpCount = 0;
            this.scrollDownCount += 1;
        }

        else if (this.currentY < this.previousY) {
            this.scrollDirection = 'up';
            this.scrollUpCount += 1;
            this.scrollDownCount = 0;
        }

        requestAnimationFrame(this.togglefix);
        requestAnimationFrame(this.toggleShow);
    }
};

Nav.prototype.onResize = function() {
    if (!this.isResizing) {
        this.isResizing = true;

        // Need to reset to get new offset value
        this.unfix();
        this.elOffsetTop = this.el.offsetTop;

        this.show();

        requestAnimationFrame(this.togglefix);
        requestAnimationFrame(this.toggleShow);
    }
};

const NAV = new Nav(document.querySelector('.js-c-nav'));

export default NAV;

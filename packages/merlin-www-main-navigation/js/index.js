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
    this.el.classList.add('is-fixed');
    this.logoEl.classList.remove('is-hidden');
    this.state.isFixed = true;
};

Nav.prototype.unfix = function() {
    this.el.classList.remove('is-fixed');
    this.logoEl.classList.add('is-hidden');
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
    document.body.style.overflow = 'hidden';
    this.el.classList.add('is-open');

    this.toggleOpenIconEl.classList.add('is-hidden');
    this.toggleCloseIconEl.classList.remove('is-hidden');

    this.state.isOpen = true;
};

Nav.prototype.close = function() {
    document.body.style.overflow = '';
    this.el.classList.remove('is-open');

    this.toggleOpenIconEl.classList.remove('is-hidden');
    this.toggleCloseIconEl.classList.add('is-hidden');

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
    this.el.classList.remove('is-hidden');
    this.state.isHidden = false;
};

Nav.prototype.hide = function() {
    this.el.classList.add('is-hidden');
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
    this.searchEl.classList.remove('is-hidden');

    this.searchOpenIconEl.classList.add('is-hidden');
    this.searchCloseIconEl.classList.remove('is-hidden');

    this.state.isSearchOpen = true;
};

Nav.prototype.closeSearch = function() {
    this.searchEl.classList.add('is-hidden');

    this.searchOpenIconEl.classList.remove('is-hidden');
    this.searchCloseIconEl.classList.add('is-hidden');

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
    this.galleryEl.classList.remove('is-hidden');

    this.state.isGalleryHidden = false;
};

Nav.prototype.hideGallery = function() {
    this.galleryEl.classList.add('is-hidden');

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

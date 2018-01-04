import img from '@cnbritain/merlin-www-image';
import ShowItemCarousel from '@cnbritain/merlin-www-show-card-carousel';

export default {
    "init": function() {
        img.init();

        var elsCarousel = document.querySelectorAll('.sh-item-carousel');
        var len = elsCarousel.length;
        while (len--) {
            var carousel = new ShowItemCarousel(elsCarousel[len]);
        }
    }
};
import PageManager from './page-manager';


export default class Home extends PageManager {
    constructor(context) {
        super(context);
    }

    onReady() {
        this.productHomeCarousel();
        this.customPaging();
    }

    customPaging(){
        $('.homeCarouselFeature__wrapper .slick-dots li').each(function(i){
            var slide = $(this).find('button').text();
            $(this).find('button').append('<span class="dot-stt">'+0+ +slide+'</span>');
        })
    }

    /* Product Home Carousel */
    productHomeCarousel(){
        $('.homeCarouselFeature')?.slick({
            dots: true,
            arrows: false,
            infinite: false,
            fade: true,
            slidesToShow: 1,
            slidesToScroll: 1,
        });
    }
}

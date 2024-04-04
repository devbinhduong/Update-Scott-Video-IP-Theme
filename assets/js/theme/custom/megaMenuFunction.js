import utils from '@bigcommerce/stencil-utils';

export default class megaMenuFunction {
    constructor() {}

    menuItem(num) {
        return {
            setMegaMenu(param) {
                param = $.extend({
                    style: '',
                    dropAlign: 'fullWidth',
                    dropWidth: '493px',
                    cateColumns: 1,
                    disabled: false,
                    bottomCates: '',
                    products:'',
                    productId: '',
                    label: '',
                    labelType: '',
                    content: '',
                    contentLeft: '',
                    contentRight: '',
                    images:'',
                    imagesTop: '',
                    imagesCustom: '',
                    imagesLeft: '',
                    imagesRight: ''
                }, param);

                var $scope = $('.navPages-list-custom > li:nth-child('+num+')');

                if(!$scope.hasClass('navPages-item-toggle')){
                    if (param.disabled === false) {
                        const subMegaMenu = $scope.find('> .navPage-subMenu');

                        if(param.style === 'style 1') {
                            if(!$scope.hasClass('has-megamenu')){
                                $scope.addClass('has-megamenu style-1 fullWidth');

                                if(!subMegaMenu.find('.cateArea').length){

                                    subMegaMenu.find('.container > .navPage-subMenu-list').wrap('<div class="cateArea test12121212 columns-'+param.cateColumns+'"></div>');
                                }

                                subMegaMenu.find('.imageArea').css({
                                    'width': '100%',
                                    'max-width': param.imageAreaWidth
                                });

                                subMegaMenu.find('.cateArea').css({
                                    'width': '100%',
                                    'max-width': param.cateAreaWidth
                                });

                                if (param.imagesTop.length && (param.imagesTop !== '')) {
                                    function megaImageTop(array) {
                                        var j = 2;
                                        for (var i = 0, l = array.length; i < l; i++) {
                                            j = j + 1;
                                            subMegaMenu.find('.cateArea > ul > li:nth-child(' + j + ') > .navPages-action').after(array[i]);
                                        }
                                    }
                                    megaImageTop(param.imagesTop);
                                }

                                if (!subMegaMenu.find('.bottomMegamenu').length) {
                                    subMegaMenu.append('<div class="bottomMegamenu custom-fadeInLeft" data-step-animate="0">' + param.bottomMegamenu + '</div>');
                                }

                                subMegaMenu.addClass('customScrollbar');
                            }
                        }

                        if(param.style === 'style 2') {
                            if(!$scope.hasClass('has-megamenu')){
                                $scope.addClass('has-megamenu style-2 fullWidth');

                                if(!subMegaMenu.find('.cateArea').length){
                                    subMegaMenu.find('.container > .navPage-subMenu-list').wrap('<div class="cateArea columns-'+param.cateColumns+'"></div>');
                                }

                                if(!subMegaMenu.find('.imageArea').length){
                                    subMegaMenu.find('.container').append('<div class="imageArea"><div class="megamenu-right-item custom-fadeInLeft" data-step-animate="0">'+param.imagesRight+'</div></div>');

                                    if (param.products.length && (param.products !== '')) {
                                        subMegaMenu.find('.imageArea').prepend('<div class="megamenu-left-item megamenu-product-list custom-fadeInLeft" data-step-animate="0">'+param.products+'</div>');
                                    }
                                }

                                subMegaMenu.find('.imageArea').css({
                                    'width': '100%',
                                    'max-width': param.imageAreaWidth
                                });

                                subMegaMenu.find('.cateArea').css({
                                    'width': '100%',
                                    'max-width': param.cateAreaWidth
                                });

                                subMegaMenu.addClass('customScrollbar');
                            }
                        }

                        if(param.style === 'style 3') {
                            if(!$scope.hasClass('has-megamenu')){
                                $scope.addClass('has-megamenu style-3 fullWidth');

                                if(!subMegaMenu.find('.cateArea').length){
                                    subMegaMenu.find('.container > .navPage-subMenu-list').wrap('<div class="cateArea columns-'+param.cateColumns+'"></div>');
                                }

                                if(!subMegaMenu.find('.imageArea').length){
                                    subMegaMenu.find('.container').append('<div class="imageArea"><div class="megamenu-right-item custom-fadeInLeft" data-step-animate="0">'+param.imagesRight+'</div></div>');
                                }

                                subMegaMenu.find('.imageArea').css({
                                    'width': '100%',
                                    'max-width': param.imageAreaWidth
                                });

                                subMegaMenu.find('.cateArea').css({
                                    'width': '100%',
                                    'max-width': param.cateAreaWidth
                                });

                                if (!subMegaMenu.find('.bottomMegamenu').length) {
                                    subMegaMenu.append('<div class="bottomMegamenu custom-fadeInLeft" data-step-animate="0">' + param.bottomMegamenu + '</div>');
                                }

                                subMegaMenu.addClass('customScrollbar');
                            }
                        }

                        /* Custom Mega Menu Style By Mint */
                        if(param.style === 'style custom') {
                            if(!$scope.hasClass('has-megamenu')){
                                $scope.addClass('has-megamenu style-custom fullWidth');

                                if(!subMegaMenu.find('.cateArea').length){
                                    subMegaMenu.find('.container > .navPage-subMenu-list').wrap('<div class="cateArea columns-'+param.cateColumns+'"></div>');
                                }

                                if(!subMegaMenu.find('.imageArea').length){
                                    subMegaMenu.find('.container').append('<div class="imageArea"><div class="megamenu-right-item custom-fadeInLeft" data-step-animate="0">'+param.imagesRight+'</div></div>');
                                }

                                subMegaMenu.find('.imageArea').css({
                                    'width': '100%',
                                    'max-width': param.imageAreaWidth
                                });

                                subMegaMenu.find('.cateArea').css({
                                    'width': '100%',
                                    'max-width': param.cateAreaWidth
                                });

                                subMegaMenu.addClass('customScrollbar');
                            }
                        }

                        const navPagesAction = $scope.children('.navPages-action');

                        if (param.labelType === 'new') {
                            navPagesAction.find('.text').append('<span class="navPages-label new-label">'+param.label+'</span>');
                        } else if (param.labelType === 'sale') {
                            navPagesAction.find('.text').append('<span class="navPages-label sale-label">'+param.label+'</span>');
                        } else if (param.labelType === 'hot') {
                            navPagesAction.find('.text').append('<span class="navPages-label hot-label">'+param.label+'</span>');
                        }
                    } else{
                        const navPagesAction = $scope.children('.navPages-action');

                        if (param.labelType === 'new') {
                            navPagesAction.find('.text').append('<span class="navPages-label new-label">'+param.label+'</span>');
                        } else if (param.labelType === 'sale') {
                            navPagesAction.find('.text').append('<span class="navPages-label sale-label">'+param.label+'</span>');
                        } else if (param.labelType === 'hot') {
                            navPagesAction.find('.text').append('<span class="navPages-label hot-label">'+param.label+'</span>');
                        }
                    }
                }

                return this;
            }
        }
    }
}

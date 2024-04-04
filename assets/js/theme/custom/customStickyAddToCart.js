import utils from '@bigcommerce/stencil-utils';
import _ from 'lodash';

export default function($scope, context){
    if ($('#form-action-addToCart').length) {
        var scroll = $('#form-action-addToCart').offset(),
            h_statc = $('#custom_sticky_addToCart').outerHeight(),
            scrollTop = scroll.top;

        if ($('.productView-details .productView-options [data-product-attribute="swatch"]').length) {               
            var color = $('.productView-details .productView-options [data-product-attribute="swatch"] .form-option > span').attr('title');
            $('#custom_sticky_addToCart .option-value').append('<span class="color-name"> -' + ' ' + color + '</div>');
        }

        $(window).scroll(function(){
            const $sticky = $('#custom_sticky_addToCart');

            if($(window).scrollTop() > scrollTop + 400){

                if(!$('#custom_sticky_addToCart').hasClass('show_sticky')){
                    $('#custom_sticky_addToCart').addClass('show_sticky');

                    if ($(window).width() > 550) {
                        $('#recently_bought_list').css("bottom", $('#custom_sticky_addToCart').outerHeight() + 20);
                    } else {
                        if($('#custom_sticky_addToCart').length){
                            $('#recently_bought_list').css("bottom", $('#custom_sticky_addToCart').outerHeight() + 30);
                        } else {
                            $('#recently_bought_list').css("bottom", 80);
                        }
                    }
                }
            } else{

                $('#custom_sticky_addToCart').removeClass('show_sticky');
                $('.pop-up-option').removeClass('is-open');
                $('body').removeClass('openPopupOption');

                $('.choose_options_add').removeClass('is-active');

                if ($(window).width() > 550) {
                    $('#recently_bought_list').css("bottom", 20);
                } else {
                    if($('#custom_sticky_addToCart').length){
                        $('#recently_bought_list').css("bottom", 20);
                    } else {
                        $('#recently_bought_list').css("bottom", 80);
                    }
                }
            }
        });

        $(document).on('click','.choose_options_add', function(event){
            $(this).toggleClass('is-active');
            $('.pop-up-option').toggleClass('is-open');
            $('body').addClass('openPopupOption');
        });

        $(document).on('click','.pop-up-option .modal-close', function(event){
            $(".pop-up-option").removeClass('is-open');
            $('body').removeClass('openPopupOption');
            $('.choose_options_add').removeClass('is-active');
        });

        window.onload = function(){
            if($(window).scrollTop() > scrollTop + 400){
                if(!$('#custom_sticky_addToCart').hasClass('show_sticky')){
                    $('#custom_sticky_addToCart').addClass('show_sticky');

                    if ($(window).width() > 550) {
                        $('#recently_bought_list').css("bottom", $('#custom_sticky_addToCart').outerHeight() + 40);
                    } else {
                        if($('#custom_sticky_addToCart').length){
                            $('#recently_bought_list').css("bottom", $('#custom_sticky_addToCart').outerHeight() + 30);
                        } else {
                            $('#recently_bought_list').css("bottom", 80);
                        }
                    }
                }
            }
        }
    }
}

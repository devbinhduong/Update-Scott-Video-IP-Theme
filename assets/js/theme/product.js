/*
 Import all product specific js
 */

 import utils from '@bigcommerce/stencil-utils';
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/utils/form-utils';
import modalFactory from './global/modal';
import customBundleProducts from './custom/customBundleProducts';
import customStickyAddToCart from './custom/customStickyAddToCart';
import customAskAnExpertPopup from './custom/customAskAnExpertPopup';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.$bulkPricingLink = $('[data-reveal-id="modal-bulk-pricing"]');
        this.reviewModal = modalFactory('#modal-review-form')[0];
    }

    onReady() {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);
        this.productDetails.setProductVariant();

        videoGallery();

        this.bulkPricingHandler();

        /* Custom Start */
        this.customProductTabs();
        this.showBrandImage();
        this.customRightTabContent();
        this.productFAQTab();
        this.toggleFAQTab();
        this.productTabsMobile();
        this.productShippingTab();
        this.toggleTitleRightCol();
        
        customBundleProducts($('.productView'), this.context);
        customStickyAddToCart($('.productView'), this.context);
        customAskAnExpertPopup(this.context);
        /* Custom End */

        const $reviewForm = classifyForm('.writeReview-form');

        if ($reviewForm.length === 0) return;

        const review = new Review({ $reviewForm });

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
            this.ariaDescribeReviewInputs($reviewForm);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        this.productReviewHandler();
    }

    ariaDescribeReviewInputs($form) {
        $form.find('[data-input]').each((_, input) => {
            const $input = $(input);
            const msgSpanId = `${$input.attr('name')}-msg`;

            $input.siblings('span').attr('id', msgSpanId);
            $input.attr('aria-describedby', msgSpanId);
        });
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.trigger('click');
        }
    }

    bulkPricingHandler() {
        if (this.url.indexOf('#bulk_pricing') !== -1) {
            this.$bulkPricingLink.trigger('click');
        }
    }

    /* Custom Tabs */
    customProductTabs() {
        $('.productView-description .custom-product-tab').appendTo(
            '.productView-description #tab-custom .tabContent'
        );
        $('#tab-custom .tabContent .icon-loading').hide();
        if (
            $('.productView-description #tab-custom .tabContent')
                .text()
                .trim() == ''
        ) {
            $('.productView-description .tab-custom').hide();
        }
    }

    /* Get Brand Image On Product Page */
    showBrandImage() {
        const productBrand = document.querySelector('.productView-brand');

        if (!productBrand) return;

        let brandUrl = productBrand.querySelector('a').getAttribute('href');

        fetch(brandUrl)
            .then((response) => response.text())
            .then((data) => {
                const tempElement = document.createElement('div');
                tempElement.innerHTML = data;

                const brandImage = tempElement.querySelector(
                    '.brand-image-container img'
                );

                if (brandImage) {
                    const brandImageSrc = brandImage.getAttribute('data-src');

                    if (brandImageSrc !== undefined) {
                        const imageElement = `
                        <a href="${brandUrl}">
                        <img src="${brandImageSrc}" alt="${brandImage.getAttribute(
                            'alt'
                        )}">
                        </a>
                        `;
                        productBrand.insertAdjacentHTML(
                            'afterbegin',
                            imageElement
                        );
                    }
                }
            });
    }

    
    customRightTabContent() {
        const customExpertTab = document.querySelector('.custom-expert-tab'),
            customVideoTab = document.querySelector('.custom-video-tab');

        if(!customExpertTab) {
            document.querySelector('.rightTab.rightTab--grey').style.display = 'none';
        }

        if (!customVideoTab) {
            document.querySelector('.rightTab.rightTab--video').style.display = 'none';
        }

        if(!customExpertTab && !customVideoTab) {
            document.querySelector('.productView-desc__wrapper').classList.remove('has-right-col');
            return;
        }

        const expertTabContent = document.querySelector('.rightTab-content--expert'),
            videoTabContent = document.querySelector('.rightTab-content--video');
        
        /* Append custom expert tab to expertTabCotent */
        if(expertTabContent && customExpertTab) {
            expertTabContent.appendChild(customExpertTab);
        }

        /* Append custom video tab to videoTabContent */
        if(videoTabContent && customVideoTab) {
            videoTabContent.appendChild(customVideoTab);
        }
    }

    /* FAQs Tab */
    productFAQTab(){
        if(this.context.themeSettings.show_faq_tab == true){
            if(this.context.themeSettings.show_faq_tab_type == "all"){
                const url = this.context.themeSettings.show_faq_tab_link;

                const option = {
                    template: 'custom/page/custom-page-template'
                };

                utils.api.getPage(url, option, (err, response) => {
                    $(response).appendTo('#tab-faq-mobile');

                    if ($('.productView-tab #tab-faq-mobile').text().trim() == '') {
                        $('.productView-tab #tab-faq').hide();
                    }
                });

                $('#tab-description').find('[data-faq-tab]').remove();

            } else if(this.context.themeSettings.show_faq_tab_type == "custom"){
                $('#tab-description').find('[data-faq-tab]').appendTo('#tab-faq-mobile');
            }
        }
    }

    /* FAQs tab toggle */
    toggleFAQTab() {
        $(document).on('click','.custom-faqs-content .card .title', event => {
            event.preventDefault();
            
            var target = $(event.currentTarget);

            $('.custom-faqs-content .card .title').not(target).removeClass('faq_collapsed');

            if(target.hasClass('faq_collapsed')){
                target.removeClass('faq_collapsed');
            } else{
                target.addClass('faq_collapsed');
            }

            $('.custom-faqs-content .card').each((index, element) => {
                if($('.title', element).hasClass('faq_collapsed')){
                    $(element).find('.faq_collapse').removeClass('faq_hidden');
                } else{
                    $(element).find('.faq_collapse').addClass('faq_hidden');
                }
            });
        });
    }

    // Product Tabs Mobile
    // -----------------------------------------------------------------------------
    productTabsMobile() {
        const $btnTabMobile = $('.tab-titleMobile');

        $btnTabMobile.on('click', (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            const idTab = $target.attr('href');
            const thisTop = $('.productView-description').offset().top - 20;

            if ($target.hasClass('is-active')) {
                $target.removeClass('is-active');
                $(idTab).removeClass('is-active').find('.tabContent').slideUp();
            } else {
                const $tabActiveMobile = $(
                    '.productView-description .tabs-contents .tab-content.is-active'
                );

                $btnTabMobile.removeClass('is-active');
                $target.addClass('is-active');
                $tabActiveMobile
                    .removeClass('is-active')
                    .find('.tabContent')
                    .slideUp();
                $(idTab).addClass('is-active').find('.tabContent').slideDown();

                $('body,html').animate(
                    {
                        scrollTop: thisTop,
                    },
                    1000
                );
            }
        });
    }

    /* Get Content Shipping Page */
    productShippingTab() {
        if (this.context.themeSettings.shipping_tab_url != ''&& this.context.themeSettings.show_shipping_tabs) {
            console.log("run");
            var link_page = this.context.themeSettings.shipping_tab_url;
            var descriptionTab = this.context.themeSettings.show_product_details_tabs;

            $.ajax({
               url:link_page,
               type:'GET',
               success: function(data){
                    var content = $(data).find('.page-content').html();
                    if (descriptionTab == true) {
                        $('#tab-shipping .tabContent').html(content);
                    }
               }
            });
        }
    }

    /* Right Column Description */
    toggleTitleRightCol() {
        const $titleToggle = $('.rightTab-toggle');

        if(!$titleToggle) return;

        $titleToggle.on('click', (e) => {
            e.preventDefault();

            const $target = $(e.currentTarget);
            const $rightTab = $target.parents('.rightTab');
            const $rightTabContent = $rightTab.find('.rightTab-content');

            $rightTab.toggleClass('is-open');

            if ($rightTab.hasClass('is-open')) {
                $rightTabContent.slideDown(400);
            }
            else {
                $rightTabContent.slideUp(400);
            }
        });
    }
}

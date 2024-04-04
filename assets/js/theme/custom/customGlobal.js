import utils from '@bigcommerce/stencil-utils';
import modalFactory from '../global/modal';
import { load } from 'webfontloader';
import event from '../global/jquery-migrate/event';
import { forEach } from 'lodash';

import { defaultModal } from '../global/modal';
import megaMenuEditor from './megaMenuEditor';
import loginPopup from './loginPopup';
import ajaxAddToCart from './ajaxAddToCart';
import quickShop from './quickShop';
import customGetCardInfo from './customGetCardInfo';

export default function(context) {
    const themeSettings = context.themeSettings;

    var $header = $('header.header'),
        height_header = $header.outerHeight(),
        header_top_height = $('.headerTop').outerHeight();

    var scroll_position = $(window).scrollTop();

    var check_JS_load = true;

    /* Contains all functions  that are needed to be executed after JS is loaded */
    function loadFunction () {
        if(check_JS_load) {
            check_JS_load = false;
            const wWidth = window.innerWidth;

            /* Add global function here */
            closeSidebar();
            clickOverlay();
            searchFormMobile();

            if (wWidth <= 1024) {
                searchMobileClick();
            }

            /* Mega Menu Editor */
            megaMenuEditor(context);
            activeMenuMobile();

            /* Logion  / Register Modal */
            authPopup();
            authSidebarMobile();
            ajaxAddToCart(context);
            quickShop(context);
            sidebarMobile();
            openMenuDropdown();
            stopPropagationSubMenu();

            if (!document.body.classList.contains('page-type-login')) {
                loginPopup();
            }
            toogleFooterMobile();

            /* About Us Page */
            aboutUsBrandSlider();
            loadAnimateCount();
            playVideoBanner();
            companyHistorySlider();
            aboutUsServiceSlider();

            /* Product Home Banner Slick */
            homeProductBannerSlider();

            window.matchMedia('(max-width: 550px)').addEventListener('change', () => {
                homeProductBannerSlider();
            });

            customGetCardInfo(context);

            back_to_top();

            if(context.themeSettings.disable_open_devtoll) {
                deniUserAction();
            }
        }
    }

    function eventLoad(){
        /* Load when DOM ready */
        window.addEventListener('load', (e) =>{
            /* Global Slick Slider */
            const sectionSlicks = document.querySelectorAll('.section-slick');
            if(sectionSlicks.length > 0) {
                for(let i = 0; i < sectionSlicks.length; i++) {
                    const sectionSlick = sectionSlicks[i];
                    const sectionSlickOptions = sectionSlick.getAttribute('data-slick-options');
                    if(sectionSlickOptions) {
                        const options = JSON.parse(sectionSlickOptions);
                        $(sectionSlick).slick(options);
                    }
                }
            }
        });

        /* Load Section when scroll */
        sectionLoad();

        /* Load when scroll */
        $(window).on('scroll', (e) => {
            const $target = $(e.currentTarget);
            const tScroll = $target.scrollTop();

            headerSticky(tScroll);
        });

        /* Load when user action on site */
        ['keydown', 'mousemove', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                loadFunction();
            });
        });

        /* Load when resize */
        window.addEventListener('resize', (e) => {
            searchFormMobile();
            activeMenuMobile();
        });
    }
    eventLoad();

    /* Hide all Sidebar */
    function hideAllSidebar() {
        const body = document.body,
            menuMobileIcon = document.querySelector('.mobileMenu-toggle'),
            searchMobileButton = document.querySelector("[data-search='quickSearch']"),
            pageSidebar = document.querySelector('.page-sidebar'),
            pageSidebarMobile = document.querySelector('.page-sidebar-mobile'),
            authSidebarMobile = document.querySelector('.custom-auth-sidebar');

        /* Hide menu sidebar */
        if(body.classList.contains('has-activeNavPages')) {
            menuMobileIcon.click();
        }

        searchMobileButton.classList.remove('is-open');
        body.classList.remove('openSearchMobile');
        body.classList.remove('openSidebar');
        body.classList.remove('openAuthSidebar');
        authSidebarMobile?.classList.remove('is-open');
        pageSidebar?.classList.remove('is-open');
        pageSidebarMobile?.classList.remove('is-open');

    }

    /* Close sidebar */
    function closeSidebar() {
        const closeButtons = document.querySelectorAll('.custom-sidebar-close');
        if(!closeButtons) return;
        
        for(let i = 0; i < closeButtons.length; i++) {
            closeButtons[i].addEventListener('click', (e) => {
                e.preventDefault();
                hideAllSidebar();
            });
        }
    }

    function clickOverlay() {
        const backgroundOverlay = document.querySelector('.background-overlay');
        if(!backgroundOverlay) return;

        backgroundOverlay.addEventListener('click', (e) => {
            hideAllSidebar();
        });
    }

    /* Custom Animate */
    function customAnimate(section) {
        if(section.matches('.animate-loaded')) return;

        section.classList.add('animate-loaded');

        section.classList.add('animated');
    }

    function sectionLoad() {
        const handler = (entries, observer) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    const section = entry.target;
                    const sectionType = section.getAttribute('data-section-load');

                    switch(sectionType) {
                        case 'animation':
                            customAnimate(section);
                            break;
                        case 'home-product-banner':
                            customSpecialProduct(context);
                            break;
                        default:
                            break;
                    }
                }
            });
        }

        const sections = document.querySelectorAll('[data-section-load]'),
        options = {
            threshold: .05
        };

        if(!sections) return;

        const observer = new IntersectionObserver(handler, options);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    /* Search Mobile */
    function searchFormMobile() {
        const quickSearchForm = document.getElementById("quickSearch"),
            hasOnDesktop = document.querySelector('.item--quicksearch #quickSearch'),
            searchSidebarDesktop = document.querySelector('.item--quicksearch'),
            searchSidebarMobile = document.querySelector('#custom-search-mobile .custom-sidebar-wrapper');

        if(window.innerWidth <= 1024) {
            if(hasOnDesktop) {
                searchSidebarMobile.appendChild(quickSearchForm);
            } 
        } else {
            if(!hasOnDesktop) {
                searchSidebarDesktop.appendChild(quickSearchForm);
            }
        }
    }

    function searchMobileClick() {
        const body = document.body,
            searchMobileButton = document.querySelector("[data-search='quickSearch']");

        if(!searchMobileButton) return;

        searchMobileButton.addEventListener('click', (e) => {
            e.preventDefault();
            if(searchMobileButton.classList.contains('is-open')) {
                body.classList.remove('openSearchMobile');
                searchMobileButton.classList.remove('is-open');
            } else {
                body.classList.add('openSearchMobile');
                searchMobileButton.classList.add('is-open');
            }
        });
    }

    function activeMenuMobile() {
        var menuPc = document.querySelector('#menu .navPages-list:not(.navPages-list--user)'),
            menuMobile = document.querySelector('#custom-menu-mobile .navPages-list:not(.navPages-list--user)'),
            menuMobileToggle = document.querySelector('.mobileMenu-toggle');

        if (window.innerWidth <= 1024) {
            menuMobileToggle.addEventListener('click', function(event) {
                if (menuPc) {
                    if (!menuMobile.children.length) {
                        while (menuPc.children.length > 0) {
                            menuMobile.appendChild(menuPc.children[0]);
                        }
                    }
                }
            });
        }else {
            if (menuPc) {
                if (!menuPc.children.length) {
                    while (menuMobile.children.length > 0) {
                        menuPc.appendChild(menuMobile.children[0]);
                    }
                }
            }
        }

    }

    function authPopup() {
        let authButton = document.querySelector("[data-login-form]");

        if(!authButton) return;

        authButton.addEventListener('click', (e) => {
            e.preventDefault();

            const target = e.currentTarget;

            if (!document.body.classList.contains('page-type-login')) {
                target.nextElementSibling.classList.toggle('is-open'); 
            } else {
                $('html, body').animate(
                    {
                        scrollTop: $('.login').offset().top,
                    },
                    700
                );
            }
        });

        document.addEventListener('click', (event) => {
            const customAuthPopup = document.querySelector('.custom-auth-popup');
        
            if (customAuthPopup.classList.contains('is-open')) {
                if (
                    !event.target.closest('.custom-auth-popup') &&
                    !event.target.closest('[data-login-form]')
                ) {
                    customAuthPopup.classList.remove('is-open');
                }
            }
        });
    }
    
    function authSidebarMobile() {
        const loginMobileButton = document.querySelector("[data-login-form-mobile]"),
            authSidebar = document.querySelector('.custom-auth-sidebar');

        if(!loginMobileButton || !authSidebar) return;

        loginMobileButton.addEventListener('click', (e) => {
            e.preventDefault();

            if (!document.body.classList.contains('page-type-login')) {
                if(authSidebar.classList.contains('is-open')) {
                    authSidebar.classList.remove('is-open');
                    document.body.classList.remove('openAuthSidebar');
                } else {
                    authSidebar.classList.add('is-open');
                    document.body.classList.add('openAuthSidebar');
                }
                
            } else {
                $('html, body').animate(
                    {
                        scrollTop: $('.login').offset().top,
                    },
                    700
                );
            }
        })
    }

    function headerSticky(tScroll) {
        if (themeSettings.show_sticky_header) {
            if (tScroll > header_top_height && tScroll < scroll_position) {
                if (!$('.header-height').length) {
                    $header.before(
                        '<div class="header-height" style="height: ' +
                            height_header +
                            'px"></div>'
                    );
                }
                $header.addClass('is-sticky');
                $header.css('animation-name', 'fadeInDown');
            } else {
                $header.removeClass('is-sticky');
                $('.header-height').remove();
                $header.css('animation-name', '');
            }

            scroll_position = tScroll;
        }
    }

    function toogleFooterMobile() {
        const $footerHeadingToggle = $('.footer-info-heading--toggle');

        $footerHeadingToggle.on('click', (e) => {
            e.preventDefault();
            const wWidth = window.innerWidth;

            if (wWidth < 768) {
                const $target = $(e.currentTarget);
                const $thisFooterInfo = $target.parents('.footer-info-col');
                const $thisFooterInfo_list = $thisFooterInfo.find('.footer-info-list');

                $thisFooterInfo.toggleClass('open-dropdown');

                if ($thisFooterInfo.hasClass('open-dropdown')) {
                    $thisFooterInfo_list.slideDown(400);
                }
                else {
                    $thisFooterInfo_list.slideUp(400);
                }
            }
        });
    }

    function customSpecialProduct(){
        let productIDList = document.querySelectorAll('.productBanner__item');

        for(let productID of productIDList) {
            const productId = productID.getAttribute('data-special-product-id');

            const options ={
                template: 'custom/products/card-tmp'
            }
    
            utils.api.product.getById(productId, options, (err, response) => {
                let productSpecial = productID.querySelector('.custom-special-product');
                
                if(productSpecial) {
                    productSpecial.innerHTML = response;
                }
            });
        }
    }
    /* Slick Brand On About Us Page */
    function aboutUsBrandSlider() {
        $('.ourBrands__list')?.slick({
            dots: false,
            arrows: true,
            infinite: false,
            mobileFirst: true,
            slidesToShow: 1,
            slidesToScroll: 1,

            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 5,
                    },
                },
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 4,
                    },
                },
                {
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 3,
                    },
                },
                {
                    breakpoint: 551,
                    settings: {
                        slidesToShow: 2,
                        dots: false,
                        arrows: true,
                    },
                },
            ],
        });
    }

    function animateCount(target, start, end, duration) {
        let range = end - start;
        let current = start;
        let increment = end > start ? 1 : -1;
        let stepTime = Math.abs(Math.floor(duration / range));

        let timer = setInterval(function() {
            current += increment;
            target.innerHTML = current;

            if (current >= end) {
                clearInterval(timer);
            }

        }, stepTime);
    }

    function loadAnimateCount() {
        let countElements = document.querySelectorAll('.count-number-animation'),
            sectionLoadAnimate = document.querySelector('[data-animation-count]');

        if (!sectionLoadAnimate || !countElements) return;

        let bounding = sectionLoadAnimate.getBoundingClientRect();

        // Check the element is visible in view
        if (bounding.top < window.innerHeight && bounding.bottom >= 0) {
            for(let countElement of countElements) {
                let endCount = parseInt(countElement.textContent, 10);
                let startCount = 0;
                let getThousandsNumber = 0;

                if (endCount > 4000) {
                    startCount = 4000;
                }
                
                if(getThousandsNumber > 0) {
                    startCount = getThousandsNumber;
                }
                
                let duration = 2000;
                animateCount(countElement, startCount, endCount, duration);

                /* Remove data after loaded animation */
                sectionLoadAnimate.removeAttribute('data-animation-count');
            }
        }
    }

    function playVideoBanner() {
        const videoBannerButton = document.querySelector(".bannerTextVideo__button");

        if(!videoBannerButton) return;

        const modal = defaultModal();
        const dataVideo = videoBannerButton.getAttribute("data-video-link");
        const videoId = dataVideo.match(/[?&]v=([^&]+)/)[1];

        if(!videoId) {
            /* Hide videoBannerButton button */
            videoBannerButton.style.display = "none";
            return;
        };

        const videoIframe = `<iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;

        videoBannerButton.addEventListener('click', (e) => {
            e.preventDefault();

            modal.open();
            document.querySelector("#modal").classList.add('bannerTextVideo__modal')
            modal.updateContent(videoIframe);
        })
    }

    function companyHistorySlider() {
        $('.companyHistory__list').slick({
            centerMode: true,
            centerPadding: '190px',
            slidesToShow: 3,
            arrows: false,
            infinite: true,
            autoplay: false,
            autoplaySpeed: 2500,
            responsive: [
              {
                breakpoint: 1400,
                settings: {
                  arrows: false,
                  centerMode: true,
                  centerPadding: '80px',
                  slidesToShow: 2
                }
              },
              {
                breakpoint: 767,
                settings: {
                  arrows: true,
                  centerMode: true,
                  centerPadding: '75px',
                  slidesToShow: 1
                }
              },
              {
                breakpoint: 551,
                settings: {
                  arrows: true,
                  centerMode: true,
                  centerPadding: '0',
                  slidesToShow: 1
                }
              }
            ]
          });
    }


    /* Slick Service On About Us Page */
    function aboutUsServiceSlider() {
        $('.serviceSection__list')?.slick({
            dots: false,
            arrows: true,
            infinite: false,
            mobileFirst: true,
            slidesToShow: 1,
            slidesToScroll: 1,

            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 4,
                    },
                },
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                    },
                },
                {
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 2,
                    },
                },
            ],
        });
    }

    function homeProductBannerSlider() {
        if (window.innerWidth > 550) {
            $('.productBanner__list.slick-initialized').slick('unslick');

        } else {
            $('.productBanner__list').slick({
                dots: false,
                arrows: true,
                infinite: false,
                mobileFirst: true,
                slidesToShow: 1.3,
                slidesToScroll: 1
            });
        }
    }

    function sidebarMobile() {
        $('.page-sidebar-mobile').on('click', (event) => {
            if ($(event.currentTarget).hasClass('is-open')) {
                $(event.currentTarget).removeClass('is-open');
                $('.page-sidebar').removeClass('is-open');
                $('body').removeClass('openSidebar');
            } else {
                $(event.currentTarget).addClass('is-open');
                $('.page-sidebar').addClass('is-open');
                $('body').addClass('openSidebar');
            }
        });

        $('.page-sidebar .page-sidebar-close').on('click', (event) => {
            event.preventDefault();
            $('.page-sidebar-mobile').removeClass('is-open');
            $('.page-sidebar').removeClass('is-open');
            $('body').removeClass('openSidebar');
        });
    }

    function openMenuDropdown() {
        const menuList = document.querySelectorAll('.navPages-list-custom .navPages-item.has-dropdown');

        if (window.innerWidth > 1024) {
            for (let menuItem of menuList) {

                menuItem.addEventListener('click', (e) => {
                    e.preventDefault();

                    forEach(menuList, (item) => {
                        if (item.classList.contains('is-open') && item !== menuItem) {
                            item.classList.remove('is-open');
                            item.classList.remove('animated');
                        }
                    });

                    menuItem.classList.toggle('animated');
                    menuItem.classList.toggle('is-open');
                });
            }
        }
    }

    function stopPropagationSubMenu() {
        const menuItems2 = document.querySelectorAll('.navPage-subMenu-item-child .navPage-subMenu-action');

        if(!menuItems2) return;

        if(window.innerWidth > 1024) {
            for(let menuItem of menuItems2) {
                menuItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        }

    }

    /* Back To Top */
    function back_to_top() {
        var offset = $(window).height() / 2;
        const backToTop = $('#back-to-top');

        $(window).scroll(function () {
            $(this).scrollTop() > offset
                ? backToTop.addClass('is-visible')
                : backToTop.removeClass('is-visible');
        });

        backToTop.on('click', function (event) {
            event.preventDefault();
            $('body,html').animate(
                {
                    scrollTop: 0,
                },
                1000
            );
        });
    }
    



    function deniUserAction() {
        /* Disable Open DevTool */
        document.onkeydown = function (e) {
            if (e.keyCode === 123) {
                return false;
            }

            if (
                e.ctrlKey &&
                (e.keyCode === 67 ||
                    e.keyCode === 73 ||
                    e.keyCode === 86 ||
                    e.keyCode === 86 ||
                    e.keyCode === 117)
            ) {
                return false;
            } else {
                return true;
            }
        };

        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });

        /* Disable Select Element */
        document.onselectstart = new Function('return false');
    
        /* Disable Copy */
        document.oncopy = new Function('return false');

        /* Clear All Site If User Open Devtools */
        // const threshold = 160;
      
        // function checkWindowSize() {
        //   let widthThreshold = window.outerWidth - window.innerWidth > threshold;
        //   let heightThreshold = window.outerHeight - window.innerHeight > threshold;
        //   return widthThreshold || heightThreshold;
        // }
      
        // setInterval(() => {
        //   if (checkWindowSize()) {
        //      document.documentElement.innerHTML = '';
        //      console.clear();
        //      return '';
        //   }
        // }, 100);
    }
}

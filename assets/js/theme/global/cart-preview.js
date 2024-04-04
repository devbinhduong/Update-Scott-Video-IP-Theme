import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import utils from '@bigcommerce/stencil-utils';
import quickEditCart from '../custom/quickEditCart';

export const CartPreviewEvents = {
    close: 'closed.fndtn.dropdown',
    open: 'opened.fndtn.dropdown',
};

export default function (secureBaseUrl, cartId, context) {
    const loadingClass = 'is-loading';
    const $cart = $('[data-cart-preview]');
    const $cartDropdown = $('#cart-preview-dropdown');
    const $cartLoading = $('<div class="loadingOverlay"></div>');

     /* Custom Start */
     const $cart2 = $('[data-cart-preview2]');
     const $cartDropdown2 = $('#custom-cart-sidebar .custom-sidebar-wrapper');

    const $body = $('body');

    if (window.ApplePaySession) {
        $cartDropdown.addClass('apple-pay-supported');
    }

    $body.on('cart-quantity-update', (event, quantity) => {
        $cart.attr('aria-label', (_, prevValue) => prevValue.replace(/\d+/, quantity));

        if (!quantity) {
            $cart.addClass('navUser-item--cart__hidden-s');
        } else {
            $cart.removeClass('navUser-item--cart__hidden-s');
        }

        $('.cart-quantity')
            .text(quantity)
            .toggleClass('countPill--positive', quantity > 0);
        if (utils.tools.storage.localStorageAvailable()) {
            localStorage.setItem('cart-quantity', quantity);
        }
    });

     /* Custom Start */
     if (!$('body').hasClass('page-type-cart')) {
        quickEditCart(context);

        $cart.on('click', event => {
            const options = {
                template: 'common/cart-preview',
            };
    
            // Redirect to full cart page
            //
            // https://developer.mozilla.org/en-US/docs/Browser_detection_using_the_user_agent
            // In summary, we recommend looking for the string 'Mobi' anywhere in the User Agent to detect a mobile device.
            if (/Mobi/i.test(navigator.userAgent)) {
                return event.stopPropagation();
            }
    
            event.preventDefault();
    
            /* Custom Start */
            $body.toggleClass('openCartDropdown');
            $cartDropdown2.empty();
    
            $cartDropdown
                .addClass(loadingClass)
                .html($cartLoading);
            $cartLoading
                .show();
    
            utils.api.cart.getContent(options, (err, response) => {
                $cartDropdown
                    .removeClass(loadingClass)
                    .html(response);
                $cartLoading
                    .hide();
            });
        });

        $cart2.on('click', event => {
            const options = {
                template: 'common/cart-preview',
            };
            event.preventDefault();
    
            $body.toggleClass('openCartSidebar');
    
            $cartDropdown.empty();
    
            $cartDropdown2
                .addClass(loadingClass)
                .html($cartLoading);
            $cartLoading
                .show();
    
            utils.api.cart.getContent(options, (err, response) => {
                $cartDropdown2
                    .removeClass(loadingClass)
                    .html(response);
                $cartLoading
                    .hide();
            });
        });
    }

    let quantity = 0;

    if (cartId) {
        // Get existing quantity from localStorage if found
        if (utils.tools.storage.localStorageAvailable()) {
            if (localStorage.getItem('cart-quantity')) {
                quantity = Number(localStorage.getItem('cart-quantity'));
                $body.trigger('cart-quantity-update', quantity);
            }
        }

        // Get updated cart quantity from the Cart API
        const cartQtyPromise = new Promise((resolve, reject) => {
            utils.api.cart.getCartQuantity({ baseUrl: secureBaseUrl, cartId }, (err, qty) => {
                if (err) {
                    // If this appears to be a 404 for the cart ID, set cart quantity to 0
                    if (err === 'Not Found') {
                        resolve(0);
                    } else {
                        reject(err);
                    }
                }
                resolve(qty);
            });
        });

        // If the Cart API gives us a different quantity number, update it
        cartQtyPromise.then(qty => {
            quantity = qty;
            $body.trigger('cart-quantity-update', quantity);
        });
    } else {
        $body.trigger('cart-quantity-update', quantity);
    }


     /* Custom Start */
     $(document).on('click', event => {
        if (($(event.target).closest('[data-cart-preview]').length === 0) && ($(event.target).closest('#cart-preview-dropdown').length === 0) && ($(event.target).closest('#modal').length === 0) && ($(event.target).closest('[data-cart-edit-item-remove]').length === 0)){
            $('body').removeClass('openCartDropdown');
        }
    });
    
    $(document).on('click', event => {
        if (($(event.target).closest('[data-cart-preview2]').length === 0) && ($(event.target).closest('#custom-cart-sidebar').length === 0) && ($(event.target).closest('#modal').length === 0) && ($(event.target).closest('[data-cart-edit-item-remove]').length === 0)){
            $('body').removeClass('openCartSidebar');
        }
    });

    $(document).on('click','#custom-cart-sidebar .custom-sidebar-close', (event) => {
        event.preventDefault();

        $('body').removeClass('openCartSidebar');
    });

    $(document).on('click','.previewCart .previewCartItem-remove', (event) => {
        event.preventDefault();
        const itemId = $(event.currentTarget).data('cartItemid');

        cartRemoveItem(itemId);
    });

    $(document).on('focus','.previewCart .form-input--incrementTotal', (event) => {
        const $target = $(event.currentTarget);
        $target.data('preVal', $target.val());
    });    
    
    $(document).on('change','.previewCart .form-input--incrementTotal', (event) => {
        const $target = $(event.currentTarget);
        var preVal= $target.data('preVal');
        event.preventDefault();

        cartUpdateQtyTextChange($target, preVal);
    });

    function cartRemoveItem(itemId) {
        utils.api.cart.itemRemove(itemId, (err, response) => {
            if (response.data.status === 'succeed') {
                refreshContent(true);
            } else {
                alert(response.data.errors.join('\n'));
            }
        });
    }

    function listenQuantityChange() {
        $(document).on('click', '[data-cart-edit-item-quantity] button', event => {
            event.preventDefault();
            const $target = $(event.currentTarget);
            const itemId = $target.data('cart-itemid');
            const $el = $target.siblings('.form-input--incrementTotal');
            const maxQty = parseInt($el.data('quantityMax'), 10);
            const minQty = parseInt($el.data('quantityMin'), 10);
            const oldQty = parseInt($el.val(), 10);
            const minError = $el.data('quantityMinError');
            const maxError = $el.data('quantityMaxError');
            const newQty = $target.data('action') === 'inc' ? oldQty + 1 : oldQty - 1;
            const stock = $el.data('stock');
            const proTitle= $('.product-edit-title').html();
            let invalidEntry;

            // Does not quality for min/max quantity
            if (!newQty) {
                invalidEntry = newQty;
                $el.val(oldQty);
                alert(`${invalidEntry} is not a valid entry`)
                
            } else if (newQty < minQty) {
                $el.val(oldQty);
                alert(minError)
                
            } else if (maxQty > 0 && newQty > maxQty) {
                $el.val(oldQty);
                alert(maxError)
            } else if (newQty > stock) {
                $el.val(oldQty);
                alert("We don't have enough "+ proTitle +" stock on hand for the quantity you selected. Please try again.");
            } else {
               $el.val(newQty);
            }            
        });

        $(document).on('focus','[data-cart-edit-item-quantity] .form-input--incrementTotal', (event) => {
            const $target = $(event.currentTarget);
            $target.data('preval', $target.val());
        });  

        $(document).on('change','[data-cart-edit-item-quantity] .form-input--incrementTotal', (event) => {
            const $target = $(event.currentTarget);
            var preVal= $target.data('preval');
            event.preventDefault();

            listenQuantityChangeUpdate($target, preVal);
        });
    }
    listenQuantityChange();

    function listenQuantityChangeUpdate($target, preVal = null) {
        const itemId = $target.data('cart-itemid');
        const $el = $target;
        const maxQty = parseInt($el.data('quantityMax'), 10);
        const minQty = parseInt($el.data('quantityMin'), 10);
        const oldQty = preVal !== null ? preVal : minQty;
        const minError = $el.data('quantityMinError');
        const maxError = $el.data('quantityMaxError');
        const newQty = parseInt(Number($el.val()), 10);
        const stock = $el.data('stock');
        const proTitle= $('.product-edit-title').html();
        let invalidEntry;

        // Does not quality for min/max quantity
        if (!newQty) {
            invalidEntry = $el.val();
            $el.val(oldQty);
            alert(`${invalidEntry} is not a valid entry`)
            
        } else if (newQty < minQty) {
            $el.val(oldQty);
            alert(minError)
            
        } else if (maxQty > 0 && newQty > maxQty) {
            $el.val(oldQty);
            alert(maxError)
        } else if (newQty > stock) {
            $el.val(oldQty);
            alert("We don't have enough "+ proTitle +" stock on hand for the quantity you selected. Please try again.");
        }
    }

    function cartUpdateQtyTextChange($target, preVal = null) {
        const itemId = $target.data('cart-itemid');
        const $el = $(`#qty-${itemId}`);
        const maxQty = parseInt($el.data('quantityMax'), 10);
        const minQty = parseInt($el.data('quantityMin'), 10);
        const oldQty = preVal !== null ? preVal : minQty;
        const minError = $el.data('quantityMinError');
        const maxError = $el.data('quantityMaxError');
        const newQty = parseInt(Number($el.val()), 10);
        let invalidEntry;

        // Does not quality for min/max quantity
        if (!newQty) {
            invalidEntry = $el.val();
            $el.val(oldQty);
            return swal.fire({
                text: `${invalidEntry} is not a valid entry`,
                icon: 'error',
            });
        } else if (newQty < minQty) {
            $el.val(oldQty);
            return swal.fire({
                text: minError,
                icon: 'error',
            });
        } else if (maxQty > 0 && newQty > maxQty) {
            $el.val(oldQty);
            return swal.fire({
                text: maxError,
                icon: 'error',
            });
        }

        utils.api.cart.itemUpdate(itemId, newQty, (err, response) => {
            if (response.data.status === 'succeed') {
                // if the quantity is changed "1" from "0", we have to remove the row.
                const remove = (newQty === 0);
                refreshContent(remove);
            } else {
                $el.val(oldQty);
                swal.fire({
                    text: response.data.errors.join('\n'),
                    icon: 'error',
                });
            }
        });
    }

    function refreshContent(remove) {
        const options = {
            template: 'common/cart-preview',
        };

        if($body.hasClass('openCartDropdown')){
            $cartDropdown
                .addClass(loadingClass)
                .prepend($cartLoading);
            $cartLoading
                .show();

            utils.api.cart.getContent(options, (err, response) => {
                $cartDropdown
                    .removeClass(loadingClass)
                    .html(response);
                $cartLoading
                    .hide();

                const quantity = $(response).find('[data-cart-quantity]').data('cartQuantity') || $('[data-cart-quantity]').data('cartQuantity') || 0;

                $body.trigger('cart-quantity-update', quantity);
            });
        } else if($body.hasClass('openCartSidebar')){
            $cartDropdown2
                .addClass(loadingClass)
                .html($cartLoading);
            $cartLoading
                .show();

            utils.api.cart.getContent(options, (err, response) => {
                $cartDropdown2
                    .removeClass(loadingClass)
                    .html(response);
                $cartLoading
                    .hide();

                const quantity = $(response).find('[data-cart-quantity]').data('cartQuantity') || $('[data-cart-quantity]').data('cartQuantity') || 0;

                $body.trigger('cart-quantity-update', quantity);
            });
        }

        if(location.pathname == "/cart.php"){
            cart_page.refreshContent(remove);
        }
    }
}

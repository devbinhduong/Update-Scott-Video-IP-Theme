import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';
import { defaultModal, showAlertModal } from '../global/modal';
import swal from 'sweetalert2';
import ShippingEstimator from '../cart/shipping-estimator';
import giftCertCheck from '../common/gift-certificate-validator';
import Cart from '../cart';

export default function (context) {
	var $cartContent = $('[data-cart-content]');
	var $cartMessages = $('[data-cart-status]');
    var $cartTotals = $('[data-cart-totals]');
    var $overlay = $('[data-cart] .loadingOverlay');

	if(context.themeSettings.quickEditCart == true){	    
		$(document).on('click', '[data-cart-edit-id]', event => {
			event.preventDefault();
			
			const $target = $(event.currentTarget),
				productId = $target.data('cart-edit-id'),
	            itemId = $target.data('cartItemid'),
	            $qty = $target.data('cart-edit-quantity'),
	            itemImg = $target.parents('[data-cart-edit-productItem]').find('img');

	        const modal = defaultModal(),
	        	options = {
		            template: 'cart/modals/configure-product-2',
		        },
		        options2 = {
		            template: 'cart/modals/configure-product-3',
		        };

		    modal.$modal.removeClass().addClass('modal modal--editOptions');
	        modal.open({ size: 'medium' });

	        utils.api.productAttributes.configureInCart(itemId, options2, (err2, response2) => {
	            utils.api.product.getById(productId, options, (err, response) => {
	                modal.updateContent(response);

	                modal.$content.find('[data-product-edit-item-id]').attr('data-product-edit-item-id', itemId);
	                modal.$content.find('.product-edit-info [data-cart-edit-item]').prepend(response2.content);
	                modal.$content.find('.product-edit-image').append(itemImg.clone());
	                modal.$content.find('.cart-edit-row .form-input--incrementTotal').val($qty);
	                modal.$content.find('.cart-edit-row .form-input--incrementTotal').attr({
	                    'cart-itemid' : itemId,
	                    'id' : 'editqty-' + itemId
	                });

	                const $form = modal.$content.find('.form');
	                const $submit = $('[data-edit-cart-add-to-cart]');
	                const $messageBox = $('.alertMessageBox');
	                const $productOptionsElement = $('[data-product-option-change2]');
	                const hasOptions = $productOptionsElement.html().trim().length;
	                const hasDefaultOptions = $productOptionsElement.find('[data-default]').length;

	                if (hasDefaultOptions && hasOptions) {
	                    utils.api.productAttributes.optionChange(productId, $form.serialize(), 'products/bulk-discount-rates', (err, response) => {
	                        const attributesData = response.data || {};

	                        updateProductAttributes($form, attributesData);

	                        modal.$content.find('.cart-edit-row .form-input--incrementTotal').attr('data-stock', attributesData.stock);

	                        if (hasDefaultOptions) {
	                            if (attributesData.purchasing_message) {
	                                $('p.alertBox-message', $messageBox).text(attributesData.purchasing_message);
	                                $submit.prop('disabled', true);
	                                $messageBox.show();
	                            } else {
	                                $submit.prop('disabled', false);
	                                $messageBox.hide();
	                            }

	                            if (!attributesData.purchasable || !attributesData.instock) {
	                                $submit.prop('disabled', true);
	                            } else {
	                                $submit.prop('disabled', false);
	                            }

	                            if (_.isObject(attributesData.price)){
	                                if (attributesData.price.with_tax) {
	                                    $form.find('[data-cart-edit-item-price] .price').html(attributesData.price.with_tax.formatted);
	                                }

	                                if (attributesData.price.without_tax) {
	                                    $form.find('[data-cart-edit-item-price] .price').html(attributesData.price.without_tax.formatted);
	                                }
	                            }
	                        }
	                    });
	                }

	                setProductVariant($form);
	            });
	        });
		});

		listenQuantityChange();

		$(document).on('change', '[data-product-option-change2]' , event => {
	        const $changedOption = $(event.target);
	        const $form = $changedOption.parents('form');
	        const $submit = $('[data-edit-cart-add-to-cart]');
	        const $messageBox = $('.alertMessageBox');
	        const item = $('[name="product_id"]', $form).val();

	        utils.api.productAttributes.optionChange(item, $form.serialize(), 'products/bulk-discount-rates', (err, result) => {
	            const data = result.data || {};

	            if (err) {
	                swal({
	                    text: err,
	                    icon: 'error',
	                });
	                return false;
	            }

	            updateProductAttributes($form, data);
	            
	            if (data.purchasing_message) {
	                $('p.alertBox-message', $messageBox).text(data.purchasing_message);
	                $submit.prop('disabled', true);
	                $messageBox.show();
	            } else {
	                $submit.prop('disabled', false);
	                $messageBox.hide();
	            }

	            if (!data.purchasable || !data.instock) {
	                $submit.prop('disabled', true);
	            } else {
	                $submit.prop('disabled', false);
	            }

	            if (_.isObject(data.price)) {
	                if (data.price.with_tax) {
	                    $form.find('[data-cart-edit-item-price] .price').html(data.price.with_tax.formatted);
	                }

	                if (data.price.without_tax) {
	                    $form.find('[data-cart-edit-item-price] .price').html(data.price.without_tax.formatted);
	                }
	            }
	        });

	        setProductVariant($form);
	    });

	    $(document).on('click', '.product-addmore-button', event => {
	        event.preventDefault();

	        const $form = $('.product-edit-info [data-product-option-change2]').eq(0).clone();

	        $form.appendTo('.product-edit-info');
	    });

	    $(document).on('click', '[data-cart-edit-item-remove] a', event => {
	        event.preventDefault();

	        const $form = $(event.currentTarget).parents('.product-edit-change');

	        $form.remove();
	    });

	    $(document).on('click', '[data-edit-cart-add-to-cart]', event => {
	        const $form = $('[data-product-option-change2] form');
	        const itemId = $('.product-edit-detail .product-edit').data('product-edit-item-id');
	        var arrPro = new Array();

	        $form.each(function(i, val) {
	            arrPro.push(i);
	        });

	        var check = false;

	        if (arrPro.length > 0) {
	            check = checkProduct($form, arrPro);
	        }

	        if (check) {
	            if (arrPro.length > 0) {
	                utils.api.cart.itemRemove(itemId, (err, response) => {
	                    if (response.data.status === 'succeed') {
	                        $('[data-edit-cart-add-to-cart]').addClass('loading');
	                        addToCart($form, 0, arrPro, itemId);
	                    } else {
	                        swal({
			                    text: response.data.errors.join('\n'),
			                    icon: 'error',
			                });

	                        updateCartContent();
	                    }
	                });
	            }
	        } else {
	            const errorMessage = 'Please make sure all options have been filled in.';

	            if (errorMessage) {
	                const tmp = document.createElement('DIV');
	                tmp.innerHTML = errorMessage;

	                return showAlertModal(tmp.textContent || tmp.innerText);
	            }
	        }

	        event.preventDefault();
	    });

	    function addToCart(form, i, arrP, cartId) {
	        if (window.FormData === undefined) {
	            return;
	        }

	        var k = arrP[i];

	        utils.api.cart.itemAdd(filterEmptyFilesFromForm(new FormData(form[k])), (err, response) => {
	            const errorMessage = err || response.data.error;

	            if (errorMessage) {
	                const tmp = document.createElement('DIV');
	                tmp.innerHTML = errorMessage;

	                return showAlertModal(tmp.textContent || tmp.innerText);
	            }

	            i++;

	            if (i >= arrP.length) {
	                const modal = defaultModal();
	                modal.close();

	                updateCartContent();

	                return;
	            }

	            addToCart(form, i, arrP);
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

	            return swal({
	                text: `${invalidEntry} is not a valid entry`,
	                icon: 'error',
	            });
	        } else if (newQty < minQty) {
	            $el.val(oldQty);
	            
	            return swal({
	                text: minError,
	                icon: 'error',
	            });
	        } else if (maxQty > 0 && newQty > maxQty) {
	            $el.val(oldQty);
	           
	            return swal({
	                text: maxError,
	                icon: 'error',
	            });
	        } else if (newQty > stock) {
	            $el.val(oldQty);

	            return swal({
	                text: 'We don\'t have enough "+ proTitle +" stock on hand for the quantity you selected. Please try again.',
	                icon: 'error',
	            });
	        }

	    }

	    function filterEmptyFilesFromForm(formData) {
	        try {
	            for (const [key, val] of formData) {
	                if (val instanceof File && !val.name && !val.size) {
	                    formData.delete(key);
	                }
	            }
	        } catch (e) {
	            console.error(e);
	        }

	        return formData;
	    }

	    function checkProduct(form, arrPro) {
	        var check = true;

	        for (var i = 0, len = arrPro.length; i < len; i++) {
	            var k = arrPro[i];
	            var $form = $(form[k]);
	            if ($form.find('[data-cart-edit-item-option]').length) {
	                check = checkBeforeAdd($form);
	                if (check == false)
	                    return false;
	            }
	        }

	        return check;
	    }

	    function checkBeforeAdd($attributes) {
	        var check = true;

	        $attributes.find('select').each(function() {
	            if (!$(this).prop('required')) {
	            } else {
	                if ($(this).val()) {} else {
	                    $(this).focus();
	                    check = false;
	                }
	            }
	        });

	        return check;
	    }

	    function setProductVariant($form) {
	        const unsatisfiedRequiredFields = [];
	        const options = [];

	        $.each($('[data-product-attribute]', $form), (index, value) => {
	            const type = value.getAttribute('data-product-attribute');

	            if (type === 'set-select') {
	                const select = value.querySelector('select');
	                const selectedIndex = select.selectedIndex;

	                if (selectedIndex !== 0) {
	                    return;
	                }

	                if (required) {
	                    unsatisfiedRequiredFields.push(value);
	                }
	            }
	        });
	    }

	    function updateProductAttributes($scope, data) {
	        const behavior = data.out_of_stock_behavior;
	        const inStockIds = data.in_stock_attributes;
	        const outOfStockMessage = ` (${data.out_of_stock_message})`;

	        if (behavior !== 'hide_option' && behavior !== 'label_option') {
	            return;
	        }

	        $('[data-product-attribute-value]', $scope).each((i, attribute) => {
	            const $attribute = $(attribute);
	            const attrId = parseInt($attribute.data('productAttributeValue'), 10);

	            if (inStockIds.indexOf(attrId) !== -1) {
	                enableAttribute($attribute, behavior, outOfStockMessage);
	            } else {
	                disableAttribute($attribute, behavior, outOfStockMessage);
	            }
	        });
	    }

	    function disableAttribute($attribute, behavior, outOfStockMessage) {
	        if (getAttributeType($attribute) === 'set-select') {
	            return disableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
	        }

	        if (behavior === 'hide_option') {
	            $attribute.hide();
	        } else {
	            $attribute.addClass('unavailable');
	        }
	    }

	    function disableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
	        const $select = $attribute.parent();

	        if (behavior === 'hide_option') {
	            $attribute.toggleOption(false);

	            if ($select.val() === $attribute.attr('value')) {
	                $select[0].selectedIndex = 0;
	            }
	        } else {
	            $attribute.attr('disabled', 'disabled');
	            $attribute.html($attribute.html().replace(outOfStockMessage, '') + outOfStockMessage);
	        }
	    }

	    function enableAttribute($attribute, behavior, outOfStockMessage) {
	        if (getAttributeType($attribute) === 'set-select') {
	            return enableSelectOptionAttribute($attribute, behavior, outOfStockMessage);
	        }

	        if (behavior === 'hide_option') {
	            $attribute.show();
	        } else {
	            $attribute.removeClass('unavailable');
	        }
	    }

	    function enableSelectOptionAttribute($attribute, behavior, outOfStockMessage) {
	        if (behavior === 'hide_option') {
	            $attribute.toggleOption(true);
	        } else {
	            $attribute.prop('disabled', false);
	            $attribute.html($attribute.html().replace(outOfStockMessage, ''));
	        }
	    }

	    function getAttributeType($attribute) {
	        const $parent = $attribute.closest('[data-product-attribute]');

	        return $parent ? $parent.data('productAttribute') : null;
	    }

	    function updateCartContent(){
	    	if (!$('body').hasClass('page-type-cart')) {
	    		const loadingClass = 'is-loading';
			    const $cartDropdown = $('.dropdown-cart');
			    const $cartLoading = $('<div class="loadingOverlay"></div>');
			    const $body = $('body');
			    var options = {
		                template: 'common/cart-preview',
		            };

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
		    } else {
		    	refreshContent();
		    }
	    }

	    function cartUpdate($target) {
	        const itemId = $target.data('cart-itemid');
	        const $el = $(`#qty-${itemId}`);
	        const oldQty = parseInt($el.val(), 10);
	        const maxQty = parseInt($el.data('quantityMax'), 10);
	        const minQty = parseInt($el.data('quantityMin'), 10);
	        const minError = $el.data('quantityMinError');
	        const maxError = $el.data('quantityMaxError');
	        const newQty = $target.data('action') === 'inc' ? oldQty + 1 : oldQty - 1;
	        let invalidEntry;

	        // Does not quality for min/max quantity
	        if (!newQty) {
	            invalidEntry = newQty;
	            $el.val(oldQty);
	            return swal({
	                text: `${invalidEntry} is not a valid entry`,
	                icon: 'error',
	            });
	        } else if (newQty < minQty) {
	            return swal({
	                text: minError,
	                icon: 'error',
	            });
	        } else if (maxQty > 0 && newQty > maxQty) {
	            return swal({
	                text: maxError,
	                icon: 'error',
	            });
	        } else {
	            utils.api.cart.itemUpdate(itemId, newQty, (err, response) => {
	                if (response.data.status === 'succeed') {
	                    // if the quantity is changed "1" from "0", we have to remove the row.
	                    const remove = (newQty === 0);

	                    refreshContent(remove);
	                } else {
	                    $el.val(oldQty);
	                    swal({
	                        text: response.data.errors.join('\n'),
	                        icon: 'error',
	                    });
	                }
	            });
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
	        const newQty = $target.val();
	        let invalidEntry;

	        // Does not quality for min/max quantity
	        if (!newQty) {
	            invalidEntry = $el.val();
	            $el.val(oldQty);
	            return swal({
	                text: `${invalidEntry} is not a valid entry`,
	                icon: 'error',
	            });
	        } else if (newQty < minQty) {
	            $el.val(oldQty);
	            return swal({
	                text: minError,
	                icon: 'error',
	            });
	        } else if (maxQty > 0 && newQty > maxQty) {
	            $el.val(oldQty);
	            return swal({
	                text: maxError,
	                icon: 'error',
	            });
	        } else {
	            utils.api.cart.itemUpdate(itemId, newQty, (err, response) => {
	                if (response.data.status === 'succeed') {
	                    // if the quantity is changed "1" from "0", we have to remove the row.
	                    const remove = (newQty === 0);
	                    refreshContent(remove);
	                } else {
	                    $el.val(oldQty);
	                    swal({
	                        text: response.data.errors.join('\n'),
	                        icon: 'error',
	                    });
	                }
	            });  
	        }
	    }

	    function bindCartEvents() {
	        let preVal;

	        var $cartContent = $('[data-cart-content]');
	        // cart update
	        $('[data-cart-update]', $cartContent).on('click', event => {
	            const $target = $(event.currentTarget);
	            event.preventDefault();

	            // update cart quantity
	            cartUpdate($target);
	        });

	        // cart qty manually updates
	        $('.cart-item-qty-input', $cartContent).on('focus', () => {
	            preVal = this.value;
	        }).change(event => {
	            const $target = $(event.currentTarget);
	            event.preventDefault();

	            // update cart quantity
	            cartUpdateQtyTextChange($target, preVal);
	        });

	        $('.cart-remove', $cartContent).on('click', event => {
	            const itemId = $(event.currentTarget).data('cartItemid');
	            const string = $(event.currentTarget).data('confirmDelete');
	            swal({
	                text: string,
	                type: 'warning',
	                showCancelButton: true,
	            }).then(() => {
	                // remove item from cart
	                cartRemoveItem(itemId);
	            });
	            event.preventDefault();
	        });
	    }

	    function bindPromoCodeEvents() {
	        const $couponContainer = $('.coupon-code');
	        const $couponForm = $('.coupon-form');
	        const $codeInput = $('[name="couponcode"]', $couponForm);

	        $('.coupon-code-add').on('click', event => {
	            event.preventDefault();

	            $(event.currentTarget).hide();
	            $couponContainer.show();
	            $('.coupon-code-cancel').show();
	            $codeInput.trigger('focus');
	        });

	        $('.coupon-code-cancel').on('click', event => {
	            event.preventDefault();

	            $couponContainer.hide();
	            $('.coupon-code-cancel').hide();
	            $('.coupon-code-add').show();
	        });

	        $couponForm.on('submit', event => {
	            const code = $codeInput.val();

	            event.preventDefault();

	            // Empty code
	            if (!code) {
	                return swal({
	                    text: $codeInput.data('error'),
	                    type: 'error',
	                });
	            }

	            utils.api.cart.applyCode(code, (err, response) => {
	                if (response.data.status === 'success') {
	                    refreshContent();
	                } else {
	                    swal({
	                        text: response.data.errors.join('\n'),
	                        type: 'error',
	                    });
	                }
	            });
	        });
	    }

	    function bindGiftCertificateEvents() {
	        const $certContainer = $('.gift-certificate-code');
	        const $certForm = $('.cart-gift-certificate-form');
	        const $certInput = $('[name="certcode"]', $certForm);

	        $('.gift-certificate-add').on('click', event => {
	            event.preventDefault();
	            $(event.currentTarget).toggle();
	            $certContainer.toggle();
	            $('.gift-certificate-cancel').toggle();
	        });

	        $('.gift-certificate-cancel').on('click', event => {
	            event.preventDefault();
	            $certContainer.toggle();
	            $('.gift-certificate-add').toggle();
	            $('.gift-certificate-cancel').toggle();
	        });

	        $certForm.on('submit', event => {
	            const code = $certInput.val();

	            event.preventDefault();

	            if (!giftCertCheck(code)) {
	                return swal({
	                    text: $certInput.data('error'),
	                    type: 'error',
	                });
	            }

	            utils.api.cart.applyGiftCertificate(code, (err, resp) => {
	                if (resp.data.status === 'success') {
	                    refreshContent();
	                } else {
	                    swal({
	                        text: resp.data.errors.join('\n'),
	                        type: 'error',
	                    });
	                }
	            });
	        });
	    }

	    function bindGiftWrappingEvents() {
	        const modal = defaultModal();

	        $('[data-item-giftwrap]').on('click', event => {
	            const itemId = $(event.currentTarget).data('itemGiftwrap');
	            const options = {
	                template: 'cart/modals/gift-wrapping-form',
	            };

	            event.preventDefault();

	            modal.open();

	            utils.api.cart.getItemGiftWrappingOptions(itemId, options, (err, response) => {
	                modal.updateContent(response.content);

	                bindGiftWrappingForm();
	            });
	        });
	    }

	    function bindGiftWrappingForm() {
	        $('.giftWrapping-select').on('change', event => {
	            const $select = $(event.currentTarget);
	            const id = $select.val();
	            const index = $select.data('index');

	            if (!id) {
	                return;
	            }

	            const allowMessage = $select.find(`option[value=${id}]`).data('allowMessage');

	            $(`.giftWrapping-image-${index}`).hide();
	            $(`#giftWrapping-image-${index}-${id}`).show();

	            if (allowMessage) {
	                $(`#giftWrapping-message-${index}`).show();
	            } else {
	                $(`#giftWrapping-message-${index}`).hide();
	            }
	        });

	        $('.giftWrapping-select').trigger('change');

	        function toggleViews() {
	            const value = $('input:radio[name ="giftwraptype"]:checked').val();
	            const $singleForm = $('.giftWrapping-single');
	            const $multiForm = $('.giftWrapping-multiple');

	            if (value === 'same') {
	                $singleForm.show();
	                $multiForm.hide();
	            } else {
	                $singleForm.hide();
	                $multiForm.show();
	            }
	        }

	        $('[name="giftwraptype"]').on('click', toggleViews);

	        toggleViews();
	    }

	    function refreshContent(remove) {
	        const $cartItemsRows = $('[data-item-row]', $cartContent);
	        const $cartPageTitle = $('[data-cart-page-title]');
	        const options = {
	            template: {
	                content: 'cart/content',
	                totals: 'cart/totals',
	                pageTitle: 'cart/page-title',
	                statusMessages: 'cart/status-messages',
	            },
	        };

	        $overlay.show();

	        // Remove last item from cart? Reload
	        if (remove && $cartItemsRows.length === 1) {
	            return window.location.reload();
	        }

	        utils.api.cart.getContent(options, (err, response) => {
	            $cartContent.html(response.content);
	            $cartTotals.html(response.totals);
	            $cartMessages.html(response.statusMessages);

	            $cartPageTitle.replaceWith(response.pageTitle);
	            bindEvents();
	            $overlay.hide();

	            const quantity = $('[data-cart-quantity]', $cartContent).data('cartQuantity') || 0;

	            $('body').trigger('cart-quantity-update', quantity);
	        });
	    }

	    function bindEvents() {
	        bindCartEvents();
	        bindPromoCodeEvents();
	        bindGiftWrappingEvents();
	        bindGiftCertificateEvents();

	        // initiate shipping estimator module
	        var shippingEstimator = new ShippingEstimator($('[data-shipping-estimator]'));
	    }
	}
}

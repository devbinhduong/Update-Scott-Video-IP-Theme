import utils from '@bigcommerce/stencil-utils';
import _ from 'lodash';
import modalFactory, { showAlertModal, ModalEvents } from '../global/modal';

export default function($scope, context) {
    const thisProuctId = parseInt(context.productId),
        $relateTab = $('#custom-related-products'),
        $bundle = $('#custom-bundle-products'),
        $bundleList = $bundle.find('.custom-product-list');

    const modal = modalFactory('#modal')[0];

    var currency = context.money;

    showBundle();

    $(document).on('click', '.custom-toggle-options', event => {
        event.preventDefault();

        var $target = $(event.currentTarget);

        $('.custom-toggle-options').not($target).removeClass('is-focus');
        $('.custom-detail-options').not($target.next('.custom-detail-options')).removeClass('is-open');

        if (!$target.next('.custom-detail-options').hasClass('is-open')) {
            $target.addClass('is-focus');
            $target.next('.custom-detail-options').addClass('is-open');
        } else {
            $target.next('.custom-detail-options').removeClass('is-open');
            $target.removeClass('is-focus');
        }
    });

    $(document).on('click', '.custom-option-close', event => {
        event.preventDefault();

        $('.custom-detail-options').removeClass('is-open');
        $('.custom-toggle-options').removeClass('is-focus');
    });

    $(document).on('click', event => {
        if ($('.custom-detail-options').hasClass('is-open')) {
            if (($(event.target).closest('.custom-detail-options').length === 0) && ($(event.target).closest('.custom-toggle-options').length === 0)){
                $('.custom-detail-options').removeClass('is-open');
                $('.custom-toggle-options').removeClass('is-focus');
            }
        }
    });

    $(document).on('change', '.custom-detail-checkbox', event => {
        var $target = $(event.currentTarget),
            id = $target.attr('id').replace('fbt_product',''),
            product = $('.custom-product-item[data-product-id="' + id + '"]');

        if($target.is(':checked') == false) {
            product.removeClass('isChecked');
        } else {
            product.addClass('isChecked');
        }

        totalPrice();
    });

    $(document).on('click', '#custom-addAll', event => {
        event.preventDefault();

        const $form = $('form', $bundle);
        var arrPro = new Array();

        $('.custom-detail-checkbox').each((index, val) => {
            if ($(val).is(':checked')) {
                arrPro.push(index);
            }
        });

        var check = false;

        if (arrPro.length > 0) {
            check = checkProduct($form, arrPro);
        }

        if (check) {
            if (arrPro.length > 0) {
                var k = arrPro.length;

                $bundle.find('.loadingOverlay').show();

                addToCart($form, 0, arrPro, k);
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

    function showBundle() {
        const options = {
                template: {
                    item: 'custom/products/custom-bundle-products-tmp',
                    options: 'custom/products/custom-bundle-products-options',
                },
            };

        var prodBundleId = [],
            totalBlock = '';

        firstItem();

        if($bundle.hasClass('custom-bundle-login')){
            totalBlock = '<div class="custom-product-total">\
                            <a class="button button--secondary custom-product-total-button" disabled href="#">Log in for pricing</a>\
                        </div>';
        } else{
            totalBlock = '<div class="custom-product-total">\
                            <div class="total-price">\
                                <span class="text"><span>Total price:</span></span>\
                                <span class="price"></span>\
                            </div>\
                            <a class="button button--primary custom-product-total-button flex-center flex" id="custom-addAll" href="#">Add All To Cart</a>\
                        </div>';
        }

        $bundle.find('.bundle-product-right').append(totalBlock);


        $.each(context.productCustomFields, function(index, obj) {
            if (obj.name == '__bundleid') {
                prodBundleId = JSON.parse('['+obj.value+']');
            }
        });

        prodBundleId = $.grep(prodBundleId, (value) => {
            return value != thisProuctId;
        });

        if ($bundle.length > 0 && prodBundleId.length == 0) {
            var num = 0,
                list = [];

            $relateTab.find('.card').each((index, val) => {
                list.push({
                    index: index,
                    data: ""
                });

                var pId = $(val).data('product-id');

                if (pId != undefined) {
                    utils.api.product.getById(pId, options, (err, response) => {
                        if (err) {
                            return '';
                        }

                        list.forEach((element) => {
                            if(element.index == index){
                                element.data = response;
                            }
                        });
                        
                        num++;

                        if(num == $relateTab.find('.card').length){
                            showList(list);
                        }
                    });
                }
            });
        } else if ($bundle.length > 0 && prodBundleId.length > 0) {
            var num = 0,
                list = [],
                listFilter = $.unique(prodBundleId);

            $.each(prodBundleId, function(i, val){
                list.push({i:i, data: ""});

                var pId = prodBundleId[i];

                if (pId != undefined) {
                    utils.api.product.getById(pId, options, (err, response) => {
                        if (err) {
                            return false;
                        }

                        list.forEach(function(element) {

                            if(element.i == i){
                                element.data = response;
                            }
                        });
                        
                        num++;

                        if(num == prodBundleId.length){
                            showList(list);
                        }
                    });
                }
            });
        }
    }

    function firstItem(){
        const firstItem = $bundleList.find('.custom-product-itemFirst'),
            pId = firstItem.data('product-id'),
            form = firstItem.find('form'),
            hasOptions = form.find('[data-fbt-option-change]').length,
            hasDefaultOptions = form.find('[data-default]').length;

        if (hasDefaultOptions && hasOptions) {
            utils.api.productAttributes.optionChange(pId, form.serialize(), 'products/bulk-discount-rates', (err, response) => {
                const attributesData = response.data || {};
                const attributesContent = response.content || {};

                updateProductAttributes(form, attributesData);

                if (hasDefaultOptions) {
                    updateView(form, attributesData, attributesContent);
                } else {
                    updateDefaultAttributesForOOS(attributesData);
                }
            });
        }
    }

    function showList(list){

        list.forEach((element) => {
            var response = element.data;


            if(response != undefined && response != null && response != ''){
                $bundleList.append(response.item);

                if (response.options.trim() != "") {
                    var pId = $(response.item).data('product-id'),
                    $form = $bundleList.find('.custom-product-item[data-product-id="' + pId + '"] form');

                    $form.append(response.options);

                    const $productOptionsElement = $('[data-fbt-option-change]', $form);
                    const hasOptions = $productOptionsElement.html().trim().length;
                    const hasDefaultOptions = $(response.options).find('[data-default]').length;

                    if (hasDefaultOptions && hasOptions) {
                        utils.api.productAttributes.optionChange(pId, $form.serialize(), 'products/bulk-discount-rates', (err, response) => {
                            if(response != undefined){
                                const attributesData = response.data || {};
                                const attributesContent = response.content || {};

                                updateProductAttributes($form, attributesData);

                                if (hasDefaultOptions) {
                                    updateView($form, attributesData, attributesContent);
                                } else {
                                    updateDefaultAttributesForOOS(attributesData);
                                }
                            }
                        });
                    }

                    setProductVariant();
                }
            }
        });

        
        
        productOptions();
        showSlickSlider($bundleList);

        if(!$bundle.hasClass('custom-bundle-login')){
            totalPrice();
        }

        $bundle.removeClass('custom-block-disable');
    }

    function showSlickSlider(wrap){
        if(wrap.length > 0){
            wrap.slick({
                dots: true,
                arrows: false,
                slidesToShow: 2,
                slidesToScroll: 1,
                mobileFirst: true,
                infinite: true,
                responsive: [
                    {
                        breakpoint: 1025,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 1,
                            dots: false,
                            arrows: true
                        }
                    }
                ]
            });
        }
    }

    function checkProduct(form, arrPro) {
        var check = true;

        for (var i = 0; i < arrPro.length; i++) {
            var k = arrPro[i],
                $form = $(form[k]);

            if ($form.find('[data-fbt-option-change]').length) {
                check = checkBeforeAdd($form);

                if (check == false){
                    return false;
                }
            }
        }

        return check;
    }

    function checkBeforeAdd($attributes) {
        var check = true,
            att = "";

        $attributes.find('input:text, input:password, input:file, textarea').each((index, element) => {
            if (!$(element).prop('required')) {} else {
                if ($(element).val()) {} else {
                    $(element).focus();
                    check = false;
                }
            }
        });

        $attributes.find('select').each((index, element) => {
            if (!$(element).prop('required')) {} else {
                if ($(element).val()) {} else {
                    $(element).focus();
                    check = false;
                }
            }
        });

        $attributes.find('input:radio, input:checkbox').each((index, element) => {
            if (att != $(element).attr("name")) {
                att = $(element).attr("name");
                if (!$(element).prop('required')) {
                    if ($(element).attr("type") == "checkbox") {
                        if ($("[name='" + att + "']:checked").val()) {}
                    }
                    if ($(element).attr("type") == "radio") {
                        if ($("[name='" + att + "']:checked").val()) {}
                    }
                } else {
                    if ($(element).attr("type") == "checkbox") {
                        if ($("[name='" + att + "']:checked").val()) {} else {
                            check = false;
                        }
                    }
                    if ($(element).attr("type") == "radio") {
                        if ($("[name='" + att + "']:checked").val()) {} else {
                            check = false;
                        }
                    }
                }
            }
        });

        return check;
    }

    function addToCart(form, i, arrP, k) {
        if (window.FormData === undefined) {
            return;
        }

        var prod = arrP[i];

        utils.api.cart.itemAdd(filterEmptyFilesFromForm(new FormData(form[prod])), (err, response) => {
            const errorMessage = err || response.data.error;

            if (errorMessage) {
                const tmp = document.createElement('DIV');
                tmp.innerHTML = errorMessage;
                alert(tmp.textContent || tmp.innerText);
                k = k - 1;
            }

            i++;

            if (i >= arrP.length) {
                $bundle.find('.loadingOverlay').hide();

                if (context.themeSettings.customAddToCartAction === 'sidebar'){
                    const options = {
                        template: 'common/cart-preview'
                    };

                    const loadingClass = 'is-loading';
                    const $body = $('body');
                    const $cartDropdown = $('#custom-cart-sidebar .custom-sidebar-wrapper');
                    const $cartLoading = $('<div class="loadingOverlay"></div>');

                    $body.toggleClass('openCartSidebar');

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

                        const quantity = $(response).find('[data-cart-quantity]').data('cartQuantity') || 0;

                        $body.trigger('cart-quantity-update', quantity);

                    });
                } else {
                    redirectTo(context.urls.cart);
                }

                return;
            }

            addToCart(form, i, arrP, k);
        });
    }

    function isRunningInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    function redirectTo(url) {
        if (isRunningInIframe() && !window.iframeSdk) {
            window.top.location = url;
        } else {
            window.location = url;
        }
    }

    function totalPrice() {
        var total = 0,
            symbol,
            symbolChange,
            decimalPlaces,
            decimalSeparator,
            thousandsSeparator,
            symbolLocation,
            curr,
            token1,
            token2,
            length;


        decimalPlaces = currency.decimal_places;
        decimalSeparator = currency.decimal_token;
        thousandsSeparator = currency.thousands_token;
        symbolLocation = currency.currency_location;
        symbol = currency.currency_token;

        $bundleList.find('.custom-product-item.isChecked').each((index, val) => {
            var price = parseFloat($(val).find('[data-price-value]').attr('data-price-value'));

            total = total + price;
        });

        if ($('.productView-product .productView-price > .price-section > .price.price--withTax', $scope).length) {
            curr = $('.productView-product .productView-price > .price-section > .price.price--withTax', $scope).data('value-price');
        } else {
            curr = $('.productView-product .productView-price > .price-section > .price.price--withoutTax', $scope).data('value-price');
        }

        symbolChange = curr.replace(/[0-9]/g, "").replace(".", "").replace(",", "");

        if(symbol != symbolChange){
            symbol = symbolChange;
            token1 = (curr.indexOf('.'));
            token2 = (curr.indexOf(','));
            length = curr.length - 1;

            if (curr.indexOf(symbol) != -1) {
                symbolLocation = curr.indexOf(symbol);
            }

            if (token1 < token2) {
                thousandsSeparator = '.';
                decimalSeparator = ',';

                if (symbolLocation == 0 || symbolLocation == "left") {
                    decimalPlaces = length - token2;
                } else {
                    decimalPlaces = length - token2 - 1;
                }
            } else {
                thousandsSeparator = ',';
                decimalSeparator = '.';
                if (symbolLocation == 0 || symbolLocation == "left") {
                    decimalPlaces = length - token1;
                } else {
                    decimalPlaces = length - token1 - 1;
                }
            }
        }

        if(total == 0){
            $bundle.find('#custom-addAll').attr('disabled', true);
        } else{
            $bundle.find('#custom-addAll').attr('disabled', false);
        }

        total = formatMoney(total, decimalPlaces, decimalSeparator, thousandsSeparator);

        if (symbolLocation == "left" || symbolLocation == 0){
            total = symbol + total;
        } else{
            total = total + symbol;
        }

        $bundle.find('.custom-product-total .price').html(total);
    }

    function formatMoney(n, c, d, t) {
        var c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;

        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    function productOptions() {
        if(!$bundle.hasClass('custom-bundle-login')){
            totalPrice();
        }

        const $form = $('form', $bundle),
            $productOptionsElement = $('[data-fbt-option-change]', $form);

        $(document).on('change', $productOptionsElement, event => {
            productOptionsChanged(event);
            setProductVariant(event);
        });
    }

    function setProductVariant() {
        const unsatisfiedRequiredFields = [];
        const options = [];

        $.each($('[data-fbt-option-change] [data-product-attribute]'), (index, value) => {
            const optionLabel = value.children[0].innerText;
            const optionTitle = optionLabel.split(':')[0].trim();
            const required = optionLabel.toLowerCase().includes('required');
            const type = value.getAttribute('data-product-attribute');

            if ((type === 'input-file' || type === 'input-text' || type === 'input-number') && value.querySelector('input').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'textarea' && value.querySelector('textarea').value === '' && required) {
                unsatisfiedRequiredFields.push(value);
            }

            if (type === 'date') {
                const isSatisfied = Array.from(value.querySelectorAll('select')).every((select) => select.selectedIndex !== 0);

                if (isSatisfied) {
                    const dateString = Array.from(value.querySelectorAll('select')).map((x) => x.value).join('-');
                    options.push(`${optionTitle}:${dateString}`);

                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-select') {
                const select = value.querySelector('select');
                const selectedIndex = select.selectedIndex;

                if (selectedIndex !== 0) {
                    options.push(`${optionTitle}:${select.options[selectedIndex].innerText}`);
                    $(value.children[0]).find('[data-option-value]').text(select.options[selectedIndex].innerText);
                    return;
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }

            if (type === 'set-rectangle' || type === 'set-radio' || type === 'swatch' || type === 'input-checkbox' || type === 'product-list') {
                const checked = value.querySelector(':checked');
                if (checked) {
                    if (type === 'set-rectangle' || type === 'set-radio' || type === 'product-list') {
                        const label = checked.labels[0].innerText;
                        if (label) {
                            options.push(`${optionTitle}:${label}`);
                            $(value.children[0]).find('[data-option-value]').text(label);
                        }
                    }

                    if (type === 'swatch') {
                        const label = checked.labels[0].children[0];
                        if (label) {
                            options.push(`${optionTitle}:${label.title}`);
                            $(value.children[0]).find('[data-option-value]').text(label.title);
                        }
                    }

                    if (type === 'input-checkbox') {
                        options.push(`${optionTitle}:Yes`);
                    }

                    return;
                }

                if (type === 'input-checkbox') {
                    options.push(`${optionTitle}:No`);
                }

                if (required) {
                    unsatisfiedRequiredFields.push(value);
                }
            }
        });
    }

    function productOptionsChanged(event) {
        const $changedOption = $(event.target);
        const $form = $changedOption.parents('form');
        const productId = $('[name="product_id"]', $form).val();

        if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
            return;
        }

        if ($changedOption.attr('id') === 'fbt_product' + productId) {
            return;
        }
        
        utils.api.productAttributes.optionChange(productId, $form.serialize(), 'products/bulk-discount-rates', (err, response) => {
            const productAttributesData = response.data || {};
            const productAttributesContent = response.content || {};
            showProductImage(productId, productAttributesData);
            updateProductAttributes($form, productAttributesData);
            updateView($form, productAttributesData, productAttributesContent);

            if(!$bundle.hasClass('custom-bundle-login')){
                totalPrice();
            }
        });

        return false;
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

    function showProductImage(productId, data) {
        if (_.isPlainObject(data.image)) {
            const mainImageUrl = utils.tools.imageSrcset.getSrcset(
                data.image.data, { '1x': context.themeSettings.productgallery_size },
            );

            $('.custom-product-item[data-product-id="' + productId + '"]').find('img').attr({
                'srcset': mainImageUrl,
                'data-srcset': $(this).attr('srcset'),
            });
        } else {
            const mainImageUrl = $('.custom-product-item[data-product-id="' + productId + '"]').find('img').attr('data-srcset');
            $('.custom-product-item[data-product-id="' + productId + '"]').find('img').attr({
                'srcset': mainImageUrl,
                'data-srcset': $(this).attr('srcset'),
            });
        }
    }

    function updateView($scope, data, content = null) {
        const viewModel = getViewModel($scope);

        if (_.isNumber(data.stock)) {
            if((data.stock <= parseInt(context.themeSettings.custom_stock_level_limit)) && (data.stock > 0)) {
                viewModel.$stockLeftWrapper.removeClass('u-hiddenVisually');
                viewModel.$stockLeft.text(data.stock);
            } else{
                viewModel.$stockLeftWrapper.addClass('u-hiddenVisually');
            }
        }

        showMessageBox(data.stock_message || data.purchasing_message, $scope);

        if (_.isObject(data.price)) {
            updatePriceView(viewModel, data.price);
        }

        var productId = $('[name="product_id"]', $scope).val(),
            product = $bundleList.find('.custom-product-item[data-product-id="' + productId + '"]'),
            productCheckbox = product.find('.custom-detail-checkbox');

        if (!data.purchasable || !data.instock) {
            product.removeClass('isChecked hasOptions--selected');
            productCheckbox.prop('checked', false).prop('disabled', true);
        } else {
            product.addClass('isChecked');
            productCheckbox.prop('checked', true).prop('disabled', false);

            if ($scope.find('[data-fbt-option-change]').length > 0) {

                var check = checkBeforeAdd($scope);

                if (check == true) {
                    product.addClass('hasOptions--selected');
                }
            }
        }
    }

    function updateDefaultAttributesForOOS($scope, data) {
        var productId = $('[name="product_id"]', $scope).val(),
            product = $bundleList.find('.custom-product-item[data-product-id="' + productId + '"]'),
            productCheckbox = product.find('.custom-detail-checkbox');

        if (!data.purchasable || !data.instock) {
            product.removeClass('isChecked hasOptions--selected');
            productCheckbox.prop('checked', false).prop('disabled', true);
        } else {
            product.addClass('isChecked');
            productCheckbox.prop('checked', true).prop('disabled', false);

            if ($scope.find('[data-fbt-option-change]').length > 0) {
                var check = checkBeforeAdd($scope);

                if (check == true) {
                    product.addClass('hasOptions--selected');
                }
            }
        }
    }

    function getViewModel($scope) {
        return {
            $priceWithTax: $('[data-product-price-with-tax]', $scope),
            $priceWithoutTax: $('[data-product-price-without-tax]', $scope),
            rrpWithTax: {
                $div: $('.rrp-price--withTax', $scope),
                $span: $('[data-product-rrp-with-tax]', $scope),
            },
            rrpWithoutTax: {
                $div: $('.rrp-price--withoutTax', $scope),
                $span: $('[data-product-rrp-price-without-tax]', $scope),
            },
            nonSaleWithTax: {
                $div: $('.non-sale-price--withTax', $scope),
                $span: $('[data-product-non-sale-price-with-tax]', $scope),
            },
            nonSaleWithoutTax: {
                $div: $('.non-sale-price--withoutTax', $scope),
                $span: $('[data-product-non-sale-price-without-tax]', $scope),
            },
            priceSaved: {
                $div: $('.price-section--saving', $scope),
                $span: $('[data-product-price-saved]', $scope),
            },
            priceNowLabel: {
                $span: $('.price-now-label', $scope),
            },
            priceLabel: {
                $span: $('.price-label', $scope),
            },
            priceData: {
                $div: $('[data-price-value]', $scope),
            },
            $weight: $('.productView-info [data-product-weight]', $scope),
            $increments: $('.form-field--increments :input', $scope),
            $addToCart: $('#form-action-addToCart', $scope),
            $wishlistVariation: $('[data-wishlist-add] [name="variation_id"]', $scope),
            $stockLeft: $('[data-stock-left]', $scope),
            $stockLeftWrapper: $('.productView-optionsStock', $scope),
            stock: {
                $container: $('.form-field--stock', $scope),
                $input: $('[data-product-stock]', $scope),
            },
            $sku: $('[data-product-sku]'),
            $upc: $('[data-product-upc]'),
            quantity: {
                $text: $('.incrementTotal', $scope),
                $input: $('[name=qty\\[\\]]', $scope),
            },
            $bulkPricing: $('.productView-info-bulkPricing', $scope),
        };
    }

    function showMessageBox(message, $scope) {
        const $messageBox = $('.productAttributes-message', $scope);

        if (message) {
            $('.alertBox-message', $messageBox).text(message);
            $messageBox.show();
        } else {
            $messageBox.hide();
        }
    }

    function clearPricingNotFound(viewModel) {
        viewModel.rrpWithTax.$div.hide();
        viewModel.rrpWithoutTax.$div.hide();
        viewModel.nonSaleWithTax.$div.hide();
        viewModel.nonSaleWithoutTax.$div.hide();
        viewModel.priceSaved.$div.hide();
        viewModel.priceNowLabel.$span.hide();
        viewModel.priceLabel.$span.hide();
    }
    
    function updatePriceView(viewModel, price) {
        clearPricingNotFound(viewModel);

        if (price.with_tax) {
            viewModel.priceLabel.$span.show();
            viewModel.$priceWithTax.html(price.with_tax.formatted);
            viewModel.priceData.$div.attr('data-price-value', price.with_tax.value);
        }

        if (price.without_tax) {
            viewModel.priceLabel.$span.show();
            viewModel.$priceWithoutTax.html(price.without_tax.formatted);
            viewModel.priceData.$div.attr('data-price-value', price.without_tax.value);
        }

        if (price.rrp_with_tax) {
            viewModel.rrpWithTax.$div.show();
            viewModel.rrpWithTax.$span.html(price.rrp_with_tax.formatted);
        }

        if (price.rrp_without_tax) {
            viewModel.rrpWithoutTax.$div.show();
            viewModel.rrpWithoutTax.$span.html(price.rrp_without_tax.formatted);
        }

        if (price.saved) {
            viewModel.priceSaved.$div.show();
            viewModel.priceSaved.$span.html(price.saved.formatted);
        }

        if (price.non_sale_price_with_tax) {
            viewModel.priceLabel.$span.hide();
            viewModel.nonSaleWithTax.$div.show();
            viewModel.priceNowLabel.$span.show();
            viewModel.nonSaleWithTax.$span.html(price.non_sale_price_with_tax.formatted);
        }

        if (price.non_sale_price_without_tax) {
            viewModel.priceLabel.$span.hide();
            viewModel.nonSaleWithoutTax.$div.show();
            viewModel.priceNowLabel.$span.show();
            viewModel.nonSaleWithoutTax.$span.html(price.non_sale_price_without_tax.formatted);
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
}

import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';
import StencilDropDown from './stencil-dropdown';

export default function (context) {
    const TOP_STYLING = 'top: 49px;';
    const $quickSearchResults = $('.quickSearchResults');
    const $quickSearchResultsCustom = $('.quickSearchResultsCustom');
    const $searchDropdown = $('.customQuickSearchResults');
    const $quickSearchDiv = $('#quickSearch');
    const $searchQuery = $('#search_query');
    const $quickSearchForms = $('[data-quick-search-form]');



    const stencilDropDownExtendables = {
        hide: () => {
            $searchQuery.trigger('blur');
        },
        show: (event) => {
            $searchQuery.trigger('focus');
            event.stopPropagation();
        },
    };

    // const stencilDropDown = new StencilDropDown(stencilDropDownExtendables);
    // stencilDropDown.bind($('[data-search="quickSearch"]'), $('#quickSearch'), TOP_STYLING);

    /* Custom Start */
    $(document).on('click', event => {
        // If the target element has this data tag or one of it's parents, do not close the search results
        // We have to specify `.modal-background` because of limitations around Foundation Reveal not allowing
        // any modification to the background element.
        if (($(event.target).closest('[data-prevent-quick-search-close]').length === 0) && ($(event.target).closest('.before-you-leave-search').length === 0))  {
            // stencilDropDown.hide($container);

            $quickSearchResults.removeClass('is-open');
            $quickSearchResultsCustom.removeClass('is-open');

            if (context.quickSearchBefore) {
                document.body.classList.remove('openSearchDropdown');
            }
        }
    });

    /* Custom Start */
    $(document).on('click', '.quickResults-close', (e) => {
        e.preventDefault();
        $searchDropdown.removeClass('is-open');
        
        if (context.quickSearchBefore) {
            document.body.classList.remove('openSearchDropdown');
        }
    });

    // stagger searching for 1200ms after last input
    const debounceWaitTime = 1200;
    const doSearch = _.debounce((searchQuery) => {
        utils.api.search.search(searchQuery, { template: 'search/quick-results' }, (err, response) => {
            if (err) {
                return false;
            }
            /* Custom Start */
            $quickSearchResultsCustom.removeClass('is-open');
            $quickSearchResults.html(response).addClass('is-open');
            
            const $quickSearchResultsCurrent = $quickSearchResults.filter(':visible');

            const $noResultsMessage = $quickSearchResultsCurrent.find('.quickSearchMessage');
            if ($noResultsMessage.length) {
                $noResultsMessage.attr({
                    role: 'status',
                    'aria-live': 'polite',
                });
            } else {
                const $quickSearchAriaMessage = $quickSearchResultsCurrent.next();
                $quickSearchAriaMessage.addClass('u-hidden');

                const predefinedText = $quickSearchAriaMessage.data('search-aria-message-predefined-text');
                const itemsFoundCount = $quickSearchResultsCurrent.find('.product').length;

                $quickSearchAriaMessage.text(`${itemsFoundCount} ${predefinedText} ${searchQuery}`);

                setTimeout(() => {
                    $quickSearchAriaMessage.removeClass('u-hidden');
                }, 100);
            }
        });
    }, debounceWaitTime);

    utils.hooks.on('search-quick', (event, currentTarget) => {
        const searchQuery = $(currentTarget).val();

        // server will only perform search with at least 3 characters
        if (searchQuery.length < 3) {
            $quickSearchResults.removeClass('is-open');
            $quickSearchResultsCustom.addClass('is-open');

            if (context.quickSearchBefore) {
                document.body.classList.add('openSearchDropdown');
            }
            return;
        }

        doSearch(searchQuery);
    });

    // Catch the submission of the quick-search
    $quickSearchDiv.on('submit', event => {
        const searchQuery = $(event.currentTarget).find('input').val();

        if (searchQuery.length === 0) {
            return event.preventDefault();
        }

        return true;
    });

    if (context.quickSearchBefore) {
        $searchQuery.on('click', event => {
            // $quickSearchResults.empty().removeClass('is-open');

            document.body.classList.add('openSearchDropdown');

            let isSearchResult = $quickSearchResults.find('.productGrid .product').length;

            if(isSearchResult) {
                $quickSearchResultsCustom.empty().removeClass('is-open');
                $quickSearchResultsCustom.removeClass('is-open');
                $quickSearchResults.addClass('is-open');
            } else {
                $quickSearchResultsCustom.addClass('is-open');
                $quickSearchResults.removeClass('is-open');
            }


            var listIDs = context.quickSearchPopularId.split(','),
                listID = listIDs.slice(0,parseInt(context.quickSearchResultLimit));

            const $options = {
                template: 'custom/products/product-card-2'
            };

            if(!$quickSearchResultsCustom.find('.productGrid .product').length){
                $quickSearchResultsCustom.find('.quickResults-product').addClass('is-loading');

                var num = 0;

                for (var i = 0; i <= listID.length; i++) {
                    var $prodId = listID[i];

                    if($prodId != undefined){
                        utils.api.product.getById($prodId, $options, (err, response) => {
                            if(err){
                                return false;
                            }

                            var hasProd = $(response).find('.card').data('product-id');

                            if(hasProd != undefined){
                                if($quickSearchResultsCustom.find('.productGrid .product').length < listID.length){
                                    $quickSearchResultsCustom.find('.productGrid').append(response);
                                }

                                num++;

                                if(num == listID.length){
                                    $quickSearchResultsCustom.find('.quickResults-product').removeClass('is-loading');
                                }
                            }
                        });            
                    }
                }
            }
        });
    }
    $('[data-search="quickSearch"]').on('click', event => {
        $searchQuery.trigger('click');
    });

    // Catch the submission of the quick-search forms
    $quickSearchForms.on('submit', event => {
        event.preventDefault();

        const $target = $(event.currentTarget);
        const searchQuery = $target.find('input').val();
        const searchUrl = $target.data('url');

        if (searchQuery.length === 0) {
            return;
        }

        window.location.href = `${searchUrl}?search_query=${encodeURIComponent(searchQuery)}`;
    });
}

export default function() {
    const $grid = $('#grid-view'),
        $list = $('#list-view');

    $list.on('click', event => {
        event.preventDefault();
        const $productListing = $('#product-listing-container .productGrid');

        if (!$list.hasClass('current-view')) {
            setTimeout(function(){ 
                $list.addClass('current-view');
                $grid.removeClass('current-view');
                $productListing.removeClass('productGrid').addClass('productList');
            }, 300);
        }
   });

    $grid.on('click', event => {
        event.preventDefault();
        const $productListing = $('#product-listing-container .productList');
        
        if (!$grid.hasClass('current-view')) {
            setTimeout(function(){ 
                $grid.addClass('current-view');
                $list.removeClass('current-view');
                $productListing.removeClass('productList').addClass('productGrid');
            }, 300);
        }
    });
}

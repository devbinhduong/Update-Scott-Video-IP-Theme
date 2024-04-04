import utils from '@bigcommerce/stencil-utils';

export default function(context) {
    if (context.themeSettings.showCardInfo) {

        var  list = [];
        const $card = $('.card');
        const token = context.token;

        if ($card.length) {
            for (var i=0; i < $card.length; i++) {
                const $prodWrapId = $card.eq(i).data('product-id');

                if ($prodWrapId != undefined) {
                    list.push($prodWrapId.toString());
                }
            };
        }

        showCardInfo();

        function showCardInfo() {
            if(list.length > 0){
                getProductInfo(list).then(data => {
                    var aFilter = data.site.products.edges;

                    $.each(aFilter, (index, element) => {
                        var productId = aFilter[index].node.entityId,
                            producUPC = aFilter[index].node.upc,
                            productWarranty = aFilter[index].node.warranty,
                            productCondition = aFilter[index].node.condition;

                            /* Capilizetal For productCondition */
                            if(productCondition) {
                                productCondition = productCondition.charAt(0).toUpperCase() + productCondition.slice(1).toLowerCase();
                            }

                            let card = document.querySelector('.card[data-product-id="'+productId+'"]');

                            const cardUPC = card.querySelector("[data-card-upc]"),
                                cardWarranty = card.querySelector("[data-card-warranty]"),
                                cardCondition = card.querySelector("[data-card-condition]");

                            if(producUPC) {
                                cardUPC.innerHTML = producUPC;
                            } else {
                                cardUPC.closest(".cardInfo__item").remove();
                            }

                            if(productWarranty) {
                                cardWarranty.innerHTML = productWarranty;
                            } else {
                                cardWarranty.closest(".cardInfo__item").remove();
                            }

                            if(productCondition) {
                                cardCondition.innerHTML = productCondition;
                            } else {
                                cardCondition.closest(".cardInfo__item").remove();
                            }
                    });
                });
            }
        }

        function getProductInfo(list){
            return fetch('/graphql', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                  query: `
                    query SeveralProductsByID {
                      site {
                        products(entityIds: [`+list+`], first: 50) {
                          edges {
                            node {
                              entityId
                              sku
                              name
                              warranty
                              upc
                              condition
                            }
                          }
                        }
                      }
                    }
                  `}),
            }).then(res => res.json()).then(res => res.data);
        }
    }
}

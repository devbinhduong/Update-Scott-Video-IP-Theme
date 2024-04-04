import megaMenuFunction from './megaMenuFunction';
    window.megaMenuFunction = megaMenuFunction;

export default function (context) {
	var settings = context.themeSettings;

	if (settings.customMegamenuType == 'Editor') {
	    var megaMenuFunction = new window.megaMenuFunction();
	    const urlStoreHash = $('.custom-global-block').data('store-hash-image');

		var mega_menu_styleCustom_item1 = parseInt(settings.mega_menu_styleCustom_item1),
			mega_menu_styleCustom_item2 = parseInt(settings.mega_menu_styleCustom_item2),
			mega_menu_styleCustom_item3 = parseInt(settings.mega_menu_styleCustom_item3),
			mega_menu_styleCustom_item4 = parseInt(settings.mega_menu_styleCustom_item4);

	    function SetItemMegaMenu(){
	        $('.navPages-list-megamenu > li:not(.navPages-item-toggle)').mouseover(event => {
	            var numberItem = $(event.currentTarget).index() + 1;

	            if (!$(event.currentTarget).hasClass('has-megamenu')) {
	                LoadMegaMenu(numberItem);
	            }
	        });

	        $(document).on('click','#custom-menu-mobile .navPages-list:not(.navPages-list--user) > li > .navPages-action' , event => {
	            var numberItem = $(event.currentTarget).parent().index() + 1;

	            if (!$(event.currentTarget).parent().hasClass('has-megamenu')) {
	                LoadMegaMenu(numberItem);
	            }
	        });
	    }
	        
	    function LoadMegaMenu(numberItem){
			let mega_menu_styleCustom_bottom = '',
				mega_menu_styleCustom_img_1 = '',
				mega_menu_styleCustom_img_2 = '',
				mega_menu_styleCustom_img_3 = '',
				mega_menu_styleCustom_img_4 = '',
				mega_menu_styleCustom_img_5 = '',
				mega_menu_styleCustom_img_6 = '',
				mega_menu_styleCustom_img_7 = '',
				mega_menu_styleCustom_img_8 = '';

			if (settings.mega_menu_styleCustom_img1 != '') {
				mega_menu_styleCustom_img_1 = `
					<a class="image hover-banner" href="${settings.mega_menu_styleCustom_link1}" aria-label="${settings.mega_menu_styleCustom_img1}">
						<img src="${urlStoreHash}${settings.mega_menu_styleCustom_img1}" alt="${settings.mega_menu_styleCustom_img1}">
					</a>
				`
			}

			if (settings.mega_menu_styleCustom_img2 != '') {
				mega_menu_styleCustom_img_2 = `
					<a class="image hover-banner" href="${settings.mega_menu_styleCustom_link2}" aria-label="${settings.mega_menu_styleCustom_img2}">
						<img src="${urlStoreHash}${settings.mega_menu_styleCustom_img2}" alt="${settings.mega_menu_styleCustom_img2}">
					</a>
				`
			}

			if (settings.mega_menu_styleCustom_img3 != '') {
				mega_menu_styleCustom_img_3 = `
					<a class="image hover-banner" href="${settings.mega_menu_styleCustom_link3}" aria-label="${settings.mega_menu_styleCustom_img3}">
						<img src="${urlStoreHash}${settings.mega_menu_styleCustom_img3}" alt="${settings.mega_menu_styleCustom_img3}">
					</a>
				`
			}

			if (settings.mega_menu_styleCustom_img4 != '') {
				mega_menu_styleCustom_img_4 = `
					<a class="image hover-banner" href="${settings.mega_menu_styleCustom_link4}" aria-label="${settings.mega_menu_styleCustom_img4}">
						<img src="${urlStoreHash}${settings.mega_menu_styleCustom_img4}" alt="${settings.mega_menu_styleCustom_img4}">
					</a>
				`
			}

			if (settings.mega_menu_styleCustom_img5 != '') {
				mega_menu_styleCustom_img_5 = `
					<a class="image hover-banner" href="${settings.mega_menu_styleCustom_link5}" aria-label="${settings.mega_menu_styleCustom_img5}">
						<img src="${urlStoreHash}${settings.mega_menu_styleCustom_img5}" alt="${settings.mega_menu_styleCustom_img5}">
					</a>
				`
			}

			if (settings.mega_menu_styleCustom_img6 != '') {
				mega_menu_styleCustom_img_6 = `
					<a class="image hover-banner" href="${settings.mega_menu_styleCustom_link6}" aria-label="${settings.mega_menu_styleCustom_img6}">
						<img src="${urlStoreHash}${settings.mega_menu_styleCustom_img6}" alt="${settings.mega_menu_styleCustom_img6}">
					</a>
				`
			}

			if (settings.mega_menu_styleCustom_img7 != '') {
				mega_menu_styleCustom_img_7 = `
					<a class="image hover-banner" href="${settings.mega_menu_styleCustom_link7}" aria-label="${settings.mega_menu_styleCustom_img7}">
						<img src="${urlStoreHash}${settings.mega_menu_styleCustom_img7}" alt="${settings.mega_menu_styleCustom_img7}">
					</a>
				`
			}

			if (settings.mega_menu_styleCustom_img8 != '') {
				mega_menu_styleCustom_img_8 = `
					<a class="image hover-banner" href="${settings.mega_menu_styleCustom_link8}" aria-label="${settings.mega_menu_styleCustom_img8}">
						<img src="${urlStoreHash}${settings.mega_menu_styleCustom_img8}" alt="${settings.mega_menu_styleCustom_img8}">
					</a>
				`
			}

			if (settings.mega_menu_styleCustom_bottom != '') {
				mega_menu_styleCustom_bottom = 
				`<div class="container">${settings.mega_menu_styleCustom_bottom}</div>`
			}

	        if (numberItem) {
	            megaMenuFunction.menuItem(numberItem).setMegaMenu({
	                style: 'style custom',
	                imageAreaWidth: "0%",
	                cateAreaWidth: "100%",
	                cateColumns: 5,
	            });
			} else {
	            return;
	        }
	    }

	    function megaMenuLabel(){
	        if (settings.mega_menu_new_label && settings.mega_menu_new_label_text) {
	            megaMenuFunction.menuItem(settings.mega_menu_new_label).setMegaMenu({
	                label: settings.mega_menu_new_label_text,
	                labelType: 'new',
	                disabled: true
	            });
	        }

	        if (settings.mega_menu_hot_label && settings.mega_menu_hot_label_text) {
	            megaMenuFunction.menuItem(settings.mega_menu_hot_label).setMegaMenu({
	                label: settings.mega_menu_hot_label_text,
	                labelType: 'hot',
	                disabled: true
	            });
	        }

	        if (settings.mega_menu_sale_label && settings.mega_menu_sale_label_text) {
	            megaMenuFunction.menuItem(settings.mega_menu_sale_label).setMegaMenu({
	                label: settings.mega_menu_sale_label_text,
	                labelType: 'sale',
	                disabled: true
	            });
	        }
	    }

	    megaMenuLabel();

	    var setItemMegaMenu = SetItemMegaMenu();

	    window.onload = setItemMegaMenu;
	}
}

import utils from '@bigcommerce/stencil-utils';

export default function (context) {
    var message;

    $(document).ready(function() {
        utils.api.getPage(context.themeSettings.custom_ask_an_expert_pagelink, {template: 'custom/global/custom-ask-an-expert-form'}, (err, response) => {
            if (err) return;

            $('.hl-form-field-wrapper').html(response);
        });
    });

    $(document).on('click', '.ask-an-expert-link', event => {
        event.preventDefault();

        $('body').addClass('has-askAnExpert')
    });

    $(document).on('click', '[data-close-ask-an-expert-popup]', event => {
        event.preventDefault();

        $('body').removeClass('has-askAnExpert');
    });

    $(document).on('click', event => {
        if (($(event.target).closest('.ask-an-expert-link').length === 0) && ($(event.target).closest('.custom-ask-an-expert-container').length === 0)){
            $('body').removeClass('has-askAnExpert');
        }
    });

    $('.custom-ask-an-expert-form').on('submit', function (event) {
        event.preventDefault();

        var typeContact = $('.custom-ask-an-expert-form input[name=type_contact]:checked').val(),
            typePackage = $('.custom-ask-an-expert-form input[name=type_package]:checked').val(),
            customerMessage = $('.custom-ask-an-expert-form textarea[name=contact_comment_area]').val(),
            recaptcha = $('.custom-ask-an-expert-form #g-recaptcha-response').val(),
            title =  $('.custom-ask-an-expert-form[data-product-title]').attr('data-product-title'),
            sku = $('.custom-ask-an-expert-form[data-product-sku]').attr('data-product-sku'),
            url = $('.custom-ask-an-expert-form[data-product-url]').attr('data-product-url');

        if (recaptcha == '') {
            const error = 'The captcha you entered is incorrect. Please try again.'

            $('#custom-ask-an-expert-results').html('<div class="alertBox alertBox--error">'+error+'</div>');
            return;
        }

        if ($("body").hasClass("page-type-product")) {
            message = 
            "\n\rDo you need: " + typePackage +
            "\n\rWhat can i help you with today: " + customerMessage +
            "\n\rHow would you like me to contact you ?: " + typeContact +
            "\n\rProduct Name: " + title +
            "\n\rProduct SKU: " + sku +
            "\n\rProduct Link: " + url
        } else {
            message = 
            "\n\rDo you need: " + typePackage +
            "\n\rWhat can i help you with today: " + customerMessage +
            "\n\rHow would you like me to contact you ?: " + typeContact
        }

        $('#contact_question').val(message);

        $.ajax({
            type: 'POST',
            url: '/pages.php?action=sendContactForm',
            data: $('.custom-ask-an-expert-form').serialize(),
            success: function() {
                $('.custom-ask-an-expert-form').hide();
                $('#custom-ask-an-expert-results').html('<div class="alertBox alertBox--success">Thank you. We\'ve received your feedback and will respond shortly.</div>');
            },
        });
    });

    $(document).on('change', '#term-ask', event => {
        if($("#term-ask:checked").length){
            $('#custom-ask-an-expert-button').attr('disabled', false);
        } else{
            $('#custom-ask-an-expert-button').attr('disabled', true);
        }
    });
}

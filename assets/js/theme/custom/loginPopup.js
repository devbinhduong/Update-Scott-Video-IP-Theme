import nod from '../common/nod';
import forms from '../common/models/forms';
import {classifyForm, Validators} from '../common/utils/form-utils';

export default function() {
    const $loginFormPC = classifyForm('#login-pc-popup form');
    const $loginFormMB = classifyForm('#login-mb-popup form');

    if ($loginFormPC.length > 0) {
        registerLoginValidation($loginFormPC);
    }

    if ($loginFormMB.length > 0) {
        registerLoginValidation($loginFormMB);
    }

    function registerLoginValidation($loginForm) {
        const loginModel = forms;

        const loginValidator = nod({
            submit: $loginForm.find('button'),
        });

        loginValidator.add([{
            selector: $loginForm.find('input[type="email"]'),
            validate: (cb, val) => {
                const result = loginModel.email(val);
                cb(result);
            },
            errorMessage: 'Please use a valid email address, such as user@example.com.',
        }, {
            selector: $loginForm.find('input[type="password"]'),
            validate: (cb, val) => {
                const result = loginModel.password(val);
                cb(result);
            },
            errorMessage: 'You must enter a password.',
        }, ]);

        $loginForm.on('click', 'button', event => {
            event.preventDefault();
            loginValidator.performCheck();

            if (loginValidator.areAll('valid')) {
                var formData = new FormData($loginForm[0]),
                    xhr = new XMLHttpRequest(),
                    urlSuccess1 = 'account.php',
                    urlSuccess2 = 'cart.php',
                    urlError = 'login.php';

                $loginForm.parents('.login-form-popup').addClass('is-loading');

                $.ajax({
                    type: 'POST',
                    url: '/login.php?action=check_login',
                    data: formData,
                    processData: false,
                    contentType: false,
                    xhr: function() {
                        return xhr;
                    },
                    success: function(data) {
                        $loginForm.parents('.login-form-popup').removeClass('is-loading');

                        var url = xhr.responseURL;
                        
                        if(url.indexOf(urlSuccess1) != -1 || url.indexOf(urlSuccess2) != -1){
                            location.reload();
                        } else if(url.indexOf(urlError) != -1){
                            redirectTo(url);
                        } else{
                            location.reload();
                        }
                    },
                    error: function (jqXHR, exception) {
                    },
                });
                
                return;
            }
        });
    }

    function redirectTo(url) {
        if (isRunningInIframe() && !window.iframeSdk) {
            window.top.location = url;
        } else {
            window.location = url;
        }
    }

    function isRunningInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }
}

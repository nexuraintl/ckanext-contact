/* Loads the Image into a modal dialog.
 *
 * Examples
 *
 *   <a data-module="modal-image"">Image</a>
 *
 */
this.ckan.module('modal-contact', function (jQuery, _) {
    var self
    return {

        /* holds the loaded lightbox */
        modal: null,

        options: {
            i18n: {
                onSuccess: _('Gracias por contactarnos, y trataremos de responderle lo antes posible.'),
                onError: _('Lo sentimos, hubo un error al enviar el correo electrónico. Por favor, inténtelo de nuevo más tarde.')
            }
        },

        /* Sets up event listeners
         *
         * Returns nothing.
         */
        initialize: function () {
            self = this;
            jQuery.proxyAll(this, /_on/);
            this.el.on('click', this._onClick);
        },

        /* Displays the image
         *
         */
        show: function () {
            var sandbox = this.sandbox,
                module = this;

            module.modal = this.loadTemplate();
            module.modal.find('form').submit(function (event) {

                event.preventDefault();
                var form = $(this);

                jQuery.ajax({
                    url: '/contact/ajax',
                    type: this.method,
                    data: form.serialize(),
                    beforeSend: function (xhr, settings) {
                        $('button.save').attr('disabled', 'disabled').prepend('<i class="fa fa-refresh fa-spin"></i> ');
                    },
                    success: function (results) {
                        console.log(results);
                        if (results.data['success'] !== undefined) {
                            module.hide();
                            self.flash_success(self.i18n('onSuccess'))
                        } else if (!jQuery.isEmptyObject(results.errors)) {
                            self.processFormError(form, results.errors)
                        } else {
                            self.flash_error(self.i18n('onError'));
                            location.reload();
                        }
                    },
                    complete: function () {
                        $('button.save').removeAttr('disabled').find('i.fa').remove();
                    }
                });

                // TODO: Add cancel button

            });

            module.modal.modal().appendTo(sandbox.body);
        },

        /* Process errors returned from form submission process
         *
         */
        processFormError: function (form, errors) {
            // Remove all errors & classes
            form.find('.error-block').remove();
            form.find('.error').removeClass('error');

            // Lop through all the errors, adding the error message and error classes
            for (var k in errors) {
                var controls = form.find("[name='" + k + "']").parent('.controls');
                if (k == 'captcha') {
                    controls = form.find(".g-recaptcha").parent('.controls');
                }
                controls.append('<span class="error-block">' + errors[k] + '</span>');
                controls.parent('.control-group').addClass('error');
            }
        },

        /* Hides the modal.
         *
         */
        hide: function () {
            if (this.modal) {
                this.modal.modal('hide');
            }
        },

        flash_error: function (message) {
            this.flash(message, 'alert-error')
        },

        flash_success: function (message) {
            this.flash(message, 'alert-success')
        },

        flash: function (message, category) {
            $('.flash-messages').append('<div class="alert ' + category + '">' + message + '</div>');
        },

        loadTemplate: function () {
            return $('#modalContact');
        },

        /* Event handler for clicking on the element */
        _onClick: function (event) {
            event.preventDefault();
            this.show();
        },

        /* error handler when the template fails to load */
        _onTemplateError: function () {
            this.sandbox.notify(this.i18n('loadError'));
        }

    };
});
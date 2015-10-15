/*
 *  jquery-validator - v1.0
 *  Create custom jquery plugin validate
 *  Made by Nguyen Phuc Khanh
 *  Under MIT License
 */
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

	"use strict";

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "validator",
		dataKey = "plugin_" + pluginName;
		defaults = {
			delay: 500,
			html: false,
			disable: true,
			custom: {},
			errors: {
				match: 'Does not match',
				minlength: 'Not long enough'
			},
			feedback: {
				success: 'icon-ok',
				error: 'icon-remove'
			}
		},
		validators = {
			'native': function ($el) {
				var el = $el[0]
				return el.checkValidity ? el.checkValidity() : true
			},
			'match': function ($el) {
				var target = $el.data('match')
				return !$el.val() || $el.val() === $(target).val()
			},
			'minlength': function ($el) {
				var minlength = $el.data('minlength')
				return !$el.val() || $el.val().length >= minlength
			},
			'maxlength': function ($el) {
				var minlength = $el.data('maxlength')
				return !$el.val() || $el.val().length <= minlength
			}
		};
		input_selectors = ':input:not([type="submit"], button):enabled:visible'

		// The actual plugin constructor
		function Plugin ( element, options ) {
			this.element = element;
				// jQuery has an extend method which merges the contents of two or
				// more objects, storing the result in the first object. The first object
				// is generally empty as we don't want to alter the default options for
				// future instances of the plugin
				this._options = $.extend( {}, defaults, options );
				this._defaults = defaults;
				this._name = pluginName;
				this._validators = validators;
				this._input_selectors = input_selectors;
				this.init();
			}

		// Avoid Plugin.prototype conflicts
		$.extend(Plugin.prototype, {
			init: function () {
				// Place initialization logic here
				// You already have access to the DOM element and
				// the options via the instance, e.g. this.element
				// and this.settings
				// you can add more functions like the one below and
				// call them like so: this.yourOtherFunction(this.element, this.settings).
				debugger;
				this.$element.on('input.pk.validator change.pk.validator focusout.pk.validator', $.proxy(this.validateInput, this))
				this.$element.on('submit.pk.validator', $.proxy(this.onSubmit, this))
			},
			validate: function () {
				var delay = this.options.delay;

				this.options.delay = 0;
				this.$element.find(this._input_selectors).trigger('input.pk.validator');
				this.options.delay = delay;

				return this;
			},
			validateInput: function () {
				var $el        = $(e.target)
				var prevErrors = $el.data('pk.validator.errors')
				var errors

				if ($el.is('[type="radio"]')) $el = this.$element.find('input[name="' + $el.attr('name') + '"]')

					this.$element.trigger(e = $.Event('validate.pk.validator', {relatedTarget: $el[0]}))

				if (e.isDefaultPrevented()) return

					var self = this
				this.runValidators($el).done(function (errors) {
					$el.data('pk.validator.errors', errors)

					errors.length ? self.showErrors($el) : self.clearErrors($el)

					if (!prevErrors || errors.toString() !== prevErrors.toString()) {
						e = errors.length
						? $.Event('invalid.pk.validator', {relatedTarget: $el[0], detail: errors})
						: $.Event('valid.pk.validator', {relatedTarget: $el[0], detail: prevErrors})

						self.$element.trigger(e)
					}

					self.toggleSubmit()

					self.$element.trigger($.Event('validated.pk.validator', {relatedTarget: $el[0]}))
				})
			}
		});

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
			return this.each(function() {
				if ( !$.data( this, dataKey ) ) {
					$.data( this, dataKey, new Plugin( this, options ) );
				}
			});
		};

	})( jQuery, window, document );

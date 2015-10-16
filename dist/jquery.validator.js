/*
 *  jquery-pkvalidate - v1.0
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
		var pluginName = "pkvalidator",
		dataKey = "plugin_" + pluginName,
		defaults = {
			inputs: 'input, textarea, select'           // Default supported inputs.
	    , excluded: 'input[type=hidden], input[type=file], :disabled' // Do not validate input[type=hidden] & :disabled.
	    , trigger: false                            // $.Event() that will trigger validation. eg: keyup, change..
	    , animate: true                             // fade in / fade out error messages
	    , animateDuration: 300                      // fadein/fadout ms time
	    , focus: 'first'                            // 'fist'|'last'|'none' which error field would have focus first on form validation
	    , validationMinlength: 3                    // If trigger validation specified, only if value.length > validationMinlength
	    , successClass: 'pkvalidate-success'           // Class name on each valid input
	    , errorClass: 'pkvalidate-error'               // Class name on each invalid input
	    , errorMessage: false                       // Customize an unique error message showed if one constraint fails
	    , validators: {}                            // Add your custom validators functions
	    , showErrors: true                          // Set to false if you don't want pkvalidate to display error messages
	    , messages: {}
	    , errors: {
	        classHandler: function ( elem, isRadioOrCheckbox ) {return $(elem).closest('.form-group');}             // specify where pkvalidate error-success classes are set
	      , container: function ( elem, isRadioOrCheckbox ) {}                // specify an elem where errors will be **apened**
	      , errorsWrapper: '<div class="form-group has-error"></div>'                                        // do not set an id for this elem, it would have an auto-generated id
	      , errorElem: '<p class="help-block has-error"></p>'                                            // each field constraint fail in an li
      }                           // Add your own error messages here
		},
		messages = {
			defaultMessage: "This value seems to be invalid.",
			type: {
				email:      "This value should be a valid email."
				, url:        "This value should be a valid url."
				, dateIso:    "This value should be a valid date (YYYY-MM-DD)."
				, phone:      "This value should be a valid phone number."
			},
			notnull: "This value should not be null.",
			required: "This value is require.",
			minlength: "This value is too short. It should have %s characters or more.",
			maxlength: "This value is too long. It should have %s characters or less.",
			regexp: "This value seems to be invalid.",
			match: "This value should be the same %s."

		},
		validators = {
			'match': function (val, target) {
				return !val || val === $(target).val()
			}
			, minlength: function ( val, min ) {
        return val.length >= min;
      }

      , maxlength: function ( val, max ) {
        return val.length <= max;
      }
			, notnull: function ( val ) {
				return val.length > 0;
			}
			, notblank: function ( val ) {
				return 'string' === typeof val && '' !== val.replace( /^\s+/g, '' ).replace( /\s+$/g, '' );
			}
			, required: function ( val ) {

        // for checkboxes and select multiples. Check there is at least one required value
        if ( 'object' === typeof val ) {
        	for ( var i in val ) {
        		if ( this.required( val[ i ] ) ) {
        			return true;
        		}
        	}

        	return false;
        }
        if ('boolean' === typeof val) return val;
        return this.notnull( val ) && this.notblank( val );
      }
      , type: function ( val, type ) {
      	var regExp;

      	switch ( type ) {
      		case 'email':
      			regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))){2,6}$/i;
      			break;
      		case 'url':
      			val = new RegExp( '(https?|s?ftp|git)', 'i' ).test( val ) ? val : 'http://' + val;
      			/* falls through */
      		case 'dateIso':
      			regExp = /^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])$/;
      			break;
      		case 'phone':
	      		regExp = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/;
	      		break;
      		default:
      			return false;
      	}
        // test regExp if not null
        return '' !== val ? regExp.test( val ) : false;
      }

      , regexp: function ( val, regExp, self ) {
      	return new RegExp( regExp, self.options.regexpFlag || '' ).test( val );
      }
    };

		// The actual plugin constructor
		function Plugin ( element, options ) {
			this.$element = $(element);
			
			// jQuery has an extend method which merges the contents of two or
			// more objects, storing the result in the first object. The first object
			// is generally empty as we don't want to alter the default options for
			// future instances of the plugin
			this._options = defaults;
			this._name = pluginName;
			this._validators = validators;
			this._messages = messages;
			this.hasError = false;
			this.init(options);
		}

		// Avoid Plugin.prototype conflicts
		$.extend(Plugin.prototype, {
			init: function (options) {
				this.$element.on('input.pkvalidator change.pkvalidator focusout.pkvalidator', $.proxy(this.validateFields, this));
    		this.$element.on('submit.pkvalidator', $.proxy(this.onSubmit, this));
				this._options = $.extend( {}, defaults, options );
				this._validators = $.extend( {}, validators, options.validators );
				this._messages = $.extend( {}, messages, options.messages );
			},
			validate: function () {
				// debugger
				var arrInput = this._options.inputs.split(',');
				// return false;
				for (var input in arrInput) {
					this.$element.find(arrInput[input].trim()).trigger('input.pkvalidator');
				}
			}
			, validateFields: function (e) {
				// var data = this.data();
				var eType = e.type;
				var errorFlag = false;
				var $target = $(e.target);
				var data = $target.data();
				var value = $target.val();
				// Do not show error with element unrequired
				if (!$target.data('required') && !this._validators['required'](value)) {
					this._options.errors.classHandler($target).removeClass('hasError');
					this.removeMessageError($target);
					return false
				};
				if ($target.is('[type="radio"]')) {

					$target = this.$element.find('input[name="' + $target.attr('name') + '"]');
					value = false;
					data = $target.first().data();
					$target.each(function() {
						if ($(this).prop('checked')) value = true;
					});
				}
				if ($target.is('[type="checkbox"]')) value = $target.prop('checked');

				// reset
				this.removeMessageError($target);
				this._options.errors.classHandler($target).removeClass("hasError");
				this.hasError = false;

				for (var key in data) {
					// debugger;
					if(this._validators.hasOwnProperty(key) && !this._validators[key](value, data[key])){
						this._options.errors.classHandler($target).addClass('hasError');
						// debugger
						this.hasError = true;
						this.showMessageError($target, key, data[key]);
						break;
					}
				}
				return this;
			}
			, onSubmit: function (e) {

				this.validate();
				var arrInput = this._options.inputs.split(',');
				var self = this;
				console.log("form has errors : " + this.hasError);
				if (this.hasError) {
					e.preventDefault;
					return false;
				}
				else {
					alert('submit success');
					e.submit();
				}

			}
			, showMessageError: function (target, key, value) {
				
				var wrap = this._options.errors.classHandler(target);
				var message = ('object' === typeof this._messages[key]) ? this._messages[key][value] : this._messages[key];
				var errorsWrapper = wrap.find($(this._options.errors.errorsWrapper));// $($(this._options.errors.errorsWrapper), wrap);
				var errorElem = $(this._options.errors.errorElem);
				var message = this.formatMesssage(message, value, this);
				
				target.removeClass(this._options.successClass);
				if (!!target.attr('data-error-'+key)) {
					var customError = target.attr('data-error-'+key);
					message = this.formatMesssage(customError, value, this);
				}
				errorElem.text(message);
				if (!errorsWrapper.length) {
					wrap.append(this._options.errors.errorsWrapper);
					errorsWrapper = $($(this._options.errors.errorsWrapper), wrap);
				}
				errorElem.addClass(this._options.errorClass);
				errorsWrapper.append(errorElem);
				wrap.append(errorsWrapper);
			}
			, removeMessageError: function (target) {
				var wrap = this._options.errors.classHandler(target);
				wrap.removeClass('hasError');
				wrap.find('.'+this._options.errorClass+':first').parent().remove();
			}
			, showSuccessField: function (target) {
				target.removeClass(this._options.errorClass);
				target.addClass(this._options.successClass);
			}
			/**
    * Replace %s placeholders by values
    *
    * @method formatMesssage
    * @param {String} message Message key
    * @param {Mixed} args Args passed by validators functions. Could be string, number or object
    * @return {String} Formatted string
    */
    , formatMesssage: function ( message, args ) {
// debugger
    	if ( 'object' === typeof args ) {
    		for ( var i in args ) {
    			message = this.formatMesssage( message, args[ i ] );
    		}

    		return message;
    	}

    	return 'string' === typeof message ? message.replace( new RegExp( '%s', 'i' ), args) : '';
    }

    /**
    * Add / override a validator in validators list
    *
    * @method addValidator
    * @param {String} name Validator name. Will automatically bindable through data-name=''
    * @param {Function} fn Validator function. Must return {Boolean}
    */
    , addValidator: function ( name, fn ) {
    	this.validators[ name ] = fn;
    }

    /**
    * Add / override error message
    *
    * @method addMessage
    * @param {String} name Message name. Will automatically be binded to validator with same name
    * @param {String} message Message
    */
    , addMessage: function ( key, message, type ) {

    	if ( 'undefined' !== typeof type && true === type ) {
    		this.messages.type[ key ] = message;
    		return;
    	}

      // custom types messages are a bit tricky cuz' nested ;)
			if ( 'type' === key ) {
				for ( var i in message ) {
					this.messages.type[ i ] = message[ i ];
				}

				return;
			}
		}
});


		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
			return this.each(function() {
				if ( !$.data( this, dataKey ) ) {
					if (!options) options = {};
					$.data( this, dataKey, new Plugin( this, options ) );
				}
			});
		};
		$( window ).on( 'load', function () {
			$( '[data-validate="pkvalidator"]' ).each( function () {
				$( this ).pkvalidator();
			} );
		} );

	})( jQuery, window, document );

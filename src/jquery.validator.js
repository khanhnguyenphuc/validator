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



		// Create the defaults once
		var pluginName = "pkvalidator";
		var dataKey = pluginName;
		var defaults = {
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
    };

    /*Create abstract class
    *
		*@class: Validator
		*@constructor
		*/
    var Validator = function(options) {

    	/*List messages error
    	*@property: messages
    	*@type: object
    	*/
    	this.messages = {
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

    	};
	    /*List validators function
	    *@property: validators
    	*@type: object
    	*/
    	this.validators = {
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
	    this.init(options);
		};
  $.extend(Validator.prototype, {
  	constructor: Validator,
  	/* Add custom validators and messages*/
  	init: function(options) {
  		var customValidators = options.validators
        , customMessages = options.messages;

      var key;
      for ( key in customValidators ) {
        this.addValidator(key, customValidators[ key ]);
      }

      for ( key in customMessages ) {
        this.addMessage(key, customMessages[ key ]);
      }
  	}
  	/**
    * Replace %s placeholders by values
    *
    * @method Validator.formatMesssage
    * @param {String} message Message key
    * @param {Mixed} args Args passed by validators functions. Could be string, number or object
    * @return {String} Formatted string
    */
    , formatMesssage: function ( message, args ) {
    	if ( 'object' === typeof args ) {
    		for ( var i in args ) {
    			message = this.Validator.formatMesssage( message, args[ i ] );
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
		
	/*
	* PkvalidatorField add to each input inside form
	*
	*@class: PkvalidatorField
	*@constructor
	*/
	var PkvalidatorField = function(element, options, type) {
		this.$element = $(element);
		this.Validator = new Validator(options);

		if (type === 'PkvalidatorMultiField') return this;
		this._options = options;
		this._type = 'PkvalidatorField';
		this.lstError = [];
		this.hasError = false;
		this.addConstraints();
		this.init(options);
	};

	$.extend(PkvalidatorField.prototype, {
		constructor: PkvalidatorField,
		init: function(options) {
			var listener = 'input.' + this._type + ' change.' + this._type + ' focusout.' + this._type;
			this.$element.on(listener, $.proxy(this.validate, this));
		}
		, validate: function() {
			var value = this.$element.val();
			var data = this.$element.data();
			// Do not show error with element unrequired
			if (!this.$element.data('required') && !this.Validator.validators['required'](value)) {
				this._options.errors.classHandler(this.$element).removeClass('hasError');
				this.removeMessageError(this.$element);
				return false
			}
			// reset
			this.removeMessageError(this.$element);
			this._options.errors.classHandler(this.$element).removeClass("hasError");
			this.hasError = false;

			if (this.$element.is('[type="radio"]') || this.$element.is('[type="checkbox"]')) {

				this.$element = $('input[name="' + this.$element.attr('name') + '"]');
				value = false;
				data = this.$element.first().data();
				this.$element.each(function() {
					if ($(this).prop('checked')) value = true;
				});
			}

			for (var key in data) {
				if(this.Validator.validators.hasOwnProperty(key) && !this.Validator.validators[key](value, data[key])){
					this._options.errors.classHandler(this.$element).addClass('hasError');
					this.hasError = true;
					this.showMessageError(this.$element, key, data[key]);
					break;
				}
			}
			return this.hasError;
		}
		, addConstraints: function() {
			for (var key in this._options.constraints) {
				var value = this._options.constraints[key];
				// if ('object' === typeof value) {
				// 	this.addConstraint(key, value[key])
				// }
				this.$element.data(key, value);
			}
		}
		, manageErrors: function() {}
		, showMessageError: function (target, key, value) {
			
			var wrap = this._options.errors.classHandler(target);
			var message = ('object' === typeof this.Validator.messages[key]) ? this.Validator.messages[key][value] : this.Validator.messages[key];
			var errorsWrapper = wrap.find($(this._options.errors.errorsWrapper));// $($(this._options.errors.errorsWrapper), wrap);
			var errorElem = $(this._options.errors.errorElem);
			var message = this.Validator.formatMesssage(message, value, this);
			
			target.removeClass(this._options.successClass);
			if (!!target.attr('data-error-'+key)) {
				var customError = target.attr('data-error-'+key);
				message = this.Validator.formatMesssage(customError, value, this);
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
		, destroy: function () {
			this.$element.off('.' + this._type).removeData(dataKey);
			this.removeMessageError(this.$element);
		}
	});
	/*
	* Create PkvalidatorMultiField for radio and checkbox
	*
	*@class: PkvalidatorForm
	*@constructor
	*/
	var PkvalidatorMultiField = function(element, options) {
		this.$element = $(element);
  	this.items = {};
  	this.Validator = new Validator(options);
  	this._options = options;
  	this.inherit(element, options);
  	this.init(options);
  	this._type = 'PkvalidatorMultiField';
	};
	$.extend(PkvalidatorMultiField.prototype, {
		init: function(options) {
			
	  	this.group = options.group || false;
	  	this.siblings = this.group ? $('input[type=' + this.group + ']') : $('input[type=' + this.$element.name + ']');
	  	this.isRadio = false;
	  	this.isCheckbox = false;
	  	this.siblings.on('change.' + this._type, $.proxy(this.validate, this));
		}
		, inherit: function(elem, options) {
			var clone = new PkvalidatorField(elem, options, this._type);
			for (var property in clone) {
				if ('undefined' === typeof this[property])
					this[property] = clone[property];
			}
		}
		, getVal: function() {
			var values = [];
			if (this.isRadio) {
				var val = this.siblings.find('input:checked').val() || false;
				values.push(val);
			}

			if (this.isCheckbox) {
				this.siblings.find('input:checked').forEach(function(checkbox) {
					values.push(this.val());
				});
			}
			return values;
		}
	});

	/*
	* Create PkvalidatorForm
	*
	*@class: PkvalidatorForm
	*@constructor
	*/
  var PkvalidatorForm = function(element, options) {
  	this.$element = $(element);
  	this.items = []; // list inputs inside form
  	this.Validator = new Validator(options);
  	this._options = options;
  	this.init(options);
  };

	// Avoid Plugin.prototype conflicts
	$.extend(PkvalidatorForm.prototype, {
		constructor: PkvalidatorForm,
		init: function (options) {
			var self = this;
			this.$element.find( options.inputs ).each( function () {
        self.addItem( this );
      });
			this.$element.on('submit.PkvalidatorForm', $.proxy(this.onSubmit, this));
		},
		validate: function () {
			
			this.items.forEach(function(item) {
				item.validate();
			});
			return !this.hasError();
		}
		, hasError: function () {
			
			for (var item in this.items) {
				if (this.items[item].hasError) return true;
			}
			return false;
		}
		, addItem: function ( elem ) {
			if ( $( elem ).is( this._options.excluded ) ) {
				return false;
			}
			var validatorField = $(elem).pkvalidator(this._options );

      this.items.push( validatorField );
      // this.items.push( PkvalidatorField );
    }
		, onSubmit: function (e) {
			e.preventDefault();
			if(this.validate())
				console('submit success')
			else
				console('submit fail')

		}
		, showMessageError: function (target, key, value) {
			
			var wrap = this._options.errors.classHandler(target);
			var message = ('object' === typeof this.Validator.messages[key]) ? this.Validator.messages[key][value] : this.Validator.messages[key];
			var errorsWrapper = wrap.find($(this._options.errors.errorsWrapper));// $($(this._options.errors.errorsWrapper), wrap);
			var errorElem = $(this._options.errors.errorElem);
			var message = this.Validator.formatMesssage(message, value, this);
			
			target.removeClass(this._options.successClass);
			if (!!target.attr('data-error-'+key)) {
				var customError = target.attr('data-error-'+key);
				message = this.Validator.formatMesssage(customError, value, this);
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
		, destroy: function () {
			this.$element.off('.' + this._type).removeData(dataKey);
			this.items.forEach(function(item) {
				item.destroy();
			});
		}
});

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
			// debugger
			
			var plugin = this.data(dataKey);

      // has plugin instantiated ?
      if (plugin) {
      		// here is our pkvalidator public function accessor
      		if ( 'string' === typeof options && 'function' === typeof plugin[ options ] ) {
		        var response = plugin[ options ]();

		        return 'undefined' !== typeof response ? response : $( self );
		      }
          // if have options arguments, call plugin.init() again
          if (typeof options !== 'undefined') {
              plugin.init(options);
          }
      } else {
      	options = $.extend({}, defaults, 'undefined' !== typeof options ? options : {}, this.data() );
          if (this.is( 'form' )){
          	plugin = new PkvalidatorForm( this, options );
					}
					else if (!this.is(options.excluded)){
						if (!this.is('input[type=radio], input[type=checkbox]')) {
							plugin = new PkvalidatorField( this, options );
						}
						else {
							plugin = new PkvalidatorMultiField( this, options );
						}
					}
					this.data(dataKey, plugin );
      }

      return plugin;
		};
		$( window ).on( 'load', function () {
			$( '[data-validate="pkvalidator"]' ).each( function () {
				$( this ).pkvalidator();
			} );
		} );

	})( jQuery, window, document );

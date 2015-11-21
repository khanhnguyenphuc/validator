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
        defaultMessage: "This value seems to be invalid."
      , type: {
            email:      "This value should be a valid email."
          , url:        "This value should be a valid url."
          , urlstrict:  "This value should be a valid url."
          , number:     "This value should be a valid number."
          , digits:     "This value should be digits."
          , dateIso:    "This value should be a valid date (YYYY-MM-DD)."
          , alphanum:   "This value should be alphanumeric."
          , phone:      "This value should be a valid phone number."
        }
      , notnull:        "This value should not be null."
      , notblank:       "This value should not be blank."
      , required:       "This value is required."
      , regexp:         "This value seems to be invalid."
      , min:            "This value should be greater than or equal to %s."
      , max:            "This value should be lower than or equal to %s."
      , range:          "This value should be between %s and %s."
      , minlength:      "This value is too short. It should have %s characters or more."
      , maxlength:      "This value is too long. It should have %s characters or less."
      , rangelength:    "This value length is invalid. It should be between %s and %s characters long."
      , mincheck:       "You must select at least %s choices."
      , maxcheck:       "You must select %s choices or less."
      , rangecheck:     "You must select between %s and %s choices."
      , equalto:        "This value should be the same."
    },
	    /*List validators function
	    *@property: validators
    	*@type: object
    	*/
    	this.validators = {
    		notnull: function ( val ) {
	        return val.length > 0;
	      }

	      , notblank: function ( val ) {
	        return 'string' === typeof val && '' !== val.replace( /^\s+/g, '' ).replace( /\s+$/g, '' );
	      }

	      // Works on all inputs. val is object for checkboxes
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

	        return this.notnull( val ) && this.notblank( val );
	      }

	      , type: function ( val, type ) {
	        var regExp;

	        switch ( type ) {
	          case 'number':
	            regExp = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
	            break;
	          case 'digits':
	            regExp = /^\d+$/;
	            break;
	          case 'alphanum':
	            regExp = /^\w+$/;
	            break;
	          case 'email':
	            regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))){2,6}$/i;
	            break;
	          case 'url':
	            val = new RegExp( '(https?|s?ftp|git)', 'i' ).test( val ) ? val : 'http://' + val;
	            /* falls through */
	          case 'urlstrict':
	            regExp = /^(https?|s?ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
	            break;
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

	      , minlength: function ( val, min ) {
	        return val.length >= min;
	      }

	      , maxlength: function ( val, max ) {
	        return val.length <= max;
	      }

	      , rangelength: function ( val, arrayRange ) {
	        return this.minlength( val, arrayRange[ 0 ] ) && this.maxlength( val, arrayRange[ 1 ] );
	      }

	      , min: function ( val, min ) {
	        return Number( val ) >= min;
	      }

	      , max: function ( val, max ) {
	        return Number( val ) <= max;
	      }

	      , range: function ( val, arrayRange ) {
	        return val >= arrayRange[ 0 ] && val <= arrayRange[ 1 ];
	      }

	      , equalto: function ( val, elem, self ) {
	        self.options.validateIfUnchanged = true;

	        return val === $( elem ).val();
	      }

	      , remote: function ( val, url, self ) {
	        var result = null
	          , data = {}
	          , dataType = {};

	        data[ self.$element.attr( 'name' ) ] = val;

	        if ( 'undefined' !== typeof self.options.remoteDatatype ) {
	          dataType = { dataType: self.options.remoteDatatype };
	        }

	        var manage = function ( isConstraintValid, message ) {
	          // remove error message if we got a server message, different from previous message
	          if ( 'undefined' !== typeof message && 'undefined' !== typeof self.Validator.messages.remote && message !== self.Validator.messages.remote ) {
	            $( self.ulError + ' .remote' ).remove();
	          }

	          self.updtConstraint( { name: 'remote', valid: isConstraintValid }, message );
	          self.manageValidationResult();
	        };

	        // transform string response into object
	        var handleResponse = function ( response ) {
	          if ( 'object' === typeof response ) {
	            return response;
	          }

	          try {
	            response = $.parseJSON( response );
	          } catch ( err ) {}

	          return response;
	        }

	        var manageErrorMessage = function ( response ) {
	          return 'object' === typeof response && null !== response ? ( 'undefined' !== typeof response.error ? response.error : ( 'undefined' !== typeof response.message ? response.message : null ) ) : null;
	        }

	        $.ajax( $.extend( {}, {
	            url: url
	          , data: data
	          , type: self.options.remoteMethod || 'GET'
	          , success: function ( response ) {
	            response = handleResponse( response );
	            manage( 1 === response || true === response || ( 'object' === typeof response && null !== response && 'undefined' !== typeof response.success ), manageErrorMessage( response )
	            );
	          }
	          , error: function ( response ) {
	            response = handleResponse( response );
	            manage( false, manageErrorMessage( response ) );
	          }
	        }, dataType ) );

	        return result;
	      }

	      /**
	      * Aliases for checkboxes constraints
	      */
	      , mincheck: function ( obj, val ) {
	        return this.minlength( obj, val );
	      }

	      , maxcheck: function ( obj, val ) {
	        return this.maxlength( obj, val);
	      }

	      , rangecheck: function ( obj, arrayRange ) {
	        return this.rangelength( obj, arrayRange );
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
			this.events = 'input.' + this._type + ' change.' + this._type + ' focusout.' + this._type;
			this.dataValid = this.$element.data();
			this.$element.on(this.events, $.proxy(this.validate, this));
		}
		, validate: function() {
			var value = this.getVal();
			var data = this.getData();
			// Do not show error with element unrequired
			if (!data['required'] && !this.Validator.validators['required'](value)) {
				this._options.errors.classHandler(this.$element).removeClass('hasError');
				this.removeMessageError(this.$element);
				return false
			}
			// reset
			this.removeMessageError(this.$element);
			this._options.errors.classHandler(this.$element).removeClass("hasError");
			this.hasError = false;

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
				if ('object' === typeof value) {
					this.addConstraint(key, value[key])
				}
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
		, getVal: function () {
      return this.$element.data('value') || this.$element.val();
    }
		, getData: function () {
      return this.$element.data(pluginName).dataValid;
    }
		, destroy: function () {
			this.$element.off('.' + this._type, this.events).removeData(pluginName);
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
		this.initMultiple(element, options);
  	this.items = {};
  	this._type = 'PkvalidatorMultiField';
  	this.Validator = new Validator(options);
  	this._options = options;
  	this.inherit(element, options);
  	this.init(options);
	};
	$.extend(PkvalidatorMultiField.prototype, {
		inherit: function(elem, options) {
			var clone = new PkvalidatorField(elem, options, this._type);
			for (var property in clone) {
				if ('undefined' === typeof this[property])
					this[property] = clone[property];
			}
		}
		, initMultiple: function ( element, options ) {
      this.element = element;
      this.$element = $( element );
      this.group = options.group || false;
      this.hash = this.getName();
      this.siblings = this.group ? '[data-group="' + this.group + '"]' : 'input[name="' + this.$element.attr( 'name' ) + '"]';
      this.isRadioOrCheckbox = true;
      this.isRadio = this.$element.is( 'input[type=radio]' );
      this.isCheckbox = this.$element.is( 'input[type=checkbox]' );
      this.errorClassHandler = options.errors.classHandler( element, this.isRadioOrCheckbox ) || this.$element.parent();
    }
		, getVal: function () {
      if ( this.isRadio ) {
        return $( this.siblings + ':checked' ).val() || '';
      }

      if ( this.isCheckbox ) {
        var values = [];

        $( this.siblings + ':checked' ).each( function () {
          values.push( $( this ).val() );
        } );

        return values;
      }
    }
		, getData: function () {
      return $(this.siblings).first().data(pluginName).dataValid;
    }

    , getName: function () {
      if ( this.group ) {
        return 'pkvalidator-' + this.group;
      }

      if ( 'undefined' === typeof this.$element.attr( 'name' ) ) {
        throw "A radio / checkbox input must have a data-group attribute or a name to be pkvalidator validated !";
      }

      return 'pkvalidator-' + this.$element.attr( 'name' ).replace( /(:|\.|\[|\])/g, '' );
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
  	this._type = 'PkvalidatorForm';
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
      this.events = 'submit.PkvalidatorForm';
			this.$element.on(this.events, $.proxy(this.onSubmit, this));
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
			
			if(this.validate())
				console('submit success');
			else
				e.preventDefault();
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
			this.$element.off('.' + this._type, this.events).removeData(pluginName);
			this.items.forEach(function(item) {
				item.destroy();
			});
		}
});

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
			
			var plugin = this.data(pluginName);

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
					this.data(pluginName, plugin );
      }

      return plugin;
		};
		$(function() {
      $('[data-' + pluginName + ']')[pluginName]();
    });

	})( jQuery, window, document );

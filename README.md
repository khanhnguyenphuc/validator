# pkvalidator
Create custom jquery plugin validator

#How to use

Validate form : $(formSelector).pkvalidator([options]);

$(formSelector).pkvalidator({
	successClass: 'success',
	errorClass  : 'error',
	errors      : {
		classHandler : function (el) {
			return $(el).closest('.form-group');
		},
		errorsWrapper: '<ul class=\"help-inline\"></ul>',
		errorElem    : '<li></li>'
	}
});

Validate selector : $(inputSelector).pkvalidator({
	constraints: {
		required: true/false,
		minlenght: 4,
		...
	},
	validators: {} // custom validators
	message: {} // custom message
});

#Call validate function by string
selector.pkvalidtor(string)
string : "validate", "destroy", ...


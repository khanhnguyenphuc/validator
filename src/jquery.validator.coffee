###
#  jquery-pkvalidate - v1.0
#  Create custom jquery plugin validate
#  Made by Nguyen Phuc Khanh
#  Under MIT License
###

# the semi-colon before function invocation is a safety net against concatenated

# scripts and/or other plugins which may not be closed properly.
(($, window, document) ->
  'use strict'
  # Create the defaults once
  pluginName = 'pkvalidator'
  dataKey = pluginName
  defaults =
    inputs: 'input, textarea, select'
    excluded: 'input[type=hidden], input[type=file], :disabled'
    trigger: false
    animate: true
    animateDuration: 300
    focus: 'first'
    validationMinlength: 3
    successClass: 'pkvalidate-success'
    errorClass: 'pkvalidate-error'
    errorMessage: false
    validators: {}
    showErrors: true
    messages: {}
    errors:
      classHandler: (elem, isRadioOrCheckbox) ->
        $(elem).closest '.form-group'
      container: (elem, isRadioOrCheckbox) ->
      errorsWrapper: '<div class="form-group has-error"></div>'
      errorElem: '<p class="help-block has-error"></p>'

  ###Create abstract class
  *
                *@class: Validator
                *@constructor
  ###

  Validator = (options) ->

    ###List messages error
    *@property: messages
    *@type: object
    ###

    @messages =
      defaultMessage: 'This value seems to be invalid.'
      type:
        email: 'This value should be a valid email.'
        url: 'This value should be a valid url.'
        dateIso: 'This value should be a valid date (YYYY-MM-DD).'
        phone: 'This value should be a valid phone number.'
      notnull: 'This value should not be null.'
      required: 'This value is require.'
      minlength: 'This value is too short. It should have %s characters or more.
'
      maxlength: 'This value is too long. It should have %s characters or less.'

      regexp: 'This value seems to be invalid.'
      match: 'This value should be the same %s.'

    ###List validators function
    *@property: validators
    *@type: object
    ###

    @validators =
      'match': (val, target) ->
        !val or val == $(target).val()
      minlength: (val, min) ->
        val.length >= min
      maxlength: (val, max) ->
        val.length <= max
      notnull: (val) ->
        val.length > 0
      notblank: (val) ->
        'string' == typeof val and '' != val.replace(/^\s+/g, '').replace(/\s+$/
g, '')
      required: (val) ->
        # for checkboxes and select multiples. Check there is at least one requi
red value
        if 'object' == typeof val
          for i of val
            if @required(val[i])
              return true
          return false
        if 'boolean' == typeof val
          return val
        @notnull(val) and @notblank(val)
      type: (val, type) ->
        regExp = undefined
        switch type
          when 'email'
            regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\
uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\
uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x
09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\u
D7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF
\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))
@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7F
F\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF
0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u
00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF
0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[
\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))){2,6}$/i
          when 'dateIso'
            regExp = /^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])$/
          when 'phone'
            regExp = /^((\+\d{1,3}(-| )?\(?\d\)?(-| )?\d{1,5})|(\(?\d{2,6}\)?))(
-| )?(\d{3,4})(-| )?(\d{4})(( x| ext)\d{1,5}){0,1}$/
          else
            return false
        # test regExp if not null
        if '' != val then regExp.test(val) else false
      regexp: (val, regExp, self) ->
        new RegExp(regExp, self.options.regexpFlag or '').test val
    @init options
    return

  return
  $.extend Validator.prototype,
    constructor: Validator
    init: (options) ->
      customValidators = options.validators
      customMessages = options.messages
      key = undefined
      for key of customValidators
        `key = key`
        @addValidator key, customValidators[key]
      for key of customMessages
        `key = key`
        @addMessage key, customMessages[key]
      return
    formatMesssage: (message, args) ->
      if 'object' == typeof args
        for i of args
          message = @Validator.formatMesssage(message, args[i])
        return message
      if 'string' == typeof message then message.replace(new RegExp('%s', 'i'),
args) else ''
    addValidator: (name, fn) ->
      @validators[name] = fn
      return
    addMessage: (key, message, type) ->
      if 'undefined' != typeof type and true == type
        @messages.type[key] = message
        return
      # custom types messages are a bit tricky cuz' nested ;)
      if 'type' == key
        for i of message
          @messages.type[i] = message[i]
        return
      return

  ###
  * PkvalidatorField add to each input inside form
  *
  *@class: PkvalidatorField
  *@constructor
  ###

  PkvalidatorField = (element, options, type) ->
    @$element = $(element)
    @Validator = new Validator(options)
    if type == 'PkvalidatorMultiField'
      return this
    @_options = options
    @_type = 'PkvalidatorField'
    @lstError = []
    @hasError = false
    @addConstraints()
    @init options
    return

  $.extend PkvalidatorField.prototype,
    constructor: PkvalidatorField
    init: (options) ->
      listener = 'input.' + @_type + ' change.' + @_type + ' focusout.' + @_type

      @$element.on listener, $.proxy(@validate, this)
      return
    validate: ->
      value = @$element.val()
      data = @$element.data()
      # Do not show error with element unrequired
      if !@$element.data('required') and !@Validator.validators['required'](valu
e)
        @_options.errors.classHandler(@$element).removeClass 'hasError'
        @removeMessageError @$element
        return false
      # reset
      @removeMessageError @$element
      @_options.errors.classHandler(@$element).removeClass 'hasError'
      @hasError = false
      if @$element.is('[type="radio"]') or @$element.is('[type="checkbox"]')
        @$element = $('input[name="' + @$element.attr('name') + '"]')
        value = false
        data = @$element.first().data()
        @$element.each ->
          if $(this).prop('checked')
            value = true
          return
      for key of data
        if @Validator.validators.hasOwnProperty(key) and !@Validator.validators[
key](value, data[key])
          @_options.errors.classHandler(@$element).addClass 'hasError'
          @hasError = true
          @showMessageError @$element, key, data[key]
          break
      @hasError
    addConstraints: ->
      for key of @_options.constraints
        value = @_options.constraints[key]
        # if ('object' === typeof value) {
        #       this.addConstraint(key, value[key])
        # }
        @$element.data key, value
      return
    manageErrors: ->
    showMessageError: (target, key, value) ->
      `var message`
      wrap = @_options.errors.classHandler(target)
      message = if 'object' == typeof @Validator.messages[key] then @Validator.m
essages[key][value] else @Validator.messages[key]
      errorsWrapper = wrap.find($(@_options.errors.errorsWrapper))
      # $($(this._options.errors.errorsWrapper), wrap);
      errorElem = $(@_options.errors.errorElem)
      message = @Validator.formatMesssage(message, value, this)
      target.removeClass @_options.successClass
      if ! !target.attr('data-error-' + key)
        customError = target.attr('data-error-' + key)
        message = @Validator.formatMesssage(customError, value, this)
      errorElem.text message
      if !errorsWrapper.length
        wrap.append @_options.errors.errorsWrapper
        errorsWrapper = $($(@_options.errors.errorsWrapper), wrap)
      errorElem.addClass @_options.errorClass
      errorsWrapper.append errorElem
      wrap.append errorsWrapper
      return
    removeMessageError: (target) ->
      wrap = @_options.errors.classHandler(target)
      wrap.removeClass 'hasError'
      wrap.find('.' + @_options.errorClass + ':first').parent().remove()
      return
    showSuccessField: (target) ->
      target.removeClass @_options.errorClass
      target.addClass @_options.successClass
      return
    destroy: ->
      @$element.off('.' + @_type).removeData dataKey
      @removeMessageError @$element
      return

  ###
  * Create PkvalidatorMultiField for radio and checkbox
  *
  *@class: PkvalidatorForm
  *@constructor
  ###

  PkvalidatorMultiField = (element, options) ->
    @$element = $(element)
    @items = {}
    @Validator = new Validator(options)
    @_options = options
    @inherit element, options
    @init options
    @_type = 'PkvalidatorMultiField'
    return

  $.extend PkvalidatorMultiField.prototype,
    init: (options) ->
      @group = options.group or false
      @siblings = if @group then $('input[type=' + @group + ']') else $('input[t
ype=' + @$element.name + ']')
      @isRadio = false
      @isCheckbox = false
      @siblings.on 'change.' + @_type, $.proxy(@validate, this)
      return
    inherit: (elem, options) ->
      clone = new PkvalidatorField(elem, options, @_type)
      for property of clone
        if 'undefined' == typeof @[property]
          @[property] = clone[property]
      return
    getVal: ->
      values = []
      if @isRadio
        val = @siblings.find('input:checked').val() or false
        values.push val
      if @isCheckbox
        @siblings.find('input:checked').forEach (checkbox) ->
          values.push @val()
          return
      values

  ###
  * Create PkvalidatorForm
  *
  *@class: PkvalidatorForm
  *@constructor
  ###

  PkvalidatorForm = (element, options) ->
    @$element = $(element)
    @items = []
    # list inputs inside form
    @Validator = new Validator(options)
    @_options = options
    @init options
    return

  # Avoid Plugin.prototype conflicts
  $.extend PkvalidatorForm.prototype,
    constructor: PkvalidatorForm
    init: (options) ->
      self = this
      @$element.find(options.inputs).each ->
        self.addItem this
        return
      @$element.on 'submit.PkvalidatorForm', $.proxy(@onSubmit, this)
      return
    validate: ->
      @items.forEach (item) ->
        item.validate()
        return
      !@hasError()
    hasError: ->
      for item of @items
        if @items[item].hasError
          return true
      false
    addItem: (elem) ->
      if $(elem).is(@_options.excluded)
        return false
      validatorField = $(elem).pkvalidator(@_options)
      @items.push validatorField
      # this.items.push( PkvalidatorField );
      return
    onSubmit: (e) ->
      if @validate()
        console 'submit success'
      else
        e.preventDefault()
      return
    showMessageError: (target, key, value) ->
      `var message`
      wrap = @_options.errors.classHandler(target)
      message = if 'object' == typeof @Validator.messages[key] then @Validator.m
essages[key][value] else @Validator.messages[key]
      errorsWrapper = wrap.find($(@_options.errors.errorsWrapper))
      # $($(this._options.errors.errorsWrapper), wrap);
      errorElem = $(@_options.errors.errorElem)
      message = @Validator.formatMesssage(message, value, this)
      target.removeClass @_options.successClass
      if ! !target.attr('data-error-' + key)
        customError = target.attr('data-error-' + key)
        message = @Validator.formatMesssage(customError, value, this)
      errorElem.text message
      if !errorsWrapper.length
        wrap.append @_options.errors.errorsWrapper
        errorsWrapper = $($(@_options.errors.errorsWrapper), wrap)
      errorElem.addClass @_options.errorClass
      errorsWrapper.append errorElem
      wrap.append errorsWrapper
      return
    removeMessageError: (target) ->
      wrap = @_options.errors.classHandler(target)
      wrap.removeClass 'hasError'
      wrap.find('.' + @_options.errorClass + ':first').parent().remove()
      return
    showSuccessField: (target) ->
      target.removeClass @_options.errorClass
      target.addClass @_options.successClass
      return
    destroy: ->
      @$element.off('.' + @_type).removeData dataKey
      @items.forEach (item) ->
        item.destroy()
        return
      return
  # A really lightweight plugin wrapper around the constructor,
  # preventing against multiple instantiations

  $.fn[pluginName] = (options) ->
    # debugger
    plugin = @data(dataKey)
    # has plugin instantiated ?
    if plugin
      # here is our pkvalidator public function accessor
      if 'string' == typeof options and 'function' == typeof plugin[options]
        response = plugin[options]()
        return if 'undefined' != typeof response then response else $(self)
      # if have options arguments, call plugin.init() again
      if typeof options != 'undefined'
        plugin.init options
    else
      options = $.extend({}, defaults, if 'undefined' != typeof options then opt
ions else {}, @data())
      if @is('form')
        plugin = new PkvalidatorForm(this, options)
      else if !@is(options.excluded)
        if !@is('input[type=radio], input[type=checkbox]')
          plugin = new PkvalidatorField(this, options)
        else
          plugin = new PkvalidatorMultiField(this, options)
      @data dataKey, plugin
    plugin

  $(window).on 'load', ->
    $('[data-validate="pkvalidator"]').each ->
      $(this).pkvalidator()
      return
    return
  return
) jQuery, window, document
var H5P = H5P || {};

/**
 * Constructor.
 *
 * @param {object} params Options for this library.
 */
H5P.Text = function (params) {
  this.text = params.text === undefined ? '<em>New text</em>' : params.text;
};

/**
 * Wipe out the content of the wrapper and put our HTML in it.
 *
 * @param {jQuery} $wrapper
 */
H5P.Text.prototype.attach = function ($wrapper) {
  $wrapper.addClass('h5p-text').html(this.text);
};
;
var H5P = H5P || {};

/**
 * Text Input Field module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.TextInputField = (function ($) {
  // CSS Classes:
  var MAIN_CONTAINER = 'h5p-text-input-field';
  var INPUT_LABEL = 'h5p-text-input-field-label';
  var INPUT_FIELD = 'h5p-text-input-field-textfield';
  var WRAPPER_MESSAGE = 'h5p-text-input-field-message-wrapper';
  var CHAR_MESSAGE = 'h5p-text-input-field-message-char';

  var ariaId = 0;

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @returns {Object} TextInputField TextInputField instance
   */
  function TextInputField(params, id, contentData) {
    this.$ = $(this);
    this.id = id;
    this.contentData = contentData;

    // Set default behavior.
    this.params = $.extend({}, {
      taskDescription: 'Input field',
      placeholderText: '',
      inputFieldSize: '1',
      requiredField: false
    }, params);

    // Sanitize the task description as it comes in HTML
    this.XAPIGenerator = new H5P.TextInputField.XAPIGenerator(this.params.taskDescription.replace(/^\s+|\s+$/g, '').replace(/(<p>|<\/p>)/img, ""));

    // Set the maximum length for the textarea
    this.maxTextLength = (typeof this.params.maximumLength === 'undefined') ? '' : parseInt(this.params.maximumLength, 10);

    // Get previous state
    if (this.contentData !== undefined && this.contentData.previousState !== undefined) {
      this.previousState = this.contentData.previousState;
    }

    ariaId++;
  }

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  TextInputField.prototype.attach = function ($container) {
    var self = this;
    this.$inner = $container.addClass(MAIN_CONTAINER);

    this.$taskDescription = $('<div>', {
      id: ariaId,
      'class': INPUT_LABEL + (this.params.requiredField ? ' required' : ''),
      'html': self.params.taskDescription
    }).appendTo(self.$inner);

    this.$inputField = $('<textarea>', {
      'class': INPUT_FIELD,
      'rows': parseInt(self.params.inputFieldSize, 10),
      'maxlength': self.maxTextLength,
      'placeholder': self.params.placeholderText,
      'tabindex': '0',
      'aria-required': this.params.requiredField,
      'aria-labelledby': ariaId
    }).appendTo(self.$inner);

    // set state from previous one
    this.setState(this.previousState);

    var $wrapperMessage = $('<div>', {'class': WRAPPER_MESSAGE}).appendTo(self.$inner);
    this.$charMessage = $('<div>', {'class': CHAR_MESSAGE}).appendTo($wrapperMessage);
    this.$inputField.on('change keyup paste', function () {
      if (self.params.maximumLength !== undefined) {
        self.$charMessage.html(self.params.remainingChars.replace(/@chars/g, self.computeRemainingChars()));
      }
    });

    this.$inputField.blur(function () {
      var xApiTemplate = self.createXAPIEventTemplate('interacted');
      var xApiEvent = self.XAPIGenerator.generateXApi(xApiTemplate, self.$inputField.val());
      self.trigger(xApiEvent);
    });

    this.$inputField.trigger('change');
  };

  /**
   * Returns true if input field is not required or non-empty
   * @returns {boolean} True if input field is filled or not required
   */
  TextInputField.prototype.isRequiredInputFilled = function () {
    if (!this.params.requiredField) {
      return true;
    }

    if (this.params.requiredField && this.$inputField.val().length) {
      return true;
    }

    return false;
  };

  /**
   * Retrieves the text input field
   * @returns {description:string, value:string} Returns input field
   */
  TextInputField.prototype.getInput = function () {
    // Strip away HTML from description:
    var descriptionDoc = new DOMParser().parseFromString(this.params.taskDescription, 'text/html');
    var description = (descriptionDoc.body && descriptionDoc.body.textContent) ? descriptionDoc.body.textContent : '';

    // Remove trailing newlines
    var cleanedTaskDescription = description
      .replace(/^\s+|\s+$/g, '')
      .replace(/(<p>|<\/p>)/img, "");

    // Escape html
    var descriptionElement = document.createElement('div');
    descriptionElement.textContent = cleanedTaskDescription;

    return {
      description: descriptionElement.innerHTML,
      value: this.$inputField.val()
    };
  };

  /**
   * Get current state for H5P.Question.
   * @return {object} Current state.
   */
  TextInputField.prototype.getCurrentState = function () {
    // We could have just uses a string, but you never know when you need to store more parameters
    return {
      'inputField': this.$inputField.val()
    };
  };

  /**
   * Set state from previous state.
   * @param {object} previousState - PreviousState.
   */
  TextInputField.prototype.setState = function (previousState) {
    var self = this;

    if (previousState === undefined) {
      return;
    }
    if (typeof previousState === 'object' && !Array.isArray(previousState)) {
      self.$inputField.html(previousState.inputField || '');
    }
  };

  /**
   * Mark field if empty until it's filled.
   */
  TextInputField.prototype.markEmptyField = function () {
    const self = this;

    if (this.$inputField.val().length === 0) {
      this.$inputField.addClass('required-input');
    }
    this.$inputField.one('input', function () {
      self.$inputField.removeClass('required-input');
    });
  };

  /**
   * Compute the remaining number of characters
   * @returns {number} Returns number of characters left
   */
  TextInputField.prototype.computeRemainingChars = function () {
    return this.maxTextLength - this.$inputField.val().length;
  };

  /**
   * Triggers an 'answered' xAPI event for all inputs
   */
  TextInputField.prototype.triggerAnsweredEvent = function  () {
    var xApiTemplate = this.createXAPIEventTemplate('answered');
    var xApiEvent = this.XAPIGenerator.generateXApi(xApiTemplate, this.getCurrentState().inputField);
    this.trigger(xApiEvent);
  };

  /**
   * Get xAPI data.
   * Contract used by report rendering engine.
   *
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  TextInputField.prototype.getXAPIData = function () {
    var xApiTemplate = this.createXAPIEventTemplate('answered');
    var xApiEvent = this.XAPIGenerator.generateXApi(xApiTemplate, this.getCurrentState().inputField);
    return {
      statement: xApiEvent.data.statement
    };
  };

  return TextInputField;
}(H5P.jQuery));
;
var H5P = H5P || {};
H5P.TextInputField = H5P.TextInputField || {};

/**
 * Generate xAPI statements
 */
H5P.TextInputField.XAPIGenerator = (function ($) {

  function XAPIGenerator(question) {
    // Set up default response object
    this.event = {
      description: {
        'en-US': question // We don't actually know the language of the question
      },
      type: 'http://adlnet.gov/expapi/activities/cmi.interaction',
      interactionType: 'fill-in',
    };
  }

  XAPIGenerator.prototype.constructor = XAPIGenerator;

  /**
   * Extend xAPI template
   * @param {H5P.XAPIEvent} xApiTemplate xAPI event template
   * @param {string} answer Text input given
   * @return {H5P.XAPIEvent} Extended xAPI event
   */
  XAPIGenerator.prototype.generateXApi = function (xApiTemplate, answer) {
    let statement = xApiTemplate.data.statement;

    statement = $.extend(true, statement, {
      result: {
        response: answer
      }
    });

    if (statement.object) {
      statement.object.definition = $.extend(true, statement.object.definition, this.event);
    }

    return xApiTemplate;
  };

  return XAPIGenerator;
})(H5P.jQuery);
;
var H5P = H5P || {};

/**
 * Constructor.
 *
 * @param {Object} params Options for this library.
 * @param {Number} id Content identifier
 * @returns {undefined}
 */
(function ($) {
  H5P.Image = function (params, id, extras) {
    H5P.EventDispatcher.call(this);
    this.extras = extras;

    if (params.file === undefined || !(params.file instanceof Object)) {
      this.placeholder = true;
    }
    else {
      this.source = H5P.getPath(params.file.path, id);
      this.width = params.file.width;
      this.height = params.file.height;
    }

    this.alt = params.alt !== undefined ? params.alt : 'New image';

    if (params.title !== undefined) {
      this.title = params.title;
    }
  };

  H5P.Image.prototype = Object.create(H5P.EventDispatcher.prototype);
  H5P.Image.prototype.constructor = H5P.Image;

  /**
   * Wipe out the content of the wrapper and put our HTML in it.
   *
   * @param {jQuery} $wrapper
   * @returns {undefined}
   */
  H5P.Image.prototype.attach = function ($wrapper) {
    var self = this;
    var source = this.source;

    if (self.$img === undefined) {
      if(self.placeholder) {
        self.$img = $('<div>', {
          width: '100%',
          height: '100%',
          class: 'h5p-placeholder',
          title: this.title === undefined ? '' : this.title,
          load: function () {
            self.trigger('loaded');
          }
        });
      } else {
        self.$img = $('<img>', {
          width: '100%',
          height: '100%',
          src: source,
          alt: this.alt,
          title: this.title === undefined ? '' : this.title,
          load: function () {
            self.trigger('loaded');
          }
        });
      }
    }

    $wrapper.addClass('h5p-image').html(self.$img);
  };

  return H5P.Image;
}(H5P.jQuery));
;
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false*/

(function (global, factory) {
  if (typeof exports === "object" && exports) {
    factory(exports); // CommonJS
  } else if (typeof define === "function" && define.amd) {
    define(['exports'], factory); // AMD
  } else {
    factory(global.Mustache = {}); // <script>
  }
}(this, function (mustache) {

  var Object_toString = Object.prototype.toString;
  var isArray = Array.isArray || function (object) {
    return Object_toString.call(object) === '[object Array]';
  };

  function isFunction(object) {
    return typeof object === 'function';
  }

  function escapeRegExp(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var RegExp_test = RegExp.prototype.test;
  function testRegExp(re, string) {
    return RegExp_test.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace(string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   */
  function parseTemplate(template, tags) {
    if (!template)
      return [];

    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags(tags) {
      if (typeof tags === 'string')
        tags = tags.split(spaceRe, 2);

      if (!isArray(tags) || tags.length !== 2)
        throw new Error('Invalid tags: ' + tags);

      openingTagRe = new RegExp(escapeRegExp(tags[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tags[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tags[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n')
            stripSpace();
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      token = [ type, value, start, scanner.pos ];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens(tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens(tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
      case '#':
      case '^':
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case '/':
        section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function () {
    return this.tail === "";
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function (re) {
    var index = this.tail.search(re), match;

    switch (index) {
    case -1:
      match = this.tail;
      this.tail = "";
      break;
    case 0:
      match = "";
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context(view, parentContext) {
    this.view = view == null ? {} : view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function (name) {
    var cache = this.cache;

    var value;
    if (name in cache) {
      value = cache[name];
    } else {
      var context = this, names, index;

      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;
          names = name.split('.');
          index = 0;

          while (value != null && index < names.length)
            value = value[names[index++]];
        } else if (typeof context.view == 'object') {
          value = context.view[name];
        }

        if (value != null)
          break;

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer() {
    this.cache = {};
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function () {
    this.cache = {};
  };

  /**
   * Parses and caches the given `template` and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function (template, tags) {
    var cache = this.cache;
    var tokens = cache[template];

    if (tokens == null)
      tokens = cache[template] = parseTemplate(template, tags);

    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   */
  Writer.prototype.render = function (template, view, partials) {
    var tokens = this.parse(template);
    var context = (view instanceof Context) ? view : new Context(view);
    return this.renderTokens(tokens, context, partials, template);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function (tokens, context, partials, originalTemplate) {
    var buffer = '';

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    var self = this;
    function subRender(template) {
      return self.render(template, context, partials);
    }

    var token, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
      case '#':
        value = context.lookup(token[1]);

        if (!value)
          continue;

        if (isArray(value)) {
          for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
            buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
          }
        } else if (typeof value === 'object' || typeof value === 'string') {
          buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
        } else if (isFunction(value)) {
          if (typeof originalTemplate !== 'string')
            throw new Error('Cannot use higher-order sections without the original template');

          // Extract the portion of the original template that the section contains.
          value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

          if (value != null)
            buffer += value;
        } else {
          buffer += this.renderTokens(token[4], context, partials, originalTemplate);
        }

        break;
      case '^':
        value = context.lookup(token[1]);

        // Use JavaScript's definition of falsy. Include empty arrays.
        // See https://github.com/janl/mustache.js/issues/186
        if (!value || (isArray(value) && value.length === 0))
          buffer += this.renderTokens(token[4], context, partials, originalTemplate);

        break;
      case '>':
        if (!partials)
          continue;

        value = isFunction(partials) ? partials(token[1]) : partials[token[1]];

        if (value != null)
          buffer += this.renderTokens(this.parse(value), context, partials, value);

        break;
      case '&':
        value = context.lookup(token[1]);

        if (value != null)
          buffer += value;

        break;
      case 'name':
        value = context.lookup(token[1]);

        if (value != null)
          buffer += mustache.escape(value);

        break;
      case 'text':
        buffer += token[1];
        break;
      }
    }

    return buffer;
  };

  mustache.name = "mustache.js";
  mustache.version = "1.0.0";
  mustache.tags = [ "{{", "}}" ];

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  mustache.render = function (template, view, partials) {
    return defaultWriter.render(template, view, partials);
  };

  // This is here for backwards compatibility with 0.4.x.
  mustache.to_html = function (template, view, partials, send) {
    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

}));
;
var H5P = H5P || {};

/**
 * Standard Page module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.StandardPage = (function ($, EventDispatcher) {
  "use strict";

  // CSS Classes:
  var MAIN_CONTAINER = 'h5p-standard-page';

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @returns {Object} StandardPage StandardPage instance
   */
  function StandardPage(params, id, extras) {
    EventDispatcher.call(this);

    this.$ = $(this);
    this.id = id;
    this.extras = extras;

    // Set default behavior.
    this.params = $.extend({
      title: this.getTitle(),
      elementList: [],
      helpTextLabel: 'Read more',
      helpText: 'Help text'
    }, params);
  }

  // Setting up inheritance
  StandardPage.prototype = Object.create(EventDispatcher.prototype);
  StandardPage.prototype.constructor = StandardPage;

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  StandardPage.prototype.attach = function ($container) {
    var self = this;

    this.$inner = $('<div>', {
      'class': MAIN_CONTAINER
    }).appendTo($container);

    var standardPageTemplate =
      '<div class="page-header" role="heading" tabindex="-1">' +
      ' <div class="page-title">{{{title}}}</div>' +
      ' <button class="page-help-text">{{{helpTextLabel}}}</button>' +
      '</div>';

    /*global Mustache */
    self.$inner.append(Mustache.render(standardPageTemplate, self.params));

    self.$pageTitle = self.$inner.find('.page-header');
    self.$helpButton = self.$inner.find('.page-help-text');

    self.createHelpTextButton();

    this.pageInstances = [];

    this.params.elementList.forEach(function (element) {
      var $elementContainer = $('<div>', {
        'class': 'h5p-standard-page-element'
      }).appendTo(self.$inner);

      var elementInstance = H5P.newRunnable(element, self.id);

      elementInstance.on('loaded', function () {
        self.trigger('resize');
      });

      elementInstance.attach($elementContainer);

      self.pageInstances.push(elementInstance);
    });
  };

  /**
   * Create help text functionality for reading more about the task
   */
  StandardPage.prototype.createHelpTextButton = function () {
    var self = this;

    if (this.params.helpText !== undefined && this.params.helpText.length) {
      self.$helpButton.on('click', function () {
        self.trigger('open-help-dialog', {
          title: self.params.title,
          helpText: self.params.helpText
        });
      });
    }
    else {
      self.$helpButton.remove();
    }
  };

  /**
   * Retrieves input array.
   */
  StandardPage.prototype.getInputArray = function () {
    var inputArray = [];
    this.pageInstances.forEach(function (elementInstance) {
      if (elementInstance.libraryInfo.machineName === 'H5P.TextInputField') {
        inputArray.push(elementInstance.getInput());
      }
    });

    return inputArray;
  };

  /**
   * Returns True if all required inputs are filled.
   * @returns {boolean} True if all required inputs are filled.
   */
  StandardPage.prototype.requiredInputsIsFilled = function () {
    var requiredInputsIsFilled = true;
    this.pageInstances.forEach(function (elementInstance) {
      if (elementInstance.libraryInfo.machineName === 'H5P.TextInputField') {
        if (!elementInstance.isRequiredInputFilled()) {
          requiredInputsIsFilled = false;
        }
      }
    });

    return requiredInputsIsFilled;
  };

  /**
   * Mark required input fields.
   */
  StandardPage.prototype.markRequiredInputFields = function () {
    this.pageInstances.forEach(function (elementInstance) {
      if (elementInstance.libraryInfo.machineName === 'H5P.TextInputField') {
        if (!elementInstance.isRequiredInputFilled()) {
          elementInstance.markEmptyField();
        }
      }
    });
  };

  /**
   * Sets focus on page
   */
  StandardPage.prototype.focus = function () {
    this.$pageTitle.focus();
  };

  /**
   * Get page title
   * @returns {String} page title
   */
  StandardPage.prototype.getTitle = function () {
    return H5P.createTitle((this.extras && this.extras.metadata && this.extras.metadata.title) ? this.extras.metadata.title : 'Instructions');
  };

  /**
   * Triggers an 'answered' xAPI event for all inputs
   */
  StandardPage.prototype.triggerAnsweredEvents = function () {
    this.pageInstances.forEach(function (elementInstance) {
      if (elementInstance.triggerAnsweredEvent) {
        elementInstance.triggerAnsweredEvent();
      }
    });
  };

  /**
   * Helper function to return all xAPI data
   * @returns {Array}
   */
  StandardPage.prototype.getXAPIDataFromChildren = function () {
    var children = [];

    this.pageInstances.forEach(function (elementInstance) {
      if (elementInstance.getXAPIData) {
        children.push(elementInstance.getXAPIData());
      }
    });

    return children;
  };

  /**
   * Generate xAPI object definition used in xAPI statements.
   * @return {Object}
   */
  StandardPage.prototype.getxAPIDefinition = function () {
    var definition = {};
    var self = this;

    definition.interactionType = 'compound';
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.description = {
      'en-US': self.params.title
    };
    definition.extensions = {
      'https://h5p.org/x-api/h5p-machine-name': 'H5P.StandardPage'
    };

    return definition;
  };

  /**
   * Add the question itself to the definition part of an xAPIEvent
   */
  StandardPage.prototype.addQuestionToXAPI = function (xAPIEvent) {
    var definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
    $.extend(definition, this.getxAPIDefinition());
  };

  /**
   * Get xAPI data.
   * Contract used by report rendering engine.
   *
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  StandardPage.prototype.getXAPIData = function () {
    var xAPIEvent = this.createXAPIEventTemplate('compound');
    this.addQuestionToXAPI(xAPIEvent);
    return {
      statement: xAPIEvent.data.statement,
      children: this.getXAPIDataFromChildren()
    };
  };

  return StandardPage;
}(H5P.jQuery, H5P.EventDispatcher));
;
var oldTether = window.Tether;
!function(t,e){"function"==typeof define&&define.amd?define(e):"object"==typeof exports?module.exports=e(require,exports,module):t.Tether=e()}(this,function(t,e,o){"use strict";function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function n(t){var e=getComputedStyle(t),o=e.position;if("fixed"===o)return t;for(var i=t;i=i.parentNode;){var n=void 0;try{n=getComputedStyle(i)}catch(r){}if("undefined"==typeof n||null===n)return i;var s=n.overflow,a=n.overflowX,f=n.overflowY;if(/(auto|scroll)/.test(s+f+a)&&("absolute"!==o||["relative","absolute","fixed"].indexOf(n.position)>=0))return i}return document.body}function r(t){var e=void 0;t===document?(e=document,t=document.documentElement):e=t.ownerDocument;var o=e.documentElement,i={},n=t.getBoundingClientRect();for(var r in n)i[r]=n[r];var s=x(e);return i.top-=s.top,i.left-=s.left,"undefined"==typeof i.width&&(i.width=document.body.scrollWidth-i.left-i.right),"undefined"==typeof i.height&&(i.height=document.body.scrollHeight-i.top-i.bottom),i.top=i.top-o.clientTop,i.left=i.left-o.clientLeft,i.right=e.body.clientWidth-i.width-i.left,i.bottom=e.body.clientHeight-i.height-i.top,i}function s(t){return t.offsetParent||document.documentElement}function a(){var t=document.createElement("div");t.style.width="100%",t.style.height="200px";var e=document.createElement("div");f(e.style,{position:"absolute",top:0,left:0,pointerEvents:"none",visibility:"hidden",width:"200px",height:"150px",overflow:"hidden"}),e.appendChild(t),document.body.appendChild(e);var o=t.offsetWidth;e.style.overflow="scroll";var i=t.offsetWidth;o===i&&(i=e.clientWidth),document.body.removeChild(e);var n=o-i;return{width:n,height:n}}function f(){var t=void 0===arguments[0]?{}:arguments[0],e=[];return Array.prototype.push.apply(e,arguments),e.slice(1).forEach(function(e){if(e)for(var o in e)({}).hasOwnProperty.call(e,o)&&(t[o]=e[o])}),t}function h(t,e){if("undefined"!=typeof t.classList)e.split(" ").forEach(function(e){e.trim()&&t.classList.remove(e)});else{var o=new RegExp("(^| )"+e.split(" ").join("|")+"( |$)","gi"),i=u(t).replace(o," ");p(t,i)}}function l(t,e){if("undefined"!=typeof t.classList)e.split(" ").forEach(function(e){e.trim()&&t.classList.add(e)});else{h(t,e);var o=u(t)+(" "+e);p(t,o)}}function d(t,e){if("undefined"!=typeof t.classList)return t.classList.contains(e);var o=u(t);return new RegExp("(^| )"+e+"( |$)","gi").test(o)}function u(t){return t.className instanceof SVGAnimatedString?t.className.baseVal:t.className}function p(t,e){t.setAttribute("class",e)}function c(t,e,o){o.forEach(function(o){-1===e.indexOf(o)&&d(t,o)&&h(t,o)}),e.forEach(function(e){d(t,e)||l(t,e)})}function i(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function g(t,e){var o=void 0===arguments[2]?1:arguments[2];return t+o>=e&&e>=t-o}function m(){return"undefined"!=typeof performance&&"undefined"!=typeof performance.now?performance.now():+new Date}function v(){for(var t={top:0,left:0},e=arguments.length,o=Array(e),i=0;e>i;i++)o[i]=arguments[i];return o.forEach(function(e){var o=e.top,i=e.left;"string"==typeof o&&(o=parseFloat(o,10)),"string"==typeof i&&(i=parseFloat(i,10)),t.top+=o,t.left+=i}),t}function y(t,e){return"string"==typeof t.left&&-1!==t.left.indexOf("%")&&(t.left=parseFloat(t.left,10)/100*e.width),"string"==typeof t.top&&-1!==t.top.indexOf("%")&&(t.top=parseFloat(t.top,10)/100*e.height),t}function b(t,e){return"scrollParent"===e?e=t.scrollParent:"window"===e&&(e=[pageXOffset,pageYOffset,innerWidth+pageXOffset,innerHeight+pageYOffset]),e===document&&(e=e.documentElement),"undefined"!=typeof e.nodeType&&!function(){var t=r(e),o=t,i=getComputedStyle(e);e=[o.left,o.top,t.width+o.left,t.height+o.top],U.forEach(function(t,o){t=t[0].toUpperCase()+t.substr(1),"Top"===t||"Left"===t?e[o]+=parseFloat(i["border"+t+"Width"]):e[o]-=parseFloat(i["border"+t+"Width"])})}(),e}var w=function(){function t(t,e){for(var o=0;o<e.length;o++){var i=e[o];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,o,i){return o&&t(e.prototype,o),i&&t(e,i),e}}(),C=void 0;"undefined"==typeof C&&(C={modules:[]});var O=function(){var t=0;return function(){return++t}}(),E={},x=function(t){var e=t._tetherZeroElement;"undefined"==typeof e&&(e=t.createElement("div"),e.setAttribute("data-tether-id",O()),f(e.style,{top:0,left:0,position:"absolute"}),t.body.appendChild(e),t._tetherZeroElement=e);var o=e.getAttribute("data-tether-id");if("undefined"==typeof E[o]){E[o]={};var i=e.getBoundingClientRect();for(var n in i)E[o][n]=i[n];T(function(){delete E[o]})}return E[o]},A=[],T=function(t){A.push(t)},S=function(){for(var t=void 0;t=A.pop();)t()},W=function(){function t(){i(this,t)}return w(t,[{key:"on",value:function(t,e,o){var i=void 0===arguments[3]?!1:arguments[3];"undefined"==typeof this.bindings&&(this.bindings={}),"undefined"==typeof this.bindings[t]&&(this.bindings[t]=[]),this.bindings[t].push({handler:e,ctx:o,once:i})}},{key:"once",value:function(t,e,o){this.on(t,e,o,!0)}},{key:"off",value:function(t,e){if("undefined"==typeof this.bindings||"undefined"==typeof this.bindings[t])if("undefined"==typeof e)delete this.bindings[t];else for(var o=0;o<this.bindings[t].length;)this.bindings[t][o].handler===e?this.bindings[t].splice(o,1):++o}},{key:"trigger",value:function(t){if("undefined"!=typeof this.bindings&&this.bindings[t])for(var e=0;e<this.bindings[t].length;){var o=this.bindings[t][e],i=o.handler,n=o.ctx,r=o.once,s=n;"undefined"==typeof s&&(s=this);for(var a=arguments.length,f=Array(a>1?a-1:0),h=1;a>h;h++)f[h-1]=arguments[h];i.apply(s,f),r?this.bindings[t].splice(e,1):++e}}}]),t}();C.Utils={getScrollParent:n,getBounds:r,getOffsetParent:s,extend:f,addClass:l,removeClass:h,hasClass:d,updateClasses:c,defer:T,flush:S,uniqueId:O,Evented:W,getScrollBarSize:a};var M=function(){function t(t,e){var o=[],i=!0,n=!1,r=void 0;try{for(var s,a=t[Symbol.iterator]();!(i=(s=a.next()).done)&&(o.push(s.value),!e||o.length!==e);i=!0);}catch(f){n=!0,r=f}finally{try{!i&&a["return"]&&a["return"]()}finally{if(n)throw r}}return o}return function(e,o){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,o);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),w=function(){function t(t,e){for(var o=0;o<e.length;o++){var i=e[o];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,o,i){return o&&t(e.prototype,o),i&&t(e,i),e}}();if("undefined"==typeof C)throw new Error("You must include the utils.js file before tether.js");var P=C.Utils,n=P.getScrollParent,r=P.getBounds,s=P.getOffsetParent,f=P.extend,l=P.addClass,h=P.removeClass,c=P.updateClasses,T=P.defer,S=P.flush,a=P.getScrollBarSize,k=function(){for(var t=document.createElement("div"),e=["transform","webkitTransform","OTransform","MozTransform","msTransform"],o=0;o<e.length;++o){var i=e[o];if(void 0!==t.style[i])return i}}(),B=[],_=function(){B.forEach(function(t){t.position(!1)}),S()};!function(){var t=null,e=null,o=null,i=function n(){return"undefined"!=typeof e&&e>16?(e=Math.min(e-16,250),void(o=setTimeout(n,250))):void("undefined"!=typeof t&&m()-t<10||("undefined"!=typeof o&&(clearTimeout(o),o=null),t=m(),_(),e=m()-t))};["resize","scroll","touchmove"].forEach(function(t){window.addEventListener(t,i)})}();var z={center:"center",left:"right",right:"left"},F={middle:"middle",top:"bottom",bottom:"top"},L={top:0,left:0,middle:"50%",center:"50%",bottom:"100%",right:"100%"},Y=function(t,e){var o=t.left,i=t.top;return"auto"===o&&(o=z[e.left]),"auto"===i&&(i=F[e.top]),{left:o,top:i}},H=function(t){var e=t.left,o=t.top;return"undefined"!=typeof L[t.left]&&(e=L[t.left]),"undefined"!=typeof L[t.top]&&(o=L[t.top]),{left:e,top:o}},X=function(t){var e=t.split(" "),o=M(e,2),i=o[0],n=o[1];return{top:i,left:n}},j=X,N=function(){function t(e){var o=this;i(this,t),this.position=this.position.bind(this),B.push(this),this.history=[],this.setOptions(e,!1),C.modules.forEach(function(t){"undefined"!=typeof t.initialize&&t.initialize.call(o)}),this.position()}return w(t,[{key:"getClass",value:function(){var t=void 0===arguments[0]?"":arguments[0],e=this.options.classes;return"undefined"!=typeof e&&e[t]?this.options.classes[t]:this.options.classPrefix?this.options.classPrefix+"-"+t:t}},{key:"setOptions",value:function(t){var e=this,o=void 0===arguments[1]?!0:arguments[1],i={offset:"0 0",targetOffset:"0 0",targetAttachment:"auto auto",classPrefix:"tether"};this.options=f(i,t);var r=this.options,s=r.element,a=r.target,h=r.targetModifier;if(this.element=s,this.target=a,this.targetModifier=h,"viewport"===this.target?(this.target=document.body,this.targetModifier="visible"):"scroll-handle"===this.target&&(this.target=document.body,this.targetModifier="scroll-handle"),["element","target"].forEach(function(t){if("undefined"==typeof e[t])throw new Error("Tether Error: Both element and target must be defined");"undefined"!=typeof e[t].jquery?e[t]=e[t][0]:"string"==typeof e[t]&&(e[t]=document.querySelector(e[t]))}),l(this.element,this.getClass("element")),this.options.addTargetClasses!==!1&&l(this.target,this.getClass("target")),!this.options.attachment)throw new Error("Tether Error: You must provide an attachment");this.targetAttachment=j(this.options.targetAttachment),this.attachment=j(this.options.attachment),this.offset=X(this.options.offset),this.targetOffset=X(this.options.targetOffset),"undefined"!=typeof this.scrollParent&&this.disable(),this.scrollParent="scroll-handle"===this.targetModifier?this.target:n(this.target),this.options.enabled!==!1&&this.enable(o)}},{key:"getTargetBounds",value:function(){if("undefined"==typeof this.targetModifier)return r(this.target);if("visible"===this.targetModifier){if(this.target===document.body)return{top:pageYOffset,left:pageXOffset,height:innerHeight,width:innerWidth};var t=r(this.target),e={height:t.height,width:t.width,top:t.top,left:t.left};return e.height=Math.min(e.height,t.height-(pageYOffset-t.top)),e.height=Math.min(e.height,t.height-(t.top+t.height-(pageYOffset+innerHeight))),e.height=Math.min(innerHeight,e.height),e.height-=2,e.width=Math.min(e.width,t.width-(pageXOffset-t.left)),e.width=Math.min(e.width,t.width-(t.left+t.width-(pageXOffset+innerWidth))),e.width=Math.min(innerWidth,e.width),e.width-=2,e.top<pageYOffset&&(e.top=pageYOffset),e.left<pageXOffset&&(e.left=pageXOffset),e}if("scroll-handle"===this.targetModifier){var t=void 0,o=this.target;o===document.body?(o=document.documentElement,t={left:pageXOffset,top:pageYOffset,height:innerHeight,width:innerWidth}):t=r(o);var i=getComputedStyle(o),n=o.scrollWidth>o.clientWidth||[i.overflow,i.overflowX].indexOf("scroll")>=0||this.target!==document.body,s=0;n&&(s=15);var a=t.height-parseFloat(i.borderTopWidth)-parseFloat(i.borderBottomWidth)-s,e={width:15,height:.975*a*(a/o.scrollHeight),left:t.left+t.width-parseFloat(i.borderLeftWidth)-15},f=0;408>a&&this.target===document.body&&(f=-11e-5*Math.pow(a,2)-.00727*a+22.58),this.target!==document.body&&(e.height=Math.max(e.height,24));var h=this.target.scrollTop/(o.scrollHeight-a);return e.top=h*(a-e.height-f)+t.top+parseFloat(i.borderTopWidth),this.target===document.body&&(e.height=Math.max(e.height,24)),e}}},{key:"clearCache",value:function(){this._cache={}}},{key:"cache",value:function(t,e){return"undefined"==typeof this._cache&&(this._cache={}),"undefined"==typeof this._cache[t]&&(this._cache[t]=e.call(this)),this._cache[t]}},{key:"enable",value:function(){var t=void 0===arguments[0]?!0:arguments[0];this.options.addTargetClasses!==!1&&l(this.target,this.getClass("enabled")),l(this.element,this.getClass("enabled")),this.enabled=!0,this.scrollParent!==document&&this.scrollParent.addEventListener("scroll",this.position),t&&this.position()}},{key:"disable",value:function(){h(this.target,this.getClass("enabled")),h(this.element,this.getClass("enabled")),this.enabled=!1,"undefined"!=typeof this.scrollParent&&this.scrollParent.removeEventListener("scroll",this.position)}},{key:"destroy",value:function(){var t=this;this.disable(),B.forEach(function(e,o){return e===t?void B.splice(o,1):void 0})}},{key:"updateAttachClasses",value:function(t,e){var o=this;t=t||this.attachment,e=e||this.targetAttachment;var i=["left","top","bottom","right","middle","center"];"undefined"!=typeof this._addAttachClasses&&this._addAttachClasses.length&&this._addAttachClasses.splice(0,this._addAttachClasses.length),"undefined"==typeof this._addAttachClasses&&(this._addAttachClasses=[]);var n=this._addAttachClasses;t.top&&n.push(this.getClass("element-attached")+"-"+t.top),t.left&&n.push(this.getClass("element-attached")+"-"+t.left),e.top&&n.push(this.getClass("target-attached")+"-"+e.top),e.left&&n.push(this.getClass("target-attached")+"-"+e.left);var r=[];i.forEach(function(t){r.push(o.getClass("element-attached")+"-"+t),r.push(o.getClass("target-attached")+"-"+t)}),T(function(){"undefined"!=typeof o._addAttachClasses&&(c(o.element,o._addAttachClasses,r),o.options.addTargetClasses!==!1&&c(o.target,o._addAttachClasses,r),delete o._addAttachClasses)})}},{key:"position",value:function(){var t=this,e=void 0===arguments[0]?!0:arguments[0];if(this.enabled){this.clearCache();var o=Y(this.targetAttachment,this.attachment);this.updateAttachClasses(this.attachment,o);var i=this.cache("element-bounds",function(){return r(t.element)}),n=i.width,f=i.height;if(0===n&&0===f&&"undefined"!=typeof this.lastSize){var h=this.lastSize;n=h.width,f=h.height}else this.lastSize={width:n,height:f};var l=this.cache("target-bounds",function(){return t.getTargetBounds()}),d=l,u=y(H(this.attachment),{width:n,height:f}),p=y(H(o),d),c=y(this.offset,{width:n,height:f}),g=y(this.targetOffset,d);u=v(u,c),p=v(p,g);for(var m=l.left+p.left-u.left,b=l.top+p.top-u.top,w=0;w<C.modules.length;++w){var O=C.modules[w],E=O.position.call(this,{left:m,top:b,targetAttachment:o,targetPos:l,elementPos:i,offset:u,targetOffset:p,manualOffset:c,manualTargetOffset:g,scrollbarSize:A,attachment:this.attachment});if(E===!1)return!1;"undefined"!=typeof E&&"object"==typeof E&&(b=E.top,m=E.left)}var x={page:{top:b,left:m},viewport:{top:b-pageYOffset,bottom:pageYOffset-b-f+innerHeight,left:m-pageXOffset,right:pageXOffset-m-n+innerWidth}},A=void 0;return document.body.scrollWidth>window.innerWidth&&(A=this.cache("scrollbar-size",a),x.viewport.bottom-=A.height),document.body.scrollHeight>window.innerHeight&&(A=this.cache("scrollbar-size",a),x.viewport.right-=A.width),(-1===["","static"].indexOf(document.body.style.position)||-1===["","static"].indexOf(document.body.parentElement.style.position))&&(x.page.bottom=document.body.scrollHeight-b-f,x.page.right=document.body.scrollWidth-m-n),"undefined"!=typeof this.options.optimizations&&this.options.optimizations.moveElement!==!1&&"undefined"==typeof this.targetModifier&&!function(){var e=t.cache("target-offsetparent",function(){return s(t.target)}),o=t.cache("target-offsetparent-bounds",function(){return r(e)}),i=getComputedStyle(e),n=o,a={};if(["Top","Left","Bottom","Right"].forEach(function(t){a[t.toLowerCase()]=parseFloat(i["border"+t+"Width"])}),o.right=document.body.scrollWidth-o.left-n.width+a.right,o.bottom=document.body.scrollHeight-o.top-n.height+a.bottom,x.page.top>=o.top+a.top&&x.page.bottom>=o.bottom&&x.page.left>=o.left+a.left&&x.page.right>=o.right){var f=e.scrollTop,h=e.scrollLeft;x.offset={top:x.page.top-o.top+f-a.top,left:x.page.left-o.left+h-a.left}}}(),this.move(x),this.history.unshift(x),this.history.length>3&&this.history.pop(),e&&S(),!0}}},{key:"move",value:function(t){var e=this;if("undefined"!=typeof this.element.parentNode){var o={};for(var i in t){o[i]={};for(var n in t[i]){for(var r=!1,a=0;a<this.history.length;++a){var h=this.history[a];if("undefined"!=typeof h[i]&&!g(h[i][n],t[i][n])){r=!0;break}}r||(o[i][n]=!0)}}var l={top:"",left:"",right:"",bottom:""},d=function(t,o){var i="undefined"!=typeof e.options.optimizations,n=i?e.options.optimizations.gpu:null;if(n!==!1){var r=void 0,s=void 0;t.top?(l.top=0,r=o.top):(l.bottom=0,r=-o.bottom),t.left?(l.left=0,s=o.left):(l.right=0,s=-o.right),l[k]="translateX("+Math.round(s)+"px) translateY("+Math.round(r)+"px)","msTransform"!==k&&(l[k]+=" translateZ(0)")}else t.top?l.top=o.top+"px":l.bottom=o.bottom+"px",t.left?l.left=o.left+"px":l.right=o.right+"px"},u=!1;(o.page.top||o.page.bottom)&&(o.page.left||o.page.right)?(l.position="absolute",d(o.page,t.page)):(o.viewport.top||o.viewport.bottom)&&(o.viewport.left||o.viewport.right)?(l.position="fixed",d(o.viewport,t.viewport)):"undefined"!=typeof o.offset&&o.offset.top&&o.offset.left?!function(){l.position="absolute";var i=e.cache("target-offsetparent",function(){return s(e.target)});s(e.element)!==i&&T(function(){e.element.parentNode.removeChild(e.element),i.appendChild(e.element)}),d(o.offset,t.offset),u=!0}():(l.position="absolute",d({top:!0,left:!0},t.page)),u||"BODY"===this.element.parentNode.tagName||(this.element.parentNode.removeChild(this.element),document.body.appendChild(this.element));var p={},c=!1;for(var n in l){var m=l[n],v=this.element.style[n];""!==v&&""!==m&&["top","left","bottom","right"].indexOf(n)>=0&&(v=parseFloat(v),m=parseFloat(m)),v!==m&&(c=!0,p[n]=m)}c&&T(function(){f(e.element.style,p)})}}}]),t}();N.modules=[],C.position=_;var R=f(N,C),M=function(){function t(t,e){var o=[],i=!0,n=!1,r=void 0;try{for(var s,a=t[Symbol.iterator]();!(i=(s=a.next()).done)&&(o.push(s.value),!e||o.length!==e);i=!0);}catch(f){n=!0,r=f}finally{try{!i&&a["return"]&&a["return"]()}finally{if(n)throw r}}return o}return function(e,o){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,o);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),P=C.Utils,r=P.getBounds,f=P.extend,c=P.updateClasses,T=P.defer,U=["left","top","right","bottom"];C.modules.push({position:function(t){var e=this,o=t.top,i=t.left,n=t.targetAttachment;if(!this.options.constraints)return!0;var s=this.cache("element-bounds",function(){return r(e.element)}),a=s.height,h=s.width;if(0===h&&0===a&&"undefined"!=typeof this.lastSize){var l=this.lastSize;h=l.width,a=l.height}var d=this.cache("target-bounds",function(){return e.getTargetBounds()}),u=d.height,p=d.width,g=[this.getClass("pinned"),this.getClass("out-of-bounds")];this.options.constraints.forEach(function(t){var e=t.outOfBoundsClass,o=t.pinnedClass;e&&g.push(e),o&&g.push(o)}),g.forEach(function(t){["left","top","right","bottom"].forEach(function(e){g.push(t+"-"+e)})});var m=[],v=f({},n),y=f({},this.attachment);return this.options.constraints.forEach(function(t){var r=t.to,s=t.attachment,f=t.pin;"undefined"==typeof s&&(s="");var l=void 0,d=void 0;if(s.indexOf(" ")>=0){var c=s.split(" "),g=M(c,2);d=g[0],l=g[1]}else l=d=s;var w=b(e,r);("target"===d||"both"===d)&&(o<w[1]&&"top"===v.top&&(o+=u,v.top="bottom"),o+a>w[3]&&"bottom"===v.top&&(o-=u,v.top="top")),"together"===d&&(o<w[1]&&"top"===v.top&&("bottom"===y.top?(o+=u,v.top="bottom",o+=a,y.top="top"):"top"===y.top&&(o+=u,v.top="bottom",o-=a,y.top="bottom")),o+a>w[3]&&"bottom"===v.top&&("top"===y.top?(o-=u,v.top="top",o-=a,y.top="bottom"):"bottom"===y.top&&(o-=u,v.top="top",o+=a,y.top="top")),"middle"===v.top&&(o+a>w[3]&&"top"===y.top?(o-=a,y.top="bottom"):o<w[1]&&"bottom"===y.top&&(o+=a,y.top="top"))),("target"===l||"both"===l)&&(i<w[0]&&"left"===v.left&&(i+=p,v.left="right"),i+h>w[2]&&"right"===v.left&&(i-=p,v.left="left")),"together"===l&&(i<w[0]&&"left"===v.left?"right"===y.left?(i+=p,v.left="right",i+=h,y.left="left"):"left"===y.left&&(i+=p,v.left="right",i-=h,y.left="right"):i+h>w[2]&&"right"===v.left?"left"===y.left?(i-=p,v.left="left",i-=h,y.left="right"):"right"===y.left&&(i-=p,v.left="left",i+=h,y.left="left"):"center"===v.left&&(i+h>w[2]&&"left"===y.left?(i-=h,y.left="right"):i<w[0]&&"right"===y.left&&(i+=h,y.left="left"))),("element"===d||"both"===d)&&(o<w[1]&&"bottom"===y.top&&(o+=a,y.top="top"),o+a>w[3]&&"top"===y.top&&(o-=a,y.top="bottom")),("element"===l||"both"===l)&&(i<w[0]&&"right"===y.left&&(i+=h,y.left="left"),i+h>w[2]&&"left"===y.left&&(i-=h,y.left="right")),"string"==typeof f?f=f.split(",").map(function(t){return t.trim()}):f===!0&&(f=["top","left","right","bottom"]),f=f||[];var C=[],O=[];o<w[1]&&(f.indexOf("top")>=0?(o=w[1],C.push("top")):O.push("top")),o+a>w[3]&&(f.indexOf("bottom")>=0?(o=w[3]-a,C.push("bottom")):O.push("bottom")),i<w[0]&&(f.indexOf("left")>=0?(i=w[0],C.push("left")):O.push("left")),i+h>w[2]&&(f.indexOf("right")>=0?(i=w[2]-h,C.push("right")):O.push("right")),C.length&&!function(){var t=void 0;t="undefined"!=typeof e.options.pinnedClass?e.options.pinnedClass:e.getClass("pinned"),m.push(t),C.forEach(function(e){m.push(t+"-"+e)})}(),O.length&&!function(){var t=void 0;t="undefined"!=typeof e.options.outOfBoundsClass?e.options.outOfBoundsClass:e.getClass("out-of-bounds"),m.push(t),O.forEach(function(e){m.push(t+"-"+e)})}(),(C.indexOf("left")>=0||C.indexOf("right")>=0)&&(y.left=v.left=!1),(C.indexOf("top")>=0||C.indexOf("bottom")>=0)&&(y.top=v.top=!1),(v.top!==n.top||v.left!==n.left||y.top!==e.attachment.top||y.left!==e.attachment.left)&&e.updateAttachClasses(y,v)}),T(function(){e.options.addTargetClasses!==!1&&c(e.target,m,g),c(e.element,m,g)}),{top:o,left:i}}});var P=C.Utils,r=P.getBounds,c=P.updateClasses,T=P.defer;C.modules.push({position:function(t){var e=this,o=t.top,i=t.left,n=this.cache("element-bounds",function(){return r(e.element)}),s=n.height,a=n.width,f=this.getTargetBounds(),h=o+s,l=i+a,d=[];o<=f.bottom&&h>=f.top&&["left","right"].forEach(function(t){var e=f[t];(e===i||e===l)&&d.push(t)}),i<=f.right&&l>=f.left&&["top","bottom"].forEach(function(t){var e=f[t];(e===o||e===h)&&d.push(t)});var u=[],p=[],g=["left","top","right","bottom"];return u.push(this.getClass("abutted")),g.forEach(function(t){u.push(e.getClass("abutted")+"-"+t)}),d.length&&p.push(this.getClass("abutted")),d.forEach(function(t){p.push(e.getClass("abutted")+"-"+t)}),T(function(){e.options.addTargetClasses!==!1&&c(e.target,p,u),c(e.element,p,u)}),!0}});var M=function(){function t(t,e){var o=[],i=!0,n=!1,r=void 0;try{for(var s,a=t[Symbol.iterator]();!(i=(s=a.next()).done)&&(o.push(s.value),!e||o.length!==e);i=!0);}catch(f){n=!0,r=f}finally{try{!i&&a["return"]&&a["return"]()}finally{if(n)throw r}}return o}return function(e,o){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,o);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();return C.modules.push({position:function(t){var e=t.top,o=t.left;if(this.options.shift){var i=this.options.shift;"function"==typeof this.options.shift&&(i=this.options.shift.call(this,{top:e,left:o}));var n=void 0,r=void 0;if("string"==typeof i){i=i.split(" "),i[1]=i[1]||i[0];var s=M(i,2);n=s[0],r=s[1],n=parseFloat(n,10),r=parseFloat(r,10)}else n=i.top,r=i.left;return e+=n,o+=r,{top:e,left:o}}}}),R});
H5P.Tether = Tether;
window.Tether = oldTether;
;
var oldDrop = window.Drop;
var oldTether = window.Tether;
Tether = H5P.Tether;
!function(t,e){"function"==typeof define&&define.amd?define(["tether"],e):"object"==typeof exports?module.exports=e(require("tether")):t.Drop=e(t.Tether)}(this,function(t){"use strict";function e(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function n(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}function o(t){var e=t.split(" "),n=a(e,2),o=n[0],i=n[1];if(["left","right"].indexOf(o)>=0){var s=[i,o];o=s[0],i=s[1]}return[o,i].join(" ")}function i(t,e){for(var n=void 0,o=[];-1!==(n=t.indexOf(e));)o.push(t.splice(n,1));return o}function s(){var a=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],u=function(){for(var t=arguments.length,e=Array(t),n=0;t>n;n++)e[n]=arguments[n];return new(r.apply(b,[null].concat(e)))};p(u,{createContext:s,drops:[],defaults:{}});var g={classPrefix:"drop",defaults:{position:"bottom left",openOn:"click",beforeClose:null,constrainToScrollParent:!0,constrainToWindow:!0,classes:"",remove:!1,tetherOptions:{}}};p(u,g,a),p(u.defaults,g.defaults,a.defaults),"undefined"==typeof x[u.classPrefix]&&(x[u.classPrefix]=[]),u.updateBodyClasses=function(){for(var t=!1,e=x[u.classPrefix],n=e.length,o=0;n>o;++o)if(e[o].isOpened()){t=!0;break}t?d(document.body,u.classPrefix+"-open"):c(document.body,u.classPrefix+"-open")};var b=function(s){function r(t){if(e(this,r),l(Object.getPrototypeOf(r.prototype),"constructor",this).call(this),this.options=p({},u.defaults,t),this.target=this.options.target,"undefined"==typeof this.target)throw new Error("Drop Error: You must provide a target.");var n="data-"+u.classPrefix,o=this.target.getAttribute(n);o&&(this.options.content=o);for(var i=["position","openOn"],s=0;s<i.length;++s){var a=this.target.getAttribute(n+"-"+i[s]);a&&(this.options[i[s]]=a)}this.options.classes&&this.options.addTargetClasses!==!1&&d(this.target,this.options.classes),u.drops.push(this),x[u.classPrefix].push(this),this._boundEvents=[],this.bindMethods(),this.setupElements(),this.setupEvents(),this.setupTether()}return n(r,s),h(r,[{key:"_on",value:function(t,e,n){this._boundEvents.push({element:t,event:e,handler:n}),t.addEventListener(e,n)}},{key:"bindMethods",value:function(){this.transitionEndHandler=this._transitionEndHandler.bind(this)}},{key:"setupElements",value:function(){var t=this;if(this.drop=document.createElement("div"),d(this.drop,u.classPrefix),this.options.classes&&d(this.drop,this.options.classes),this.content=document.createElement("div"),d(this.content,u.classPrefix+"-content"),"function"==typeof this.options.content){var e=function(){var e=t.options.content.call(t,t);if("string"==typeof e)t.content.innerHTML=e;else{if("object"!=typeof e)throw new Error("Drop Error: Content function should return a string or HTMLElement.");t.content.innerHTML="",t.content.appendChild(e)}};e(),this.on("open",e.bind(this))}else"object"==typeof this.options.content?this.content.appendChild(this.options.content):this.content.innerHTML=this.options.content;this.drop.appendChild(this.content)}},{key:"setupTether",value:function(){var e=this.options.position.split(" ");e[0]=E[e[0]],e=e.join(" ");var n=[];this.options.constrainToScrollParent?n.push({to:"scrollParent",pin:"top, bottom",attachment:"together none"}):n.push({to:"scrollParent"}),this.options.constrainToWindow!==!1?n.push({to:"window",attachment:"together"}):n.push({to:"window"});var i={element:this.drop,target:this.target,attachment:o(e),targetAttachment:o(this.options.position),classPrefix:u.classPrefix,offset:"0 0",targetOffset:"0 0",enabled:!1,constraints:n,addTargetClasses:this.options.addTargetClasses};this.options.tetherOptions!==!1&&(this.tether=new t(p({},i,this.options.tetherOptions)))}},{key:"setupEvents",value:function(){var t=this;if(this.options.openOn){if("always"===this.options.openOn)return void setTimeout(this.open.bind(this));var e=this.options.openOn.split(" ");if(e.indexOf("click")>=0)for(var n=function(e){t.toggle(e),e.preventDefault()},o=function(e){t.isOpened()&&(e.target===t.drop||t.drop.contains(e.target)||e.target===t.target||t.target.contains(e.target)||t.close(e))},i=0;i<y.length;++i){var s=y[i];this._on(this.target,s,n),this._on(document,s,o)}var r=!1,a=null,h=function(e){r=!0,t.open(e)},l=function(e){r=!1,"undefined"!=typeof a&&clearTimeout(a),a=setTimeout(function(){r||t.close(e),a=null},50)};e.indexOf("hover")>=0&&(this._on(this.target,"mouseover",h),this._on(this.drop,"mouseover",h),this._on(this.target,"mouseout",l),this._on(this.drop,"mouseout",l)),e.indexOf("focus")>=0&&(this._on(this.target,"focus",h),this._on(this.drop,"focus",h),this._on(this.target,"blur",l),this._on(this.drop,"blur",l))}}},{key:"isOpened",value:function(){return this.drop?f(this.drop,u.classPrefix+"-open"):void 0}},{key:"toggle",value:function(t){this.isOpened()?this.close(t):this.open(t)}},{key:"open",value:function(t){var e=this;this.isOpened()||(this.drop.parentNode||document.body.appendChild(this.drop),"undefined"!=typeof this.tether&&this.tether.enable(),d(this.drop,u.classPrefix+"-open"),d(this.drop,u.classPrefix+"-open-transitionend"),setTimeout(function(){e.drop&&d(e.drop,u.classPrefix+"-after-open")}),"undefined"!=typeof this.tether&&this.tether.position(),this.trigger("open"),u.updateBodyClasses())}},{key:"_transitionEndHandler",value:function(t){t.target===t.currentTarget&&(f(this.drop,u.classPrefix+"-open")||c(this.drop,u.classPrefix+"-open-transitionend"),this.drop.removeEventListener(m,this.transitionEndHandler))}},{key:"beforeCloseHandler",value:function(t){var e=!0;return this.isClosing||"function"!=typeof this.options.beforeClose||(this.isClosing=!0,e=this.options.beforeClose(t,this)!==!1),this.isClosing=!1,e}},{key:"close",value:function(t){this.isOpened()&&this.beforeCloseHandler(t)&&(c(this.drop,u.classPrefix+"-open"),c(this.drop,u.classPrefix+"-after-open"),this.drop.addEventListener(m,this.transitionEndHandler),this.trigger("close"),"undefined"!=typeof this.tether&&this.tether.disable(),u.updateBodyClasses(),this.options.remove&&this.remove(t))}},{key:"remove",value:function(t){this.close(t),this.drop.parentNode&&this.drop.parentNode.removeChild(this.drop)}},{key:"position",value:function(){this.isOpened()&&"undefined"!=typeof this.tether&&this.tether.position()}},{key:"destroy",value:function(){this.remove(),"undefined"!=typeof this.tether&&this.tether.destroy();for(var t=0;t<this._boundEvents.length;++t){var e=this._boundEvents[t],n=e.element,o=e.event,s=e.handler;n.removeEventListener(o,s)}this._boundEvents=[],this.tether=null,this.drop=null,this.content=null,this.target=null,i(x[u.classPrefix],this),i(u.drops,this)}}]),r}(v);return u}var r=Function.prototype.bind,a=function(){function t(t,e){var n=[],o=!0,i=!1,s=void 0;try{for(var r,a=t[Symbol.iterator]();!(o=(r=a.next()).done)&&(n.push(r.value),!e||n.length!==e);o=!0);}catch(h){i=!0,s=h}finally{try{!o&&a["return"]&&a["return"]()}finally{if(i)throw s}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),h=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),l=function(t,e,n){for(var o=!0;o;){var i=t,s=e,r=n;a=l=h=void 0,o=!1,null===i&&(i=Function.prototype);var a=Object.getOwnPropertyDescriptor(i,s);if(void 0!==a){if("value"in a)return a.value;var h=a.get;return void 0===h?void 0:h.call(r)}var l=Object.getPrototypeOf(i);if(null===l)return void 0;t=l,e=s,n=r,o=!0}},u=t.Utils,p=u.extend,d=u.addClass,c=u.removeClass,f=u.hasClass,v=u.Evented,y=["click"];"ontouchstart"in document.documentElement&&y.push("touchstart");var g={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"otransitionend",transition:"transitionend"},m="";for(var b in g)if({}.hasOwnProperty.call(g,b)){var O=document.createElement("p");"undefined"!=typeof O.style[b]&&(m=g[b])}var E={left:"right",right:"left",top:"bottom",bottom:"top",middle:"middle",center:"center"},x={},P=s();return document.addEventListener("DOMContentLoaded",function(){P.updateBodyClasses()}),P});
H5P.Drop = Drop;
window.Drop = oldDrop;
window.Tether = oldTether;
;
var H5P = H5P || {};
/**
 * Transition contains helper function relevant for transitioning
 */
H5P.Transition = (function ($) {

  /**
   * @class
   * @namespace H5P
   */
  Transition = {};

  /**
   * @private
   */
  Transition.transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'transition':       'transitionend',
    'MozTransition':    'transitionend',
    'OTransition':      'oTransitionEnd',
    'msTransition':     'MSTransitionEnd'
  };

  /**
   * @private
   */
  Transition.cache = [];

  /**
   * Get the vendor property name for an event
   *
   * @function H5P.Transition.getVendorPropertyName
   * @static
   * @private
   * @param  {string} prop Generic property name
   * @return {string}      Vendor specific property name
   */
  Transition.getVendorPropertyName = function (prop) {

    if (Transition.cache[prop] !== undefined) {
      return Transition.cache[prop];
    }

    var div = document.createElement('div');

    // Handle unprefixed versions (FF16+, for example)
    if (prop in div.style) {
      Transition.cache[prop] = prop;
    }
    else {
      var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
      var prop_ = prop.charAt(0).toUpperCase() + prop.substr(1);

      if (prop in div.style) {
        Transition.cache[prop] = prop;
      }
      else {
        for (var i = 0; i < prefixes.length; ++i) {
          var vendorProp = prefixes[i] + prop_;
          if (vendorProp in div.style) {
            Transition.cache[prop] = vendorProp;
            break;
          }
        }
      }
    }

    return Transition.cache[prop];
  };

  /**
   * Get the name of the transition end event
   *
   * @static
   * @private
   * @return {string}  description
   */
  Transition.getTransitionEndEventName = function () {
    return Transition.transitionEndEventNames[Transition.getVendorPropertyName('transition')] || undefined;
  };

  /**
   * Helper function for listening on transition end events
   *
   * @function H5P.Transition.onTransitionEnd
   * @static
   * @param  {domElement} $element The element which is transitioned
   * @param  {function} callback The callback to be invoked when transition is finished
   * @param  {number} timeout  Timeout in milliseconds. Fallback if transition event is never fired
   */
  Transition.onTransitionEnd = function ($element, callback, timeout) {
    // Fallback on 1 second if transition event is not supported/triggered
    timeout = timeout || 1000;
    Transition.transitionEndEventName = Transition.transitionEndEventName || Transition.getTransitionEndEventName();
    var callbackCalled = false;

    var doCallback = function () {
      if (callbackCalled) {
        return;
      }
      $element.off(Transition.transitionEndEventName, callback);
      callbackCalled = true;
      clearTimeout(timer);
      callback();
    };

    var timer = setTimeout(function () {
      doCallback();
    }, timeout);

    $element.on(Transition.transitionEndEventName, function () {
      doCallback();
    });
  };

  /**
   * Wait for a transition - when finished, invokes next in line
   *
   * @private
   *
   * @param {Object[]}    transitions             Array of transitions
   * @param {H5P.jQuery}  transitions[].$element  Dom element transition is performed on
   * @param {number=}     transitions[].timeout   Timeout fallback if transition end never is triggered
   * @param {bool=}       transitions[].break     If true, sequence breaks after this transition
   * @param {number}      index                   The index for current transition
   */
  var runSequence = function (transitions, index) {
    if (index >= transitions.length) {
      return;
    }

    var transition = transitions[index];
    H5P.Transition.onTransitionEnd(transition.$element, function () {
      if (transition.end) {
        transition.end();
      }
      if (transition.break !== true) {
        runSequence(transitions, index+1);
      }
    }, transition.timeout || undefined);
  };

  /**
   * Run a sequence of transitions
   *
   * @function H5P.Transition.sequence
   * @static
   * @param {Object[]}    transitions             Array of transitions
   * @param {H5P.jQuery}  transitions[].$element  Dom element transition is performed on
   * @param {number=}     transitions[].timeout   Timeout fallback if transition end never is triggered
   * @param {bool=}       transitions[].break     If true, sequence breaks after this transition
   */
  Transition.sequence = function (transitions) {
    runSequence(transitions, 0);
  };

  return Transition;
})(H5P.jQuery);
;
var H5P = H5P || {};

/**
 * Class responsible for creating a help text dialog
 */
H5P.JoubelHelpTextDialog = (function ($) {

  var numInstances = 0;
  /**
   * Display a pop-up containing a message.
   *
   * @param {H5P.jQuery}  $container  The container which message dialog will be appended to
   * @param {string}      message     The message
   * @param {string}      closeButtonTitle The title for the close button
   * @return {H5P.jQuery}
   */
  function JoubelHelpTextDialog(header, message, closeButtonTitle) {
    H5P.EventDispatcher.call(this);

    var self = this;

    numInstances++;
    var headerId = 'joubel-help-text-header-' + numInstances;
    var helpTextId = 'joubel-help-text-body-' + numInstances;

    var $helpTextDialogBox = $('<div>', {
      'class': 'joubel-help-text-dialog-box',
      'role': 'dialog',
      'aria-labelledby': headerId,
      'aria-describedby': helpTextId
    });

    $('<div>', {
      'class': 'joubel-help-text-dialog-background'
    }).appendTo($helpTextDialogBox);

    var $helpTextDialogContainer = $('<div>', {
      'class': 'joubel-help-text-dialog-container'
    }).appendTo($helpTextDialogBox);

    $('<div>', {
      'class': 'joubel-help-text-header',
      'id': headerId,
      'role': 'header',
      'html': header
    }).appendTo($helpTextDialogContainer);

    $('<div>', {
      'class': 'joubel-help-text-body',
      'id': helpTextId,
      'html': message,
      'role': 'document',
      'tabindex': 0
    }).appendTo($helpTextDialogContainer);

    var handleClose = function () {
      $helpTextDialogBox.remove();
      self.trigger('closed');
    };

    var $closeButton = $('<div>', {
      'class': 'joubel-help-text-remove',
      'role': 'button',
      'title': closeButtonTitle,
      'tabindex': 1,
      'click': handleClose,
      'keydown': function (event) {
        // 32 - space, 13 - enter
        if ([32, 13].indexOf(event.which) !== -1) {
          event.preventDefault();
          handleClose();
        }
      }
    }).appendTo($helpTextDialogContainer);

    /**
     * Get the DOM element
     * @return {HTMLElement}
     */
    self.getElement = function () {
      return $helpTextDialogBox;
    };

    self.focus = function () {
      $closeButton.focus();
    };
  }

  JoubelHelpTextDialog.prototype = Object.create(H5P.EventDispatcher.prototype);
  JoubelHelpTextDialog.prototype.constructor = JoubelHelpTextDialog;

  return JoubelHelpTextDialog;
}(H5P.jQuery));
;
var H5P = H5P || {};

/**
 * Class responsible for creating auto-disappearing dialogs
 */
H5P.JoubelMessageDialog = (function ($) {

  /**
   * Display a pop-up containing a message.
   *
   * @param {H5P.jQuery} $container The container which message dialog will be appended to
   * @param {string} message The message
   * @return {H5P.jQuery}
   */
  function JoubelMessageDialog ($container, message) {
    var timeout;

    var removeDialog = function () {
      $warning.remove();
      clearTimeout(timeout);
      $container.off('click.messageDialog');
    };

    // Create warning popup:
    var $warning = $('<div/>', {
      'class': 'joubel-message-dialog',
      text: message
    }).appendTo($container);

    // Remove after 3 seconds or if user clicks anywhere in $container:
    timeout = setTimeout(removeDialog, 3000);
    $container.on('click.messageDialog', removeDialog);

    return $warning;
  }

  return JoubelMessageDialog;
})(H5P.jQuery);
;
var H5P = H5P || {};

/**
 * Class responsible for creating a circular progress bar
 */

H5P.JoubelProgressCircle = (function ($) {

  /**
   * Constructor for the Progress Circle
   *
   * @param {Number} number The amount of progress to display
   * @param {string} progressColor Color for the progress meter
   * @param {string} backgroundColor Color behind the progress meter
   */
  function ProgressCircle(number, progressColor, fillColor, backgroundColor) {
    progressColor = progressColor || '#1a73d9';
    fillColor = fillColor || '#f0f0f0';
    backgroundColor = backgroundColor || '#ffffff';
    var progressColorRGB = this.hexToRgb(progressColor);

    //Verify number
    try {
      number = Number(number);
      if (number === '') {
        throw 'is empty';
      }
      if (isNaN(number)) {
        throw 'is not a number';
      }
    } catch (e) {
      number = 'err';
    }

    //Draw circle
    if (number > 100) {
      number = 100;
    }

    // We can not use rgba, since they will stack on top of each other.
    // Instead we create the equivalent of the rgba color
    // and applies this to the activeborder and background color.
    var progressColorString = 'rgb(' + parseInt(progressColorRGB.r, 10) +
      ',' + parseInt(progressColorRGB.g, 10) +
      ',' + parseInt(progressColorRGB.b, 10) + ')';

    // Circle wrapper
    var $wrapper = $('<div/>', {
      'class': "joubel-progress-circle-wrapper"
    });

    //Active border indicates progress
    var $activeBorder = $('<div/>', {
      'class': "joubel-progress-circle-active-border"
    }).appendTo($wrapper);

    //Background circle
    var $backgroundCircle = $('<div/>', {
      'class': "joubel-progress-circle-circle"
    }).appendTo($activeBorder);

    //Progress text/number
    $('<span/>', {
      'text': number + '%',
      'class': "joubel-progress-circle-percentage"
    }).appendTo($backgroundCircle);

    var deg = number * 3.6;
    if (deg <= 180) {
      $activeBorder.css('background-image',
        'linear-gradient(' + (90 + deg) + 'deg, transparent 50%, ' + fillColor + ' 50%),' +
        'linear-gradient(90deg, ' + fillColor + ' 50%, transparent 50%)')
        .css('border', '2px solid' + backgroundColor)
        .css('background-color', progressColorString);
    } else {
      $activeBorder.css('background-image',
        'linear-gradient(' + (deg - 90) + 'deg, transparent 50%, ' + progressColorString + ' 50%),' +
        'linear-gradient(90deg, ' + fillColor + ' 50%, transparent 50%)')
        .css('border', '2px solid' + backgroundColor)
        .css('background-color', progressColorString);
    }

    this.$activeBorder = $activeBorder;
    this.$backgroundCircle = $backgroundCircle;
    this.$wrapper = $wrapper;

    this.initResizeFunctionality();

    return $wrapper;
  }

  /**
   * Initializes resize functionality for the progress circle
   */
  ProgressCircle.prototype.initResizeFunctionality = function () {
    var self = this;

    $(window).resize(function () {
      // Queue resize
      setTimeout(function () {
        self.resize();
      });
    });

    // First resize
    setTimeout(function () {
      self.resize();
    }, 0);
  };

  /**
   * Resize function makes progress circle grow or shrink relative to parent container
   */
  ProgressCircle.prototype.resize = function () {
    var $parent = this.$wrapper.parent();

    if ($parent !== undefined && $parent) {

      // Measurements
      var fontSize = parseInt($parent.css('font-size'), 10);

      // Static sizes
      var fontSizeMultiplum = 3.75;
      var progressCircleWidthPx = parseInt((fontSize / 4.5), 10) % 2 === 0 ? parseInt((fontSize / 4.5), 10) + 4 : parseInt((fontSize / 4.5), 10) + 5;
      var progressCircleOffset = progressCircleWidthPx / 2;

      var width = fontSize * fontSizeMultiplum;
      var height = fontSize * fontSizeMultiplum;
      this.$activeBorder.css({
        'width': width,
        'height': height
      });

      this.$backgroundCircle.css({
        'width': width - progressCircleWidthPx,
        'height': height - progressCircleWidthPx,
        'top': progressCircleOffset,
        'left': progressCircleOffset
      });
    }
  };

  /**
   * Hex to RGB conversion
   * @param hex
   * @returns {{r: Number, g: Number, b: Number}}
   */
  ProgressCircle.prototype.hexToRgb = function (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  return ProgressCircle;

}(H5P.jQuery));
;
var H5P = H5P || {};

H5P.SimpleRoundedButton = (function ($) {

  /**
   * Creates a new tip
   */
  function SimpleRoundedButton(text) {

    var $simpleRoundedButton = $('<div>', {
      'class': 'joubel-simple-rounded-button',
      'title': text,
      'role': 'button',
      'tabindex': '0'
    }).keydown(function (e) {
      // 32 - space, 13 - enter
      if ([32, 13].indexOf(e.which) !== -1) {
        $(this).click();
        e.preventDefault();
      }
    });

    $('<span>', {
      'class': 'joubel-simple-rounded-button-text',
      'html': text
    }).appendTo($simpleRoundedButton);

    return $simpleRoundedButton;
  }

  return SimpleRoundedButton;
}(H5P.jQuery));
;
var H5P = H5P || {};

/**
 * Class responsible for creating speech bubbles
 */
H5P.JoubelSpeechBubble = (function ($) {

  var $currentSpeechBubble;
  var $currentContainer;  
  var $tail;
  var $innerTail;
  var removeSpeechBubbleTimeout;
  var currentMaxWidth;

  var DEFAULT_MAX_WIDTH = 400;

  var iDevice = navigator.userAgent.match(/iPod|iPhone|iPad/g) ? true : false;

  /**
   * Creates a new speech bubble
   *
   * @param {H5P.jQuery} $container The speaking object
   * @param {string} text The text to display
   * @param {number} maxWidth The maximum width of the bubble
   * @return {H5P.JoubelSpeechBubble}
   */
  function JoubelSpeechBubble($container, text, maxWidth) {
    maxWidth = maxWidth || DEFAULT_MAX_WIDTH;
    currentMaxWidth = maxWidth;
    $currentContainer = $container;

    this.isCurrent = function ($tip) {
      return $tip.is($currentContainer);
    };

    this.remove = function () {
      remove();
    };

    var fadeOutSpeechBubble = function ($speechBubble) {
      if (!$speechBubble) {
        return;
      }

      // Stop removing bubble
      clearTimeout(removeSpeechBubbleTimeout);

      $speechBubble.removeClass('show');
      setTimeout(function () {
        if ($speechBubble) {
          $speechBubble.remove();
          $speechBubble = undefined;
        }
      }, 500);
    };

    if ($currentSpeechBubble !== undefined) {
      remove();
    }

    var $h5pContainer = getH5PContainer($container);

    // Make sure we fade out old speech bubble
    fadeOutSpeechBubble($currentSpeechBubble);

    // Create bubble
    $tail = $('<div class="joubel-speech-bubble-tail"></div>');
    $innerTail = $('<div class="joubel-speech-bubble-inner-tail"></div>');
    var $innerBubble = $(
      '<div class="joubel-speech-bubble-inner">' +
      '<div class="joubel-speech-bubble-text">' + text + '</div>' +
      '</div>'
    ).prepend($innerTail);

    $currentSpeechBubble = $(
      '<div class="joubel-speech-bubble" aria-live="assertive">'
    ).append([$tail, $innerBubble])
      .appendTo($h5pContainer);

    // Show speech bubble with transition
    setTimeout(function () {
      $currentSpeechBubble.addClass('show');
    }, 0);

    position($currentSpeechBubble, $currentContainer, maxWidth, $tail, $innerTail);

    // Handle click to close
    H5P.$body.on('mousedown.speechBubble', handleOutsideClick);

    // Handle window resizing
    H5P.$window.on('resize', '', handleResize);

    // Handle clicks when inside IV which blocks bubbling.
    $container.parents('.h5p-dialog')
      .on('mousedown.speechBubble', handleOutsideClick);

    if (iDevice) {
      H5P.$body.css('cursor', 'pointer');
    }

    return this;
  }

  // Remove speechbubble if it belongs to a dom element that is about to be hidden
  H5P.externalDispatcher.on('domHidden', function (event) {
    if ($currentSpeechBubble !== undefined && event.data.$dom.find($currentContainer).length !== 0) {
      remove();
    }
  });

  /**
   * Returns the closest h5p container for the given DOM element.
   * 
   * @param {object} $container jquery element
   * @return {object} the h5p container (jquery element)
   */
  function getH5PContainer($container) {
    var $h5pContainer = $container.closest('.h5p-frame');

    // Check closest h5p frame first, then check for container in case there is no frame.
    if (!$h5pContainer.length) {
      $h5pContainer = $container.closest('.h5p-container');
    }

    return $h5pContainer;
  }

  /**
   * Event handler that is called when the window is resized.
   */
  function handleResize() {
    position($currentSpeechBubble, $currentContainer, currentMaxWidth, $tail, $innerTail);
  }

  /**
   * Repositions the speech bubble according to the position of the container.
   * 
   * @param {object} $currentSpeechbubble the speech bubble that should be positioned   
   * @param {object} $container the container to which the speech bubble should point 
   * @param {number} maxWidth the maximum width of the speech bubble
   * @param {object} $tail the tail (the triangle that points to the referenced container)
   * @param {object} $innerTail the inner tail (the triangle that points to the referenced container)
   */
  function position($currentSpeechBubble, $container, maxWidth, $tail, $innerTail) {
    var $h5pContainer = getH5PContainer($container);

    // Calculate offset between the button and the h5p frame
    var offset = getOffsetBetween($h5pContainer, $container);

    var direction = (offset.bottom > offset.top ? 'bottom' : 'top');
    var tipWidth = offset.outerWidth * 0.9; // Var needs to be renamed to make sense
    var bubbleWidth = tipWidth > maxWidth ? maxWidth : tipWidth;

    var bubblePosition = getBubblePosition(bubbleWidth, offset);
    var tailPosition = getTailPosition(bubbleWidth, bubblePosition, offset, $container.width());
    // Need to set font-size, since element is appended to body.
    // Using same font-size as parent. In that way it will grow accordingly
    // when resizing
    var fontSize = 16;//parseFloat($parent.css('font-size'));

    // Set width and position of speech bubble
    $currentSpeechBubble.css(bubbleCSS(
      direction,
      bubbleWidth,
      bubblePosition,
      fontSize
    ));

    var preparedTailCSS = tailCSS(direction, tailPosition);
    $tail.css(preparedTailCSS);
    $innerTail.css(preparedTailCSS);
  }

  /**
   * Static function for removing the speechbubble
   */
  var remove = function () {
    H5P.$body.off('mousedown.speechBubble');
    H5P.$window.off('resize', '', handleResize);
    $currentContainer.parents('.h5p-dialog').off('mousedown.speechBubble');
    if (iDevice) {
      H5P.$body.css('cursor', '');
    }
    if ($currentSpeechBubble !== undefined) {
      // Apply transition, then remove speech bubble
      $currentSpeechBubble.removeClass('show');

      // Make sure we remove any old timeout before reassignment
      clearTimeout(removeSpeechBubbleTimeout);
      removeSpeechBubbleTimeout = setTimeout(function () {
        $currentSpeechBubble.remove();
        $currentSpeechBubble = undefined;
      }, 500);
    }
    // Don't return false here. If the user e.g. clicks a button when the bubble is visible,
    // we want the bubble to disapear AND the button to receive the event
  };

  /**
   * Remove the speech bubble and container reference
   */
  function handleOutsideClick(event) {
    if (event.target === $currentContainer[0]) {
      return; // Button clicks are not outside clicks
    }

    remove();
    // There is no current container when a container isn't clicked
    $currentContainer = undefined;
  }

  /**
   * Calculate position for speech bubble
   *
   * @param {number} bubbleWidth The width of the speech bubble
   * @param {object} offset
   * @return {object} Return position for the speech bubble
   */
  function getBubblePosition(bubbleWidth, offset) {
    var bubblePosition = {};

    var tailOffset = 9;
    var widthOffset = bubbleWidth / 2;

    // Calculate top position
    bubblePosition.top = offset.top + offset.innerHeight;

    // Calculate bottom position
    bubblePosition.bottom = offset.bottom + offset.innerHeight + tailOffset;

    // Calculate left position
    if (offset.left < widthOffset) {
      bubblePosition.left = 3;
    }
    else if ((offset.left + widthOffset) > offset.outerWidth) {
      bubblePosition.left = offset.outerWidth - bubbleWidth - 3;
    }
    else {
      bubblePosition.left = offset.left - widthOffset + (offset.innerWidth / 2);
    }

    return bubblePosition;
  }

  /**
   * Calculate position for speech bubble tail
   *
   * @param {number} bubbleWidth The width of the speech bubble
   * @param {object} bubblePosition Speech bubble position
   * @param {object} offset
   * @param {number} iconWidth The width of the tip icon
   * @return {object} Return position for the tail
   */
  function getTailPosition(bubbleWidth, bubblePosition, offset, iconWidth) {
    var tailPosition = {};
    // Magic numbers. Tuned by hand so that the tail fits visually within
    // the bounds of the speech bubble.
    var leftBoundary = 9;
    var rightBoundary = bubbleWidth - 20;

    tailPosition.left = offset.left - bubblePosition.left + (iconWidth / 2) - 6;
    if (tailPosition.left < leftBoundary) {
      tailPosition.left = leftBoundary;
    }
    if (tailPosition.left > rightBoundary) {
      tailPosition.left = rightBoundary;
    }

    tailPosition.top = -6;
    tailPosition.bottom = -6;

    return tailPosition;
  }

  /**
   * Return bubble CSS for the desired growth direction
   *
   * @param {string} direction The direction the speech bubble will grow
   * @param {number} width The width of the speech bubble
   * @param {object} position Speech bubble position
   * @param {number} fontSize The size of the bubbles font
   * @return {object} Return CSS
   */
  function bubbleCSS(direction, width, position, fontSize) {
    if (direction === 'top') {
      return {
        width: width + 'px',
        bottom: position.bottom + 'px',
        left: position.left + 'px',
        fontSize: fontSize + 'px',
        top: ''
      };
    }
    else {
      return {
        width: width + 'px',
        top: position.top + 'px',
        left: position.left + 'px',
        fontSize: fontSize + 'px',
        bottom: ''
      };
    }
  }

  /**
   * Return tail CSS for the desired growth direction
   *
   * @param {string} direction The direction the speech bubble will grow
   * @param {object} position Tail position
   * @return {object} Return CSS
   */
  function tailCSS(direction, position) {
    if (direction === 'top') {
      return {
        bottom: position.bottom + 'px',
        left: position.left + 'px',
        top: ''
      };
    }
    else {
      return {
        top: position.top + 'px',
        left: position.left + 'px',
        bottom: ''
      };
    }
  }

  /**
   * Calculates the offset between an element inside a container and the
   * container. Only works if all the edges of the inner element are inside the
   * outer element.
   * Width/height of the elements is included as a convenience.
   *
   * @param {H5P.jQuery} $outer
   * @param {H5P.jQuery} $inner
   * @return {object} Position offset
   */
  function getOffsetBetween($outer, $inner) {
    var outer = $outer[0].getBoundingClientRect();
    var inner = $inner[0].getBoundingClientRect();

    return {
      top: inner.top - outer.top,
      right: outer.right - inner.right,
      bottom: outer.bottom - inner.bottom,
      left: inner.left - outer.left,
      innerWidth: inner.width,
      innerHeight: inner.height,
      outerWidth: outer.width,
      outerHeight: outer.height
    };
  }

  return JoubelSpeechBubble;
})(H5P.jQuery);
;
var H5P = H5P || {};

H5P.JoubelThrobber = (function ($) {

  /**
   * Creates a new tip
   */
  function JoubelThrobber() {

    // h5p-throbber css is described in core
    var $throbber = $('<div/>', {
      'class': 'h5p-throbber'
    });

    return $throbber;
  }

  return JoubelThrobber;
}(H5P.jQuery));
;
H5P.JoubelTip = (function ($) {
  var $conv = $('<div/>');

  /**
   * Creates a new tip element.
   *
   * NOTE that this may look like a class but it doesn't behave like one.
   * It returns a jQuery object.
   *
   * @param {string} tipHtml The text to display in the popup
   * @param {Object} [behaviour] Options
   * @param {string} [behaviour.tipLabel] Set to use a custom label for the tip button (you want this for good A11Y)
   * @param {boolean} [behaviour.helpIcon] Set to 'true' to Add help-icon classname to Tip button (changes the icon)
   * @param {boolean} [behaviour.showSpeechBubble] Set to 'false' to disable functionality (you may this in the editor)
   * @param {boolean} [behaviour.tabcontrol] Set to 'true' if you plan on controlling the tabindex in the parent (tabindex="-1")
   * @return {H5P.jQuery|undefined} Tip button jQuery element or 'undefined' if invalid tip
   */
  function JoubelTip(tipHtml, behaviour) {

    // Keep track of the popup that appears when you click the Tip button
    var speechBubble;

    // Parse tip html to determine text
    var tipText = $conv.html(tipHtml).text().trim();
    if (tipText === '') {
      return; // The tip has no textual content, i.e. it's invalid.
    }

    // Set default behaviour
    behaviour = $.extend({
      tipLabel: tipText,
      helpIcon: false,
      showSpeechBubble: true,
      tabcontrol: false
    }, behaviour);

    // Create Tip button
    var $tipButton = $('<div/>', {
      class: 'joubel-tip-container' + (behaviour.showSpeechBubble ? '' : ' be-quiet'),
      title: behaviour.tipLabel,
      'aria-label': behaviour.tipLabel,
      'aria-expanded': false,
      role: 'button',
      tabindex: (behaviour.tabcontrol ? -1 : 0),
      click: function (event) {
        // Toggle show/hide popup
        toggleSpeechBubble();
        event.preventDefault();
      },
      keydown: function (event) {
        if (event.which === 32 || event.which === 13) { // Space & enter key
          // Toggle show/hide popup
          toggleSpeechBubble();
          event.stopPropagation();
          event.preventDefault();
        }
        else { // Any other key
          // Toggle hide popup
          toggleSpeechBubble(false);
        }
      },
      // Add markup to render icon
      html: '<span class="joubel-icon-tip-normal ' + (behaviour.helpIcon ? ' help-icon': '') + '">' +
              '<span class="h5p-icon-shadow"></span>' +
              '<span class="h5p-icon-speech-bubble"></span>' +
              '<span class="h5p-icon-info"></span>' +
            '</span>'
      // IMPORTANT: All of the markup elements must have 'pointer-events: none;'
    });

    /**
     * Tip button interaction handler.
     * Toggle show or hide the speech bubble popup when interacting with the
     * Tip button.
     *
     * @private
     * @param {boolean} [force] 'true' shows and 'false' hides.
     */
    var toggleSpeechBubble = function (force) {
      if (speechBubble !== undefined && speechBubble.isCurrent($tipButton)) {
        // Hide current popup
        speechBubble.remove();
        speechBubble = undefined;

        $tipButton.attr('aria-expanded', false);
      }
      else if (force !== false && behaviour.showSpeechBubble) {
        // Create and show new popup
        speechBubble = H5P.JoubelSpeechBubble($tipButton, tipHtml);
        $tipButton.attr('aria-expanded', true);
      }
    };

    return $tipButton;
  }

  return JoubelTip;
})(H5P.jQuery);
;
var H5P = H5P || {};

H5P.JoubelSlider = (function ($) {

  /**
   * Creates a new Slider
   *
   * @param {object} [params] Additional parameters
   */
  function JoubelSlider(params) {
    H5P.EventDispatcher.call(this);

    this.$slider = $('<div>', $.extend({
      'class': 'h5p-joubel-ui-slider'
    }, params));

    this.$slides = [];
    this.currentIndex = 0;
    this.numSlides = 0;
  }
  JoubelSlider.prototype = Object.create(H5P.EventDispatcher.prototype);
  JoubelSlider.prototype.constructor = JoubelSlider;

  JoubelSlider.prototype.addSlide = function ($content) {
    $content.addClass('h5p-joubel-ui-slide').css({
      'left': (this.numSlides*100) + '%'
    });
    this.$slider.append($content);
    this.$slides.push($content);

    this.numSlides++;

    if(this.numSlides === 1) {
      $content.addClass('current');
    }
  };

  JoubelSlider.prototype.attach = function ($container) {
    $container.append(this.$slider);
  };

  JoubelSlider.prototype.move = function (index) {
    var self = this;

    if(index === 0) {
      self.trigger('first-slide');
    }
    if(index+1 === self.numSlides) {
      self.trigger('last-slide');
    }
    self.trigger('move');

    var $previousSlide = self.$slides[this.currentIndex];
    H5P.Transition.onTransitionEnd(this.$slider, function () {
      $previousSlide.removeClass('current');
      self.trigger('moved');
    });
    this.$slides[index].addClass('current');

    var translateX = 'translateX(' + (-index*100) + '%)';
    this.$slider.css({
      '-webkit-transform': translateX,
      '-moz-transform': translateX,
      '-ms-transform': translateX,
      'transform': translateX
    });

    this.currentIndex = index;
  };

  JoubelSlider.prototype.remove = function () {
    this.$slider.remove();
  };

  JoubelSlider.prototype.next = function () {
    if(this.currentIndex+1 >= this.numSlides) {
      return;
    }

    this.move(this.currentIndex+1);
  };

  JoubelSlider.prototype.previous = function () {
    this.move(this.currentIndex-1);
  };

  JoubelSlider.prototype.first = function () {
    this.move(0);
  };

  JoubelSlider.prototype.last = function () {
    this.move(this.numSlides-1);
  };

  return JoubelSlider;
})(H5P.jQuery);
;
var H5P = H5P || {};

/**
 * @module
 */
H5P.JoubelScoreBar = (function ($) {

  /* Need to use an id for the star SVG since that is the only way to reference
     SVG filters  */
  var idCounter = 0;

  /**
   * Creates a score bar
   * @class H5P.JoubelScoreBar
   * @param {number} maxScore  Maximum score
   * @param {string} [label] Makes it easier for readspeakers to identify the scorebar
   * @param {string} [helpText] Score explanation
   * @param {string} [scoreExplanationButtonLabel] Label for score explanation button
   */
  function JoubelScoreBar(maxScore, label, helpText, scoreExplanationButtonLabel) {
    var self = this;

    self.maxScore = maxScore;
    self.score = 0;
    idCounter++;

    /**
     * @const {string}
     */
    self.STAR_MARKUP = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.77 53.87" aria-hidden="true" focusable="false">' +
        '<title>star</title>' +
        '<filter id="h5p-joubelui-score-bar-star-inner-shadow-' + idCounter + '" x0="-50%" y0="-50%" width="200%" height="200%">' +
          '<feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"></feGaussianBlur>' +
          '<feOffset dy="2" dx="4"></feOffset>' +
          '<feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"></feComposite>' +
          '<feFlood flood-color="#ffe95c" flood-opacity="1"></feFlood>' +
          '<feComposite in2="shadowDiff" operator="in"></feComposite>' +
          '<feComposite in2="SourceGraphic" operator="over" result="firstfilter"></feComposite>' +
          '<feGaussianBlur in="firstfilter" stdDeviation="3" result="blur2"></feGaussianBlur>' +
          '<feOffset dy="-2" dx="-4"></feOffset>' +
          '<feComposite in2="firstfilter" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"></feComposite>' +
          '<feFlood flood-color="#ffe95c" flood-opacity="1"></feFlood>' +
          '<feComposite in2="shadowDiff" operator="in"></feComposite>' +
          '<feComposite in2="firstfilter" operator="over"></feComposite>' +
        '</filter>' +
        '<path class="h5p-joubelui-score-bar-star-shadow" d="M35.08,43.41V9.16H20.91v0L9.51,10.85,9,10.93C2.8,12.18,0,17,0,21.25a11.22,11.22,0,0,0,3,7.48l8.73,8.53-1.07,6.16Z"/>' +
        '<g>' +
          '<path class="h5p-joubelui-score-bar-star-border" d="M61.36,22.8,49.72,34.11l2.78,16a2.6,2.6,0,0,1,.05.64c0,.85-.37,1.6-1.33,1.6A2.74,2.74,0,0,1,49.94,52L35.58,44.41,21.22,52a2.93,2.93,0,0,1-1.28.37c-.91,0-1.33-.75-1.33-1.6,0-.21.05-.43.05-.64l2.78-16L9.8,22.8A2.57,2.57,0,0,1,9,21.25c0-1,1-1.33,1.81-1.49l16.07-2.35L34.09,2.83c.27-.59.85-1.33,1.55-1.33s1.28.69,1.55,1.33l7.21,14.57,16.07,2.35c.75.11,1.81.53,1.81,1.49A3.07,3.07,0,0,1,61.36,22.8Z"/>' +
          '<path class="h5p-joubelui-score-bar-star-fill" d="M61.36,22.8,49.72,34.11l2.78,16a2.6,2.6,0,0,1,.05.64c0,.85-.37,1.6-1.33,1.6A2.74,2.74,0,0,1,49.94,52L35.58,44.41,21.22,52a2.93,2.93,0,0,1-1.28.37c-.91,0-1.33-.75-1.33-1.6,0-.21.05-.43.05-.64l2.78-16L9.8,22.8A2.57,2.57,0,0,1,9,21.25c0-1,1-1.33,1.81-1.49l16.07-2.35L34.09,2.83c.27-.59.85-1.33,1.55-1.33s1.28.69,1.55,1.33l7.21,14.57,16.07,2.35c.75.11,1.81.53,1.81,1.49A3.07,3.07,0,0,1,61.36,22.8Z"/>' +
          '<path filter="url(#h5p-joubelui-score-bar-star-inner-shadow-' + idCounter + ')" class="h5p-joubelui-score-bar-star-fill-full-score" d="M61.36,22.8,49.72,34.11l2.78,16a2.6,2.6,0,0,1,.05.64c0,.85-.37,1.6-1.33,1.6A2.74,2.74,0,0,1,49.94,52L35.58,44.41,21.22,52a2.93,2.93,0,0,1-1.28.37c-.91,0-1.33-.75-1.33-1.6,0-.21.05-.43.05-.64l2.78-16L9.8,22.8A2.57,2.57,0,0,1,9,21.25c0-1,1-1.33,1.81-1.49l16.07-2.35L34.09,2.83c.27-.59.85-1.33,1.55-1.33s1.28.69,1.55,1.33l7.21,14.57,16.07,2.35c.75.11,1.81.53,1.81,1.49A3.07,3.07,0,0,1,61.36,22.8Z"/>' +
        '</g>' +
      '</svg>';

    /**
     * @function appendTo
     * @memberOf H5P.JoubelScoreBar#
     * @param {H5P.jQuery}  $wrapper  Dom container
     */
    self.appendTo = function ($wrapper) {
      self.$scoreBar.appendTo($wrapper);
    };

    /**
     * Create the text representation of the scorebar .
     *
     * @private
     * @return {string}
     */
    var createLabel = function (score) {
      if (!label) {
        return '';
      }

      return label.replace(':num', score).replace(':total', self.maxScore);
    };

    /**
     * Creates the html for this widget
     *
     * @method createHtml
     * @private
     */
    var createHtml = function () {
      // Container div
      self.$scoreBar = $('<div>', {
        'class': 'h5p-joubelui-score-bar',
      });

      var $visuals = $('<div>', {
        'class': 'h5p-joubelui-score-bar-visuals',
        appendTo: self.$scoreBar
      });

      // The progress bar wrapper
      self.$progressWrapper = $('<div>', {
        'class': 'h5p-joubelui-score-bar-progress-wrapper',
        appendTo: $visuals
      });

      self.$progress = $('<div>', {
        'class': 'h5p-joubelui-score-bar-progress',
        'html': createLabel(self.score),
        appendTo: self.$progressWrapper
      });

      // The star
      $('<div>', {
        'class': 'h5p-joubelui-score-bar-star',
        html: self.STAR_MARKUP
      }).appendTo($visuals);

      // The score container
      var $numerics = $('<div>', {
        'class': 'h5p-joubelui-score-numeric',
        appendTo: self.$scoreBar,
        'aria-hidden': true
      });

      // The current score
      self.$scoreCounter = $('<span>', {
        'class': 'h5p-joubelui-score-number h5p-joubelui-score-number-counter',
        text: 0,
        appendTo: $numerics
      });

      // The separator
      $('<span>', {
        'class': 'h5p-joubelui-score-number-separator',
        text: '/',
        appendTo: $numerics
      });

      // Max score
      self.$maxScore = $('<span>', {
        'class': 'h5p-joubelui-score-number h5p-joubelui-score-max',
        text: self.maxScore,
        appendTo: $numerics
      });

      if (helpText) {
        H5P.JoubelUI.createTip(helpText, {
          tipLabel: scoreExplanationButtonLabel ? scoreExplanationButtonLabel : helpText,
          helpIcon: true
        }).appendTo(self.$scoreBar);
        self.$scoreBar.addClass('h5p-score-bar-has-help');
      }
    };

    /**
     * Set the current score
     * @method setScore
     * @memberOf H5P.JoubelScoreBar#
     * @param  {number} score
     */
    self.setScore = function (score) {
      // Do nothing if score hasn't changed
      if (score === self.score) {
        return;
      }
      self.score = score > self.maxScore ? self.maxScore : score;
      self.updateVisuals();
    };

    /**
     * Increment score
     * @method incrementScore
     * @memberOf H5P.JoubelScoreBar#
     * @param  {number=}        incrementBy Optional parameter, defaults to 1
     */
    self.incrementScore = function (incrementBy) {
      self.setScore(self.score + (incrementBy || 1));
    };

    /**
     * Set the max score
     * @method setMaxScore
     * @memberOf H5P.JoubelScoreBar#
     * @param  {number}    maxScore The max score
     */
    self.setMaxScore = function (maxScore) {
      self.maxScore = maxScore;
    };

    /**
     * Updates the progressbar visuals
     * @memberOf H5P.JoubelScoreBar#
     * @method updateVisuals
     */
    self.updateVisuals = function () {
      self.$progress.html(createLabel(self.score));
      self.$scoreCounter.text(self.score);
      self.$maxScore.text(self.maxScore);

      setTimeout(function () {
        // Start the progressbar animation
        self.$progress.css({
          width: ((self.score / self.maxScore) * 100) + '%'
        });

        H5P.Transition.onTransitionEnd(self.$progress, function () {
          // If fullscore fill the star and start the animation
          self.$scoreBar.toggleClass('h5p-joubelui-score-bar-full-score', self.score === self.maxScore);
          self.$scoreBar.toggleClass('h5p-joubelui-score-bar-animation-active', self.score === self.maxScore);

          // Only allow the star animation to run once
          self.$scoreBar.one("animationend", function() {
            self.$scoreBar.removeClass("h5p-joubelui-score-bar-animation-active");
          });
        }, 600);
      }, 300);
    };

    /**
     * Removes all classes
     * @method reset
     */
    self.reset = function () {
      self.$scoreBar.removeClass('h5p-joubelui-score-bar-full-score');
    };

    createHtml();
  }

  return JoubelScoreBar;
})(H5P.jQuery);
;
var H5P = H5P || {};

H5P.JoubelProgressbar = (function ($) {

  /**
   * Joubel progressbar class
   * @method JoubelProgressbar
   * @constructor
   * @param  {number}          steps Number of steps
   * @param {Object} [options] Additional options
   * @param {boolean} [options.disableAria] Disable readspeaker assistance
   * @param {string} [options.progressText] A progress text for describing
   *  current progress out of total progress for readspeakers.
   *  e.g. "Slide :num of :total"
   */
  function JoubelProgressbar(steps, options) {
    H5P.EventDispatcher.call(this);
    var self = this;
    this.options = $.extend({
      progressText: 'Slide :num of :total'
    }, options);
    this.currentStep = 0;
    this.steps = steps;

    this.$progressbar = $('<div>', {
      'class': 'h5p-joubelui-progressbar',
      on: {
        click: function () {
          self.toggleTooltip();
          return false;
        },
        mouseenter: function () {
          self.showTooltip();
        },
        mouseleave: function () {
          setTimeout(function () {
            self.hideTooltip();
          }, 1500);
        }
      }
    });
    this.$background = $('<div>', {
      'class': 'h5p-joubelui-progressbar-background'
    }).appendTo(this.$progressbar);

    $('body').click(function () {
      self.toggleTooltip(true);
    });
  }

  JoubelProgressbar.prototype = Object.create(H5P.EventDispatcher.prototype);
  JoubelProgressbar.prototype.constructor = JoubelProgressbar;

  /**
   * Display tooltip
   * @method showTooltip
   */
  JoubelProgressbar.prototype.showTooltip = function () {
    var self = this;

    if (this.currentStep === 0 || this.tooltip !== undefined) {
      return;
    }

    var parentWidth = self.$progressbar.offset().left + self.$progressbar.width();

    this.tooltip = new H5P.Drop({
      target: this.$background.get(0),
      content: this.currentStep + '/' + this.steps,
      classes: 'drop-theme-arrows-bounce h5p-joubelui-drop',
      position: 'top right',
      openOn: 'always',
      tetherOptions: {
        attachment: 'bottom center',
        targetAttachment: 'top right'
      }
    });
    this.tooltip.on('open', function () {
      var $drop = $(self.tooltip.drop);
      var left = $drop.position().left;
      var dropWidth = $drop.width();

      // Need to handle drops getting outside of the progressbar:
      if (left < 0) {
        $drop.css({marginLeft: (-left) + 'px'});
      }
      else if (left + dropWidth > parentWidth) {
        $drop.css({marginLeft: (parentWidth - (left + dropWidth)) + 'px'});
      }
    });
  };

  JoubelProgressbar.prototype.updateAria = function () {
    var self = this;
    if (this.options.disableAria) {
      return;
    }

    if (!this.$currentStatus) {
      this.$currentStatus = $('<div>', {
        'class': 'h5p-joubelui-progressbar-slide-status-text',
        'aria-live': 'assertive'
      }).appendTo(this.$progressbar);
    }
    var interpolatedProgressText = self.options.progressText
      .replace(':num', self.currentStep)
      .replace(':total', self.steps);
    this.$currentStatus.html(interpolatedProgressText);
  };

  /**
   * Hides tooltip
   * @method hideTooltip
   */
  JoubelProgressbar.prototype.hideTooltip = function () {
    if (this.tooltip !== undefined) {
      this.tooltip.remove();
      this.tooltip.destroy();
      this.tooltip = undefined;
    }
  };

  /**
   * Toggles tooltip-visibility
   * @method toggleTooltip
   * @param  {boolean} [closeOnly] Don't show, only close if open
   */
  JoubelProgressbar.prototype.toggleTooltip = function (closeOnly) {
    if (this.tooltip === undefined && !closeOnly) {
      this.showTooltip();
    }
    else if (this.tooltip !== undefined) {
      this.hideTooltip();
    }
  };

  /**
   * Appends to a container
   * @method appendTo
   * @param  {H5P.jquery} $container
   */
  JoubelProgressbar.prototype.appendTo = function ($container) {
    this.$progressbar.appendTo($container);
  };

  /**
   * Update progress
   * @method setProgress
   * @param  {number}    step
   */
  JoubelProgressbar.prototype.setProgress = function (step) {
    // Check for valid value:
    if (step > this.steps || step < 0) {
      return;
    }
    this.currentStep = step;
    this.$background.css({
      width: ((this.currentStep/this.steps)*100) + '%'
    });

    this.updateAria();
  };

  /**
   * Increment progress with 1
   * @method next
   */
  JoubelProgressbar.prototype.next = function () {
    this.setProgress(this.currentStep+1);
  };

  /**
   * Reset progressbar
   * @method reset
   */
  JoubelProgressbar.prototype.reset = function () {
    this.setProgress(0);
  };

  /**
   * Check if last step is reached
   * @method isLastStep
   * @return {Boolean}
   */
  JoubelProgressbar.prototype.isLastStep = function () {
    return this.steps === this.currentStep;
  };

  return JoubelProgressbar;
})(H5P.jQuery);
;
var H5P = H5P || {};

/**
 * H5P Joubel UI library.
 *
 * This is a utility library, which does not implement attach. I.e, it has to bee actively used by
 * other libraries
 * @module
 */
H5P.JoubelUI = (function ($) {

  /**
   * The internal object to return
   * @class H5P.JoubelUI
   * @static
   */
  function JoubelUI() {}

  /* Public static functions */

  /**
   * Create a tip icon
   * @method H5P.JoubelUI.createTip
   * @param  {string}  text   The textual tip
   * @param  {Object}  params Parameters
   * @return {H5P.JoubelTip}
   */
  JoubelUI.createTip = function (text, params) {
    return new H5P.JoubelTip(text, params);
  };

  /**
   * Create message dialog
   * @method H5P.JoubelUI.createMessageDialog
   * @param  {H5P.jQuery}               $container The dom container
   * @param  {string}                   message    The message
   * @return {H5P.JoubelMessageDialog}
   */
  JoubelUI.createMessageDialog = function ($container, message) {
    return new H5P.JoubelMessageDialog($container, message);
  };

  /**
   * Create help text dialog
   * @method H5P.JoubelUI.createHelpTextDialog
   * @param  {string}             header  The textual header
   * @param  {string}             message The textual message
   * @param  {string}             closeButtonTitle The title for the close button
   * @return {H5P.JoubelHelpTextDialog}
   */
  JoubelUI.createHelpTextDialog = function (header, message, closeButtonTitle) {
    return new H5P.JoubelHelpTextDialog(header, message, closeButtonTitle);
  };

  /**
   * Create progress circle
   * @method H5P.JoubelUI.createProgressCircle
   * @param  {number}             number          The progress (0 to 100)
   * @param  {string}             progressColor   The progress color in hex value
   * @param  {string}             fillColor       The fill color in hex value
   * @param  {string}             backgroundColor The background color in hex value
   * @return {H5P.JoubelProgressCircle}
   */
  JoubelUI.createProgressCircle = function (number, progressColor, fillColor, backgroundColor) {
    return new H5P.JoubelProgressCircle(number, progressColor, fillColor, backgroundColor);
  };

  /**
   * Create throbber for loading
   * @method H5P.JoubelUI.createThrobber
   * @return {H5P.JoubelThrobber}
   */
  JoubelUI.createThrobber = function () {
    return new H5P.JoubelThrobber();
  };

  /**
   * Create simple rounded button
   * @method H5P.JoubelUI.createSimpleRoundedButton
   * @param  {string}                  text The button label
   * @return {H5P.SimpleRoundedButton}
   */
  JoubelUI.createSimpleRoundedButton = function (text) {
    return new H5P.SimpleRoundedButton(text);
  };

  /**
   * Create Slider
   * @method H5P.JoubelUI.createSlider
   * @param  {Object} [params] Parameters
   * @return {H5P.JoubelSlider}
   */
  JoubelUI.createSlider = function (params) {
    return new H5P.JoubelSlider(params);
  };

  /**
   * Create Score Bar
   * @method H5P.JoubelUI.createScoreBar
   * @param  {number=}       maxScore The maximum score
   * @param {string} [label] Makes it easier for readspeakers to identify the scorebar
   * @return {H5P.JoubelScoreBar}
   */
  JoubelUI.createScoreBar = function (maxScore, label, helpText, scoreExplanationButtonLabel) {
    return new H5P.JoubelScoreBar(maxScore, label, helpText, scoreExplanationButtonLabel);
  };

  /**
   * Create Progressbar
   * @method H5P.JoubelUI.createProgressbar
   * @param  {number=}       numSteps The total numer of steps
   * @param {Object} [options] Additional options
   * @param {boolean} [options.disableAria] Disable readspeaker assistance
   * @param {string} [options.progressText] A progress text for describing
   *  current progress out of total progress for readspeakers.
   *  e.g. "Slide :num of :total"
   * @return {H5P.JoubelProgressbar}
   */
  JoubelUI.createProgressbar = function (numSteps, options) {
    return new H5P.JoubelProgressbar(numSteps, options);
  };

  /**
   * Create standard Joubel button
   *
   * @method H5P.JoubelUI.createButton
   * @param {object} params
   *  May hold any properties allowed by jQuery. If href is set, an A tag
   *  is used, if not a button tag is used.
   * @return {H5P.jQuery} The jquery element created
   */
  JoubelUI.createButton = function(params) {
    var type = 'button';
    if (params.href) {
      type = 'a';
    }
    else {
      params.type = 'button';
    }
    if (params.class) {
      params.class += ' h5p-joubelui-button';
    }
    else {
      params.class = 'h5p-joubelui-button';
    }
    return $('<' + type + '/>', params);
  };

  /**
   * Fix for iframe scoll bug in IOS. When focusing an element that doesn't have
   * focus support by default the iframe will scroll the parent frame so that
   * the focused element is out of view. This varies dependening on the elements
   * of the parent frame.
   */
  if (H5P.isFramed && !H5P.hasiOSiframeScrollFix &&
      /iPad|iPhone|iPod/.test(navigator.userAgent)) {
    H5P.hasiOSiframeScrollFix = true;

    // Keep track of original focus function
    var focus = HTMLElement.prototype.focus;

    // Override the original focus
    HTMLElement.prototype.focus = function () {
      // Only focus the element if it supports it natively
      if ( (this instanceof HTMLAnchorElement ||
            this instanceof HTMLInputElement ||
            this instanceof HTMLSelectElement ||
            this instanceof HTMLTextAreaElement ||
            this instanceof HTMLButtonElement ||
            this instanceof HTMLIFrameElement ||
            this instanceof HTMLAreaElement) && // HTMLAreaElement isn't supported by Safari yet.
          !this.getAttribute('role')) { // Focus breaks if a different role has been set
          // In theory this.isContentEditable should be able to recieve focus,
          // but it didn't work when tested.

        // Trigger the original focus with the proper context
        focus.call(this);
      }
    };
  }

  return JoubelUI;
})(H5P.jQuery);
;
var H5P = H5P || {};

/**
 * Goals Page module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.GoalsPage = (function ($, EventDispatcher) {
  // CSS Classes:
  var MAIN_CONTAINER = 'h5p-goals-page';

  var goalCounter = 0;

  /**
   * Helper for resizing height of text area while typing (to avoid scrollbars)
   *
   * @param  {H5P.jQuery} $textarea
   */
  var autoResizeTextarea = function ($textarea) {
    var setHeight = function () {
      $textarea.css('height', Math.max($textarea[0].scrollHeight, 50) + 'px');
    };

    $textarea.on('input', function () {
      this.style.height = 'auto';
      setHeight();
    });

    setHeight();
  };

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @returns {Object} GoalsPage GoalsPage instance
   */
  function GoalsPage(params, id, extras) {
    EventDispatcher.call(this);
    this.id = id;
    this.extras = extras;

    // Set default behavior.
    this.params = $.extend({
      title: this.getTitle(),
      description: '',
      defineGoalText: 'Create a new goal',
      definedGoalLabel: 'User defined goal',
      defineGoalPlaceholder: 'Write here...',
      goalsAddedText: 'Number of goals added:',
      removeGoalText: 'Remove',
      helpTextLabel: 'Read more',
      helpText: 'Help text',
      goalDeletionConfirmation: {
        header: 'Confirm deletion',
        message: 'Are you sure you want to delete this goal?',
        cancelLabel: 'Cancel',
        confirmLabel: 'Confirm'
      }
    }, params);
  }

  GoalsPage.prototype = Object.create(EventDispatcher.prototype);
  GoalsPage.prototype.constructor = GoalsPage;

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  GoalsPage.prototype.attach = function ($container) {
    var self = this;
    this.$inner = $('<div>', {
      'class': MAIN_CONTAINER
    }).appendTo($container);

    self.goalList = [];
    self.goalId = 0;

    var goalsTemplate =
      '<div class="page-header" role="heading" tabindex="-1">' +
      ' <div class="page-title">{{{title}}}</div>' +
      ' <button class="page-help-text">{{{helpTextLabel}}}</button>' +
      '</div>' +
      '<div class="goals-description">{{{description}}}</div>' +
      '<div class="goals-view"></div>' +
      '<div class="goals-counter"></div>' +
      '<div class="goals-define">' +
      '<div role="button" tabindex="0" class="joubel-simple-rounded-button goals-create" title="{{{defineGoalText}}}">' +
      ' <span class="joubel-simple-rounded-button-text">{{{defineGoalText}}}</span>' +
      '</div>' +
      '</div>';

    /*global Mustache */
    self.$inner.append(Mustache.render(goalsTemplate, self.params));
    self.$goalsView = $('.goals-view', self.$inner);
    self.$pageTitle = $('.page-header', self.$inner);
    self.$helpButton = $('.page-help-text', this.$inner);
    self.$createGoalButton = $('.goals-create', this.$inner);

    self.initHelpTextButton();
    self.initCreateGoalButton();
  };

  /**
   * Create button for creating goals
   */
  GoalsPage.prototype.initCreateGoalButton = function () {
    var self = this;

    // Create new goal on click
    H5P.DocumentationTool.handleButtonClick(self.$createGoalButton, function () {
      self.addGoal().find('.created-goal').focus();
      self.trigger('resize');
    });
  };

  /**
   * Adds a new goal to the page
   * @param {Object} competenceAim Optional competence aim which the goal will constructed from
   * @return {jQuery} $newGoal New goal element
   */
  GoalsPage.prototype.addGoal = function (competenceAim) {
    var self = this;
    goalCounter++;

    var goalText = self.params.defineGoalPlaceholder;
    var goalTypeDescription = self.params.definedGoalLabel;

    // Use predefined goal
    if (competenceAim !== undefined) {
      goalText = competenceAim.value;
      goalTypeDescription = competenceAim.description;
    }

    var newGoal = new H5P.GoalsPage.GoalInstance(goalText, self.goalId, goalTypeDescription);
    self.goalList.push(newGoal);
    self.goalId += 1;

    // Create goal element and append it to view
    var $newGoal = this.createNewGoal(newGoal).appendTo(self.$goalsView);

    self.updateGoalsCounter();

    return $newGoal;
  };

  /**
   * Remove chosen goal from the page
   * @param {jQuery} $goalContainer
   */
  GoalsPage.prototype.removeGoal = function ($goalContainer) {
    var goalInstance = this.getGoalInstanceFromUniqueId($goalContainer.data('uniqueId'));

    if (this.goalList.indexOf(goalInstance) > -1) {
      this.goalList.splice(this.goalList.indexOf(goalInstance), 1);
    }
    $goalContainer.remove();
    this.updateGoalsCounter();
    this.trigger('resize');
  };

  /**
   * Updates goal counter on page with amount of chosen goals.
   */
  GoalsPage.prototype.updateGoalsCounter = function () {
    var self = this;
    var $goalCounterContainer = $('.goals-counter', self.$inner);
    $goalCounterContainer.children().remove();
    if (self.goalList.length) {
      $('<span>', {
        'class': 'goals-counter-text',
        'html': self.params.goalsAddedText + ' ' + self.goalList.length,
        'aria-live': 'polite'
      }).appendTo($goalCounterContainer);
    }
  };

  /**
   * Returns the goal instance matching provided id
   * @param {Number} goalInstanceUniqueId Id matching unique id of target goal
   * @returns {H5P.GoalsPage.GoalInstance|Number} Returns matching goal instance or -1 if not found
   */
  GoalsPage.prototype.getGoalInstanceFromUniqueId = function (goalInstanceUniqueId) {
    var foundInstance = -1;
    this.goalList.forEach(function (goalInstance) {
      if (goalInstance.getUniqueId() === goalInstanceUniqueId) {
        foundInstance = goalInstance;
      }
    });

    return foundInstance;
  };

  /**
   * Create help text functionality for reading more about the task
   */
  GoalsPage.prototype.initHelpTextButton = function () {
    var self = this;

    if (this.params.helpText !== undefined && this.params.helpText.length) {
      // Init help button
      self.$helpButton.on('click', function () {
        self.trigger('open-help-dialog', {
          'aria-label': self.params.title,
          title: self.params.title,
          helpText: self.params.helpText
        });
      });
    }
    else {
      self.$helpButton.remove();
    }
  };

  /**
   * Create a new goal container
   * @param {H5P.GoalsPage.GoalInstance} goalInstance Goal instance object to create the goal from
   * @returns {jQuery} New goal element
   */
  GoalsPage.prototype.createNewGoal = function (goalInstance) {
    var self = this;

    // Goal container
    var $goalContainer = $('<div/>', {
      'class': 'created-goal-container',
    }).data('uniqueId', goalInstance.getUniqueId());

    var initialText = goalInstance.goalText();

    var id = 'created-goal-' + goalCounter + '-' + goalInstance.getUniqueId();

    // Input paragraph area
    var $goalInputArea = $('<textarea>', {
      'class': 'created-goal',
      'spellcheck': 'false',
      'placeholder': initialText,
      'title': goalInstance.getGoalTypeDescription(),
      'id': id
    }).appendTo($goalContainer);

    // Need to tell world I might need to resize
    $goalInputArea.on('blur keyup paste input', function () {
      self.trigger('resize');
    });

    // Save the value
    $goalInputArea.on('blur', function () {
      goalInstance.goalText($goalInputArea.val());
      var xAPIEvent = self.createXAPIEventTemplate('interacted');
      self.addQuestionToxAPI(xAPIEvent);
      self.addResponseToxAPI(xAPIEvent);
      self.trigger(xAPIEvent);
    });

    autoResizeTextarea($goalInputArea);

    // Add remove button
    this.createRemoveGoalButton(this.params.removeGoalText, id, $goalContainer).appendTo($goalContainer);

    return $goalContainer;
  };

  /**
   * Creates a button for removing the given container
   * @param {String} text String to display on the button
   * @param {jQuery} $removeContainer Container that will be removed upon click
   * @returns {jQuery} $removeGoalButton The button
   */
  GoalsPage.prototype.createRemoveGoalButton = function (text, textAreaId, $removeContainer) {
    var self = this;
    var $removeGoalButton = $('<button>', {
      'class': 'h5p-created-goal-remove h5p-goals-button',
      'title': text,
      'aria-describedby': textAreaId,
      click: function () {
        var confirmationDialog = new H5P.ConfirmationDialog({
          headerText: self.params.goalDeletionConfirmation.header,
          dialogText: self.params.goalDeletionConfirmation.message,
          cancelText: self.params.goalDeletionConfirmation.cancelLabel,
          confirmText: self.params.goalDeletionConfirmation.confirmLabel
        });

        confirmationDialog.on('confirmed', function () {
          self.removeGoal($removeContainer);
          // Set focus to add new goal button
          self.$createGoalButton.focus();
        });

        confirmationDialog.appendTo(self.$inner.closest('.h5p-documentation-tool').get(0));
        confirmationDialog.show();
      }
    });

    return $removeGoalButton;
  };

  /**
   * Get page title
   * @returns {String} Page title
   */
  GoalsPage.prototype.getTitle = function () {
    return H5P.createTitle((this.extras && this.extras.metadata && this.extras.metadata.title) ? this.extras.metadata.title : 'Goals');
  };

  /**
   * Get goal list
   * @returns {Array} Goal list
   */
  GoalsPage.prototype.getGoals = function () {
    return this.goalList;
  };

  /**
   * Sets focus on page
   */
  GoalsPage.prototype.focus = function () {
    this.$pageTitle.focus();
  };

  /**
   * Get xAPI data.
   * Contract used by report rendering engine.
   *
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  GoalsPage.prototype.getXAPIData = function () {
    var XAPIEvent = this.createXAPIEventTemplate('answered');
    this.addQuestionToxAPI(XAPIEvent);
    this.addResponseToxAPI(XAPIEvent);
    return {
      statement: XAPIEvent.data.statement
    };
  };

  /**
    * Trigger xAPI answered event
    */
  GoalsPage.prototype.triggerAnswered = function () {
    var xAPIEvent = this.createXAPIEventTemplate('answered');
    this.addQuestionToXAPI(xAPIEvent);
    this.addResponseToXAPI(xAPIEvent);
    this.trigger(xAPIEvent);
  };

  /**
   * Add the question itself to the definition part of an xAPIEvent
   */
  GoalsPage.prototype.addQuestionToxAPI = function (xAPIEvent) {
    var definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
    $.extend(definition, this.getxAPIDefinition());
  };

  /**
   * Generate xAPI object definition used in xAPI statements.
   * @return {Object}
   */
  GoalsPage.prototype.getxAPIDefinition = function () {
    var definition = {};
    var self = this;
    definition.description = {
      'en-US': self.params.definedGoalLabel
    };
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.interactionType = 'fill-in';
    definition.correctResponsesPattern = '';
    definition.extensions = {
      'https://h5p.org/x-api/h5p-machine-name': 'H5P.GoalsPage'
    };

    return definition;
  };

  /**
   * Add the response part to an xAPI event
   *
   * @param {H5P.XAPIEvent} xAPIEvent
   *  The xAPI event we will add a response to
   */
  GoalsPage.prototype.addResponseToxAPI = function (xAPIEvent) {
    xAPIEvent.data.statement.result = {};
    xAPIEvent.data.statement.result.response = this.getXAPIResponse();
  };

  /**
   * Generate xAPI user response, used in xAPI statements.
   * @return {string} User answers separated by the "[,]" pattern
   */
  GoalsPage.prototype.getXAPIResponse = function () {
    return this.getGoals().map(function (goal) {
      return goal.text;
    }).join('[,]');
  };

  return GoalsPage;
}(H5P.jQuery, H5P.EventDispatcher));
;
var H5P = H5P || {};
H5P.GoalsPage = H5P.GoalsPage || {};

/**
 * Goal Instance module
 */
H5P.GoalsPage.GoalInstance = (function () {

  /**
   * Initialize module.
   * @param {String} defineGoalPlaceholder Placeholder for Goal Instance
   * @param {Number} uniqueId Unique identifier for Goal Instance.

   * @param {String} goalTypeDescription String describing the goal type, that will be displayed in its' footer
   * @returns {Object} GoalInstance GoalInstance instance
   */
  function GoalInstance(defineGoalPlaceholder, uniqueId, goalTypeDescription) {
    this.uniqueId = uniqueId;
    this.answer = -1;
    this.textualAnswer = '';
    this.text = defineGoalPlaceholder;
    this.goalTypeDescription = goalTypeDescription;
  }

  /**
   * Get goal type description
   * @returns {String} String representation of the goal type
   */
  GoalInstance.prototype.getGoalTypeDescription = function () {
    return this.goalTypeDescription;
  };

  /**
   * Get goal id
   * @returns {Number} uniqueId A unique identifier for the goal
   */
  GoalInstance.prototype.getUniqueId = function () {
    return this.uniqueId;
  };

  /**
   * Set or get goal answer/assessment depending on provided parameter
   * @param {Number} answer If defined the goal will be set to this value.
   * @returns {*} Returns answer with no parameters, and return this when setting parameter for chaining
   */
  GoalInstance.prototype.goalAnswer = function (answer) {
    // Get answer value if no arguments
    if (answer === undefined) {
      return this.answer;
    }

    // Set answer value
    this.answer = answer;
    return this;
  };

  /**
   * Get or set goal text depending on provided parameter
   * @param {String} text If defined this will be the new goal text for the goal
   * @returns {*} Returns text with no parameters, and return this when setting parameter for chaining
   */
  GoalInstance.prototype.goalText = function (text) {
    // Get text value if no arguments
    if (text === undefined) {
      return this.text;
    }

    // Set text value
    this.text = text;
    return this;
  };

  /**
   * Set textual answer in goal instance
   * @param {String} textualAnswer Textual answer
   */
  GoalInstance.prototype.setTextualAnswer = function (textualAnswer) {
    this.textualAnswer = textualAnswer;
  };

  /**
   * Get textual answer from goal instance
   * @returns {string} textualAnswer Textual answer
   */
  GoalInstance.prototype.getTextualAnswer = function () {
    return this.textualAnswer;
  };

  return GoalInstance;
}());
;
/*global Mustache*/
var H5P = H5P || {};

/**
 * Goals Assessment Page module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.GoalsAssessmentPage = (function ($, EventDispatcher) {
  "use strict";

  // CSS Classes:
  var MAIN_CONTAINER = 'h5p-goals-assessment-page';

  /**
   * Helper for enabling tabbing
   * @param  {H5P.jQuery} $element
   */
  var enableTab = function ($element) {
    $element.attr('tabindex', 0);
  };

  /**
   * Helper for disabling tabbing
   * @param  {H5P.jQuery} $element
   */
  var disableTab = function ($element) {
    $element.attr('tabindex', -1);
  };

  /**
   * Helper for checking a radio
   * @param  {H5P.jQuery} $element
   */
  var check = function ($element) {
    $element.attr('aria-checked', true);
  };

  /**
   * Helper for unchecking a radio
   * @param  {H5P.jQuery} $element
   */
  var uncheck = function ($element) {
    $element.attr('aria-checked', false);
  };

  /**
   * Helper for making elements with role radio behave as excpected
   * @param  {H5P.jQuery} $element
   */
  var makeRadiosAccessible = function ($alternatives) {
    // Initially, first radio is tabable
    enableTab($alternatives.first());

    // Handle arrow-keys
    $alternatives.on('keydown', function (event) {
      var $current = $(this);
      var $focusOn;
      switch (event.which) {
        case 35: // End button
          // Go to previous Option
          $focusOn = $alternatives.last();
          break;

        case 36: // Home button
          // Go to previous Option
          $focusOn = $alternatives.first();
          break;

        case 37: // Left Arrow
        case 38: // Up Arrow
          // Go to previous Option
          $focusOn = $current.prev();
          if ($focusOn.length === 0) {
            // Wrap around
            $focusOn = $alternatives.last();
          }
          break;

        case 39: // Right Arrow
        case 40: // Down Arrow
          // Go to next Option
          $focusOn = $current.next();
          if ($focusOn.length === 0) {
            // Wrap around
            $focusOn = $alternatives.first();
          }
          break;
      }

      if ($focusOn && $focusOn.length === 1) {
        disableTab($alternatives);
        enableTab($focusOn);
        $focusOn.focus();
        event.preventDefault();
      }
    });
  };

  var goalsAssessmentTemplate =
    '<div class="page-header" role="heading" tabindex="-1">' +
    ' <div class="page-title">{{{title}}}</div>' +
    ' <button class="page-help-text">{{{helpTextLabel}}}</button>' +
    '</div>' +
    '<div class="goals-assessment-description">{{{description}}}</div>' +
    '<div class="legend" aria-hidden="true">' +
    '  <span class="legend-header">{{{legendHeader}}}</span>' +
    '  <ul class="ratings">' +
    '    <li class="rating low">{{{lowRating}}}</li> ' +
    '    <li class="rating mid">{{{midRating}}}</li> ' +
    '    <li class="rating high">{{{highRating}}}</li> ' +
    '  </ul>' +
    '</div>' +
    '<div class="goals-assessment-view">' +
    ' <div class="goals-header">' +
    '  <span class="goal-name-header">{{{goalHeader}}}</span>' +
    '  <span class="rating-header">{{{ratingHeader}}}</span>' +
    ' </div>' +
    ' <div>' +
    '  <ul class="goals">' +
    '  </ul>' +
    '</div>';

  var goalTemplate =
   '<li class="goal">' +
   ' <span class="goal-name">{{{goalName}}}</span>' +
   ' <ul role="radiogroup" class="rating-container">' +
   '  <li role="radio" class="rating low" aria-label="{{{lowRating}}}"></li>' +
   '  <li role="radio" class="rating mid" aria-label="{{{midRating}}}"></li>' +
   '  <li role="radio" class="rating high" aria-label="{{{highRating}}}"></li>' +
   ' </ul>' +
   '</li>';

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @returns {Object} GoalsAssessmentPage GoalsAssessmentPage instance
   */
  function GoalsAssessmentPage(params, id, extras) {
    EventDispatcher.call(this);
    this.id = id;
    this.extras = extras;

    // Set default behavior.
    this.params = $.extend({
      title: this.getTitle(),
      description: '',
      lowRating: 'Learned little',
      midRating: 'Learned something',
      highRating: 'Learned a lot',
      noGoalsText: 'You have not chosen any goals yet.',
      helpTextLabel: 'Read more',
      helpText: 'Help text',
      legendHeader: 'Possible ratings:',
      goalHeader: 'Goals',
      ratingHeader: 'Rating'
    }, params);

    // Array containing assessment categories,
    // makes it easier to extend categories at a later point.
    this.assessmentCategories = [
      this.params.lowRating,
      this.params.midRating,
      this.params.highRating
    ];

    this.currentGoals = [];
    this.state = {};
    this.currentSelection;
  }

  GoalsAssessmentPage.prototype = Object.create(EventDispatcher.prototype);
  GoalsAssessmentPage.prototype.constructor = GoalsAssessmentPage;

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  GoalsAssessmentPage.prototype.attach = function ($container) {
    this.$inner = $('<div>', {
      'class': MAIN_CONTAINER
    }).appendTo($container);

    this.$inner.append(Mustache.render(goalsAssessmentTemplate, this.params));

    this.$goals = $('.goals', this.$inner);
    this.$pageTitle = $('.page-header', this.$inner);
    this.$helpButton = $('.page-help-text', this.$inner);

    this.initHelpTextButton();
  };

  /**
   * Create help text functionality for reading more about the task
   */
  GoalsAssessmentPage.prototype.initHelpTextButton = function () {
    var self = this;

    if (this.params.helpText !== undefined && this.params.helpText.length) {
      self.$helpButton.on('click', function () {
        self.trigger('open-help-dialog', {
          title: self.params.title,
          helpText: self.params.helpText
        });
      });
    }
    else {
      self.$helpButton.remove();
    }
  };

  /**
   * Get page title
   * @returns {String} page title
   */
  GoalsAssessmentPage.prototype.getTitle = function () {
    return H5P.createTitle((this.extras && this.extras.metadata && this.extras.metadata.title) ? this.extras.metadata.title : 'Goals Assessment');
  };

  /**
   * Updates internal list of assessment goals
   *
   * @param {Array} newGoals Array of goals
   */
  GoalsAssessmentPage.prototype.updateAssessmentGoals = function (newGoals) {
    var self = this;

    this.currentGoals = [];
    this.$goals.empty();

    // Create and place all goals
    newGoals.forEach(function (goalsPage) {
      goalsPage.forEach(function (goalInstance) {
        self.createGoalAssessmentElement(goalInstance);
      });
    });

    self.trigger('resize');
  };

  /**
   * Create goal assessment element from goal instance
   * @param {H5P.GoalsPage.GoalInstance} goalInstance Goal instance
   */
  GoalsAssessmentPage.prototype.createGoalAssessmentElement = function (goalInstance) {
    var self = this;
    var goalText = goalInstance.goalText();
    // Check if goal is defined
    if (!goalText) {
      return;
    }

    self.currentGoals.push(goalInstance);

    var $goal = $(Mustache.render(goalTemplate, {
      goalName: goalText,
      lowRating: self.params.lowRating,
      midRating: self.params.midRating,
      highRating: self.params.highRating
    })).appendTo(self.$goals);

    // Setup buttons
    var $ratingButtons = $goal.find('[role="radio"]');
    makeRadiosAccessible($ratingButtons);
    H5P.DocumentationTool.handleButtonClick($ratingButtons, function () {
      var $currentElement = $(this);

      uncheck($ratingButtons);
      check($currentElement);

      var selectedCategoryIndex = $currentElement.index();
      // Save answer
      goalInstance.goalAnswer(selectedCategoryIndex);
      goalInstance.setTextualAnswer(self.assessmentCategories[selectedCategoryIndex]);

      var xAPIEvent = self.createXAPIEventTemplate('interacted');
      self.addQuestionToGoalXAPI(xAPIEvent, goalText);
      self.addResponseToGoalXAPI(xAPIEvent, $currentElement.index());
      self.trigger(xAPIEvent);
    });

    // If already checked - update UI
    if (goalInstance.goalAnswer() !== -1) {
      check($ratingButtons.eq(goalInstance.goalAnswer()));
    }
  };

  /**
   * Gets current updated goals
   *
   * @returns {Object} current goals and assessment categories
   */
  GoalsAssessmentPage.prototype.getAssessedGoals = function () {
    return {
      goals: this.currentGoals,
      categories: this.assessmentCategories
    };
  };

  /**
   * Sets focus on page
   */
  GoalsAssessmentPage.prototype.focus = function () {
    this.$pageTitle.focus();
  };

  /**
   * Triggers an 'answered' xAPI event for all inputs
   */
  GoalsAssessmentPage.prototype.triggerAnsweredEvents = function () {
    var self = this;
    this.getAssessedGoals().goals.forEach(function(goal) {
      var xAPIEvent = self.createXAPIEventTemplate('answered');
      self.addQuestionToGoalXAPI(xAPIEvent, goal.text);
      self.addResponseToGoalXAPI(xAPIEvent, goal.answer);
      self.trigger(xAPIEvent);
    });
  };

  /**
   * Helper function to return all xAPI data
   * @returns {Array}
   */
  GoalsAssessmentPage.prototype.getXAPIDataFromChildren = function () {
    var children = [];

    var self = this;
    this.getAssessedGoals().goals.forEach(function(goal) {
      var xAPIEvent = self.createXAPIEventTemplate('answered');
      self.addQuestionToGoalXAPI(xAPIEvent, goal.text);
      self.addResponseToGoalXAPI(xAPIEvent, goal.answer);
      children.push({
        statement: xAPIEvent.data.statement
      });
    });

    return children;
  };

  /**
   * Generate xAPI object definition used in xAPI statements for the entire goals assessment page
   * @return {Object}
   */
  GoalsAssessmentPage.prototype.getxAPIDefinition = function () {
    var definition = {};
    var self = this;
    definition.interactionType = 'compound';
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.description = {
      'en-US': self.params.title
    };
    definition.extensions = {
      'https://h5p.org/x-api/h5p-machine-name': 'H5P.GoalsAssessmentPage'
    };

    return definition;
  };

  /**
   * Generate xAPI object definition used in xAPI statements for each goal
   * @param {string} goalText Title of the goal
   * @return {Object}
   */
  GoalsAssessmentPage.prototype.getGoalXAPIDefinition = function (goalText) {
    var definition = {};
    var self = this;

    var choices = self.assessmentCategories.map(function(alt, i) {
      return {
        id: '' + i,
        description: {
          'en-US': alt // We don't actually know the language at runtime
        }
      };
    });

    definition.interactionType = 'choice';
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.description = {
      'en-US': goalText
    };
    definition.choices = choices;

    return definition;
  };

  /**
   * Add the question itself to the definition part of an xAPIEvent
   */
  GoalsAssessmentPage.prototype.addQuestionToXAPI = function (xAPIEvent) {
    var definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
    $.extend(definition, this.getxAPIDefinition());
  };

  /**
   * Add the question itself to the definition part of an xAPIEvent for a goal
   * @param {string} goal The goal title
   */
  GoalsAssessmentPage.prototype.addQuestionToGoalXAPI = function (xAPIEvent, goalText) {
    var definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
    $.extend(definition, this.getGoalXAPIDefinition(goalText));
  };

  /**
   * Add the response part to an xAPI event for each goal
   *
   * @param {H5P.XAPIEvent} xAPIEvent
   *  The xAPI event we will add a response to
   * @param {number} answer The response
   */
  GoalsAssessmentPage.prototype.addResponseToGoalXAPI = function (xAPIEvent, answer) {
    xAPIEvent.data.statement.result = {}; // Convert to a string
    xAPIEvent.data.statement.result.response = answer + ''; // Convert to a string
  };

  /**
   * Get xAPI data.
   * Contract used by report rendering engine.
   *
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  GoalsAssessmentPage.prototype.getXAPIData = function () {
    var xAPIEvent = this.createXAPIEventTemplate('compound');
    this.addQuestionToXAPI(xAPIEvent);
    return {
      statement: xAPIEvent.data.statement,
      children: this.getXAPIDataFromChildren()
    };
  };

  return GoalsAssessmentPage;
}(H5P.jQuery, H5P.EventDispatcher));
;
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Docxgen=f()}})(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({1:[function(require,module,exports){var CompiledTemplate;CompiledTemplate=CompiledTemplate=function(){function CompiledTemplate(){this.compiled=[];this}CompiledTemplate.prototype.prependText=function(text){this.compiled.unshift(text);return this};CompiledTemplate.prototype.appendTag=function(compiledTag){if(!compiledTag){throw new Error("compiled tag empty!")}this.compiled=this.compiled.concat(compiledTag.compiled);return this};CompiledTemplate.prototype.appendRaw=function(tag){this.compiled.push({type:"raw",tag:tag});return this};CompiledTemplate.prototype.appendText=function(text){if(text!==""){this.compiled.push(text)}return this};CompiledTemplate.prototype.appendSubTemplate=function(subTemplate,tag,inverted){if(!subTemplate){throw new Error("subTemplate empty!")}return this.compiled.push({type:"loop",tag:tag,inverted:inverted,template:subTemplate})};return CompiledTemplate}();module.exports=CompiledTemplate},{}],2:[function(require,module,exports){var CompiledXmlTag;CompiledXmlTag=CompiledXmlTag=function(){function CompiledXmlTag(compiled){if(compiled==null){compiled=[]}this.set(compiled)}CompiledXmlTag.prototype.set=function(compiled){var i,len,results,text;if(compiled==null){compiled=[]}if(this["null"]){return this}this.compiled=[];results=[];for(i=0,len=compiled.length;i<len;i++){text=compiled[i];if(text!==""){results.push(this.compiled.push(text))}else{results.push(void 0)}}return results};CompiledXmlTag.prototype.prependText=function(text){if(this["null"]){return this}if(text!==""){this.compiled.unshift(text)}return this};CompiledXmlTag.prototype.appendText=function(text){if(this["null"]){return this}if(text!==""){this.compiled.push(text)}return this};return CompiledXmlTag}();CompiledXmlTag["null"]=function(){var obj;obj=new CompiledXmlTag;obj["null"]=true;return obj};module.exports=CompiledXmlTag},{}],3:[function(require,module,exports){var DocUtils,slice=[].slice;DocUtils={};DocUtils.escapeRegExp=function(str){return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")};DocUtils.defaults={nullGetter:function(tag,props){if(props.tag==="simple"){return"undefined"}if(props.tag==="raw"){return""}return""},parser:function(tag){return{get:function(scope){if(tag==="."){return scope}else{return scope[tag]}}}},intelligentTagging:true,delimiters:{start:"{",end:"}"}};DocUtils.charMap={"&":"&amp;","'":"&apos;","<":"&lt;",">":"&gt;"};DocUtils.wordToUtf8=function(string){var endChar,ref,startChar;if(typeof string!=="string"){string=string.toString()}ref=DocUtils.charMap;for(endChar in ref){startChar=ref[endChar];string=string.replace(new RegExp(DocUtils.escapeRegExp(startChar),"g"),endChar)}return string};DocUtils.utf8ToWord=function(string){var endChar,ref,startChar;if(typeof string!=="string"){string=string.toString()}ref=DocUtils.charMap;for(startChar in ref){endChar=ref[startChar];string=string.replace(new RegExp(DocUtils.escapeRegExp(startChar),"g"),endChar)}return string};DocUtils.clone=function(obj){var flags,key,newInstance;if(obj==null||typeof obj!=="object"){return obj}if(typeof obj==="Date"){return new Date(obj.getTime())}if(typeof obj==="RegExp"){flags="";if(obj.global!=null){flags+="g"}if(obj.ignoreCase!=null){flags+="i"}if(obj.multiline!=null){flags+="m"}if(obj.sticky!=null){flags+="y"}return new RegExp(obj.source,flags)}newInstance=new obj.constructor;for(key in obj){newInstance[key]=DocUtils.clone(obj[key])}return newInstance};DocUtils.replaceFirstFrom=function(string,search,replace,from){var replaced,substr;substr=string.substr(from);replaced=substr.replace(search,replace);if(substr===replaced){throw new Error("replaced can't be the same as substring")}return string.substr(0,from)+replaced};DocUtils.convertSpaces=function(s){return s.replace(new RegExp(String.fromCharCode(160),"g")," ")};DocUtils.pregMatchAll=function(regex,content){var matchArray,replacer;if(typeof regex!=="object"){regex=new RegExp(regex,"g")}matchArray=[];replacer=function(){var i,match,offset,pn,string;match=arguments[0],pn=4<=arguments.length?slice.call(arguments,1,i=arguments.length-2):(i=1,[]),offset=arguments[i++],string=arguments[i++];pn.unshift(match);pn.offset=offset;return matchArray.push(pn)};content.replace(regex,replacer);return matchArray};DocUtils.sizeOfObject=function(obj){var key,size;size=0;for(key in obj){size++}return size};DocUtils.getOuterXml=function(text,start,end,xmlTag){var endTag,startTag;endTag=text.indexOf("</"+xmlTag+">",end);if(endTag===-1){throw new Error("can't find endTag "+endTag)}endTag+=("</"+xmlTag+">").length;startTag=Math.max(text.lastIndexOf("<"+xmlTag+">",start),text.lastIndexOf("<"+xmlTag+" ",start));if(startTag===-1){throw new Error("can't find startTag")}return{text:text.substr(startTag,endTag-startTag),startTag:startTag,endTag:endTag}};DocUtils.encode_utf8=function(s){return unescape(encodeURIComponent(s))};DocUtils.decode_utf8=function(s){var e,error;try{if(s===void 0){return void 0}return decodeURIComponent(escape(DocUtils.convert_spaces(s)))}catch(error){e=error;console.error(s);console.error("could not decode");throw new Error("end")}};DocUtils.base64encode=function(b){return btoa(unescape(encodeURIComponent(b)))};DocUtils.tags=DocUtils.defaults.delimiters;DocUtils.defaultParser=DocUtils.defaults.parser;DocUtils.convert_spaces=DocUtils.convertSpaces;DocUtils.preg_match_all=DocUtils.pregMatchAll;module.exports=DocUtils},{}],4:[function(require,module,exports){var DocXTemplater,SubContent,XmlTemplater,xmlUtil,extend=function(child,parent){for(var key in parent){if(hasProp.call(parent,key))child[key]=parent[key]}function ctor(){this.constructor=child}ctor.prototype=parent.prototype;child.prototype=new ctor;child.__super__=parent.prototype;return child},hasProp={}.hasOwnProperty;XmlTemplater=require("./xmlTemplater");SubContent=require("./subContent");xmlUtil=require("./xmlUtil");DocXTemplater=DocXTemplater=function(superClass){extend(DocXTemplater,superClass);function DocXTemplater(content,options){if(content==null){content=""}if(options==null){options={}}DocXTemplater.__super__.constructor.call(this,"",options);this.currentClass=DocXTemplater;this.tagXml="w:t";this.tagRawXml="w:p";if(typeof content==="string"){this.load(content)}else{throw new Error("content must be string!")}}DocXTemplater.prototype.calcIntellegentlyDashElement=function(){var content,end,i,len,ref,scopeContent,start,t;ref=new SubContent(this.content).getOuterLoop(this.templaterState),content=ref.content,start=ref.start,end=ref.end;scopeContent=xmlUtil.getListXmlElements(this.content,start,end-start);for(i=0,len=scopeContent.length;i<len;i++){t=scopeContent[i];if(t.tag==="<w:tc>"){return"w:tr"}}return DocXTemplater.__super__.calcIntellegentlyDashElement.call(this)};return DocXTemplater}(XmlTemplater);module.exports=DocXTemplater},{"./subContent":7,"./xmlTemplater":10,"./xmlUtil":11}],5:[function(require,module,exports){var ModuleManager;module.exports=ModuleManager=function(){function ModuleManager(){this.modules=[]}ModuleManager.prototype.attachModule=function(module){this.modules.push(module);module.manager=this;return this};ModuleManager.prototype.sendEvent=function(eventName,data){var i,len,m,ref,results;ref=this.modules;results=[];for(i=0,len=ref.length;i<len;i++){m=ref[i];results.push(m.handleEvent(eventName,data))}return results};ModuleManager.prototype.get=function(value){var aux,i,len,m,ref,result;result=null;ref=this.modules;for(i=0,len=ref.length;i<len;i++){m=ref[i];aux=m.get(value);result=aux!==null?aux:result}return result};ModuleManager.prototype.handle=function(type,data){var aux,i,len,m,ref,result;result=null;ref=this.modules;for(i=0,len=ref.length;i<len;i++){m=ref[i];if(result!==null){return}aux=m.handle(type,data);result=aux!==null?aux:result}return result};ModuleManager.prototype.getInstance=function(obj){return this[obj]};return ModuleManager}()},{}],6:[function(require,module,exports){var DocUtils,ScopeManager;DocUtils=require("./docUtils");module.exports=ScopeManager=function(){function ScopeManager(arg){this.tags=arg.tags,this.scopePath=arg.scopePath,this.usedTags=arg.usedTags,this.scopeList=arg.scopeList,this.parser=arg.parser,this.moduleManager=arg.moduleManager,this.nullGetter=arg.nullGetter,this.delimiters=arg.delimiters;this.moduleManager.scopeManager=this}ScopeManager.prototype.loopOver=function(tag,callback,inverted){var value;if(inverted==null){inverted=false}value=this.getValue(tag);return this.loopOverValue(value,callback,inverted)};ScopeManager.prototype.loopOverValue=function(value,callback,inverted){var i,j,len,scope,type;if(inverted==null){inverted=false}type=Object.prototype.toString.call(value);if(inverted){if(value==null){return callback(this.scopeList[this.num])}if(!value){return callback(this.scopeList[this.num])}if(type==="[object Array]"&&value.length===0){callback(this.scopeList[this.num])}return}if(value==null){return}if(type==="[object Array]"){for(i=j=0,len=value.length;j<len;i=++j){scope=value[i];callback(scope)}}if(type==="[object Object]"){callback(value)}if(value===true){return callback(this.scopeList[this.num])}};ScopeManager.prototype.getValue=function(tag,num){var e,error,parser,result,scope;this.num=num!=null?num:this.scopeList.length-1;scope=this.scopeList[this.num];try{parser=this.parser(tag);result=parser.get(scope)}catch(error){e=error;result=null}if(result==null&&this.num>0){return this.getValue(tag,this.num-1)}return result};ScopeManager.prototype.getValueFromScope=function(tag){var result,value;result=this.getValue(tag);if(result!=null){if(typeof result==="string"){this.useTag(tag,true);value=result}else if(typeof result==="number"){value=String(result)}else{value=result}}else{this.useTag(tag,false);return null}return value};ScopeManager.prototype.useTag=function(tag,val){var i,j,len,ref,s,u;if(val){u=this.usedTags.def}else{u=this.usedTags.undef}ref=this.scopePath;for(i=j=0,len=ref.length;j<len;i=++j){s=ref[i];if(u[s]==null){u[s]={}}u=u[s]}if(tag!==""){return u[tag]=true}};return ScopeManager}()},{"./docUtils":3}],7:[function(require,module,exports){var SubContent;module.exports=SubContent=function(){function SubContent(fullText){this.fullText=fullText!=null?fullText:"";this.text="";this.start=0;this.end=0}SubContent.prototype.getInnerLoop=function(templaterState){this.start=templaterState.calcEndTag(templaterState.loopOpen);this.end=templaterState.calcStartTag(templaterState.loopClose);return this.refreshText()};SubContent.prototype.getOuterLoop=function(templaterState){this.start=templaterState.calcStartTag(templaterState.loopOpen);this.end=templaterState.calcEndTag(templaterState.loopClose);return this.refreshText()};SubContent.prototype.getInnerTag=function(templaterState){this.start=templaterState.calcPosition(templaterState.tagStart);this.end=templaterState.calcPosition(templaterState.tagEnd)+1;return this.refreshText()};SubContent.prototype.refreshText=function(){this.text=this.fullText.substr(this.start,this.end-this.start);return this};SubContent.prototype.getOuterXml=function(xmlTag){this.end=this.fullText.indexOf("</"+xmlTag+">",this.end);if(this.end===-1){throw new Error("can't find endTag "+this.end)}this.end+=("</"+xmlTag+">").length;this.start=Math.max(this.fullText.lastIndexOf("<"+xmlTag+">",this.start),this.fullText.lastIndexOf("<"+xmlTag+" ",this.start));if(this.start===-1){throw new Error("can't find startTag")}return this.refreshText()};SubContent.prototype.replace=function(newText){this.fullText=this.fullText.substr(0,this.start)+newText+this.fullText.substr(this.end);this.end=this.start+newText.length;return this.refreshText()};return SubContent}()},{}],8:[function(require,module,exports){var DocUtils,TemplaterState;DocUtils=require("./docUtils");module.exports=TemplaterState=function(){function TemplaterState(moduleManager,delimiters){this.moduleManager=moduleManager;this.delimiters=delimiters;this.moduleManager.templaterState=this}TemplaterState.prototype.moveCharacters=function(numXmlTag,newTextLength,oldTextLength){var i,k,ref,ref1,results;results=[];for(k=i=ref=numXmlTag,ref1=this.matches.length;ref<=ref1?i<ref1:i>ref1;k=ref<=ref1?++i:--i){results.push(this.charactersAdded[k]+=newTextLength-oldTextLength)}return results};TemplaterState.prototype.calcStartTag=function(tag){return this.calcPosition(tag.start)};TemplaterState.prototype.calcXmlTagPosition=function(xmlTagNumber){return this.matches[xmlTagNumber].offset+this.charactersAdded[xmlTagNumber]};TemplaterState.prototype.calcEndTag=function(tag){return this.calcPosition(tag.end)+1};TemplaterState.prototype.calcPosition=function(bracket){return this.matches[bracket.numXmlTag].offset+this.matches[bracket.numXmlTag][1].length+this.charactersAdded[bracket.numXmlTag]+bracket.numCharacter};TemplaterState.prototype.innerContent=function(type){return this.matches[this[type].numXmlTag][2]};TemplaterState.prototype.initialize=function(){this.context="";this.inForLoop=false;this.loopIsInverted=false;this.inTag=false;this.inDashLoop=false;this.rawXmlTag=false;this.textInsideTag="";this.trail="";this.trailSteps=[];return this.offset=[]};TemplaterState.prototype.startTag=function(){if(this.inTag===true){throw new Error("Unclosed tag : '"+this.textInsideTag+"'")}this.currentStep=this.trailSteps[0];this.inTag=true;this.rawXmlTag=false;this.textInsideTag="";this.tagStart=this.currentStep;return this.trail=""};TemplaterState.prototype.loopType=function(){var getFromModule;if(this.inDashLoop){return"dash"}if(this.inForLoop){return"for"}if(this.rawXmlTag){return"xml"}getFromModule=this.moduleManager.get("loopType");if(getFromModule!==null){return getFromModule}return"simple"};TemplaterState.prototype.isLoopClosingTag=function(){return this.textInsideTag[0]==="/"&&"/"+this.loopOpen.tag===this.textInsideTag};TemplaterState.prototype.finishLoop=function(){this.context="";this.rawXmlTag=false;this.inForLoop=false;this.loopIsInverted=false;this.loopOpen=null;this.loopClose=null;this.inDashLoop=false;this.inTag=false;return this.textInsideTag=""};TemplaterState.prototype.getLeftValue=function(){return this.innerContent("tagStart").substr(0,this.tagStart.numCharacter+this.offset[this.tagStart.numXmlTag])};TemplaterState.prototype.getRightValue=function(){return this.innerContent("tagEnd").substr(this.tagEnd.numCharacter+1+this.offset[this.tagEnd.numXmlTag])};TemplaterState.prototype.endTag=function(){var dashInnerRegex;if(this.inTag===false){throw new Error("Unopened tag near : '"+this.context.substr(this.context.length-10,10)+"'")}this.inTag=false;this.tagEnd=this.currentStep;this.textInsideTag=this.textInsideTag.substr(0,this.textInsideTag.length+1-this.delimiters.end.length);this.textInsideTag=DocUtils.wordToUtf8(this.textInsideTag);if(this.loopType()==="simple"){if(this.textInsideTag[0]==="@"){this.rawXmlTag=true;this.tag=this.textInsideTag.substr(1)}if(this.textInsideTag[0]==="#"||this.textInsideTag[0]==="^"){this.inForLoop=true;this.loopOpen={start:this.tagStart,end:this.tagEnd,tag:this.textInsideTag.substr(1),raw:this.textInsideTag}}if(this.textInsideTag[0]==="^"){this.loopIsInverted=true}if(this.textInsideTag[0]==="-"&&this.loopType()==="simple"){this.inDashLoop=true;dashInnerRegex=/^-([^\s]+)\s(.+)$/;this.loopOpen={start:this.tagStart,end:this.tagEnd,tag:this.textInsideTag.replace(dashInnerRegex,"$2"),element:this.textInsideTag.replace(dashInnerRegex,"$1"),raw:this.textInsideTag}}}if(this.textInsideTag[0]==="/"){return this.loopClose={start:this.tagStart,end:this.tagEnd,raw:this.textInsideTag}}};return TemplaterState}()},{"./docUtils":3}],9:[function(require,module,exports){var DocUtils,XmlMatcher,slice=[].slice;DocUtils=require("./docUtils");module.exports=XmlMatcher=function(){function XmlMatcher(content){this.content=content}XmlMatcher.prototype.parse=function(tagXml){var i;this.tagXml=tagXml;this.matches=DocUtils.pregMatchAll("(<"+this.tagXml+"[^>]*>)([^<>]*)</"+this.tagXml+">",this.content);this.charactersAdded=function(){var j,ref,results;results=[];for(i=j=0,ref=this.matches.length;0<=ref?j<ref:j>ref;i=0<=ref?++j:--j){results.push(0)}return results}.call(this);this.handleRecursiveCase();return this};XmlMatcher.prototype.handleRecursiveCase=function(){var regex,replacerPush,replacerUnshift;replacerUnshift=function(_this){return function(){var j,match,offset,pn,string;match=arguments[0],pn=4<=arguments.length?slice.call(arguments,1,j=arguments.length-2):(j=1,[]),offset=arguments[j++],string=arguments[j++];match=pn[0]+pn[1];pn.unshift(match);pn.offset=offset;pn.first=true;_this.matches.unshift(pn);return _this.charactersAdded.unshift(0)}}(this);if(this.content.indexOf("<")===-1&&this.content.indexOf(">")===-1){this.content.replace(/^()([^<>]*)$/,replacerUnshift)}regex="^()([^<]+)</"+this.tagXml+">";this.content.replace(new RegExp(regex),replacerUnshift);replacerPush=function(_this){return function(){var j,match,offset,pn,string;match=arguments[0],pn=4<=arguments.length?slice.call(arguments,1,j=arguments.length-2):(j=1,[]),offset=arguments[j++],string=arguments[j++];pn.unshift(match);pn.offset=offset;pn.last=true;_this.matches.push(pn);return _this.charactersAdded.push(0)}}(this);regex="(<"+this.tagXml+"[^>]*>)([^>]+)$";this.content.replace(new RegExp(regex),replacerPush);return this};return XmlMatcher}()},{"./docUtils":3}],10:[function(require,module,exports){var CompiledTemplate,CompiledXmlTag,DocUtils,ModuleManager,ScopeManager,SubContent,TemplaterState,XmlMatcher,XmlTemplater;DocUtils=require("./docUtils");ScopeManager=require("./scopeManager");SubContent=require("./subContent");TemplaterState=require("./templaterState");XmlMatcher=require("./xmlMatcher");ModuleManager=require("./moduleManager");CompiledTemplate=require("./compiledTemplate");CompiledXmlTag=require("./compiledXmlTag");module.exports=XmlTemplater=function(){function XmlTemplater(content,options){if(content==null){content=""}if(options==null){options={}}this.tagXml="";this.tagRawXml="";this.currentClass=XmlTemplater;this.fromJson(options);this.templaterState=new TemplaterState(this.moduleManager,this.delimiters)}XmlTemplater.prototype.load=function(content1){var xmlMatcher;this.content=content1;xmlMatcher=new XmlMatcher(this.content).parse(this.tagXml);this.templaterState.matches=xmlMatcher.matches;return this.templaterState.charactersAdded=xmlMatcher.charactersAdded};XmlTemplater.prototype.fromJson=function(options){var defaultValue,key,ref;if(options==null){options={}}this.tags=options.tags!=null?options.tags:{};this.scopePath=options.scopePath!=null?options.scopePath:[];this.scopeList=options.scopeList!=null?options.scopeList:[this.tags];this.usedTags=options.usedTags!=null?options.usedTags:{def:{},undef:{}};ref=DocUtils.defaults;for(key in ref){defaultValue=ref[key];this[key]=options[key]!=null?options[key]:defaultValue}this.moduleManager=options.moduleManager!=null?options.moduleManager:new ModuleManager;return this.scopeManager=new ScopeManager({tags:this.tags,scopePath:this.scopePath,usedTags:this.usedTags,scopeList:this.scopeList,parser:this.parser,moduleManager:this.moduleManager,delimiters:this.delimiters})};XmlTemplater.prototype.toJson=function(){var defaultValue,key,obj,ref;obj={tags:DocUtils.clone(this.scopeManager.tags),scopePath:DocUtils.clone(this.scopeManager.scopePath),scopeList:DocUtils.clone(this.scopeManager.scopeList),usedTags:this.scopeManager.usedTags,moduleManager:this.moduleManager};ref=DocUtils.defaults;for(key in ref){defaultValue=ref[key];obj[key]=this[key]}return obj};XmlTemplater.prototype.calcIntellegentlyDashElement=function(){return false};XmlTemplater.prototype.getFullText=function(tagXml){var match,matcher,output;this.tagXml=tagXml!=null?tagXml:this.tagXml;matcher=new XmlMatcher(this.content).parse(this.tagXml);output=function(){var i,len,ref,results;ref=matcher.matches;results=[];for(i=0,len=ref.length;i<len;i++){match=ref[i];results.push(match[2])}return results}();return DocUtils.wordToUtf8(DocUtils.convertSpaces(output.join("")))};XmlTemplater.prototype.updateModuleManager=function(){this.moduleManager.xmlTemplater=this;this.moduleManager.templaterState=this.templaterState;return this.moduleManager.scopeManager=this.scopeManager};XmlTemplater.prototype.handleModuleManager=function(type,data){this.updateModuleManager();return this.moduleManager.handle(type,data)};XmlTemplater.prototype.render=function(){return this.compile()};XmlTemplater.prototype.compile=function(){var character,i,innerText,j,len,len1,length,loopType,match,numCharacter,numXmlTag,preContent,ref;this.sameTags=this.delimiters.start===this.delimiters.end;this.compiled=new CompiledTemplate;this.lastStart=0;this.templaterState.initialize();this.handleModuleManager("xmlRendering");ref=this.templaterState.matches;for(numXmlTag=i=0,len=ref.length;i<len;numXmlTag=++i){match=ref[numXmlTag];innerText=match[2];this.templaterState.offset[numXmlTag]=0;if(this.templaterState.trail.length===0&&!this.templaterState.inTag&&innerText.indexOf(this.delimiters.start[0])===-1&&innerText.indexOf(this.delimiters.end[0])===-1){continue}for(numCharacter=j=0,len1=innerText.length;j<len1;numCharacter=++j){character=innerText[numCharacter];this.templaterState.trail+=character;length=!this.templaterState.inTag?this.delimiters.start.length:this.delimiters.end.length;this.templaterState.trail=this.templaterState.trail.substr(-length,length);this.templaterState.currentStep={numXmlTag:numXmlTag,numCharacter:numCharacter};this.templaterState.trailSteps.push({numXmlTag:numXmlTag,numCharacter:numCharacter});this.templaterState.trailSteps=this.templaterState.trailSteps.splice(-this.delimiters.start.length,this.delimiters.start.length);this.templaterState.context+=character;if(this.sameTags===true&&this.templaterState.inTag===false&&this.templaterState.trail===this.delimiters.start||this.sameTags===false&&this.templaterState.trail===this.delimiters.start){this.templaterState.startTag()}else if(this.sameTags===true&&this.templaterState.inTag===true&&this.templaterState.trail===this.delimiters.end||this.sameTags===false&&this.templaterState.trail===this.delimiters.end){this.updateModuleManager();this.templaterState.endTag();loopType=this.templaterState.loopType();if(loopType==="simple"){this.replaceSimpleTag()}if(loopType==="xml"){this.replaceSimpleTagRawXml()}if(loopType==="dash"||loopType==="for"){if(this.templaterState.isLoopClosingTag()){this.replaceLoopTag();this.templaterState.finishLoop()}}if(["simple","dash","for","xml"].indexOf(loopType)===-1){this.handleModuleManager("replaceTag",loopType)}}else{if(this.templaterState.inTag===true){this.templaterState.textInsideTag+=character}}}}this.handleModuleManager("xmlRendered");preContent=this.content.substr(this.lastStart);this.compiled.appendText(preContent);return this};XmlTemplater.prototype.replaceSimpleTag=function(){var newValue;newValue=this.scopeManager.getValueFromScope(this.templaterState.textInsideTag);if(newValue==null){newValue=this.nullGetter(this.templaterState.textInsideTag,{tag:"simple"})}return this.content=this.replaceTagByValue(DocUtils.utf8ToWord(newValue),this.content)};XmlTemplater.prototype.replaceSimpleTagRawXml=function(){var newText,preContent,startTag,subContent;newText=this.scopeManager.getValueFromScope(this.templaterState.tag);if(newText==null){newText=this.nullGetter(this.templaterState.tag,{tag:"raw"})}subContent=new SubContent(this.content).getInnerTag(this.templaterState).getOuterXml(this.tagRawXml);startTag=subContent.start;preContent=this.content.substr(this.lastStart,startTag-this.lastStart);this.compiled.appendText(preContent);this.lastStart=startTag;this.compiled.appendRaw(this.templaterState.tag);return this.replaceXml(subContent,newText)};XmlTemplater.prototype.replaceXml=function(subContent,newText){this.templaterState.moveCharacters(this.templaterState.tagStart.numXmlTag,newText.length,subContent.text.length);return this.content=subContent.replace(newText).fullText};XmlTemplater.prototype.deleteTag=function(xml,tag){var xmlText;this.templaterState.tagStart=tag.start;this.templaterState.tagEnd=tag.end;this.templaterState.textInsideTag=tag.raw;return xmlText=this.replaceTagByValue("",xml)};XmlTemplater.prototype.deleteOuterTags=function(outerXmlText){return this.deleteTag(this.deleteTag(outerXmlText,this.templaterState.loopOpen),this.templaterState.loopClose)};XmlTemplater.prototype.dashLoop=function(elementDashLoop,sharp){var innerXmlText,outerXml,outerXmlText;if(sharp==null){sharp=false}outerXml=new SubContent(this.content).getInnerLoop(this.templaterState).getOuterXml(elementDashLoop);this.templaterState.moveCharacters(0,0,outerXml.start);outerXmlText=outerXml.text;innerXmlText=this.deleteOuterTags(outerXmlText,sharp);this.templaterState.moveCharacters(0,outerXml.start,0);this.templaterState.moveCharacters(this.templaterState.tagStart.numXmlTag,outerXmlText.length,innerXmlText.length);return this.forLoop(outerXml,innerXmlText)};XmlTemplater.prototype.xmlToBeReplaced=function(options){var after,before;before="";after="";if(options.noStartTag){return options.insideValue}if(options.spacePreserve){before="<"+this.tagXml+' xml:space="preserve">'}else{before=this.templaterState.matches[options.xmlTagNumber][1]}if(!options.noEndTag){after="</"+this.tagXml+">"}this.currentCompiledTag.prependText(before);this.currentCompiledTag.appendText(after);return before+options.insideValue+after};XmlTemplater.prototype.replaceXmlTag=function(content,options){var preContent,replacer,startTag;this.templaterState.offset[options.xmlTagNumber]+=options.insideValue.length-this.templaterState.matches[options.xmlTagNumber][2].length;options.spacePreserve=options.spacePreserve!=null?options.spacePreserve:true;options.noStartTag=options.noStartTag!=null?options.noStartTag:false;options.noEndTag=options.noEndTag!=null?options.noEndTag:false;replacer=this.xmlToBeReplaced(options);this.templaterState.matches[options.xmlTagNumber][2]=options.insideValue;startTag=this.templaterState.calcXmlTagPosition(options.xmlTagNumber);this.templaterState.moveCharacters(options.xmlTagNumber+1,replacer.length,this.templaterState.matches[options.xmlTagNumber][0].length);if(content.indexOf(this.templaterState.matches[options.xmlTagNumber][0])===-1){throw new Error("content "+this.templaterState.matches[options.xmlTagNumber][0]+" not found in content")}content=DocUtils.replaceFirstFrom(content,this.templaterState.matches[options.xmlTagNumber][0],replacer,startTag);this.templaterState.matches[options.xmlTagNumber][0]=replacer;preContent=content.substr(this.lastStart,startTag-this.lastStart);if(this.templaterState.loopType()==="simple"){this.compiled.appendText(preContent);this.lastStart=startTag+this.templaterState.matches[options.xmlTagNumber][0].length;this.compiled.appendTag(this.currentCompiledTag)}return content};XmlTemplater.prototype.replaceTagByValue=function(newValue,content){var i,k,options,ref,ref1;options={xmlTagNumber:this.templaterState.tagStart.numXmlTag,noStartTag:this.templaterState.matches[this.templaterState.tagStart.numXmlTag].first!=null,noEndTag:this.templaterState.matches[this.templaterState.tagStart.numXmlTag].last!=null};if(this.templaterState.tagEnd.numXmlTag===this.templaterState.tagStart.numXmlTag){this.currentCompiledTag=new CompiledXmlTag([this.templaterState.getLeftValue(),{type:"tag",tag:this.templaterState.textInsideTag},this.templaterState.getRightValue()]);options.insideValue=this.templaterState.getLeftValue()+newValue+this.templaterState.getRightValue();return this.replaceXmlTag(content,options)}else if(this.templaterState.tagEnd.numXmlTag>this.templaterState.tagStart.numXmlTag){options.insideValue=newValue;this.currentCompiledTag=new CompiledXmlTag([{type:"tag",tag:this.templaterState.textInsideTag}]);if(this.templaterState.matches[this.templaterState.tagStart.numXmlTag].first==null&&this.templaterState.matches[this.templaterState.tagStart.numXmlTag].last==null){this.currentCompiledTag=new CompiledXmlTag([this.templaterState.getLeftValue(),{type:"tag",tag:this.templaterState.textInsideTag}]);options.insideValue=this.templaterState.getLeftValue()+newValue}content=this.replaceXmlTag(content,options);options={insideValue:"",spacePreserve:false};for(k=i=ref=this.templaterState.tagStart.numXmlTag+1,ref1=this.templaterState.tagEnd.numXmlTag;ref<=ref1?i<ref1:i>ref1;k=ref<=ref1?++i:--i){options.xmlTagNumber=k;this.currentCompiledTag=new CompiledXmlTag([]);content=this.replaceXmlTag(content,options)}options={insideValue:this.templaterState.getRightValue(),spacePreserve:true,xmlTagNumber:this.templaterState.tagEnd.numXmlTag,noEndTag:this.templaterState.matches[this.templaterState.tagEnd.numXmlTag].last!=null};this.currentCompiledTag=CompiledXmlTag["null"]();return this.replaceXmlTag(content,options)}};XmlTemplater.prototype.replaceLoopTag=function(){var dashElement,innerTemplate,outerLoop;if(this.templaterState.loopType()==="dash"){return this.dashLoop(this.templaterState.loopOpen.element)}if(this.intelligentTagging===true){dashElement=this.calcIntellegentlyDashElement();if(dashElement!==false){return this.dashLoop(dashElement,true)}}outerLoop=new SubContent(this.content).getOuterLoop(this.templaterState);innerTemplate=new SubContent(this.content).getInnerLoop(this.templaterState).text;return this.forLoop(outerLoop,innerTemplate)};XmlTemplater.prototype.calcSubXmlTemplater=function(innerTagsContent,argOptions){var options;options=this.toJson();if(argOptions!=null){if(argOptions.tags!=null){options.tags=argOptions.tags;options.scopeList=options.scopeList.concat(argOptions.tags);options.scopePath=options.scopePath.concat(this.templaterState.loopOpen.tag)}}return new this.currentClass(innerTagsContent,options).render()};XmlTemplater.prototype.forLoop=function(outerTags,subTemplate){var newContent,preContent,startTag,subfile,tag;startTag=outerTags.start;preContent=this.content.substr(this.lastStart,startTag-this.lastStart);this.compiled.appendText(preContent);this.lastStart=outerTags.end;tag=this.templaterState.loopOpen.tag;newContent="";this.scopeManager.loopOver(tag,function(_this){return function(subTags){var subfile;subfile=_this.calcSubXmlTemplater(subTemplate,{tags:subTags});return newContent+=subfile.content}}(this),this.templaterState.loopIsInverted);subfile=this.calcSubXmlTemplater(subTemplate,{tags:{}});this.compiled.appendSubTemplate(subfile.compiled.compiled,tag,this.templaterState.loopIsInverted);this.lastStart+=newContent.length-outerTags.text.length;return this.replaceXml(outerTags,newContent)};return XmlTemplater}()},{"./compiledTemplate":1,"./compiledXmlTag":2,"./docUtils":3,"./moduleManager":5,"./scopeManager":6,"./subContent":7,"./templaterState":8,"./xmlMatcher":9}],11:[function(require,module,exports){var DocUtils,XmlUtil;DocUtils=require("./docUtils");XmlUtil={};XmlUtil.getListXmlElements=function(text,start,end){var i,innerCurrentTag,innerLastTag,j,justOpened,lastTag,len,result,tag,tags;if(start==null){start=0}if(end==null){end=text.length-1}tags=DocUtils.pregMatchAll("<(/?[^/> ]+)([^>]*)>",text.substr(start,end));result=[];for(i=j=0,len=tags.length;j<len;i=++j){tag=tags[i];if(tag[1][0]==="/"){justOpened=false;if(result.length>0){lastTag=result[result.length-1];innerLastTag=lastTag.tag.substr(1,lastTag.tag.length-2);innerCurrentTag=tag[1].substr(1);if(innerLastTag===innerCurrentTag){justOpened=true}}if(justOpened){result.pop()}else{result.push({
tag:"<"+tag[1]+">",offset:tag.offset})}}else if(tag[2][tag[2].length-1]!=="/"){result.push({tag:"<"+tag[1]+">",offset:tag.offset})}}return result};XmlUtil.getListDifferenceXmlElements=function(text,start,end){var scope;if(start==null){start=0}if(end==null){end=text.length-1}scope=this.getListXmlElements(text,start,end);while(1){if(scope.length<=1){break}if(scope[0].tag.substr(2)===scope[scope.length-1].tag.substr(1)){scope.pop();scope.shift()}else{break}}return scope};module.exports=XmlUtil},{"./docUtils":3}],12:[function(require,module,exports){"use strict";var _keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";exports.encode=function(input,utf8){var output="";var chr1,chr2,chr3,enc1,enc2,enc3,enc4;var i=0;while(i<input.length){chr1=input.charCodeAt(i++);chr2=input.charCodeAt(i++);chr3=input.charCodeAt(i++);enc1=chr1>>2;enc2=(chr1&3)<<4|chr2>>4;enc3=(chr2&15)<<2|chr3>>6;enc4=chr3&63;if(isNaN(chr2)){enc3=enc4=64}else if(isNaN(chr3)){enc4=64}output=output+_keyStr.charAt(enc1)+_keyStr.charAt(enc2)+_keyStr.charAt(enc3)+_keyStr.charAt(enc4)}return output};exports.decode=function(input,utf8){var output="";var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(i<input.length){enc1=_keyStr.indexOf(input.charAt(i++));enc2=_keyStr.indexOf(input.charAt(i++));enc3=_keyStr.indexOf(input.charAt(i++));enc4=_keyStr.indexOf(input.charAt(i++));chr1=enc1<<2|enc2>>4;chr2=(enc2&15)<<4|enc3>>2;chr3=(enc3&3)<<6|enc4;output=output+String.fromCharCode(chr1);if(enc3!=64){output=output+String.fromCharCode(chr2)}if(enc4!=64){output=output+String.fromCharCode(chr3)}}return output}},{}],13:[function(require,module,exports){"use strict";function CompressedObject(){this.compressedSize=0;this.uncompressedSize=0;this.crc32=0;this.compressionMethod=null;this.compressedContent=null}CompressedObject.prototype={getContent:function(){return null},getCompressedContent:function(){return null}};module.exports=CompressedObject},{}],14:[function(require,module,exports){"use strict";exports.STORE={magic:"\x00\x00",compress:function(content,compressionOptions){return content},uncompress:function(content){return content},compressInputType:null,uncompressInputType:null};exports.DEFLATE=require("./flate")},{"./flate":19}],15:[function(require,module,exports){"use strict";var utils=require("./utils");var table=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918e3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117];module.exports=function crc32(input,crc){if(typeof input==="undefined"||!input.length){return 0}var isArray=utils.getTypeOf(input)!=="string";if(typeof crc=="undefined"){crc=0}var x=0;var y=0;var b=0;crc=crc^-1;for(var i=0,iTop=input.length;i<iTop;i++){b=isArray?input[i]:input.charCodeAt(i);y=(crc^b)&255;x=table[y];crc=crc>>>8^x}return crc^-1}},{"./utils":32}],16:[function(require,module,exports){"use strict";var utils=require("./utils");function DataReader(data){this.data=null;this.length=0;this.index=0}DataReader.prototype={checkOffset:function(offset){this.checkIndex(this.index+offset)},checkIndex:function(newIndex){if(this.length<newIndex||newIndex<0){throw new Error("End of data reached (data length = "+this.length+", asked index = "+newIndex+"). Corrupted zip ?")}},setIndex:function(newIndex){this.checkIndex(newIndex);this.index=newIndex},skip:function(n){this.setIndex(this.index+n)},byteAt:function(i){},readInt:function(size){var result=0,i;this.checkOffset(size);for(i=this.index+size-1;i>=this.index;i--){result=(result<<8)+this.byteAt(i)}this.index+=size;return result},readString:function(size){return utils.transformTo("string",this.readData(size))},readData:function(size){},lastIndexOfSignature:function(sig){},readDate:function(){var dostime=this.readInt(4);return new Date((dostime>>25&127)+1980,(dostime>>21&15)-1,dostime>>16&31,dostime>>11&31,dostime>>5&63,(dostime&31)<<1)}};module.exports=DataReader},{"./utils":32}],17:[function(require,module,exports){"use strict";exports.base64=false;exports.binary=false;exports.dir=false;exports.createFolders=false;exports.date=null;exports.compression=null;exports.compressionOptions=null;exports.comment=null;exports.unixPermissions=null;exports.dosPermissions=null},{}],18:[function(require,module,exports){"use strict";var utils=require("./utils");exports.string2binary=function(str){return utils.string2binary(str)};exports.string2Uint8Array=function(str){return utils.transformTo("uint8array",str)};exports.uint8Array2String=function(array){return utils.transformTo("string",array)};exports.string2Blob=function(str){var buffer=utils.transformTo("arraybuffer",str);return utils.arrayBuffer2Blob(buffer)};exports.arrayBuffer2Blob=function(buffer){return utils.arrayBuffer2Blob(buffer)};exports.transformTo=function(outputType,input){return utils.transformTo(outputType,input)};exports.getTypeOf=function(input){return utils.getTypeOf(input)};exports.checkSupport=function(type){return utils.checkSupport(type)};exports.MAX_VALUE_16BITS=utils.MAX_VALUE_16BITS;exports.MAX_VALUE_32BITS=utils.MAX_VALUE_32BITS;exports.pretty=function(str){return utils.pretty(str)};exports.findCompression=function(compressionMethod){return utils.findCompression(compressionMethod)};exports.isRegExp=function(object){return utils.isRegExp(object)}},{"./utils":32}],19:[function(require,module,exports){"use strict";var USE_TYPEDARRAY=typeof Uint8Array!=="undefined"&&typeof Uint16Array!=="undefined"&&typeof Uint32Array!=="undefined";var pako=require("pako");exports.uncompressInputType=USE_TYPEDARRAY?"uint8array":"array";exports.compressInputType=USE_TYPEDARRAY?"uint8array":"array";exports.magic="\b\x00";exports.compress=function(input,compressionOptions){return pako.deflateRaw(input,{level:compressionOptions.level||-1})};exports.uncompress=function(input){return pako.inflateRaw(input)}},{pako:35}],20:[function(require,module,exports){"use strict";var base64=require("./base64");function JSZip(data,options){if(!(this instanceof JSZip))return new JSZip(data,options);this.files={};this.comment=null;this.root="";if(data){this.load(data,options)}this.clone=function(){var newObj=new JSZip;for(var i in this){if(typeof this[i]!=="function"){newObj[i]=this[i]}}return newObj}}JSZip.prototype=require("./object");JSZip.prototype.load=require("./load");JSZip.support=require("./support");JSZip.defaults=require("./defaults");JSZip.utils=require("./deprecatedPublicUtils");JSZip.base64={encode:function(input){return base64.encode(input)},decode:function(input){return base64.decode(input)}};JSZip.compressions=require("./compressions");module.exports=JSZip},{"./base64":12,"./compressions":14,"./defaults":17,"./deprecatedPublicUtils":18,"./load":21,"./object":24,"./support":28}],21:[function(require,module,exports){"use strict";var base64=require("./base64");var ZipEntries=require("./zipEntries");module.exports=function(data,options){var files,zipEntries,i,input;options=options||{};if(options.base64){data=base64.decode(data)}zipEntries=new ZipEntries(data,options);files=zipEntries.files;for(i=0;i<files.length;i++){input=files[i];this.file(input.fileName,input.decompressed,{binary:true,optimizedBinaryString:true,date:input.date,dir:input.dir,comment:input.fileComment.length?input.fileComment:null,unixPermissions:input.unixPermissions,dosPermissions:input.dosPermissions,createFolders:options.createFolders})}if(zipEntries.zipComment.length){this.comment=zipEntries.zipComment}return this}},{"./base64":12,"./zipEntries":33}],22:[function(require,module,exports){(function(Buffer){"use strict";module.exports=function(data,encoding){return new Buffer(data,encoding)};module.exports.test=function(b){return Buffer.isBuffer(b)}}).call(this,require("buffer").Buffer)},{buffer:51}],23:[function(require,module,exports){"use strict";var Uint8ArrayReader=require("./uint8ArrayReader");function NodeBufferReader(data){this.data=data;this.length=this.data.length;this.index=0}NodeBufferReader.prototype=new Uint8ArrayReader;NodeBufferReader.prototype.readData=function(size){this.checkOffset(size);var result=this.data.slice(this.index,this.index+size);this.index+=size;return result};module.exports=NodeBufferReader},{"./uint8ArrayReader":29}],24:[function(require,module,exports){"use strict";var support=require("./support");var utils=require("./utils");var crc32=require("./crc32");var signature=require("./signature");var defaults=require("./defaults");var base64=require("./base64");var compressions=require("./compressions");var CompressedObject=require("./compressedObject");var nodeBuffer=require("./nodeBuffer");var utf8=require("./utf8");var StringWriter=require("./stringWriter");var Uint8ArrayWriter=require("./uint8ArrayWriter");var getRawData=function(file){if(file._data instanceof CompressedObject){file._data=file._data.getContent();file.options.binary=true;file.options.base64=false;if(utils.getTypeOf(file._data)==="uint8array"){var copy=file._data;file._data=new Uint8Array(copy.length);if(copy.length!==0){file._data.set(copy,0)}}}return file._data};var getBinaryData=function(file){var result=getRawData(file),type=utils.getTypeOf(result);if(type==="string"){if(!file.options.binary){if(support.nodebuffer){return nodeBuffer(result,"utf-8")}}return file.asBinary()}return result};var dataToString=function(asUTF8){var result=getRawData(this);if(result===null||typeof result==="undefined"){return""}if(this.options.base64){result=base64.decode(result)}if(asUTF8&&this.options.binary){result=out.utf8decode(result)}else{result=utils.transformTo("string",result)}if(!asUTF8&&!this.options.binary){result=utils.transformTo("string",out.utf8encode(result))}return result};var ZipObject=function(name,data,options){this.name=name;this.dir=options.dir;this.date=options.date;this.comment=options.comment;this.unixPermissions=options.unixPermissions;this.dosPermissions=options.dosPermissions;this._data=data;this.options=options;this._initialMetadata={dir:options.dir,date:options.date}};ZipObject.prototype={asText:function(){return dataToString.call(this,true)},asBinary:function(){return dataToString.call(this,false)},asNodeBuffer:function(){var result=getBinaryData(this);return utils.transformTo("nodebuffer",result)},asUint8Array:function(){var result=getBinaryData(this);return utils.transformTo("uint8array",result)},asArrayBuffer:function(){return this.asUint8Array().buffer}};var decToHex=function(dec,bytes){var hex="",i;for(i=0;i<bytes;i++){hex+=String.fromCharCode(dec&255);dec=dec>>>8}return hex};var extend=function(){var result={},i,attr;for(i=0;i<arguments.length;i++){for(attr in arguments[i]){if(arguments[i].hasOwnProperty(attr)&&typeof result[attr]==="undefined"){result[attr]=arguments[i][attr]}}}return result};var prepareFileAttrs=function(o){o=o||{};if(o.base64===true&&(o.binary===null||o.binary===undefined)){o.binary=true}o=extend(o,defaults);o.date=o.date||new Date;if(o.compression!==null)o.compression=o.compression.toUpperCase();return o};var fileAdd=function(name,data,o){var dataType=utils.getTypeOf(data),parent;o=prepareFileAttrs(o);if(typeof o.unixPermissions==="string"){o.unixPermissions=parseInt(o.unixPermissions,8)}if(o.unixPermissions&&o.unixPermissions&16384){o.dir=true}if(o.dosPermissions&&o.dosPermissions&16){o.dir=true}if(o.dir){name=forceTrailingSlash(name)}if(o.createFolders&&(parent=parentFolder(name))){folderAdd.call(this,parent,true)}if(o.dir||data===null||typeof data==="undefined"){o.base64=false;o.binary=false;data=null;dataType=null}else if(dataType==="string"){if(o.binary&&!o.base64){if(o.optimizedBinaryString!==true){data=utils.string2binary(data)}}}else{o.base64=false;o.binary=true;if(!dataType&&!(data instanceof CompressedObject)){throw new Error("The data of '"+name+"' is in an unsupported format !")}if(dataType==="arraybuffer"){data=utils.transformTo("uint8array",data)}}var object=new ZipObject(name,data,o);this.files[name]=object;return object};var parentFolder=function(path){if(path.slice(-1)=="/"){path=path.substring(0,path.length-1)}var lastSlash=path.lastIndexOf("/");return lastSlash>0?path.substring(0,lastSlash):""};var forceTrailingSlash=function(path){if(path.slice(-1)!="/"){path+="/"}return path};var folderAdd=function(name,createFolders){createFolders=typeof createFolders!=="undefined"?createFolders:false;name=forceTrailingSlash(name);if(!this.files[name]){fileAdd.call(this,name,null,{dir:true,createFolders:createFolders})}return this.files[name]};var generateCompressedObjectFrom=function(file,compression,compressionOptions){var result=new CompressedObject,content;if(file._data instanceof CompressedObject){result.uncompressedSize=file._data.uncompressedSize;result.crc32=file._data.crc32;if(result.uncompressedSize===0||file.dir){compression=compressions["STORE"];result.compressedContent="";result.crc32=0}else if(file._data.compressionMethod===compression.magic){result.compressedContent=file._data.getCompressedContent()}else{content=file._data.getContent();result.compressedContent=compression.compress(utils.transformTo(compression.compressInputType,content),compressionOptions)}}else{content=getBinaryData(file);if(!content||content.length===0||file.dir){compression=compressions["STORE"];content=""}result.uncompressedSize=content.length;result.crc32=crc32(content);result.compressedContent=compression.compress(utils.transformTo(compression.compressInputType,content),compressionOptions)}result.compressedSize=result.compressedContent.length;result.compressionMethod=compression.magic;return result};var generateUnixExternalFileAttr=function(unixPermissions,isDir){var result=unixPermissions;if(!unixPermissions){result=isDir?16893:33204}return(result&65535)<<16};var generateDosExternalFileAttr=function(dosPermissions,isDir){return(dosPermissions||0)&63};var generateZipParts=function(name,file,compressedObject,offset,platform){var data=compressedObject.compressedContent,utfEncodedFileName=utils.transformTo("string",utf8.utf8encode(file.name)),comment=file.comment||"",utfEncodedComment=utils.transformTo("string",utf8.utf8encode(comment)),useUTF8ForFileName=utfEncodedFileName.length!==file.name.length,useUTF8ForComment=utfEncodedComment.length!==comment.length,o=file.options,dosTime,dosDate,extraFields="",unicodePathExtraField="",unicodeCommentExtraField="",dir,date;if(file._initialMetadata.dir!==file.dir){dir=file.dir}else{dir=o.dir}if(file._initialMetadata.date!==file.date){date=file.date}else{date=o.date}var extFileAttr=0;var versionMadeBy=0;if(dir){extFileAttr|=16}if(platform==="UNIX"){versionMadeBy=798;extFileAttr|=generateUnixExternalFileAttr(file.unixPermissions,dir)}else{versionMadeBy=20;extFileAttr|=generateDosExternalFileAttr(file.dosPermissions,dir)}dosTime=date.getHours();dosTime=dosTime<<6;dosTime=dosTime|date.getMinutes();dosTime=dosTime<<5;dosTime=dosTime|date.getSeconds()/2;dosDate=date.getFullYear()-1980;dosDate=dosDate<<4;dosDate=dosDate|date.getMonth()+1;dosDate=dosDate<<5;dosDate=dosDate|date.getDate();if(useUTF8ForFileName){unicodePathExtraField=decToHex(1,1)+decToHex(crc32(utfEncodedFileName),4)+utfEncodedFileName;extraFields+="up"+decToHex(unicodePathExtraField.length,2)+unicodePathExtraField}if(useUTF8ForComment){unicodeCommentExtraField=decToHex(1,1)+decToHex(this.crc32(utfEncodedComment),4)+utfEncodedComment;extraFields+="uc"+decToHex(unicodeCommentExtraField.length,2)+unicodeCommentExtraField}var header="";header+="\n\x00";header+=useUTF8ForFileName||useUTF8ForComment?"\x00\b":"\x00\x00";header+=compressedObject.compressionMethod;header+=decToHex(dosTime,2);header+=decToHex(dosDate,2);header+=decToHex(compressedObject.crc32,4);header+=decToHex(compressedObject.compressedSize,4);header+=decToHex(compressedObject.uncompressedSize,4);header+=decToHex(utfEncodedFileName.length,2);header+=decToHex(extraFields.length,2);var fileRecord=signature.LOCAL_FILE_HEADER+header+utfEncodedFileName+extraFields;var dirRecord=signature.CENTRAL_FILE_HEADER+decToHex(versionMadeBy,2)+header+decToHex(utfEncodedComment.length,2)+"\x00\x00"+"\x00\x00"+decToHex(extFileAttr,4)+decToHex(offset,4)+utfEncodedFileName+extraFields+utfEncodedComment;return{fileRecord:fileRecord,dirRecord:dirRecord,compressedObject:compressedObject}};var out={load:function(stream,options){throw new Error("Load method is not defined. Is the file jszip-load.js included ?")},filter:function(search){var result=[],filename,relativePath,file,fileClone;for(filename in this.files){if(!this.files.hasOwnProperty(filename)){continue}file=this.files[filename];fileClone=new ZipObject(file.name,file._data,extend(file.options));relativePath=filename.slice(this.root.length,filename.length);if(filename.slice(0,this.root.length)===this.root&&search(relativePath,fileClone)){result.push(fileClone)}}return result},file:function(name,data,o){if(arguments.length===1){if(utils.isRegExp(name)){var regexp=name;return this.filter(function(relativePath,file){return!file.dir&&regexp.test(relativePath)})}else{return this.filter(function(relativePath,file){return!file.dir&&relativePath===name})[0]||null}}else{name=this.root+name;fileAdd.call(this,name,data,o)}return this},folder:function(arg){if(!arg){return this}if(utils.isRegExp(arg)){return this.filter(function(relativePath,file){return file.dir&&arg.test(relativePath)})}var name=this.root+arg;var newFolder=folderAdd.call(this,name);var ret=this.clone();ret.root=newFolder.name;return ret},remove:function(name){name=this.root+name;var file=this.files[name];if(!file){if(name.slice(-1)!="/"){name+="/"}file=this.files[name]}if(file&&!file.dir){delete this.files[name]}else{var kids=this.filter(function(relativePath,file){return file.name.slice(0,name.length)===name});for(var i=0;i<kids.length;i++){delete this.files[kids[i].name]}}return this},generate:function(options){options=extend(options||{},{base64:true,compression:"STORE",compressionOptions:null,type:"base64",platform:"DOS",comment:null,mimeType:"application/zip"});utils.checkSupport(options.type);if(options.platform==="darwin"||options.platform==="freebsd"||options.platform==="linux"||options.platform==="sunos"){options.platform="UNIX"}if(options.platform==="win32"){options.platform="DOS"}var zipData=[],localDirLength=0,centralDirLength=0,writer,i,utfEncodedComment=utils.transformTo("string",this.utf8encode(options.comment||this.comment||""));for(var name in this.files){if(!this.files.hasOwnProperty(name)){continue}var file=this.files[name];var compressionName=file.options.compression||options.compression.toUpperCase();var compression=compressions[compressionName];if(!compression){throw new Error(compressionName+" is not a valid compression method !")}var compressionOptions=file.options.compressionOptions||options.compressionOptions||{};var compressedObject=generateCompressedObjectFrom.call(this,file,compression,compressionOptions);var zipPart=generateZipParts.call(this,name,file,compressedObject,localDirLength,options.platform);localDirLength+=zipPart.fileRecord.length+compressedObject.compressedSize;centralDirLength+=zipPart.dirRecord.length;zipData.push(zipPart)}var dirEnd="";dirEnd=signature.CENTRAL_DIRECTORY_END+"\x00\x00"+"\x00\x00"+decToHex(zipData.length,2)+decToHex(zipData.length,2)+decToHex(centralDirLength,4)+decToHex(localDirLength,4)+decToHex(utfEncodedComment.length,2)+utfEncodedComment;var typeName=options.type.toLowerCase();if(typeName==="uint8array"||typeName==="arraybuffer"||typeName==="blob"||typeName==="nodebuffer"){writer=new Uint8ArrayWriter(localDirLength+centralDirLength+dirEnd.length)}else{writer=new StringWriter(localDirLength+centralDirLength+dirEnd.length)}for(i=0;i<zipData.length;i++){writer.append(zipData[i].fileRecord);writer.append(zipData[i].compressedObject.compressedContent)}for(i=0;i<zipData.length;i++){writer.append(zipData[i].dirRecord)}writer.append(dirEnd);var zip=writer.finalize();switch(options.type.toLowerCase()){case"uint8array":case"arraybuffer":case"nodebuffer":return utils.transformTo(options.type.toLowerCase(),zip);case"blob":return utils.arrayBuffer2Blob(utils.transformTo("arraybuffer",zip),options.mimeType);case"base64":return options.base64?base64.encode(zip):zip;default:return zip}},crc32:function(input,crc){return crc32(input,crc)},utf8encode:function(string){return utils.transformTo("string",utf8.utf8encode(string))},utf8decode:function(input){return utf8.utf8decode(input)}};module.exports=out},{"./base64":12,"./compressedObject":13,"./compressions":14,"./crc32":15,"./defaults":17,"./nodeBuffer":22,"./signature":25,"./stringWriter":27,"./support":28,"./uint8ArrayWriter":30,"./utf8":31,"./utils":32}],25:[function(require,module,exports){"use strict";exports.LOCAL_FILE_HEADER="PK";exports.CENTRAL_FILE_HEADER="PK";exports.CENTRAL_DIRECTORY_END="PK";exports.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK";exports.ZIP64_CENTRAL_DIRECTORY_END="PK";exports.DATA_DESCRIPTOR="PK\b"},{}],26:[function(require,module,exports){"use strict";var DataReader=require("./dataReader");var utils=require("./utils");function StringReader(data,optimizedBinaryString){this.data=data;if(!optimizedBinaryString){this.data=utils.string2binary(this.data)}this.length=this.data.length;this.index=0}StringReader.prototype=new DataReader;StringReader.prototype.byteAt=function(i){return this.data.charCodeAt(i)};StringReader.prototype.lastIndexOfSignature=function(sig){return this.data.lastIndexOf(sig)};StringReader.prototype.readData=function(size){this.checkOffset(size);var result=this.data.slice(this.index,this.index+size);this.index+=size;return result};module.exports=StringReader},{"./dataReader":16,"./utils":32}],27:[function(require,module,exports){"use strict";var utils=require("./utils");var StringWriter=function(){this.data=[]};StringWriter.prototype={append:function(input){input=utils.transformTo("string",input);this.data.push(input)},finalize:function(){return this.data.join("")}};module.exports=StringWriter},{"./utils":32}],28:[function(require,module,exports){(function(Buffer){"use strict";exports.base64=true;exports.array=true;exports.string=true;exports.arraybuffer=typeof ArrayBuffer!=="undefined"&&typeof Uint8Array!=="undefined";exports.nodebuffer=typeof Buffer!=="undefined";exports.uint8array=typeof Uint8Array!=="undefined";if(typeof ArrayBuffer==="undefined"){exports.blob=false}else{var buffer=new ArrayBuffer(0);try{exports.blob=new Blob([buffer],{type:"application/zip"}).size===0}catch(e){try{var Builder=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder;var builder=new Builder;builder.append(buffer);exports.blob=builder.getBlob("application/zip").size===0}catch(e){exports.blob=false}}}}).call(this,require("buffer").Buffer)},{buffer:51}],29:[function(require,module,exports){"use strict";var DataReader=require("./dataReader");function Uint8ArrayReader(data){if(data){this.data=data;this.length=this.data.length;this.index=0}}Uint8ArrayReader.prototype=new DataReader;Uint8ArrayReader.prototype.byteAt=function(i){return this.data[i]};Uint8ArrayReader.prototype.lastIndexOfSignature=function(sig){var sig0=sig.charCodeAt(0),sig1=sig.charCodeAt(1),sig2=sig.charCodeAt(2),sig3=sig.charCodeAt(3);for(var i=this.length-4;i>=0;--i){if(this.data[i]===sig0&&this.data[i+1]===sig1&&this.data[i+2]===sig2&&this.data[i+3]===sig3){return i}}return-1};Uint8ArrayReader.prototype.readData=function(size){this.checkOffset(size);if(size===0){return new Uint8Array(0)}var result=this.data.subarray(this.index,this.index+size);this.index+=size;return result};module.exports=Uint8ArrayReader},{"./dataReader":16}],30:[function(require,module,exports){"use strict";var utils=require("./utils");var Uint8ArrayWriter=function(length){this.data=new Uint8Array(length);this.index=0};Uint8ArrayWriter.prototype={append:function(input){if(input.length!==0){input=utils.transformTo("uint8array",input);this.data.set(input,this.index);this.index+=input.length}},finalize:function(){return this.data}};module.exports=Uint8ArrayWriter},{"./utils":32}],31:[function(require,module,exports){"use strict";var utils=require("./utils");var support=require("./support");var nodeBuffer=require("./nodeBuffer");var _utf8len=new Array(256);for(var i=0;i<256;i++){_utf8len[i]=i>=252?6:i>=248?5:i>=240?4:i>=224?3:i>=192?2:1}_utf8len[254]=_utf8len[254]=1;var string2buf=function(str){var buf,c,c2,m_pos,i,str_len=str.length,buf_len=0;for(m_pos=0;m_pos<str_len;m_pos++){c=str.charCodeAt(m_pos);if((c&64512)===55296&&m_pos+1<str_len){c2=str.charCodeAt(m_pos+1);if((c2&64512)===56320){c=65536+(c-55296<<10)+(c2-56320);m_pos++}}buf_len+=c<128?1:c<2048?2:c<65536?3:4}if(support.uint8array){buf=new Uint8Array(buf_len)}else{buf=new Array(buf_len)}for(i=0,m_pos=0;i<buf_len;m_pos++){c=str.charCodeAt(m_pos);if((c&64512)===55296&&m_pos+1<str_len){c2=str.charCodeAt(m_pos+1);if((c2&64512)===56320){c=65536+(c-55296<<10)+(c2-56320);m_pos++}}if(c<128){buf[i++]=c}else if(c<2048){buf[i++]=192|c>>>6;buf[i++]=128|c&63}else if(c<65536){buf[i++]=224|c>>>12;buf[i++]=128|c>>>6&63;buf[i++]=128|c&63}else{buf[i++]=240|c>>>18;buf[i++]=128|c>>>12&63;buf[i++]=128|c>>>6&63;buf[i++]=128|c&63}}return buf};var utf8border=function(buf,max){var pos;max=max||buf.length;if(max>buf.length){max=buf.length}pos=max-1;while(pos>=0&&(buf[pos]&192)===128){pos--}if(pos<0){return max}if(pos===0){return max}return pos+_utf8len[buf[pos]]>max?pos:max};var buf2string=function(buf){var str,i,out,c,c_len;var len=buf.length;var utf16buf=new Array(len*2);for(out=0,i=0;i<len;){c=buf[i++];if(c<128){utf16buf[out++]=c;continue}c_len=_utf8len[c];if(c_len>4){utf16buf[out++]=65533;i+=c_len-1;continue}c&=c_len===2?31:c_len===3?15:7;while(c_len>1&&i<len){c=c<<6|buf[i++]&63;c_len--}if(c_len>1){utf16buf[out++]=65533;continue}if(c<65536){utf16buf[out++]=c}else{c-=65536;utf16buf[out++]=55296|c>>10&1023;utf16buf[out++]=56320|c&1023}}if(utf16buf.length!==out){if(utf16buf.subarray){utf16buf=utf16buf.subarray(0,out)}else{utf16buf.length=out}}return utils.applyFromCharCode(utf16buf)};exports.utf8encode=function utf8encode(str){if(support.nodebuffer){return nodeBuffer(str,"utf-8")}return string2buf(str)};exports.utf8decode=function utf8decode(buf){if(support.nodebuffer){return utils.transformTo("nodebuffer",buf).toString("utf-8")}buf=utils.transformTo(support.uint8array?"uint8array":"array",buf);var result=[],k=0,len=buf.length,chunk=65536;while(k<len){var nextBoundary=utf8border(buf,Math.min(k+chunk,len));if(support.uint8array){result.push(buf2string(buf.subarray(k,nextBoundary)))}else{result.push(buf2string(buf.slice(k,nextBoundary)))}k=nextBoundary}return result.join("")}},{"./nodeBuffer":22,"./support":28,"./utils":32}],32:[function(require,module,exports){"use strict";var support=require("./support");var compressions=require("./compressions");var nodeBuffer=require("./nodeBuffer");exports.string2binary=function(str){var result="";for(var i=0;i<str.length;i++){result+=String.fromCharCode(str.charCodeAt(i)&255)}return result};exports.arrayBuffer2Blob=function(buffer,mimeType){exports.checkSupport("blob");mimeType=mimeType||"application/zip";try{return new Blob([buffer],{type:mimeType})}catch(e){try{var Builder=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder;var builder=new Builder;builder.append(buffer);return builder.getBlob(mimeType)}catch(e){throw new Error("Bug : can't construct the Blob.")}}};function identity(input){return input}function stringToArrayLike(str,array){for(var i=0;i<str.length;++i){array[i]=str.charCodeAt(i)&255}return array}function arrayLikeToString(array){var chunk=65536;var result=[],len=array.length,type=exports.getTypeOf(array),k=0,canUseApply=true;try{switch(type){case"uint8array":String.fromCharCode.apply(null,new Uint8Array(0));break;case"nodebuffer":String.fromCharCode.apply(null,nodeBuffer(0));break}}catch(e){canUseApply=false}if(!canUseApply){var resultStr="";for(var i=0;i<array.length;i++){resultStr+=String.fromCharCode(array[i])}return resultStr}while(k<len&&chunk>1){try{if(type==="array"||type==="nodebuffer"){result.push(String.fromCharCode.apply(null,array.slice(k,Math.min(k+chunk,len))))}else{result.push(String.fromCharCode.apply(null,array.subarray(k,Math.min(k+chunk,len))))}k+=chunk}catch(e){chunk=Math.floor(chunk/2)}}return result.join("")}exports.applyFromCharCode=arrayLikeToString;function arrayLikeToArrayLike(arrayFrom,arrayTo){for(var i=0;i<arrayFrom.length;i++){arrayTo[i]=arrayFrom[i]}return arrayTo}var transform={};transform["string"]={string:identity,array:function(input){return stringToArrayLike(input,new Array(input.length))},arraybuffer:function(input){return transform["string"]["uint8array"](input).buffer},uint8array:function(input){return stringToArrayLike(input,new Uint8Array(input.length))},nodebuffer:function(input){return stringToArrayLike(input,nodeBuffer(input.length))}};transform["array"]={string:arrayLikeToString,array:identity,arraybuffer:function(input){return new Uint8Array(input).buffer},uint8array:function(input){return new Uint8Array(input)},nodebuffer:function(input){return nodeBuffer(input)}};transform["arraybuffer"]={string:function(input){return arrayLikeToString(new Uint8Array(input))},array:function(input){return arrayLikeToArrayLike(new Uint8Array(input),new Array(input.byteLength))},arraybuffer:identity,uint8array:function(input){return new Uint8Array(input)},nodebuffer:function(input){return nodeBuffer(new Uint8Array(input))}};transform["uint8array"]={string:arrayLikeToString,array:function(input){
return arrayLikeToArrayLike(input,new Array(input.length))},arraybuffer:function(input){return input.buffer},uint8array:identity,nodebuffer:function(input){return nodeBuffer(input)}};transform["nodebuffer"]={string:arrayLikeToString,array:function(input){return arrayLikeToArrayLike(input,new Array(input.length))},arraybuffer:function(input){return transform["nodebuffer"]["uint8array"](input).buffer},uint8array:function(input){return arrayLikeToArrayLike(input,new Uint8Array(input.length))},nodebuffer:identity};exports.transformTo=function(outputType,input){if(!input){input=""}if(!outputType){return input}exports.checkSupport(outputType);var inputType=exports.getTypeOf(input);var result=transform[inputType][outputType](input);return result};exports.getTypeOf=function(input){if(typeof input==="string"){return"string"}if(Object.prototype.toString.call(input)==="[object Array]"){return"array"}if(support.nodebuffer&&nodeBuffer.test(input)){return"nodebuffer"}if(support.uint8array&&input instanceof Uint8Array){return"uint8array"}if(support.arraybuffer&&input instanceof ArrayBuffer){return"arraybuffer"}};exports.checkSupport=function(type){var supported=support[type.toLowerCase()];if(!supported){throw new Error(type+" is not supported by this browser")}};exports.MAX_VALUE_16BITS=65535;exports.MAX_VALUE_32BITS=-1;exports.pretty=function(str){var res="",code,i;for(i=0;i<(str||"").length;i++){code=str.charCodeAt(i);res+="\\x"+(code<16?"0":"")+code.toString(16).toUpperCase()}return res};exports.findCompression=function(compressionMethod){for(var method in compressions){if(!compressions.hasOwnProperty(method)){continue}if(compressions[method].magic===compressionMethod){return compressions[method]}}return null};exports.isRegExp=function(object){return Object.prototype.toString.call(object)==="[object RegExp]"}},{"./compressions":14,"./nodeBuffer":22,"./support":28}],33:[function(require,module,exports){"use strict";var StringReader=require("./stringReader");var NodeBufferReader=require("./nodeBufferReader");var Uint8ArrayReader=require("./uint8ArrayReader");var utils=require("./utils");var sig=require("./signature");var ZipEntry=require("./zipEntry");var support=require("./support");var jszipProto=require("./object");function ZipEntries(data,loadOptions){this.files=[];this.loadOptions=loadOptions;if(data){this.load(data)}}ZipEntries.prototype={checkSignature:function(expectedSignature){var signature=this.reader.readString(4);if(signature!==expectedSignature){throw new Error("Corrupted zip or bug : unexpected signature "+"("+utils.pretty(signature)+", expected "+utils.pretty(expectedSignature)+")")}},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2);this.diskWithCentralDirStart=this.reader.readInt(2);this.centralDirRecordsOnThisDisk=this.reader.readInt(2);this.centralDirRecords=this.reader.readInt(2);this.centralDirSize=this.reader.readInt(4);this.centralDirOffset=this.reader.readInt(4);this.zipCommentLength=this.reader.readInt(2);this.zipComment=this.reader.readString(this.zipCommentLength);this.zipComment=jszipProto.utf8decode(this.zipComment)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8);this.versionMadeBy=this.reader.readString(2);this.versionNeeded=this.reader.readInt(2);this.diskNumber=this.reader.readInt(4);this.diskWithCentralDirStart=this.reader.readInt(4);this.centralDirRecordsOnThisDisk=this.reader.readInt(8);this.centralDirRecords=this.reader.readInt(8);this.centralDirSize=this.reader.readInt(8);this.centralDirOffset=this.reader.readInt(8);this.zip64ExtensibleData={};var extraDataSize=this.zip64EndOfCentralSize-44,index=0,extraFieldId,extraFieldLength,extraFieldValue;while(index<extraDataSize){extraFieldId=this.reader.readInt(2);extraFieldLength=this.reader.readInt(4);extraFieldValue=this.reader.readString(extraFieldLength);this.zip64ExtensibleData[extraFieldId]={id:extraFieldId,length:extraFieldLength,value:extraFieldValue}}},readBlockZip64EndOfCentralLocator:function(){this.diskWithZip64CentralDirStart=this.reader.readInt(4);this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8);this.disksCount=this.reader.readInt(4);if(this.disksCount>1){throw new Error("Multi-volumes zip are not supported")}},readLocalFiles:function(){var i,file;for(i=0;i<this.files.length;i++){file=this.files[i];this.reader.setIndex(file.localHeaderOffset);this.checkSignature(sig.LOCAL_FILE_HEADER);file.readLocalPart(this.reader);file.handleUTF8();file.processAttributes()}},readCentralDir:function(){var file;this.reader.setIndex(this.centralDirOffset);while(this.reader.readString(4)===sig.CENTRAL_FILE_HEADER){file=new ZipEntry({zip64:this.zip64},this.loadOptions);file.readCentralPart(this.reader);this.files.push(file)}},readEndOfCentral:function(){var offset=this.reader.lastIndexOfSignature(sig.CENTRAL_DIRECTORY_END);if(offset===-1){var isGarbage=true;try{this.reader.setIndex(0);this.checkSignature(sig.LOCAL_FILE_HEADER);isGarbage=false}catch(e){}if(isGarbage){throw new Error("Can't find end of central directory : is this a zip file ? "+"If it is, see http://stuk.github.io/jszip/documentation/howto/read_zip.html")}else{throw new Error("Corrupted zip : can't find end of central directory")}}this.reader.setIndex(offset);this.checkSignature(sig.CENTRAL_DIRECTORY_END);this.readBlockEndOfCentral();if(this.diskNumber===utils.MAX_VALUE_16BITS||this.diskWithCentralDirStart===utils.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===utils.MAX_VALUE_16BITS||this.centralDirRecords===utils.MAX_VALUE_16BITS||this.centralDirSize===utils.MAX_VALUE_32BITS||this.centralDirOffset===utils.MAX_VALUE_32BITS){this.zip64=true;offset=this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);if(offset===-1){throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator")}this.reader.setIndex(offset);this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);this.readBlockZip64EndOfCentralLocator();this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);this.readBlockZip64EndOfCentral()}},prepareReader:function(data){var type=utils.getTypeOf(data);if(type==="string"&&!support.uint8array){this.reader=new StringReader(data,this.loadOptions.optimizedBinaryString)}else if(type==="nodebuffer"){this.reader=new NodeBufferReader(data)}else{this.reader=new Uint8ArrayReader(utils.transformTo("uint8array",data))}},load:function(data){this.prepareReader(data);this.readEndOfCentral();this.readCentralDir();this.readLocalFiles()}};module.exports=ZipEntries},{"./nodeBufferReader":23,"./object":24,"./signature":25,"./stringReader":26,"./support":28,"./uint8ArrayReader":29,"./utils":32,"./zipEntry":34}],34:[function(require,module,exports){"use strict";var StringReader=require("./stringReader");var utils=require("./utils");var CompressedObject=require("./compressedObject");var jszipProto=require("./object");var MADE_BY_DOS=0;var MADE_BY_UNIX=3;function ZipEntry(options,loadOptions){this.options=options;this.loadOptions=loadOptions}ZipEntry.prototype={isEncrypted:function(){return(this.bitFlag&1)===1},useUTF8:function(){return(this.bitFlag&2048)===2048},prepareCompressedContent:function(reader,from,length){return function(){var previousIndex=reader.index;reader.setIndex(from);var compressedFileData=reader.readData(length);reader.setIndex(previousIndex);return compressedFileData}},prepareContent:function(reader,from,length,compression,uncompressedSize){return function(){var compressedFileData=utils.transformTo(compression.uncompressInputType,this.getCompressedContent());var uncompressedFileData=compression.uncompress(compressedFileData);if(uncompressedFileData.length!==uncompressedSize){throw new Error("Bug : uncompressed data size mismatch")}return uncompressedFileData}},readLocalPart:function(reader){var compression,localExtraFieldsLength;reader.skip(22);this.fileNameLength=reader.readInt(2);localExtraFieldsLength=reader.readInt(2);this.fileName=reader.readString(this.fileNameLength);reader.skip(localExtraFieldsLength);if(this.compressedSize==-1||this.uncompressedSize==-1){throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory "+"(compressedSize == -1 || uncompressedSize == -1)")}compression=utils.findCompression(this.compressionMethod);if(compression===null){throw new Error("Corrupted zip : compression "+utils.pretty(this.compressionMethod)+" unknown (inner file : "+this.fileName+")")}this.decompressed=new CompressedObject;this.decompressed.compressedSize=this.compressedSize;this.decompressed.uncompressedSize=this.uncompressedSize;this.decompressed.crc32=this.crc32;this.decompressed.compressionMethod=this.compressionMethod;this.decompressed.getCompressedContent=this.prepareCompressedContent(reader,reader.index,this.compressedSize,compression);this.decompressed.getContent=this.prepareContent(reader,reader.index,this.compressedSize,compression,this.uncompressedSize);if(this.loadOptions.checkCRC32){this.decompressed=utils.transformTo("string",this.decompressed.getContent());if(jszipProto.crc32(this.decompressed)!==this.crc32){throw new Error("Corrupted zip : CRC32 mismatch")}}},readCentralPart:function(reader){this.versionMadeBy=reader.readInt(2);this.versionNeeded=reader.readInt(2);this.bitFlag=reader.readInt(2);this.compressionMethod=reader.readString(2);this.date=reader.readDate();this.crc32=reader.readInt(4);this.compressedSize=reader.readInt(4);this.uncompressedSize=reader.readInt(4);this.fileNameLength=reader.readInt(2);this.extraFieldsLength=reader.readInt(2);this.fileCommentLength=reader.readInt(2);this.diskNumberStart=reader.readInt(2);this.internalFileAttributes=reader.readInt(2);this.externalFileAttributes=reader.readInt(4);this.localHeaderOffset=reader.readInt(4);if(this.isEncrypted()){throw new Error("Encrypted zip are not supported")}this.fileName=reader.readString(this.fileNameLength);this.readExtraFields(reader);this.parseZIP64ExtraField(reader);this.fileComment=reader.readString(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null;this.dosPermissions=null;var madeBy=this.versionMadeBy>>8;this.dir=this.externalFileAttributes&16?true:false;if(madeBy===MADE_BY_DOS){this.dosPermissions=this.externalFileAttributes&63}if(madeBy===MADE_BY_UNIX){this.unixPermissions=this.externalFileAttributes>>16&65535}if(!this.dir&&this.fileName.slice(-1)==="/"){this.dir=true}},parseZIP64ExtraField:function(reader){if(!this.extraFields[1]){return}var extraReader=new StringReader(this.extraFields[1].value);if(this.uncompressedSize===utils.MAX_VALUE_32BITS){this.uncompressedSize=extraReader.readInt(8)}if(this.compressedSize===utils.MAX_VALUE_32BITS){this.compressedSize=extraReader.readInt(8)}if(this.localHeaderOffset===utils.MAX_VALUE_32BITS){this.localHeaderOffset=extraReader.readInt(8)}if(this.diskNumberStart===utils.MAX_VALUE_32BITS){this.diskNumberStart=extraReader.readInt(4)}},readExtraFields:function(reader){var start=reader.index,extraFieldId,extraFieldLength,extraFieldValue;this.extraFields=this.extraFields||{};while(reader.index<start+this.extraFieldsLength){extraFieldId=reader.readInt(2);extraFieldLength=reader.readInt(2);extraFieldValue=reader.readString(extraFieldLength);this.extraFields[extraFieldId]={id:extraFieldId,length:extraFieldLength,value:extraFieldValue}}},handleUTF8:function(){if(this.useUTF8()){this.fileName=jszipProto.utf8decode(this.fileName);this.fileComment=jszipProto.utf8decode(this.fileComment)}else{var upath=this.findExtraFieldUnicodePath();if(upath!==null){this.fileName=upath}var ucomment=this.findExtraFieldUnicodeComment();if(ucomment!==null){this.fileComment=ucomment}}},findExtraFieldUnicodePath:function(){var upathField=this.extraFields[28789];if(upathField){var extraReader=new StringReader(upathField.value);if(extraReader.readInt(1)!==1){return null}if(jszipProto.crc32(this.fileName)!==extraReader.readInt(4)){return null}return jszipProto.utf8decode(extraReader.readString(upathField.length-5))}return null},findExtraFieldUnicodeComment:function(){var ucommentField=this.extraFields[25461];if(ucommentField){var extraReader=new StringReader(ucommentField.value);if(extraReader.readInt(1)!==1){return null}if(jszipProto.crc32(this.fileComment)!==extraReader.readInt(4)){return null}return jszipProto.utf8decode(extraReader.readString(ucommentField.length-5))}return null}};module.exports=ZipEntry},{"./compressedObject":13,"./object":24,"./stringReader":26,"./utils":32}],35:[function(require,module,exports){"use strict";var assign=require("./lib/utils/common").assign;var deflate=require("./lib/deflate");var inflate=require("./lib/inflate");var constants=require("./lib/zlib/constants");var pako={};assign(pako,deflate,inflate,constants);module.exports=pako},{"./lib/deflate":36,"./lib/inflate":37,"./lib/utils/common":38,"./lib/zlib/constants":41}],36:[function(require,module,exports){"use strict";var zlib_deflate=require("./zlib/deflate.js");var utils=require("./utils/common");var strings=require("./utils/strings");var msg=require("./zlib/messages");var zstream=require("./zlib/zstream");var toString=Object.prototype.toString;var Z_NO_FLUSH=0;var Z_FINISH=4;var Z_OK=0;var Z_STREAM_END=1;var Z_SYNC_FLUSH=2;var Z_DEFAULT_COMPRESSION=-1;var Z_DEFAULT_STRATEGY=0;var Z_DEFLATED=8;var Deflate=function(options){this.options=utils.assign({level:Z_DEFAULT_COMPRESSION,method:Z_DEFLATED,chunkSize:16384,windowBits:15,memLevel:8,strategy:Z_DEFAULT_STRATEGY,to:""},options||{});var opt=this.options;if(opt.raw&&opt.windowBits>0){opt.windowBits=-opt.windowBits}else if(opt.gzip&&opt.windowBits>0&&opt.windowBits<16){opt.windowBits+=16}this.err=0;this.msg="";this.ended=false;this.chunks=[];this.strm=new zstream;this.strm.avail_out=0;var status=zlib_deflate.deflateInit2(this.strm,opt.level,opt.method,opt.windowBits,opt.memLevel,opt.strategy);if(status!==Z_OK){throw new Error(msg[status])}if(opt.header){zlib_deflate.deflateSetHeader(this.strm,opt.header)}};Deflate.prototype.push=function(data,mode){var strm=this.strm;var chunkSize=this.options.chunkSize;var status,_mode;if(this.ended){return false}_mode=mode===~~mode?mode:mode===true?Z_FINISH:Z_NO_FLUSH;if(typeof data==="string"){strm.input=strings.string2buf(data)}else if(toString.call(data)==="[object ArrayBuffer]"){strm.input=new Uint8Array(data)}else{strm.input=data}strm.next_in=0;strm.avail_in=strm.input.length;do{if(strm.avail_out===0){strm.output=new utils.Buf8(chunkSize);strm.next_out=0;strm.avail_out=chunkSize}status=zlib_deflate.deflate(strm,_mode);if(status!==Z_STREAM_END&&status!==Z_OK){this.onEnd(status);this.ended=true;return false}if(strm.avail_out===0||strm.avail_in===0&&(_mode===Z_FINISH||_mode===Z_SYNC_FLUSH)){if(this.options.to==="string"){this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output,strm.next_out)))}else{this.onData(utils.shrinkBuf(strm.output,strm.next_out))}}}while((strm.avail_in>0||strm.avail_out===0)&&status!==Z_STREAM_END);if(_mode===Z_FINISH){status=zlib_deflate.deflateEnd(this.strm);this.onEnd(status);this.ended=true;return status===Z_OK}if(_mode===Z_SYNC_FLUSH){this.onEnd(Z_OK);strm.avail_out=0;return true}return true};Deflate.prototype.onData=function(chunk){this.chunks.push(chunk)};Deflate.prototype.onEnd=function(status){if(status===Z_OK){if(this.options.to==="string"){this.result=this.chunks.join("")}else{this.result=utils.flattenChunks(this.chunks)}}this.chunks=[];this.err=status;this.msg=this.strm.msg};function deflate(input,options){var deflator=new Deflate(options);deflator.push(input,true);if(deflator.err){throw deflator.msg}return deflator.result}function deflateRaw(input,options){options=options||{};options.raw=true;return deflate(input,options)}function gzip(input,options){options=options||{};options.gzip=true;return deflate(input,options)}exports.Deflate=Deflate;exports.deflate=deflate;exports.deflateRaw=deflateRaw;exports.gzip=gzip},{"./utils/common":38,"./utils/strings":39,"./zlib/deflate.js":43,"./zlib/messages":48,"./zlib/zstream":50}],37:[function(require,module,exports){"use strict";var zlib_inflate=require("./zlib/inflate.js");var utils=require("./utils/common");var strings=require("./utils/strings");var c=require("./zlib/constants");var msg=require("./zlib/messages");var zstream=require("./zlib/zstream");var gzheader=require("./zlib/gzheader");var toString=Object.prototype.toString;var Inflate=function(options){this.options=utils.assign({chunkSize:16384,windowBits:0,to:""},options||{});var opt=this.options;if(opt.raw&&opt.windowBits>=0&&opt.windowBits<16){opt.windowBits=-opt.windowBits;if(opt.windowBits===0){opt.windowBits=-15}}if(opt.windowBits>=0&&opt.windowBits<16&&!(options&&options.windowBits)){opt.windowBits+=32}if(opt.windowBits>15&&opt.windowBits<48){if((opt.windowBits&15)===0){opt.windowBits|=15}}this.err=0;this.msg="";this.ended=false;this.chunks=[];this.strm=new zstream;this.strm.avail_out=0;var status=zlib_inflate.inflateInit2(this.strm,opt.windowBits);if(status!==c.Z_OK){throw new Error(msg[status])}this.header=new gzheader;zlib_inflate.inflateGetHeader(this.strm,this.header)};Inflate.prototype.push=function(data,mode){var strm=this.strm;var chunkSize=this.options.chunkSize;var status,_mode;var next_out_utf8,tail,utf8str;var allowBufError=false;if(this.ended){return false}_mode=mode===~~mode?mode:mode===true?c.Z_FINISH:c.Z_NO_FLUSH;if(typeof data==="string"){strm.input=strings.binstring2buf(data)}else if(toString.call(data)==="[object ArrayBuffer]"){strm.input=new Uint8Array(data)}else{strm.input=data}strm.next_in=0;strm.avail_in=strm.input.length;do{if(strm.avail_out===0){strm.output=new utils.Buf8(chunkSize);strm.next_out=0;strm.avail_out=chunkSize}status=zlib_inflate.inflate(strm,c.Z_NO_FLUSH);if(status===c.Z_BUF_ERROR&&allowBufError===true){status=c.Z_OK;allowBufError=false}if(status!==c.Z_STREAM_END&&status!==c.Z_OK){this.onEnd(status);this.ended=true;return false}if(strm.next_out){if(strm.avail_out===0||status===c.Z_STREAM_END||strm.avail_in===0&&(_mode===c.Z_FINISH||_mode===c.Z_SYNC_FLUSH)){if(this.options.to==="string"){next_out_utf8=strings.utf8border(strm.output,strm.next_out);tail=strm.next_out-next_out_utf8;utf8str=strings.buf2string(strm.output,next_out_utf8);strm.next_out=tail;strm.avail_out=chunkSize-tail;if(tail){utils.arraySet(strm.output,strm.output,next_out_utf8,tail,0)}this.onData(utf8str)}else{this.onData(utils.shrinkBuf(strm.output,strm.next_out))}}}if(strm.avail_in===0&&strm.avail_out===0){allowBufError=true}}while((strm.avail_in>0||strm.avail_out===0)&&status!==c.Z_STREAM_END);if(status===c.Z_STREAM_END){_mode=c.Z_FINISH}if(_mode===c.Z_FINISH){status=zlib_inflate.inflateEnd(this.strm);this.onEnd(status);this.ended=true;return status===c.Z_OK}if(_mode===c.Z_SYNC_FLUSH){this.onEnd(c.Z_OK);strm.avail_out=0;return true}return true};Inflate.prototype.onData=function(chunk){this.chunks.push(chunk)};Inflate.prototype.onEnd=function(status){if(status===c.Z_OK){if(this.options.to==="string"){this.result=this.chunks.join("")}else{this.result=utils.flattenChunks(this.chunks)}}this.chunks=[];this.err=status;this.msg=this.strm.msg};function inflate(input,options){var inflator=new Inflate(options);inflator.push(input,true);if(inflator.err){throw inflator.msg}return inflator.result}function inflateRaw(input,options){options=options||{};options.raw=true;return inflate(input,options)}exports.Inflate=Inflate;exports.inflate=inflate;exports.inflateRaw=inflateRaw;exports.ungzip=inflate},{"./utils/common":38,"./utils/strings":39,"./zlib/constants":41,"./zlib/gzheader":44,"./zlib/inflate.js":46,"./zlib/messages":48,"./zlib/zstream":50}],38:[function(require,module,exports){"use strict";var TYPED_OK=typeof Uint8Array!=="undefined"&&typeof Uint16Array!=="undefined"&&typeof Int32Array!=="undefined";exports.assign=function(obj){var sources=Array.prototype.slice.call(arguments,1);while(sources.length){var source=sources.shift();if(!source){continue}if(typeof source!=="object"){throw new TypeError(source+"must be non-object")}for(var p in source){if(source.hasOwnProperty(p)){obj[p]=source[p]}}}return obj};exports.shrinkBuf=function(buf,size){if(buf.length===size){return buf}if(buf.subarray){return buf.subarray(0,size)}buf.length=size;return buf};var fnTyped={arraySet:function(dest,src,src_offs,len,dest_offs){if(src.subarray&&dest.subarray){dest.set(src.subarray(src_offs,src_offs+len),dest_offs);return}for(var i=0;i<len;i++){dest[dest_offs+i]=src[src_offs+i]}},flattenChunks:function(chunks){var i,l,len,pos,chunk,result;len=0;for(i=0,l=chunks.length;i<l;i++){len+=chunks[i].length}result=new Uint8Array(len);pos=0;for(i=0,l=chunks.length;i<l;i++){chunk=chunks[i];result.set(chunk,pos);pos+=chunk.length}return result}};var fnUntyped={arraySet:function(dest,src,src_offs,len,dest_offs){for(var i=0;i<len;i++){dest[dest_offs+i]=src[src_offs+i]}},flattenChunks:function(chunks){return[].concat.apply([],chunks)}};exports.setTyped=function(on){if(on){exports.Buf8=Uint8Array;exports.Buf16=Uint16Array;exports.Buf32=Int32Array;exports.assign(exports,fnTyped)}else{exports.Buf8=Array;exports.Buf16=Array;exports.Buf32=Array;exports.assign(exports,fnUntyped)}};exports.setTyped(TYPED_OK)},{}],39:[function(require,module,exports){"use strict";var utils=require("./common");var STR_APPLY_OK=true;var STR_APPLY_UIA_OK=true;try{String.fromCharCode.apply(null,[0])}catch(__){STR_APPLY_OK=false}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(__){STR_APPLY_UIA_OK=false}var _utf8len=new utils.Buf8(256);for(var q=0;q<256;q++){_utf8len[q]=q>=252?6:q>=248?5:q>=240?4:q>=224?3:q>=192?2:1}_utf8len[254]=_utf8len[254]=1;exports.string2buf=function(str){var buf,c,c2,m_pos,i,str_len=str.length,buf_len=0;for(m_pos=0;m_pos<str_len;m_pos++){c=str.charCodeAt(m_pos);if((c&64512)===55296&&m_pos+1<str_len){c2=str.charCodeAt(m_pos+1);if((c2&64512)===56320){c=65536+(c-55296<<10)+(c2-56320);m_pos++}}buf_len+=c<128?1:c<2048?2:c<65536?3:4}buf=new utils.Buf8(buf_len);for(i=0,m_pos=0;i<buf_len;m_pos++){c=str.charCodeAt(m_pos);if((c&64512)===55296&&m_pos+1<str_len){c2=str.charCodeAt(m_pos+1);if((c2&64512)===56320){c=65536+(c-55296<<10)+(c2-56320);m_pos++}}if(c<128){buf[i++]=c}else if(c<2048){buf[i++]=192|c>>>6;buf[i++]=128|c&63}else if(c<65536){buf[i++]=224|c>>>12;buf[i++]=128|c>>>6&63;buf[i++]=128|c&63}else{buf[i++]=240|c>>>18;buf[i++]=128|c>>>12&63;buf[i++]=128|c>>>6&63;buf[i++]=128|c&63}}return buf};function buf2binstring(buf,len){if(len<65537){if(buf.subarray&&STR_APPLY_UIA_OK||!buf.subarray&&STR_APPLY_OK){return String.fromCharCode.apply(null,utils.shrinkBuf(buf,len))}}var result="";for(var i=0;i<len;i++){result+=String.fromCharCode(buf[i])}return result}exports.buf2binstring=function(buf){return buf2binstring(buf,buf.length)};exports.binstring2buf=function(str){var buf=new utils.Buf8(str.length);for(var i=0,len=buf.length;i<len;i++){buf[i]=str.charCodeAt(i)}return buf};exports.buf2string=function(buf,max){var i,out,c,c_len;var len=max||buf.length;var utf16buf=new Array(len*2);for(out=0,i=0;i<len;){c=buf[i++];if(c<128){utf16buf[out++]=c;continue}c_len=_utf8len[c];if(c_len>4){utf16buf[out++]=65533;i+=c_len-1;continue}c&=c_len===2?31:c_len===3?15:7;while(c_len>1&&i<len){c=c<<6|buf[i++]&63;c_len--}if(c_len>1){utf16buf[out++]=65533;continue}if(c<65536){utf16buf[out++]=c}else{c-=65536;utf16buf[out++]=55296|c>>10&1023;utf16buf[out++]=56320|c&1023}}return buf2binstring(utf16buf,out)};exports.utf8border=function(buf,max){var pos;max=max||buf.length;if(max>buf.length){max=buf.length}pos=max-1;while(pos>=0&&(buf[pos]&192)===128){pos--}if(pos<0){return max}if(pos===0){return max}return pos+_utf8len[buf[pos]]>max?pos:max}},{"./common":38}],40:[function(require,module,exports){"use strict";function adler32(adler,buf,len,pos){var s1=adler&65535|0,s2=adler>>>16&65535|0,n=0;while(len!==0){n=len>2e3?2e3:len;len-=n;do{s1=s1+buf[pos++]|0;s2=s2+s1|0}while(--n);s1%=65521;s2%=65521}return s1|s2<<16|0}module.exports=adler32},{}],41:[function(require,module,exports){module.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],42:[function(require,module,exports){"use strict";function makeTable(){var c,table=[];for(var n=0;n<256;n++){c=n;for(var k=0;k<8;k++){c=c&1?3988292384^c>>>1:c>>>1}table[n]=c}return table}var crcTable=makeTable();function crc32(crc,buf,len,pos){var t=crcTable,end=pos+len;crc=crc^-1;for(var i=pos;i<end;i++){crc=crc>>>8^t[(crc^buf[i])&255]}return crc^-1}module.exports=crc32},{}],43:[function(require,module,exports){"use strict";var utils=require("../utils/common");var trees=require("./trees");var adler32=require("./adler32");var crc32=require("./crc32");var msg=require("./messages");var Z_NO_FLUSH=0;var Z_PARTIAL_FLUSH=1;var Z_FULL_FLUSH=3;var Z_FINISH=4;var Z_BLOCK=5;var Z_OK=0;var Z_STREAM_END=1;var Z_STREAM_ERROR=-2;var Z_DATA_ERROR=-3;var Z_BUF_ERROR=-5;var Z_DEFAULT_COMPRESSION=-1;var Z_FILTERED=1;var Z_HUFFMAN_ONLY=2;var Z_RLE=3;var Z_FIXED=4;var Z_DEFAULT_STRATEGY=0;var Z_UNKNOWN=2;var Z_DEFLATED=8;var MAX_MEM_LEVEL=9;var MAX_WBITS=15;var DEF_MEM_LEVEL=8;var LENGTH_CODES=29;var LITERALS=256;var L_CODES=LITERALS+1+LENGTH_CODES;var D_CODES=30;var BL_CODES=19;var HEAP_SIZE=2*L_CODES+1;var MAX_BITS=15;var MIN_MATCH=3;var MAX_MATCH=258;var MIN_LOOKAHEAD=MAX_MATCH+MIN_MATCH+1;var PRESET_DICT=32;var INIT_STATE=42;var EXTRA_STATE=69;var NAME_STATE=73;var COMMENT_STATE=91;var HCRC_STATE=103;var BUSY_STATE=113;var FINISH_STATE=666;var BS_NEED_MORE=1;var BS_BLOCK_DONE=2;var BS_FINISH_STARTED=3;var BS_FINISH_DONE=4;var OS_CODE=3;function err(strm,errorCode){strm.msg=msg[errorCode];return errorCode}function rank(f){return(f<<1)-(f>4?9:0)}function zero(buf){var len=buf.length;while(--len>=0){buf[len]=0}}function flush_pending(strm){var s=strm.state;var len=s.pending;if(len>strm.avail_out){len=strm.avail_out}if(len===0){return}utils.arraySet(strm.output,s.pending_buf,s.pending_out,len,strm.next_out);strm.next_out+=len;s.pending_out+=len;strm.total_out+=len;strm.avail_out-=len;s.pending-=len;if(s.pending===0){s.pending_out=0}}function flush_block_only(s,last){trees._tr_flush_block(s,s.block_start>=0?s.block_start:-1,s.strstart-s.block_start,last);s.block_start=s.strstart;flush_pending(s.strm)}function put_byte(s,b){s.pending_buf[s.pending++]=b}function putShortMSB(s,b){s.pending_buf[s.pending++]=b>>>8&255;s.pending_buf[s.pending++]=b&255}function read_buf(strm,buf,start,size){var len=strm.avail_in;if(len>size){len=size}if(len===0){return 0}strm.avail_in-=len;utils.arraySet(buf,strm.input,strm.next_in,len,start);if(strm.state.wrap===1){strm.adler=adler32(strm.adler,buf,len,start)}else if(strm.state.wrap===2){strm.adler=crc32(strm.adler,buf,len,start)}strm.next_in+=len;strm.total_in+=len;return len}function longest_match(s,cur_match){var chain_length=s.max_chain_length;var scan=s.strstart;var match;var len;var best_len=s.prev_length;var nice_match=s.nice_match;var limit=s.strstart>s.w_size-MIN_LOOKAHEAD?s.strstart-(s.w_size-MIN_LOOKAHEAD):0;var _win=s.window;var wmask=s.w_mask;var prev=s.prev;var strend=s.strstart+MAX_MATCH;var scan_end1=_win[scan+best_len-1];var scan_end=_win[scan+best_len];if(s.prev_length>=s.good_match){chain_length>>=2}if(nice_match>s.lookahead){nice_match=s.lookahead}do{match=cur_match;if(_win[match+best_len]!==scan_end||_win[match+best_len-1]!==scan_end1||_win[match]!==_win[scan]||_win[++match]!==_win[scan+1]){continue}scan+=2;match++;do{}while(_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&_win[++scan]===_win[++match]&&scan<strend);len=MAX_MATCH-(strend-scan);scan=strend-MAX_MATCH;if(len>best_len){s.match_start=cur_match;best_len=len;if(len>=nice_match){break}scan_end1=_win[scan+best_len-1];scan_end=_win[scan+best_len]}}while((cur_match=prev[cur_match&wmask])>limit&&--chain_length!==0);if(best_len<=s.lookahead){return best_len}return s.lookahead}function fill_window(s){var _w_size=s.w_size;var p,n,m,more,str;do{more=s.window_size-s.lookahead-s.strstart;if(s.strstart>=_w_size+(_w_size-MIN_LOOKAHEAD)){utils.arraySet(s.window,s.window,_w_size,_w_size,0);s.match_start-=_w_size;s.strstart-=_w_size;s.block_start-=_w_size;n=s.hash_size;p=n;do{m=s.head[--p];s.head[p]=m>=_w_size?m-_w_size:0}while(--n);n=_w_size;p=n;do{m=s.prev[--p];s.prev[p]=m>=_w_size?m-_w_size:0}while(--n);more+=_w_size}if(s.strm.avail_in===0){break}n=read_buf(s.strm,s.window,s.strstart+s.lookahead,more);s.lookahead+=n;if(s.lookahead+s.insert>=MIN_MATCH){str=s.strstart-s.insert;s.ins_h=s.window[str];s.ins_h=(s.ins_h<<s.hash_shift^s.window[str+1])&s.hash_mask;while(s.insert){s.ins_h=(s.ins_h<<s.hash_shift^s.window[str+MIN_MATCH-1])&s.hash_mask;s.prev[str&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=str;str++;s.insert--;if(s.lookahead+s.insert<MIN_MATCH){break}}}}while(s.lookahead<MIN_LOOKAHEAD&&s.strm.avail_in!==0)}function deflate_stored(s,flush){var max_block_size=65535;if(max_block_size>s.pending_buf_size-5){max_block_size=s.pending_buf_size-5}for(;;){if(s.lookahead<=1){fill_window(s);if(s.lookahead===0&&flush===Z_NO_FLUSH){return BS_NEED_MORE}if(s.lookahead===0){break}}s.strstart+=s.lookahead;s.lookahead=0;var max_start=s.block_start+max_block_size;if(s.strstart===0||s.strstart>=max_start){s.lookahead=s.strstart-max_start;s.strstart=max_start;flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE}}if(s.strstart-s.block_start>=s.w_size-MIN_LOOKAHEAD){flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE}}}s.insert=0;if(flush===Z_FINISH){flush_block_only(s,true);if(s.strm.avail_out===0){return BS_FINISH_STARTED}return BS_FINISH_DONE}if(s.strstart>s.block_start){flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE}}return BS_NEED_MORE}function deflate_fast(s,flush){var hash_head;var bflush;for(;;){if(s.lookahead<MIN_LOOKAHEAD){fill_window(s);if(s.lookahead<MIN_LOOKAHEAD&&flush===Z_NO_FLUSH){return BS_NEED_MORE}if(s.lookahead===0){break}}hash_head=0;if(s.lookahead>=MIN_MATCH){s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+MIN_MATCH-1])&s.hash_mask;hash_head=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=s.strstart}if(hash_head!==0&&s.strstart-hash_head<=s.w_size-MIN_LOOKAHEAD){s.match_length=longest_match(s,hash_head)}if(s.match_length>=MIN_MATCH){bflush=trees._tr_tally(s,s.strstart-s.match_start,s.match_length-MIN_MATCH);s.lookahead-=s.match_length;if(s.match_length<=s.max_lazy_match&&s.lookahead>=MIN_MATCH){s.match_length--;do{s.strstart++;s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+MIN_MATCH-1])&s.hash_mask;hash_head=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=s.strstart}while(--s.match_length!==0);s.strstart++}else{s.strstart+=s.match_length;s.match_length=0;s.ins_h=s.window[s.strstart];s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+1])&s.hash_mask}}else{bflush=trees._tr_tally(s,0,s.window[s.strstart]);s.lookahead--;s.strstart++}if(bflush){flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE}}}s.insert=s.strstart<MIN_MATCH-1?s.strstart:MIN_MATCH-1;if(flush===Z_FINISH){flush_block_only(s,true);if(s.strm.avail_out===0){return BS_FINISH_STARTED}return BS_FINISH_DONE}if(s.last_lit){flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE}}return BS_BLOCK_DONE}function deflate_slow(s,flush){var hash_head;var bflush;var max_insert;for(;;){if(s.lookahead<MIN_LOOKAHEAD){fill_window(s);if(s.lookahead<MIN_LOOKAHEAD&&flush===Z_NO_FLUSH){return BS_NEED_MORE}if(s.lookahead===0){break}}hash_head=0;if(s.lookahead>=MIN_MATCH){s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+MIN_MATCH-1])&s.hash_mask;hash_head=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=s.strstart;
}s.prev_length=s.match_length;s.prev_match=s.match_start;s.match_length=MIN_MATCH-1;if(hash_head!==0&&s.prev_length<s.max_lazy_match&&s.strstart-hash_head<=s.w_size-MIN_LOOKAHEAD){s.match_length=longest_match(s,hash_head);if(s.match_length<=5&&(s.strategy===Z_FILTERED||s.match_length===MIN_MATCH&&s.strstart-s.match_start>4096)){s.match_length=MIN_MATCH-1}}if(s.prev_length>=MIN_MATCH&&s.match_length<=s.prev_length){max_insert=s.strstart+s.lookahead-MIN_MATCH;bflush=trees._tr_tally(s,s.strstart-1-s.prev_match,s.prev_length-MIN_MATCH);s.lookahead-=s.prev_length-1;s.prev_length-=2;do{if(++s.strstart<=max_insert){s.ins_h=(s.ins_h<<s.hash_shift^s.window[s.strstart+MIN_MATCH-1])&s.hash_mask;hash_head=s.prev[s.strstart&s.w_mask]=s.head[s.ins_h];s.head[s.ins_h]=s.strstart}}while(--s.prev_length!==0);s.match_available=0;s.match_length=MIN_MATCH-1;s.strstart++;if(bflush){flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE}}}else if(s.match_available){bflush=trees._tr_tally(s,0,s.window[s.strstart-1]);if(bflush){flush_block_only(s,false)}s.strstart++;s.lookahead--;if(s.strm.avail_out===0){return BS_NEED_MORE}}else{s.match_available=1;s.strstart++;s.lookahead--}}if(s.match_available){bflush=trees._tr_tally(s,0,s.window[s.strstart-1]);s.match_available=0}s.insert=s.strstart<MIN_MATCH-1?s.strstart:MIN_MATCH-1;if(flush===Z_FINISH){flush_block_only(s,true);if(s.strm.avail_out===0){return BS_FINISH_STARTED}return BS_FINISH_DONE}if(s.last_lit){flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE}}return BS_BLOCK_DONE}function deflate_rle(s,flush){var bflush;var prev;var scan,strend;var _win=s.window;for(;;){if(s.lookahead<=MAX_MATCH){fill_window(s);if(s.lookahead<=MAX_MATCH&&flush===Z_NO_FLUSH){return BS_NEED_MORE}if(s.lookahead===0){break}}s.match_length=0;if(s.lookahead>=MIN_MATCH&&s.strstart>0){scan=s.strstart-1;prev=_win[scan];if(prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]){strend=s.strstart+MAX_MATCH;do{}while(prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&prev===_win[++scan]&&scan<strend);s.match_length=MAX_MATCH-(strend-scan);if(s.match_length>s.lookahead){s.match_length=s.lookahead}}}if(s.match_length>=MIN_MATCH){bflush=trees._tr_tally(s,1,s.match_length-MIN_MATCH);s.lookahead-=s.match_length;s.strstart+=s.match_length;s.match_length=0}else{bflush=trees._tr_tally(s,0,s.window[s.strstart]);s.lookahead--;s.strstart++}if(bflush){flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE}}}s.insert=0;if(flush===Z_FINISH){flush_block_only(s,true);if(s.strm.avail_out===0){return BS_FINISH_STARTED}return BS_FINISH_DONE}if(s.last_lit){flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE}}return BS_BLOCK_DONE}function deflate_huff(s,flush){var bflush;for(;;){if(s.lookahead===0){fill_window(s);if(s.lookahead===0){if(flush===Z_NO_FLUSH){return BS_NEED_MORE}break}}s.match_length=0;bflush=trees._tr_tally(s,0,s.window[s.strstart]);s.lookahead--;s.strstart++;if(bflush){flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE}}}s.insert=0;if(flush===Z_FINISH){flush_block_only(s,true);if(s.strm.avail_out===0){return BS_FINISH_STARTED}return BS_FINISH_DONE}if(s.last_lit){flush_block_only(s,false);if(s.strm.avail_out===0){return BS_NEED_MORE}}return BS_BLOCK_DONE}var Config=function(good_length,max_lazy,nice_length,max_chain,func){this.good_length=good_length;this.max_lazy=max_lazy;this.nice_length=nice_length;this.max_chain=max_chain;this.func=func};var configuration_table;configuration_table=[new Config(0,0,0,0,deflate_stored),new Config(4,4,8,4,deflate_fast),new Config(4,5,16,8,deflate_fast),new Config(4,6,32,32,deflate_fast),new Config(4,4,16,16,deflate_slow),new Config(8,16,32,32,deflate_slow),new Config(8,16,128,128,deflate_slow),new Config(8,32,128,256,deflate_slow),new Config(32,128,258,1024,deflate_slow),new Config(32,258,258,4096,deflate_slow)];function lm_init(s){s.window_size=2*s.w_size;zero(s.head);s.max_lazy_match=configuration_table[s.level].max_lazy;s.good_match=configuration_table[s.level].good_length;s.nice_match=configuration_table[s.level].nice_length;s.max_chain_length=configuration_table[s.level].max_chain;s.strstart=0;s.block_start=0;s.lookahead=0;s.insert=0;s.match_length=s.prev_length=MIN_MATCH-1;s.match_available=0;s.ins_h=0}function DeflateState(){this.strm=null;this.status=0;this.pending_buf=null;this.pending_buf_size=0;this.pending_out=0;this.pending=0;this.wrap=0;this.gzhead=null;this.gzindex=0;this.method=Z_DEFLATED;this.last_flush=-1;this.w_size=0;this.w_bits=0;this.w_mask=0;this.window=null;this.window_size=0;this.prev=null;this.head=null;this.ins_h=0;this.hash_size=0;this.hash_bits=0;this.hash_mask=0;this.hash_shift=0;this.block_start=0;this.match_length=0;this.prev_match=0;this.match_available=0;this.strstart=0;this.match_start=0;this.lookahead=0;this.prev_length=0;this.max_chain_length=0;this.max_lazy_match=0;this.level=0;this.strategy=0;this.good_match=0;this.nice_match=0;this.dyn_ltree=new utils.Buf16(HEAP_SIZE*2);this.dyn_dtree=new utils.Buf16((2*D_CODES+1)*2);this.bl_tree=new utils.Buf16((2*BL_CODES+1)*2);zero(this.dyn_ltree);zero(this.dyn_dtree);zero(this.bl_tree);this.l_desc=null;this.d_desc=null;this.bl_desc=null;this.bl_count=new utils.Buf16(MAX_BITS+1);this.heap=new utils.Buf16(2*L_CODES+1);zero(this.heap);this.heap_len=0;this.heap_max=0;this.depth=new utils.Buf16(2*L_CODES+1);zero(this.depth);this.l_buf=0;this.lit_bufsize=0;this.last_lit=0;this.d_buf=0;this.opt_len=0;this.static_len=0;this.matches=0;this.insert=0;this.bi_buf=0;this.bi_valid=0}function deflateResetKeep(strm){var s;if(!strm||!strm.state){return err(strm,Z_STREAM_ERROR)}strm.total_in=strm.total_out=0;strm.data_type=Z_UNKNOWN;s=strm.state;s.pending=0;s.pending_out=0;if(s.wrap<0){s.wrap=-s.wrap}s.status=s.wrap?INIT_STATE:BUSY_STATE;strm.adler=s.wrap===2?0:1;s.last_flush=Z_NO_FLUSH;trees._tr_init(s);return Z_OK}function deflateReset(strm){var ret=deflateResetKeep(strm);if(ret===Z_OK){lm_init(strm.state)}return ret}function deflateSetHeader(strm,head){if(!strm||!strm.state){return Z_STREAM_ERROR}if(strm.state.wrap!==2){return Z_STREAM_ERROR}strm.state.gzhead=head;return Z_OK}function deflateInit2(strm,level,method,windowBits,memLevel,strategy){if(!strm){return Z_STREAM_ERROR}var wrap=1;if(level===Z_DEFAULT_COMPRESSION){level=6}if(windowBits<0){wrap=0;windowBits=-windowBits}else if(windowBits>15){wrap=2;windowBits-=16}if(memLevel<1||memLevel>MAX_MEM_LEVEL||method!==Z_DEFLATED||windowBits<8||windowBits>15||level<0||level>9||strategy<0||strategy>Z_FIXED){return err(strm,Z_STREAM_ERROR)}if(windowBits===8){windowBits=9}var s=new DeflateState;strm.state=s;s.strm=strm;s.wrap=wrap;s.gzhead=null;s.w_bits=windowBits;s.w_size=1<<s.w_bits;s.w_mask=s.w_size-1;s.hash_bits=memLevel+7;s.hash_size=1<<s.hash_bits;s.hash_mask=s.hash_size-1;s.hash_shift=~~((s.hash_bits+MIN_MATCH-1)/MIN_MATCH);s.window=new utils.Buf8(s.w_size*2);s.head=new utils.Buf16(s.hash_size);s.prev=new utils.Buf16(s.w_size);s.lit_bufsize=1<<memLevel+6;s.pending_buf_size=s.lit_bufsize*4;s.pending_buf=new utils.Buf8(s.pending_buf_size);s.d_buf=s.lit_bufsize>>1;s.l_buf=(1+2)*s.lit_bufsize;s.level=level;s.strategy=strategy;s.method=method;return deflateReset(strm)}function deflateInit(strm,level){return deflateInit2(strm,level,Z_DEFLATED,MAX_WBITS,DEF_MEM_LEVEL,Z_DEFAULT_STRATEGY)}function deflate(strm,flush){var old_flush,s;var beg,val;if(!strm||!strm.state||flush>Z_BLOCK||flush<0){return strm?err(strm,Z_STREAM_ERROR):Z_STREAM_ERROR}s=strm.state;if(!strm.output||!strm.input&&strm.avail_in!==0||s.status===FINISH_STATE&&flush!==Z_FINISH){return err(strm,strm.avail_out===0?Z_BUF_ERROR:Z_STREAM_ERROR)}s.strm=strm;old_flush=s.last_flush;s.last_flush=flush;if(s.status===INIT_STATE){if(s.wrap===2){strm.adler=0;put_byte(s,31);put_byte(s,139);put_byte(s,8);if(!s.gzhead){put_byte(s,0);put_byte(s,0);put_byte(s,0);put_byte(s,0);put_byte(s,0);put_byte(s,s.level===9?2:s.strategy>=Z_HUFFMAN_ONLY||s.level<2?4:0);put_byte(s,OS_CODE);s.status=BUSY_STATE}else{put_byte(s,(s.gzhead.text?1:0)+(s.gzhead.hcrc?2:0)+(!s.gzhead.extra?0:4)+(!s.gzhead.name?0:8)+(!s.gzhead.comment?0:16));put_byte(s,s.gzhead.time&255);put_byte(s,s.gzhead.time>>8&255);put_byte(s,s.gzhead.time>>16&255);put_byte(s,s.gzhead.time>>24&255);put_byte(s,s.level===9?2:s.strategy>=Z_HUFFMAN_ONLY||s.level<2?4:0);put_byte(s,s.gzhead.os&255);if(s.gzhead.extra&&s.gzhead.extra.length){put_byte(s,s.gzhead.extra.length&255);put_byte(s,s.gzhead.extra.length>>8&255)}if(s.gzhead.hcrc){strm.adler=crc32(strm.adler,s.pending_buf,s.pending,0)}s.gzindex=0;s.status=EXTRA_STATE}}else{var header=Z_DEFLATED+(s.w_bits-8<<4)<<8;var level_flags=-1;if(s.strategy>=Z_HUFFMAN_ONLY||s.level<2){level_flags=0}else if(s.level<6){level_flags=1}else if(s.level===6){level_flags=2}else{level_flags=3}header|=level_flags<<6;if(s.strstart!==0){header|=PRESET_DICT}header+=31-header%31;s.status=BUSY_STATE;putShortMSB(s,header);if(s.strstart!==0){putShortMSB(s,strm.adler>>>16);putShortMSB(s,strm.adler&65535)}strm.adler=1}}if(s.status===EXTRA_STATE){if(s.gzhead.extra){beg=s.pending;while(s.gzindex<(s.gzhead.extra.length&65535)){if(s.pending===s.pending_buf_size){if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg)}flush_pending(strm);beg=s.pending;if(s.pending===s.pending_buf_size){break}}put_byte(s,s.gzhead.extra[s.gzindex]&255);s.gzindex++}if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg)}if(s.gzindex===s.gzhead.extra.length){s.gzindex=0;s.status=NAME_STATE}}else{s.status=NAME_STATE}}if(s.status===NAME_STATE){if(s.gzhead.name){beg=s.pending;do{if(s.pending===s.pending_buf_size){if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg)}flush_pending(strm);beg=s.pending;if(s.pending===s.pending_buf_size){val=1;break}}if(s.gzindex<s.gzhead.name.length){val=s.gzhead.name.charCodeAt(s.gzindex++)&255}else{val=0}put_byte(s,val)}while(val!==0);if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg)}if(val===0){s.gzindex=0;s.status=COMMENT_STATE}}else{s.status=COMMENT_STATE}}if(s.status===COMMENT_STATE){if(s.gzhead.comment){beg=s.pending;do{if(s.pending===s.pending_buf_size){if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg)}flush_pending(strm);beg=s.pending;if(s.pending===s.pending_buf_size){val=1;break}}if(s.gzindex<s.gzhead.comment.length){val=s.gzhead.comment.charCodeAt(s.gzindex++)&255}else{val=0}put_byte(s,val)}while(val!==0);if(s.gzhead.hcrc&&s.pending>beg){strm.adler=crc32(strm.adler,s.pending_buf,s.pending-beg,beg)}if(val===0){s.status=HCRC_STATE}}else{s.status=HCRC_STATE}}if(s.status===HCRC_STATE){if(s.gzhead.hcrc){if(s.pending+2>s.pending_buf_size){flush_pending(strm)}if(s.pending+2<=s.pending_buf_size){put_byte(s,strm.adler&255);put_byte(s,strm.adler>>8&255);strm.adler=0;s.status=BUSY_STATE}}else{s.status=BUSY_STATE}}if(s.pending!==0){flush_pending(strm);if(strm.avail_out===0){s.last_flush=-1;return Z_OK}}else if(strm.avail_in===0&&rank(flush)<=rank(old_flush)&&flush!==Z_FINISH){return err(strm,Z_BUF_ERROR)}if(s.status===FINISH_STATE&&strm.avail_in!==0){return err(strm,Z_BUF_ERROR)}if(strm.avail_in!==0||s.lookahead!==0||flush!==Z_NO_FLUSH&&s.status!==FINISH_STATE){var bstate=s.strategy===Z_HUFFMAN_ONLY?deflate_huff(s,flush):s.strategy===Z_RLE?deflate_rle(s,flush):configuration_table[s.level].func(s,flush);if(bstate===BS_FINISH_STARTED||bstate===BS_FINISH_DONE){s.status=FINISH_STATE}if(bstate===BS_NEED_MORE||bstate===BS_FINISH_STARTED){if(strm.avail_out===0){s.last_flush=-1}return Z_OK}if(bstate===BS_BLOCK_DONE){if(flush===Z_PARTIAL_FLUSH){trees._tr_align(s)}else if(flush!==Z_BLOCK){trees._tr_stored_block(s,0,0,false);if(flush===Z_FULL_FLUSH){zero(s.head);if(s.lookahead===0){s.strstart=0;s.block_start=0;s.insert=0}}}flush_pending(strm);if(strm.avail_out===0){s.last_flush=-1;return Z_OK}}}if(flush!==Z_FINISH){return Z_OK}if(s.wrap<=0){return Z_STREAM_END}if(s.wrap===2){put_byte(s,strm.adler&255);put_byte(s,strm.adler>>8&255);put_byte(s,strm.adler>>16&255);put_byte(s,strm.adler>>24&255);put_byte(s,strm.total_in&255);put_byte(s,strm.total_in>>8&255);put_byte(s,strm.total_in>>16&255);put_byte(s,strm.total_in>>24&255)}else{putShortMSB(s,strm.adler>>>16);putShortMSB(s,strm.adler&65535)}flush_pending(strm);if(s.wrap>0){s.wrap=-s.wrap}return s.pending!==0?Z_OK:Z_STREAM_END}function deflateEnd(strm){var status;if(!strm||!strm.state){return Z_STREAM_ERROR}status=strm.state.status;if(status!==INIT_STATE&&status!==EXTRA_STATE&&status!==NAME_STATE&&status!==COMMENT_STATE&&status!==HCRC_STATE&&status!==BUSY_STATE&&status!==FINISH_STATE){return err(strm,Z_STREAM_ERROR)}strm.state=null;return status===BUSY_STATE?err(strm,Z_DATA_ERROR):Z_OK}exports.deflateInit=deflateInit;exports.deflateInit2=deflateInit2;exports.deflateReset=deflateReset;exports.deflateResetKeep=deflateResetKeep;exports.deflateSetHeader=deflateSetHeader;exports.deflate=deflate;exports.deflateEnd=deflateEnd;exports.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":38,"./adler32":40,"./crc32":42,"./messages":48,"./trees":49}],44:[function(require,module,exports){"use strict";function GZheader(){this.text=0;this.time=0;this.xflags=0;this.os=0;this.extra=null;this.extra_len=0;this.name="";this.comment="";this.hcrc=0;this.done=false}module.exports=GZheader},{}],45:[function(require,module,exports){"use strict";var BAD=30;var TYPE=12;module.exports=function inflate_fast(strm,start){var state;var _in;var last;var _out;var beg;var end;var dmax;var wsize;var whave;var wnext;var s_window;var hold;var bits;var lcode;var dcode;var lmask;var dmask;var here;var op;var len;var dist;var from;var from_source;var input,output;state=strm.state;_in=strm.next_in;input=strm.input;last=_in+(strm.avail_in-5);_out=strm.next_out;output=strm.output;beg=_out-(start-strm.avail_out);end=_out+(strm.avail_out-257);dmax=state.dmax;wsize=state.wsize;whave=state.whave;wnext=state.wnext;s_window=state.window;hold=state.hold;bits=state.bits;lcode=state.lencode;dcode=state.distcode;lmask=(1<<state.lenbits)-1;dmask=(1<<state.distbits)-1;top:do{if(bits<15){hold+=input[_in++]<<bits;bits+=8;hold+=input[_in++]<<bits;bits+=8}here=lcode[hold&lmask];dolen:for(;;){op=here>>>24;hold>>>=op;bits-=op;op=here>>>16&255;if(op===0){output[_out++]=here&65535}else if(op&16){len=here&65535;op&=15;if(op){if(bits<op){hold+=input[_in++]<<bits;bits+=8}len+=hold&(1<<op)-1;hold>>>=op;bits-=op}if(bits<15){hold+=input[_in++]<<bits;bits+=8;hold+=input[_in++]<<bits;bits+=8}here=dcode[hold&dmask];dodist:for(;;){op=here>>>24;hold>>>=op;bits-=op;op=here>>>16&255;if(op&16){dist=here&65535;op&=15;if(bits<op){hold+=input[_in++]<<bits;bits+=8;if(bits<op){hold+=input[_in++]<<bits;bits+=8}}dist+=hold&(1<<op)-1;if(dist>dmax){strm.msg="invalid distance too far back";state.mode=BAD;break top}hold>>>=op;bits-=op;op=_out-beg;if(dist>op){op=dist-op;if(op>whave){if(state.sane){strm.msg="invalid distance too far back";state.mode=BAD;break top}}from=0;from_source=s_window;if(wnext===0){from+=wsize-op;if(op<len){len-=op;do{output[_out++]=s_window[from++]}while(--op);from=_out-dist;from_source=output}}else if(wnext<op){from+=wsize+wnext-op;op-=wnext;if(op<len){len-=op;do{output[_out++]=s_window[from++]}while(--op);from=0;if(wnext<len){op=wnext;len-=op;do{output[_out++]=s_window[from++]}while(--op);from=_out-dist;from_source=output}}}else{from+=wnext-op;if(op<len){len-=op;do{output[_out++]=s_window[from++]}while(--op);from=_out-dist;from_source=output}}while(len>2){output[_out++]=from_source[from++];output[_out++]=from_source[from++];output[_out++]=from_source[from++];len-=3}if(len){output[_out++]=from_source[from++];if(len>1){output[_out++]=from_source[from++]}}}else{from=_out-dist;do{output[_out++]=output[from++];output[_out++]=output[from++];output[_out++]=output[from++];len-=3}while(len>2);if(len){output[_out++]=output[from++];if(len>1){output[_out++]=output[from++]}}}}else if((op&64)===0){here=dcode[(here&65535)+(hold&(1<<op)-1)];continue dodist}else{strm.msg="invalid distance code";state.mode=BAD;break top}break}}else if((op&64)===0){here=lcode[(here&65535)+(hold&(1<<op)-1)];continue dolen}else if(op&32){state.mode=TYPE;break top}else{strm.msg="invalid literal/length code";state.mode=BAD;break top}break}}while(_in<last&&_out<end);len=bits>>3;_in-=len;bits-=len<<3;hold&=(1<<bits)-1;strm.next_in=_in;strm.next_out=_out;strm.avail_in=_in<last?5+(last-_in):5-(_in-last);strm.avail_out=_out<end?257+(end-_out):257-(_out-end);state.hold=hold;state.bits=bits;return}},{}],46:[function(require,module,exports){"use strict";var utils=require("../utils/common");var adler32=require("./adler32");var crc32=require("./crc32");var inflate_fast=require("./inffast");var inflate_table=require("./inftrees");var CODES=0;var LENS=1;var DISTS=2;var Z_FINISH=4;var Z_BLOCK=5;var Z_TREES=6;var Z_OK=0;var Z_STREAM_END=1;var Z_NEED_DICT=2;var Z_STREAM_ERROR=-2;var Z_DATA_ERROR=-3;var Z_MEM_ERROR=-4;var Z_BUF_ERROR=-5;var Z_DEFLATED=8;var HEAD=1;var FLAGS=2;var TIME=3;var OS=4;var EXLEN=5;var EXTRA=6;var NAME=7;var COMMENT=8;var HCRC=9;var DICTID=10;var DICT=11;var TYPE=12;var TYPEDO=13;var STORED=14;var COPY_=15;var COPY=16;var TABLE=17;var LENLENS=18;var CODELENS=19;var LEN_=20;var LEN=21;var LENEXT=22;var DIST=23;var DISTEXT=24;var MATCH=25;var LIT=26;var CHECK=27;var LENGTH=28;var DONE=29;var BAD=30;var MEM=31;var SYNC=32;var ENOUGH_LENS=852;var ENOUGH_DISTS=592;var MAX_WBITS=15;var DEF_WBITS=MAX_WBITS;function ZSWAP32(q){return(q>>>24&255)+(q>>>8&65280)+((q&65280)<<8)+((q&255)<<24)}function InflateState(){this.mode=0;this.last=false;this.wrap=0;this.havedict=false;this.flags=0;this.dmax=0;this.check=0;this.total=0;this.head=null;this.wbits=0;this.wsize=0;this.whave=0;this.wnext=0;this.window=null;this.hold=0;this.bits=0;this.length=0;this.offset=0;this.extra=0;this.lencode=null;this.distcode=null;this.lenbits=0;this.distbits=0;this.ncode=0;this.nlen=0;this.ndist=0;this.have=0;this.next=null;this.lens=new utils.Buf16(320);this.work=new utils.Buf16(288);this.lendyn=null;this.distdyn=null;this.sane=0;this.back=0;this.was=0}function inflateResetKeep(strm){var state;if(!strm||!strm.state){return Z_STREAM_ERROR}state=strm.state;strm.total_in=strm.total_out=state.total=0;strm.msg="";if(state.wrap){strm.adler=state.wrap&1}state.mode=HEAD;state.last=0;state.havedict=0;state.dmax=32768;state.head=null;state.hold=0;state.bits=0;state.lencode=state.lendyn=new utils.Buf32(ENOUGH_LENS);state.distcode=state.distdyn=new utils.Buf32(ENOUGH_DISTS);state.sane=1;state.back=-1;return Z_OK}function inflateReset(strm){var state;if(!strm||!strm.state){return Z_STREAM_ERROR}state=strm.state;state.wsize=0;state.whave=0;state.wnext=0;return inflateResetKeep(strm)}function inflateReset2(strm,windowBits){var wrap;var state;if(!strm||!strm.state){return Z_STREAM_ERROR}state=strm.state;if(windowBits<0){wrap=0;windowBits=-windowBits}else{wrap=(windowBits>>4)+1;if(windowBits<48){windowBits&=15}}if(windowBits&&(windowBits<8||windowBits>15)){return Z_STREAM_ERROR}if(state.window!==null&&state.wbits!==windowBits){state.window=null}state.wrap=wrap;state.wbits=windowBits;return inflateReset(strm)}function inflateInit2(strm,windowBits){var ret;var state;if(!strm){return Z_STREAM_ERROR}state=new InflateState;strm.state=state;state.window=null;ret=inflateReset2(strm,windowBits);if(ret!==Z_OK){strm.state=null}return ret}function inflateInit(strm){return inflateInit2(strm,DEF_WBITS)}var virgin=true;var lenfix,distfix;function fixedtables(state){if(virgin){var sym;lenfix=new utils.Buf32(512);distfix=new utils.Buf32(32);sym=0;while(sym<144){state.lens[sym++]=8}while(sym<256){state.lens[sym++]=9}while(sym<280){state.lens[sym++]=7}while(sym<288){state.lens[sym++]=8}inflate_table(LENS,state.lens,0,288,lenfix,0,state.work,{bits:9});sym=0;while(sym<32){state.lens[sym++]=5}inflate_table(DISTS,state.lens,0,32,distfix,0,state.work,{bits:5});virgin=false}state.lencode=lenfix;state.lenbits=9;state.distcode=distfix;state.distbits=5}function updatewindow(strm,src,end,copy){var dist;var state=strm.state;if(state.window===null){state.wsize=1<<state.wbits;state.wnext=0;state.whave=0;state.window=new utils.Buf8(state.wsize)}if(copy>=state.wsize){utils.arraySet(state.window,src,end-state.wsize,state.wsize,0);state.wnext=0;state.whave=state.wsize}else{dist=state.wsize-state.wnext;if(dist>copy){dist=copy}utils.arraySet(state.window,src,end-copy,dist,state.wnext);copy-=dist;if(copy){utils.arraySet(state.window,src,end-copy,copy,0);state.wnext=copy;state.whave=state.wsize}else{state.wnext+=dist;if(state.wnext===state.wsize){state.wnext=0}if(state.whave<state.wsize){state.whave+=dist}}}return 0}function inflate(strm,flush){var state;var input,output;var next;var put;var have,left;var hold;var bits;var _in,_out;var copy;var from;var from_source;var here=0;var here_bits,here_op,here_val;var last_bits,last_op,last_val;var len;var ret;var hbuf=new utils.Buf8(4);var opts;var n;var order=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!strm||!strm.state||!strm.output||!strm.input&&strm.avail_in!==0){return Z_STREAM_ERROR}state=strm.state;if(state.mode===TYPE){state.mode=TYPEDO}put=strm.next_out;output=strm.output;left=strm.avail_out;next=strm.next_in;input=strm.input;have=strm.avail_in;hold=state.hold;bits=state.bits;_in=have;_out=left;ret=Z_OK;inf_leave:for(;;){switch(state.mode){case HEAD:if(state.wrap===0){state.mode=TYPEDO;break}while(bits<16){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}if(state.wrap&2&&hold===35615){state.check=0;hbuf[0]=hold&255;hbuf[1]=hold>>>8&255;state.check=crc32(state.check,hbuf,2,0);hold=0;bits=0;state.mode=FLAGS;break}state.flags=0;if(state.head){state.head.done=false}if(!(state.wrap&1)||(((hold&255)<<8)+(hold>>8))%31){strm.msg="incorrect header check";state.mode=BAD;break}if((hold&15)!==Z_DEFLATED){strm.msg="unknown compression method";state.mode=BAD;break}hold>>>=4;bits-=4;len=(hold&15)+8;if(state.wbits===0){state.wbits=len}else if(len>state.wbits){strm.msg="invalid window size";state.mode=BAD;break}state.dmax=1<<len;strm.adler=state.check=1;state.mode=hold&512?DICTID:TYPE;hold=0;bits=0;break;case FLAGS:while(bits<16){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}state.flags=hold;if((state.flags&255)!==Z_DEFLATED){strm.msg="unknown compression method";state.mode=BAD;break}if(state.flags&57344){strm.msg="unknown header flags set";state.mode=BAD;break}if(state.head){state.head.text=hold>>8&1}if(state.flags&512){hbuf[0]=hold&255;hbuf[1]=hold>>>8&255;state.check=crc32(state.check,hbuf,2,0)}hold=0;bits=0;state.mode=TIME;case TIME:while(bits<32){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}if(state.head){state.head.time=hold}if(state.flags&512){hbuf[0]=hold&255;hbuf[1]=hold>>>8&255;hbuf[2]=hold>>>16&255;hbuf[3]=hold>>>24&255;state.check=crc32(state.check,hbuf,4,0)}hold=0;bits=0;state.mode=OS;case OS:while(bits<16){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}if(state.head){state.head.xflags=hold&255;state.head.os=hold>>8}if(state.flags&512){hbuf[0]=hold&255;hbuf[1]=hold>>>8&255;state.check=crc32(state.check,hbuf,2,0)}hold=0;bits=0;state.mode=EXLEN;case EXLEN:if(state.flags&1024){while(bits<16){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}state.length=hold;if(state.head){state.head.extra_len=hold}if(state.flags&512){hbuf[0]=hold&255;hbuf[1]=hold>>>8&255;state.check=crc32(state.check,hbuf,2,0)}hold=0;bits=0}else if(state.head){state.head.extra=null}state.mode=EXTRA;case EXTRA:if(state.flags&1024){copy=state.length;if(copy>have){copy=have}if(copy){if(state.head){len=state.head.extra_len-state.length;if(!state.head.extra){state.head.extra=new Array(state.head.extra_len)}utils.arraySet(state.head.extra,input,next,copy,len)}if(state.flags&512){state.check=crc32(state.check,input,copy,next)}have-=copy;next+=copy;state.length-=copy}if(state.length){break inf_leave}}state.length=0;state.mode=NAME;case NAME:if(state.flags&2048){if(have===0){break inf_leave}copy=0;do{len=input[next+copy++];if(state.head&&len&&state.length<65536){state.head.name+=String.fromCharCode(len)}}while(len&&copy<have);if(state.flags&512){state.check=crc32(state.check,input,copy,next)}have-=copy;next+=copy;if(len){break inf_leave}}else if(state.head){state.head.name=null}state.length=0;state.mode=COMMENT;case COMMENT:if(state.flags&4096){if(have===0){break inf_leave}copy=0;do{len=input[next+copy++];if(state.head&&len&&state.length<65536){state.head.comment+=String.fromCharCode(len)}}while(len&&copy<have);if(state.flags&512){state.check=crc32(state.check,input,copy,next)}have-=copy;next+=copy;if(len){break inf_leave}}else if(state.head){state.head.comment=null}state.mode=HCRC;case HCRC:if(state.flags&512){while(bits<16){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}if(hold!==(state.check&65535)){strm.msg="header crc mismatch";state.mode=BAD;break}hold=0;bits=0}if(state.head){state.head.hcrc=state.flags>>9&1;state.head.done=true}strm.adler=state.check=0;state.mode=TYPE;break;case DICTID:while(bits<32){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}strm.adler=state.check=ZSWAP32(hold);hold=0;bits=0;state.mode=DICT;case DICT:if(state.havedict===0){strm.next_out=put;strm.avail_out=left;strm.next_in=next;strm.avail_in=have;state.hold=hold;state.bits=bits;return Z_NEED_DICT}strm.adler=state.check=1;state.mode=TYPE;case TYPE:if(flush===Z_BLOCK||flush===Z_TREES){break inf_leave}case TYPEDO:if(state.last){hold>>>=bits&7;bits-=bits&7;state.mode=CHECK;break}while(bits<3){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}state.last=hold&1;hold>>>=1;bits-=1;switch(hold&3){case 0:state.mode=STORED;break;case 1:fixedtables(state);state.mode=LEN_;if(flush===Z_TREES){hold>>>=2;bits-=2;break inf_leave}break;case 2:state.mode=TABLE;break;case 3:strm.msg="invalid block type";state.mode=BAD}hold>>>=2;bits-=2;break;case STORED:hold>>>=bits&7;bits-=bits&7;while(bits<32){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}if((hold&65535)!==(hold>>>16^65535)){strm.msg="invalid stored block lengths";state.mode=BAD;break}state.length=hold&65535;hold=0;bits=0;state.mode=COPY_;if(flush===Z_TREES){break inf_leave}case COPY_:state.mode=COPY;case COPY:copy=state.length;if(copy){if(copy>have){copy=have}if(copy>left){copy=left}if(copy===0){break inf_leave}utils.arraySet(output,input,next,copy,put);have-=copy;next+=copy;left-=copy;put+=copy;state.length-=copy;break}state.mode=TYPE;break;case TABLE:while(bits<14){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}state.nlen=(hold&31)+257;hold>>>=5;bits-=5;state.ndist=(hold&31)+1;hold>>>=5;bits-=5;state.ncode=(hold&15)+4;hold>>>=4;bits-=4;if(state.nlen>286||state.ndist>30){strm.msg="too many length or distance symbols";state.mode=BAD;break}state.have=0;state.mode=LENLENS;case LENLENS:while(state.have<state.ncode){while(bits<3){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}state.lens[order[state.have++]]=hold&7;hold>>>=3;bits-=3}while(state.have<19){state.lens[order[state.have++]]=0}state.lencode=state.lendyn;state.lenbits=7;opts={bits:state.lenbits};ret=inflate_table(CODES,state.lens,0,19,state.lencode,0,state.work,opts);state.lenbits=opts.bits;if(ret){strm.msg="invalid code lengths set";state.mode=BAD;break}state.have=0;state.mode=CODELENS;case CODELENS:while(state.have<state.nlen+state.ndist){for(;;){here=state.lencode[hold&(1<<state.lenbits)-1];here_bits=here>>>24;here_op=here>>>16&255;here_val=here&65535;if(here_bits<=bits){break}if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}if(here_val<16){hold>>>=here_bits;bits-=here_bits;state.lens[state.have++]=here_val}else{if(here_val===16){n=here_bits+2;while(bits<n){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}hold>>>=here_bits;bits-=here_bits;if(state.have===0){strm.msg="invalid bit length repeat";state.mode=BAD;break}len=state.lens[state.have-1];copy=3+(hold&3);hold>>>=2;bits-=2}else if(here_val===17){n=here_bits+3;while(bits<n){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}hold>>>=here_bits;bits-=here_bits;len=0;copy=3+(hold&7);hold>>>=3;bits-=3}else{n=here_bits+7;while(bits<n){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}hold>>>=here_bits;bits-=here_bits;len=0;copy=11+(hold&127);hold>>>=7;bits-=7}if(state.have+copy>state.nlen+state.ndist){strm.msg="invalid bit length repeat";state.mode=BAD;break}while(copy--){state.lens[state.have++]=len}}}if(state.mode===BAD){break}if(state.lens[256]===0){strm.msg="invalid code -- missing end-of-block";state.mode=BAD;break}state.lenbits=9;opts={bits:state.lenbits};ret=inflate_table(LENS,state.lens,0,state.nlen,state.lencode,0,state.work,opts);state.lenbits=opts.bits;if(ret){strm.msg="invalid literal/lengths set";state.mode=BAD;break}state.distbits=6;state.distcode=state.distdyn;opts={bits:state.distbits};ret=inflate_table(DISTS,state.lens,state.nlen,state.ndist,state.distcode,0,state.work,opts);state.distbits=opts.bits;if(ret){strm.msg="invalid distances set";state.mode=BAD;break}state.mode=LEN_;if(flush===Z_TREES){break inf_leave}case LEN_:state.mode=LEN;case LEN:if(have>=6&&left>=258){strm.next_out=put;strm.avail_out=left;strm.next_in=next;strm.avail_in=have;state.hold=hold;state.bits=bits;inflate_fast(strm,_out);put=strm.next_out;output=strm.output;left=strm.avail_out;next=strm.next_in;input=strm.input;have=strm.avail_in;hold=state.hold;bits=state.bits;if(state.mode===TYPE){state.back=-1}break}state.back=0;for(;;){here=state.lencode[hold&(1<<state.lenbits)-1];here_bits=here>>>24;here_op=here>>>16&255;here_val=here&65535;if(here_bits<=bits){break}if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}if(here_op&&(here_op&240)===0){last_bits=here_bits;last_op=here_op;last_val=here_val;for(;;){here=state.lencode[last_val+((hold&(1<<last_bits+last_op)-1)>>last_bits)];here_bits=here>>>24;here_op=here>>>16&255;here_val=here&65535;if(last_bits+here_bits<=bits){break}if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}hold>>>=last_bits;bits-=last_bits;state.back+=last_bits}hold>>>=here_bits;bits-=here_bits;state.back+=here_bits;state.length=here_val;if(here_op===0){state.mode=LIT;break}if(here_op&32){state.back=-1;state.mode=TYPE;break}if(here_op&64){strm.msg="invalid literal/length code";state.mode=BAD;break}state.extra=here_op&15;state.mode=LENEXT;case LENEXT:if(state.extra){n=state.extra;while(bits<n){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}state.length+=hold&(1<<state.extra)-1;hold>>>=state.extra;bits-=state.extra;state.back+=state.extra}state.was=state.length;state.mode=DIST;case DIST:for(;;){here=state.distcode[hold&(1<<state.distbits)-1];here_bits=here>>>24;here_op=here>>>16&255;here_val=here&65535;if(here_bits<=bits){break}if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}if((here_op&240)===0){last_bits=here_bits;last_op=here_op;last_val=here_val;for(;;){here=state.distcode[last_val+((hold&(1<<last_bits+last_op)-1)>>last_bits)];here_bits=here>>>24;here_op=here>>>16&255;here_val=here&65535;if(last_bits+here_bits<=bits){break}if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}hold>>>=last_bits;bits-=last_bits;state.back+=last_bits}hold>>>=here_bits;bits-=here_bits;state.back+=here_bits;if(here_op&64){strm.msg="invalid distance code";state.mode=BAD;break}state.offset=here_val;state.extra=here_op&15;state.mode=DISTEXT;case DISTEXT:if(state.extra){n=state.extra;while(bits<n){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}state.offset+=hold&(1<<state.extra)-1;hold>>>=state.extra;bits-=state.extra;state.back+=state.extra}if(state.offset>state.dmax){strm.msg="invalid distance too far back";state.mode=BAD;break}state.mode=MATCH;
case MATCH:if(left===0){break inf_leave}copy=_out-left;if(state.offset>copy){copy=state.offset-copy;if(copy>state.whave){if(state.sane){strm.msg="invalid distance too far back";state.mode=BAD;break}}if(copy>state.wnext){copy-=state.wnext;from=state.wsize-copy}else{from=state.wnext-copy}if(copy>state.length){copy=state.length}from_source=state.window}else{from_source=output;from=put-state.offset;copy=state.length}if(copy>left){copy=left}left-=copy;state.length-=copy;do{output[put++]=from_source[from++]}while(--copy);if(state.length===0){state.mode=LEN}break;case LIT:if(left===0){break inf_leave}output[put++]=state.length;left--;state.mode=LEN;break;case CHECK:if(state.wrap){while(bits<32){if(have===0){break inf_leave}have--;hold|=input[next++]<<bits;bits+=8}_out-=left;strm.total_out+=_out;state.total+=_out;if(_out){strm.adler=state.check=state.flags?crc32(state.check,output,_out,put-_out):adler32(state.check,output,_out,put-_out)}_out=left;if((state.flags?hold:ZSWAP32(hold))!==state.check){strm.msg="incorrect data check";state.mode=BAD;break}hold=0;bits=0}state.mode=LENGTH;case LENGTH:if(state.wrap&&state.flags){while(bits<32){if(have===0){break inf_leave}have--;hold+=input[next++]<<bits;bits+=8}if(hold!==(state.total&4294967295)){strm.msg="incorrect length check";state.mode=BAD;break}hold=0;bits=0}state.mode=DONE;case DONE:ret=Z_STREAM_END;break inf_leave;case BAD:ret=Z_DATA_ERROR;break inf_leave;case MEM:return Z_MEM_ERROR;case SYNC:default:return Z_STREAM_ERROR}}strm.next_out=put;strm.avail_out=left;strm.next_in=next;strm.avail_in=have;state.hold=hold;state.bits=bits;if(state.wsize||_out!==strm.avail_out&&state.mode<BAD&&(state.mode<CHECK||flush!==Z_FINISH)){if(updatewindow(strm,strm.output,strm.next_out,_out-strm.avail_out)){state.mode=MEM;return Z_MEM_ERROR}}_in-=strm.avail_in;_out-=strm.avail_out;strm.total_in+=_in;strm.total_out+=_out;state.total+=_out;if(state.wrap&&_out){strm.adler=state.check=state.flags?crc32(state.check,output,_out,strm.next_out-_out):adler32(state.check,output,_out,strm.next_out-_out)}strm.data_type=state.bits+(state.last?64:0)+(state.mode===TYPE?128:0)+(state.mode===LEN_||state.mode===COPY_?256:0);if((_in===0&&_out===0||flush===Z_FINISH)&&ret===Z_OK){ret=Z_BUF_ERROR}return ret}function inflateEnd(strm){if(!strm||!strm.state){return Z_STREAM_ERROR}var state=strm.state;if(state.window){state.window=null}strm.state=null;return Z_OK}function inflateGetHeader(strm,head){var state;if(!strm||!strm.state){return Z_STREAM_ERROR}state=strm.state;if((state.wrap&2)===0){return Z_STREAM_ERROR}state.head=head;head.done=false;return Z_OK}exports.inflateReset=inflateReset;exports.inflateReset2=inflateReset2;exports.inflateResetKeep=inflateResetKeep;exports.inflateInit=inflateInit;exports.inflateInit2=inflateInit2;exports.inflate=inflate;exports.inflateEnd=inflateEnd;exports.inflateGetHeader=inflateGetHeader;exports.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":38,"./adler32":40,"./crc32":42,"./inffast":45,"./inftrees":47}],47:[function(require,module,exports){"use strict";var utils=require("../utils/common");var MAXBITS=15;var ENOUGH_LENS=852;var ENOUGH_DISTS=592;var CODES=0;var LENS=1;var DISTS=2;var lbase=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0];var lext=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78];var dbase=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0];var dext=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];module.exports=function inflate_table(type,lens,lens_index,codes,table,table_index,work,opts){var bits=opts.bits;var len=0;var sym=0;var min=0,max=0;var root=0;var curr=0;var drop=0;var left=0;var used=0;var huff=0;var incr;var fill;var low;var mask;var next;var base=null;var base_index=0;var end;var count=new utils.Buf16(MAXBITS+1);var offs=new utils.Buf16(MAXBITS+1);var extra=null;var extra_index=0;var here_bits,here_op,here_val;for(len=0;len<=MAXBITS;len++){count[len]=0}for(sym=0;sym<codes;sym++){count[lens[lens_index+sym]]++}root=bits;for(max=MAXBITS;max>=1;max--){if(count[max]!==0){break}}if(root>max){root=max}if(max===0){table[table_index++]=1<<24|64<<16|0;table[table_index++]=1<<24|64<<16|0;opts.bits=1;return 0}for(min=1;min<max;min++){if(count[min]!==0){break}}if(root<min){root=min}left=1;for(len=1;len<=MAXBITS;len++){left<<=1;left-=count[len];if(left<0){return-1}}if(left>0&&(type===CODES||max!==1)){return-1}offs[1]=0;for(len=1;len<MAXBITS;len++){offs[len+1]=offs[len]+count[len]}for(sym=0;sym<codes;sym++){if(lens[lens_index+sym]!==0){work[offs[lens[lens_index+sym]]++]=sym}}if(type===CODES){base=extra=work;end=19}else if(type===LENS){base=lbase;base_index-=257;extra=lext;extra_index-=257;end=256}else{base=dbase;extra=dext;end=-1}huff=0;sym=0;len=min;next=table_index;curr=root;drop=0;low=-1;used=1<<root;mask=used-1;if(type===LENS&&used>ENOUGH_LENS||type===DISTS&&used>ENOUGH_DISTS){return 1}var i=0;for(;;){i++;here_bits=len-drop;if(work[sym]<end){here_op=0;here_val=work[sym]}else if(work[sym]>end){here_op=extra[extra_index+work[sym]];here_val=base[base_index+work[sym]]}else{here_op=32+64;here_val=0}incr=1<<len-drop;fill=1<<curr;min=fill;do{fill-=incr;table[next+(huff>>drop)+fill]=here_bits<<24|here_op<<16|here_val|0}while(fill!==0);incr=1<<len-1;while(huff&incr){incr>>=1}if(incr!==0){huff&=incr-1;huff+=incr}else{huff=0}sym++;if(--count[len]===0){if(len===max){break}len=lens[lens_index+work[sym]]}if(len>root&&(huff&mask)!==low){if(drop===0){drop=root}next+=min;curr=len-drop;left=1<<curr;while(curr+drop<max){left-=count[curr+drop];if(left<=0){break}curr++;left<<=1}used+=1<<curr;if(type===LENS&&used>ENOUGH_LENS||type===DISTS&&used>ENOUGH_DISTS){return 1}low=huff&mask;table[low]=root<<24|curr<<16|next-table_index|0}}if(huff!==0){table[next+huff]=len-drop<<24|64<<16|0}opts.bits=root;return 0}},{"../utils/common":38}],48:[function(require,module,exports){"use strict";module.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],49:[function(require,module,exports){"use strict";var utils=require("../utils/common");var Z_FIXED=4;var Z_BINARY=0;var Z_TEXT=1;var Z_UNKNOWN=2;function zero(buf){var len=buf.length;while(--len>=0){buf[len]=0}}var STORED_BLOCK=0;var STATIC_TREES=1;var DYN_TREES=2;var MIN_MATCH=3;var MAX_MATCH=258;var LENGTH_CODES=29;var LITERALS=256;var L_CODES=LITERALS+1+LENGTH_CODES;var D_CODES=30;var BL_CODES=19;var HEAP_SIZE=2*L_CODES+1;var MAX_BITS=15;var Buf_size=16;var MAX_BL_BITS=7;var END_BLOCK=256;var REP_3_6=16;var REPZ_3_10=17;var REPZ_11_138=18;var extra_lbits=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];var extra_dbits=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];var extra_blbits=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7];var bl_order=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];var DIST_CODE_LEN=512;var static_ltree=new Array((L_CODES+2)*2);zero(static_ltree);var static_dtree=new Array(D_CODES*2);zero(static_dtree);var _dist_code=new Array(DIST_CODE_LEN);zero(_dist_code);var _length_code=new Array(MAX_MATCH-MIN_MATCH+1);zero(_length_code);var base_length=new Array(LENGTH_CODES);zero(base_length);var base_dist=new Array(D_CODES);zero(base_dist);var StaticTreeDesc=function(static_tree,extra_bits,extra_base,elems,max_length){this.static_tree=static_tree;this.extra_bits=extra_bits;this.extra_base=extra_base;this.elems=elems;this.max_length=max_length;this.has_stree=static_tree&&static_tree.length};var static_l_desc;var static_d_desc;var static_bl_desc;var TreeDesc=function(dyn_tree,stat_desc){this.dyn_tree=dyn_tree;this.max_code=0;this.stat_desc=stat_desc};function d_code(dist){return dist<256?_dist_code[dist]:_dist_code[256+(dist>>>7)]}function put_short(s,w){s.pending_buf[s.pending++]=w&255;s.pending_buf[s.pending++]=w>>>8&255}function send_bits(s,value,length){if(s.bi_valid>Buf_size-length){s.bi_buf|=value<<s.bi_valid&65535;put_short(s,s.bi_buf);s.bi_buf=value>>Buf_size-s.bi_valid;s.bi_valid+=length-Buf_size}else{s.bi_buf|=value<<s.bi_valid&65535;s.bi_valid+=length}}function send_code(s,c,tree){send_bits(s,tree[c*2],tree[c*2+1])}function bi_reverse(code,len){var res=0;do{res|=code&1;code>>>=1;res<<=1}while(--len>0);return res>>>1}function bi_flush(s){if(s.bi_valid===16){put_short(s,s.bi_buf);s.bi_buf=0;s.bi_valid=0}else if(s.bi_valid>=8){s.pending_buf[s.pending++]=s.bi_buf&255;s.bi_buf>>=8;s.bi_valid-=8}}function gen_bitlen(s,desc){var tree=desc.dyn_tree;var max_code=desc.max_code;var stree=desc.stat_desc.static_tree;var has_stree=desc.stat_desc.has_stree;var extra=desc.stat_desc.extra_bits;var base=desc.stat_desc.extra_base;var max_length=desc.stat_desc.max_length;var h;var n,m;var bits;var xbits;var f;var overflow=0;for(bits=0;bits<=MAX_BITS;bits++){s.bl_count[bits]=0}tree[s.heap[s.heap_max]*2+1]=0;for(h=s.heap_max+1;h<HEAP_SIZE;h++){n=s.heap[h];bits=tree[tree[n*2+1]*2+1]+1;if(bits>max_length){bits=max_length;overflow++}tree[n*2+1]=bits;if(n>max_code){continue}s.bl_count[bits]++;xbits=0;if(n>=base){xbits=extra[n-base]}f=tree[n*2];s.opt_len+=f*(bits+xbits);if(has_stree){s.static_len+=f*(stree[n*2+1]+xbits)}}if(overflow===0){return}do{bits=max_length-1;while(s.bl_count[bits]===0){bits--}s.bl_count[bits]--;s.bl_count[bits+1]+=2;s.bl_count[max_length]--;overflow-=2}while(overflow>0);for(bits=max_length;bits!==0;bits--){n=s.bl_count[bits];while(n!==0){m=s.heap[--h];if(m>max_code){continue}if(tree[m*2+1]!==bits){s.opt_len+=(bits-tree[m*2+1])*tree[m*2];tree[m*2+1]=bits}n--}}}function gen_codes(tree,max_code,bl_count){var next_code=new Array(MAX_BITS+1);var code=0;var bits;var n;for(bits=1;bits<=MAX_BITS;bits++){next_code[bits]=code=code+bl_count[bits-1]<<1}for(n=0;n<=max_code;n++){var len=tree[n*2+1];if(len===0){continue}tree[n*2]=bi_reverse(next_code[len]++,len)}}function tr_static_init(){var n;var bits;var length;var code;var dist;var bl_count=new Array(MAX_BITS+1);length=0;for(code=0;code<LENGTH_CODES-1;code++){base_length[code]=length;for(n=0;n<1<<extra_lbits[code];n++){_length_code[length++]=code}}_length_code[length-1]=code;dist=0;for(code=0;code<16;code++){base_dist[code]=dist;for(n=0;n<1<<extra_dbits[code];n++){_dist_code[dist++]=code}}dist>>=7;for(;code<D_CODES;code++){base_dist[code]=dist<<7;for(n=0;n<1<<extra_dbits[code]-7;n++){_dist_code[256+dist++]=code}}for(bits=0;bits<=MAX_BITS;bits++){bl_count[bits]=0}n=0;while(n<=143){static_ltree[n*2+1]=8;n++;bl_count[8]++}while(n<=255){static_ltree[n*2+1]=9;n++;bl_count[9]++}while(n<=279){static_ltree[n*2+1]=7;n++;bl_count[7]++}while(n<=287){static_ltree[n*2+1]=8;n++;bl_count[8]++}gen_codes(static_ltree,L_CODES+1,bl_count);for(n=0;n<D_CODES;n++){static_dtree[n*2+1]=5;static_dtree[n*2]=bi_reverse(n,5)}static_l_desc=new StaticTreeDesc(static_ltree,extra_lbits,LITERALS+1,L_CODES,MAX_BITS);static_d_desc=new StaticTreeDesc(static_dtree,extra_dbits,0,D_CODES,MAX_BITS);static_bl_desc=new StaticTreeDesc(new Array(0),extra_blbits,0,BL_CODES,MAX_BL_BITS)}function init_block(s){var n;for(n=0;n<L_CODES;n++){s.dyn_ltree[n*2]=0}for(n=0;n<D_CODES;n++){s.dyn_dtree[n*2]=0}for(n=0;n<BL_CODES;n++){s.bl_tree[n*2]=0}s.dyn_ltree[END_BLOCK*2]=1;s.opt_len=s.static_len=0;s.last_lit=s.matches=0}function bi_windup(s){if(s.bi_valid>8){put_short(s,s.bi_buf)}else if(s.bi_valid>0){s.pending_buf[s.pending++]=s.bi_buf}s.bi_buf=0;s.bi_valid=0}function copy_block(s,buf,len,header){bi_windup(s);if(header){put_short(s,len);put_short(s,~len)}utils.arraySet(s.pending_buf,s.window,buf,len,s.pending);s.pending+=len}function smaller(tree,n,m,depth){var _n2=n*2;var _m2=m*2;return tree[_n2]<tree[_m2]||tree[_n2]===tree[_m2]&&depth[n]<=depth[m]}function pqdownheap(s,tree,k){var v=s.heap[k];var j=k<<1;while(j<=s.heap_len){if(j<s.heap_len&&smaller(tree,s.heap[j+1],s.heap[j],s.depth)){j++}if(smaller(tree,v,s.heap[j],s.depth)){break}s.heap[k]=s.heap[j];k=j;j<<=1}s.heap[k]=v}function compress_block(s,ltree,dtree){var dist;var lc;var lx=0;var code;var extra;if(s.last_lit!==0){do{dist=s.pending_buf[s.d_buf+lx*2]<<8|s.pending_buf[s.d_buf+lx*2+1];lc=s.pending_buf[s.l_buf+lx];lx++;if(dist===0){send_code(s,lc,ltree)}else{code=_length_code[lc];send_code(s,code+LITERALS+1,ltree);extra=extra_lbits[code];if(extra!==0){lc-=base_length[code];send_bits(s,lc,extra)}dist--;code=d_code(dist);send_code(s,code,dtree);extra=extra_dbits[code];if(extra!==0){dist-=base_dist[code];send_bits(s,dist,extra)}}}while(lx<s.last_lit)}send_code(s,END_BLOCK,ltree)}function build_tree(s,desc){var tree=desc.dyn_tree;var stree=desc.stat_desc.static_tree;var has_stree=desc.stat_desc.has_stree;var elems=desc.stat_desc.elems;var n,m;var max_code=-1;var node;s.heap_len=0;s.heap_max=HEAP_SIZE;for(n=0;n<elems;n++){if(tree[n*2]!==0){s.heap[++s.heap_len]=max_code=n;s.depth[n]=0}else{tree[n*2+1]=0}}while(s.heap_len<2){node=s.heap[++s.heap_len]=max_code<2?++max_code:0;tree[node*2]=1;s.depth[node]=0;s.opt_len--;if(has_stree){s.static_len-=stree[node*2+1]}}desc.max_code=max_code;for(n=s.heap_len>>1;n>=1;n--){pqdownheap(s,tree,n)}node=elems;do{n=s.heap[1];s.heap[1]=s.heap[s.heap_len--];pqdownheap(s,tree,1);m=s.heap[1];s.heap[--s.heap_max]=n;s.heap[--s.heap_max]=m;tree[node*2]=tree[n*2]+tree[m*2];s.depth[node]=(s.depth[n]>=s.depth[m]?s.depth[n]:s.depth[m])+1;tree[n*2+1]=tree[m*2+1]=node;s.heap[1]=node++;pqdownheap(s,tree,1)}while(s.heap_len>=2);s.heap[--s.heap_max]=s.heap[1];gen_bitlen(s,desc);gen_codes(tree,max_code,s.bl_count)}function scan_tree(s,tree,max_code){var n;var prevlen=-1;var curlen;var nextlen=tree[0*2+1];var count=0;var max_count=7;var min_count=4;if(nextlen===0){max_count=138;min_count=3}tree[(max_code+1)*2+1]=65535;for(n=0;n<=max_code;n++){curlen=nextlen;nextlen=tree[(n+1)*2+1];if(++count<max_count&&curlen===nextlen){continue}else if(count<min_count){s.bl_tree[curlen*2]+=count}else if(curlen!==0){if(curlen!==prevlen){s.bl_tree[curlen*2]++}s.bl_tree[REP_3_6*2]++}else if(count<=10){s.bl_tree[REPZ_3_10*2]++}else{s.bl_tree[REPZ_11_138*2]++}count=0;prevlen=curlen;if(nextlen===0){max_count=138;min_count=3}else if(curlen===nextlen){max_count=6;min_count=3}else{max_count=7;min_count=4}}}function send_tree(s,tree,max_code){var n;var prevlen=-1;var curlen;var nextlen=tree[0*2+1];var count=0;var max_count=7;var min_count=4;if(nextlen===0){max_count=138;min_count=3}for(n=0;n<=max_code;n++){curlen=nextlen;nextlen=tree[(n+1)*2+1];if(++count<max_count&&curlen===nextlen){continue}else if(count<min_count){do{send_code(s,curlen,s.bl_tree)}while(--count!==0)}else if(curlen!==0){if(curlen!==prevlen){send_code(s,curlen,s.bl_tree);count--}send_code(s,REP_3_6,s.bl_tree);send_bits(s,count-3,2)}else if(count<=10){send_code(s,REPZ_3_10,s.bl_tree);send_bits(s,count-3,3)}else{send_code(s,REPZ_11_138,s.bl_tree);send_bits(s,count-11,7)}count=0;prevlen=curlen;if(nextlen===0){max_count=138;min_count=3}else if(curlen===nextlen){max_count=6;min_count=3}else{max_count=7;min_count=4}}}function build_bl_tree(s){var max_blindex;scan_tree(s,s.dyn_ltree,s.l_desc.max_code);scan_tree(s,s.dyn_dtree,s.d_desc.max_code);build_tree(s,s.bl_desc);for(max_blindex=BL_CODES-1;max_blindex>=3;max_blindex--){if(s.bl_tree[bl_order[max_blindex]*2+1]!==0){break}}s.opt_len+=3*(max_blindex+1)+5+5+4;return max_blindex}function send_all_trees(s,lcodes,dcodes,blcodes){var rank;send_bits(s,lcodes-257,5);send_bits(s,dcodes-1,5);send_bits(s,blcodes-4,4);for(rank=0;rank<blcodes;rank++){send_bits(s,s.bl_tree[bl_order[rank]*2+1],3)}send_tree(s,s.dyn_ltree,lcodes-1);send_tree(s,s.dyn_dtree,dcodes-1)}function detect_data_type(s){var black_mask=4093624447;var n;for(n=0;n<=31;n++,black_mask>>>=1){if(black_mask&1&&s.dyn_ltree[n*2]!==0){return Z_BINARY}}if(s.dyn_ltree[9*2]!==0||s.dyn_ltree[10*2]!==0||s.dyn_ltree[13*2]!==0){return Z_TEXT}for(n=32;n<LITERALS;n++){if(s.dyn_ltree[n*2]!==0){return Z_TEXT}}return Z_BINARY}var static_init_done=false;function _tr_init(s){if(!static_init_done){tr_static_init();static_init_done=true}s.l_desc=new TreeDesc(s.dyn_ltree,static_l_desc);s.d_desc=new TreeDesc(s.dyn_dtree,static_d_desc);s.bl_desc=new TreeDesc(s.bl_tree,static_bl_desc);s.bi_buf=0;s.bi_valid=0;init_block(s)}function _tr_stored_block(s,buf,stored_len,last){send_bits(s,(STORED_BLOCK<<1)+(last?1:0),3);copy_block(s,buf,stored_len,true)}function _tr_align(s){send_bits(s,STATIC_TREES<<1,3);send_code(s,END_BLOCK,static_ltree);bi_flush(s)}function _tr_flush_block(s,buf,stored_len,last){var opt_lenb,static_lenb;var max_blindex=0;if(s.level>0){if(s.strm.data_type===Z_UNKNOWN){s.strm.data_type=detect_data_type(s)}build_tree(s,s.l_desc);build_tree(s,s.d_desc);max_blindex=build_bl_tree(s);opt_lenb=s.opt_len+3+7>>>3;static_lenb=s.static_len+3+7>>>3;if(static_lenb<=opt_lenb){opt_lenb=static_lenb}}else{opt_lenb=static_lenb=stored_len+5}if(stored_len+4<=opt_lenb&&buf!==-1){_tr_stored_block(s,buf,stored_len,last)}else if(s.strategy===Z_FIXED||static_lenb===opt_lenb){send_bits(s,(STATIC_TREES<<1)+(last?1:0),3);compress_block(s,static_ltree,static_dtree)}else{send_bits(s,(DYN_TREES<<1)+(last?1:0),3);send_all_trees(s,s.l_desc.max_code+1,s.d_desc.max_code+1,max_blindex+1);compress_block(s,s.dyn_ltree,s.dyn_dtree)}init_block(s);if(last){bi_windup(s)}}function _tr_tally(s,dist,lc){s.pending_buf[s.d_buf+s.last_lit*2]=dist>>>8&255;s.pending_buf[s.d_buf+s.last_lit*2+1]=dist&255;s.pending_buf[s.l_buf+s.last_lit]=lc&255;s.last_lit++;if(dist===0){s.dyn_ltree[lc*2]++}else{s.matches++;dist--;s.dyn_ltree[(_length_code[lc]+LITERALS+1)*2]++;s.dyn_dtree[d_code(dist)*2]++}return s.last_lit===s.lit_bufsize-1}exports._tr_init=_tr_init;exports._tr_stored_block=_tr_stored_block;exports._tr_flush_block=_tr_flush_block;exports._tr_tally=_tr_tally;exports._tr_align=_tr_align},{"../utils/common":38}],50:[function(require,module,exports){"use strict";function ZStream(){this.input=null;this.next_in=0;this.avail_in=0;this.total_in=0;this.output=null;this.next_out=0;this.avail_out=0;this.total_out=0;this.msg="";this.state=null;this.data_type=2;this.adler=0}module.exports=ZStream},{}],"/js/docxgen.js":[function(require,module,exports){var DocUtils,DocxGen;DocUtils=require("./docUtils");DocxGen=DocxGen=function(){function DocxGen(content,options){this.moduleManager=new DocxGen.ModuleManager;this.moduleManager.gen=this;this.templateClass=this.getTemplateClass();this.setOptions({});if(content!=null){this.load(content,options)}}DocxGen.prototype.attachModule=function(module){this.moduleManager.attachModule(module);return this};DocxGen.prototype.setOptions=function(options1){var defaultValue,key,ref;this.options=options1!=null?options1:{};ref=DocUtils.defaults;for(key in ref){defaultValue=ref[key];this[key]=this.options[key]!=null?this.options[key]:defaultValue}return this};DocxGen.prototype.getTemplateClass=function(){return DocxGen.DocXTemplater};DocxGen.prototype.getTemplatedFiles=function(){var slideTemplates;slideTemplates=this.zip.file(/word\/(header|footer)\d+\.xml/).map(function(file){return file.name});return slideTemplates.concat(["word/document.xml"])};DocxGen.prototype.load=function(content,options){this.moduleManager.sendEvent("loading");if(content.file!=null){this.zip=content}else{this.zip=new DocxGen.JSZip(content,options)}this.moduleManager.sendEvent("loaded");this.templatedFiles=this.getTemplatedFiles();return this};DocxGen.prototype.renderFile=function(fileName){var currentFile;this.moduleManager.sendEvent("rendering-file",fileName);currentFile=this.createTemplateClass(fileName);this.zip.file(fileName,currentFile.render().content);return this.moduleManager.sendEvent("rendered-file",fileName)};DocxGen.prototype.render=function(){var fileName,i,len,ref;this.moduleManager.sendEvent("rendering");ref=this.templatedFiles;for(i=0,len=ref.length;i<len;i++){fileName=ref[i];if(this.zip.files[fileName]!=null){this.renderFile(fileName)}}this.moduleManager.sendEvent("rendered");return this};DocxGen.prototype.getTags=function(){var currentFile,fileName,i,len,ref,usedTags,usedTemplateV;usedTags=[];ref=this.templatedFiles;for(i=0,len=ref.length;i<len;i++){fileName=ref[i];if(!(this.zip.files[fileName]!=null)){continue}currentFile=this.createTemplateClass(fileName);usedTemplateV=currentFile.render().usedTags;if(DocUtils.sizeOfObject(usedTemplateV)){usedTags.push({fileName:fileName,vars:usedTemplateV})}}return usedTags};DocxGen.prototype.setData=function(tags){this.tags=tags;return this};DocxGen.prototype.getZip=function(){return this.zip};DocxGen.prototype.createTemplateClass=function(path){var _,key,obj,ref,usedData;usedData=this.zip.files[path].asText();obj={tags:this.tags,moduleManager:this.moduleManager};ref=DocUtils.defaults;for(key in ref){_=ref[key];obj[key]=this[key]}return new this.templateClass(usedData,obj)};DocxGen.prototype.getFullText=function(path){if(path==null){path="word/document.xml"}return this.createTemplateClass(path).getFullText()};return DocxGen}();DocxGen.DocUtils=require("./docUtils");DocxGen.DocXTemplater=require("./docxTemplater");DocxGen.JSZip=require("jszip");DocxGen.ModuleManager=require("./moduleManager");DocxGen.XmlTemplater=require("./xmlTemplater");DocxGen.XmlMatcher=require("./xmlMatcher");DocxGen.XmlUtil=require("./xmlUtil");DocxGen.SubContent=require("./subContent");module.exports=DocxGen},{"./docUtils":3,"./docxTemplater":4,"./moduleManager":5,"./subContent":7,"./xmlMatcher":9,"./xmlTemplater":10,"./xmlUtil":11,jszip:20}],51:[function(require,module,exports){(function(global){"use strict";var base64=require("base64-js");var ieee754=require("ieee754");var isArray=require("isarray");exports.Buffer=Buffer;exports.SlowBuffer=SlowBuffer;exports.INSPECT_MAX_BYTES=50;Buffer.poolSize=8192;var rootParent={};Buffer.TYPED_ARRAY_SUPPORT=global.TYPED_ARRAY_SUPPORT!==undefined?global.TYPED_ARRAY_SUPPORT:typedArraySupport();function typedArraySupport(){try{var arr=new Uint8Array(1);arr.foo=function(){return 42};return arr.foo()===42&&typeof arr.subarray==="function"&&arr.subarray(1,1).byteLength===0}catch(e){return false}}function kMaxLength(){return Buffer.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function Buffer(arg){if(!(this instanceof Buffer)){if(arguments.length>1)return new Buffer(arg,arguments[1]);return new Buffer(arg)}if(!Buffer.TYPED_ARRAY_SUPPORT){this.length=0;this.parent=undefined}if(typeof arg==="number"){return fromNumber(this,arg)}if(typeof arg==="string"){return fromString(this,arg,arguments.length>1?arguments[1]:"utf8")}return fromObject(this,arg)}Buffer._augment=function(arr){arr.__proto__=Buffer.prototype;return arr};function fromNumber(that,length){that=allocate(that,length<0?0:checked(length)|0);if(!Buffer.TYPED_ARRAY_SUPPORT){for(var i=0;i<length;i++){that[i]=0}}return that}function fromString(that,string,encoding){if(typeof encoding!=="string"||encoding==="")encoding="utf8";var length=byteLength(string,encoding)|0;that=allocate(that,length);that.write(string,encoding);return that}function fromObject(that,object){if(Buffer.isBuffer(object))return fromBuffer(that,object);if(isArray(object))return fromArray(that,object);if(object==null){throw new TypeError("must start with number, buffer, array or string")}if(typeof ArrayBuffer!=="undefined"){if(object.buffer instanceof ArrayBuffer){return fromTypedArray(that,object)}if(object instanceof ArrayBuffer){return fromArrayBuffer(that,object)}}if(object.length)return fromArrayLike(that,object);return fromJsonObject(that,object)}function fromBuffer(that,buffer){var length=checked(buffer.length)|0;that=allocate(that,length);buffer.copy(that,0,0,length);return that}function fromArray(that,array){var length=checked(array.length)|0;that=allocate(that,length);for(var i=0;i<length;i+=1){that[i]=array[i]&255}return that}function fromTypedArray(that,array){var length=checked(array.length)|0;that=allocate(that,length);for(var i=0;i<length;i+=1){that[i]=array[i]&255}return that}function fromArrayBuffer(that,array){array.byteLength;if(Buffer.TYPED_ARRAY_SUPPORT){that=new Uint8Array(array);that.__proto__=Buffer.prototype}else{that=fromTypedArray(that,new Uint8Array(array))}return that}function fromArrayLike(that,array){var length=checked(array.length)|0;that=allocate(that,length);for(var i=0;i<length;i+=1){that[i]=array[i]&255}return that}function fromJsonObject(that,object){var array;var length=0;if(object.type==="Buffer"&&isArray(object.data)){array=object.data;length=checked(array.length)|0}that=allocate(that,length);for(var i=0;i<length;i+=1){that[i]=array[i]&255}return that}if(Buffer.TYPED_ARRAY_SUPPORT){Buffer.prototype.__proto__=Uint8Array.prototype;Buffer.__proto__=Uint8Array;if(typeof Symbol!=="undefined"&&Symbol.species&&Buffer[Symbol.species]===Buffer){Object.defineProperty(Buffer,Symbol.species,{value:null,configurable:true})}}else{Buffer.prototype.length=undefined;Buffer.prototype.parent=undefined}function allocate(that,length){if(Buffer.TYPED_ARRAY_SUPPORT){that=new Uint8Array(length);that.__proto__=Buffer.prototype}else{that.length=length}var fromPool=length!==0&&length<=Buffer.poolSize>>>1;if(fromPool)that.parent=rootParent;return that}function checked(length){if(length>=kMaxLength()){throw new RangeError("Attempt to allocate Buffer larger than maximum "+"size: 0x"+kMaxLength().toString(16)+" bytes")}return length|0}function SlowBuffer(subject,encoding){if(!(this instanceof SlowBuffer))return new SlowBuffer(subject,encoding);var buf=new Buffer(subject,encoding);delete buf.parent;return buf}Buffer.isBuffer=function isBuffer(b){return!!(b!=null&&b._isBuffer)};Buffer.compare=function compare(a,b){if(!Buffer.isBuffer(a)||!Buffer.isBuffer(b)){throw new TypeError("Arguments must be Buffers")}if(a===b)return 0;var x=a.length;var y=b.length;var i=0;var len=Math.min(x,y);while(i<len){if(a[i]!==b[i])break;++i}if(i!==len){x=a[i];y=b[i]}if(x<y)return-1;if(y<x)return 1;return 0};Buffer.isEncoding=function isEncoding(encoding){switch(String(encoding).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"raw":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return true;default:return false}};Buffer.concat=function concat(list,length){if(!isArray(list))throw new TypeError("list argument must be an Array of Buffers.");if(list.length===0){return new Buffer(0)}var i;if(length===undefined){length=0;for(i=0;i<list.length;i++){length+=list[i].length}}var buf=new Buffer(length);var pos=0;for(i=0;i<list.length;i++){var item=list[i];item.copy(buf,pos);pos+=item.length}return buf};function byteLength(string,encoding){if(typeof string!=="string")string=""+string;var len=string.length;if(len===0)return 0;var loweredCase=false;for(;;){switch(encoding){case"ascii":case"binary":case"raw":case"raws":return len;case"utf8":case"utf-8":return utf8ToBytes(string).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return len*2;case"hex":return len>>>1;case"base64":return base64ToBytes(string).length;default:if(loweredCase)return utf8ToBytes(string).length;encoding=(""+encoding).toLowerCase();loweredCase=true}}}Buffer.byteLength=byteLength;function slowToString(encoding,start,end){var loweredCase=false;start=start|0;end=end===undefined||end===Infinity?this.length:end|0;if(!encoding)encoding="utf8";if(start<0)start=0;if(end>this.length)end=this.length;if(end<=start)return"";while(true){switch(encoding){case"hex":return hexSlice(this,start,end);case"utf8":case"utf-8":return utf8Slice(this,start,end);case"ascii":return asciiSlice(this,start,end);case"binary":return binarySlice(this,start,end);case"base64":return base64Slice(this,start,end);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return utf16leSlice(this,start,end);default:if(loweredCase)throw new TypeError("Unknown encoding: "+encoding);encoding=(encoding+"").toLowerCase();loweredCase=true}}}Buffer.prototype._isBuffer=true;Buffer.prototype.toString=function toString(){var length=this.length|0;if(length===0)return"";if(arguments.length===0)return utf8Slice(this,0,length);return slowToString.apply(this,arguments)};Buffer.prototype.equals=function equals(b){if(!Buffer.isBuffer(b))throw new TypeError("Argument must be a Buffer");if(this===b)return true;return Buffer.compare(this,b)===0};Buffer.prototype.inspect=function inspect(){var str="";var max=exports.INSPECT_MAX_BYTES;if(this.length>0){str=this.toString("hex",0,max).match(/.{2}/g).join(" ");if(this.length>max)str+=" ... "}return"<Buffer "+str+">"};Buffer.prototype.compare=function compare(b){if(!Buffer.isBuffer(b))throw new TypeError("Argument must be a Buffer");if(this===b)return 0;return Buffer.compare(this,b)};Buffer.prototype.indexOf=function indexOf(val,byteOffset){if(byteOffset>2147483647)byteOffset=2147483647;else if(byteOffset<-2147483648)byteOffset=-2147483648;byteOffset>>=0;if(this.length===0)return-1;if(byteOffset>=this.length)return-1;if(byteOffset<0)byteOffset=Math.max(this.length+byteOffset,0);if(typeof val==="string"){if(val.length===0)return-1;return String.prototype.indexOf.call(this,val,byteOffset)}if(Buffer.isBuffer(val)){return arrayIndexOf(this,val,byteOffset)}if(typeof val==="number"){if(Buffer.TYPED_ARRAY_SUPPORT&&Uint8Array.prototype.indexOf==="function"){return Uint8Array.prototype.indexOf.call(this,val,byteOffset)}return arrayIndexOf(this,[val],byteOffset)}function arrayIndexOf(arr,val,byteOffset){var foundIndex=-1;for(var i=0;byteOffset+i<arr.length;i++){if(arr[byteOffset+i]===val[foundIndex===-1?0:i-foundIndex]){if(foundIndex===-1)foundIndex=i;if(i-foundIndex+1===val.length)return byteOffset+foundIndex}else{foundIndex=-1}}return-1}throw new TypeError("val must be string, number or Buffer")};function hexWrite(buf,string,offset,length){offset=Number(offset)||0;var remaining=buf.length-offset;if(!length){length=remaining}else{length=Number(length);if(length>remaining){length=remaining}}var strLen=string.length;if(strLen%2!==0)throw new Error("Invalid hex string");if(length>strLen/2){length=strLen/2}for(var i=0;i<length;i++){var parsed=parseInt(string.substr(i*2,2),16);if(isNaN(parsed))throw new Error("Invalid hex string");buf[offset+i]=parsed}return i}function utf8Write(buf,string,offset,length){return blitBuffer(utf8ToBytes(string,buf.length-offset),buf,offset,length)}function asciiWrite(buf,string,offset,length){return blitBuffer(asciiToBytes(string),buf,offset,length)}function binaryWrite(buf,string,offset,length){return asciiWrite(buf,string,offset,length)}function base64Write(buf,string,offset,length){return blitBuffer(base64ToBytes(string),buf,offset,length)}function ucs2Write(buf,string,offset,length){return blitBuffer(utf16leToBytes(string,buf.length-offset),buf,offset,length)}Buffer.prototype.write=function write(string,offset,length,encoding){if(offset===undefined){encoding="utf8";length=this.length;offset=0}else if(length===undefined&&typeof offset==="string"){encoding=offset;length=this.length;offset=0}else if(isFinite(offset)){offset=offset|0;if(isFinite(length)){length=length|0;if(encoding===undefined)encoding="utf8"}else{encoding=length;length=undefined}}else{var swap=encoding;encoding=offset;offset=length|0;length=swap}var remaining=this.length-offset;if(length===undefined||length>remaining)length=remaining;if(string.length>0&&(length<0||offset<0)||offset>this.length){throw new RangeError("attempt to write outside buffer bounds")}if(!encoding)encoding="utf8";var loweredCase=false;for(;;){switch(encoding){case"hex":return hexWrite(this,string,offset,length);case"utf8":case"utf-8":return utf8Write(this,string,offset,length);case"ascii":return asciiWrite(this,string,offset,length);case"binary":return binaryWrite(this,string,offset,length);case"base64":return base64Write(this,string,offset,length);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return ucs2Write(this,string,offset,length);default:if(loweredCase)throw new TypeError("Unknown encoding: "+encoding);encoding=(""+encoding).toLowerCase();loweredCase=true}}};Buffer.prototype.toJSON=function toJSON(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function base64Slice(buf,start,end){
if(start===0&&end===buf.length){return base64.fromByteArray(buf)}else{return base64.fromByteArray(buf.slice(start,end))}}function utf8Slice(buf,start,end){end=Math.min(buf.length,end);var res=[];var i=start;while(i<end){var firstByte=buf[i];var codePoint=null;var bytesPerSequence=firstByte>239?4:firstByte>223?3:firstByte>191?2:1;if(i+bytesPerSequence<=end){var secondByte,thirdByte,fourthByte,tempCodePoint;switch(bytesPerSequence){case 1:if(firstByte<128){codePoint=firstByte}break;case 2:secondByte=buf[i+1];if((secondByte&192)===128){tempCodePoint=(firstByte&31)<<6|secondByte&63;if(tempCodePoint>127){codePoint=tempCodePoint}}break;case 3:secondByte=buf[i+1];thirdByte=buf[i+2];if((secondByte&192)===128&&(thirdByte&192)===128){tempCodePoint=(firstByte&15)<<12|(secondByte&63)<<6|thirdByte&63;if(tempCodePoint>2047&&(tempCodePoint<55296||tempCodePoint>57343)){codePoint=tempCodePoint}}break;case 4:secondByte=buf[i+1];thirdByte=buf[i+2];fourthByte=buf[i+3];if((secondByte&192)===128&&(thirdByte&192)===128&&(fourthByte&192)===128){tempCodePoint=(firstByte&15)<<18|(secondByte&63)<<12|(thirdByte&63)<<6|fourthByte&63;if(tempCodePoint>65535&&tempCodePoint<1114112){codePoint=tempCodePoint}}}}if(codePoint===null){codePoint=65533;bytesPerSequence=1}else if(codePoint>65535){codePoint-=65536;res.push(codePoint>>>10&1023|55296);codePoint=56320|codePoint&1023}res.push(codePoint);i+=bytesPerSequence}return decodeCodePointsArray(res)}var MAX_ARGUMENTS_LENGTH=4096;function decodeCodePointsArray(codePoints){var len=codePoints.length;if(len<=MAX_ARGUMENTS_LENGTH){return String.fromCharCode.apply(String,codePoints)}var res="";var i=0;while(i<len){res+=String.fromCharCode.apply(String,codePoints.slice(i,i+=MAX_ARGUMENTS_LENGTH))}return res}function asciiSlice(buf,start,end){var ret="";end=Math.min(buf.length,end);for(var i=start;i<end;i++){ret+=String.fromCharCode(buf[i]&127)}return ret}function binarySlice(buf,start,end){var ret="";end=Math.min(buf.length,end);for(var i=start;i<end;i++){ret+=String.fromCharCode(buf[i])}return ret}function hexSlice(buf,start,end){var len=buf.length;if(!start||start<0)start=0;if(!end||end<0||end>len)end=len;var out="";for(var i=start;i<end;i++){out+=toHex(buf[i])}return out}function utf16leSlice(buf,start,end){var bytes=buf.slice(start,end);var res="";for(var i=0;i<bytes.length;i+=2){res+=String.fromCharCode(bytes[i]+bytes[i+1]*256)}return res}Buffer.prototype.slice=function slice(start,end){var len=this.length;start=~~start;end=end===undefined?len:~~end;if(start<0){start+=len;if(start<0)start=0}else if(start>len){start=len}if(end<0){end+=len;if(end<0)end=0}else if(end>len){end=len}if(end<start)end=start;var newBuf;if(Buffer.TYPED_ARRAY_SUPPORT){newBuf=this.subarray(start,end);newBuf.__proto__=Buffer.prototype}else{var sliceLen=end-start;newBuf=new Buffer(sliceLen,undefined);for(var i=0;i<sliceLen;i++){newBuf[i]=this[i+start]}}if(newBuf.length)newBuf.parent=this.parent||this;return newBuf};function checkOffset(offset,ext,length){if(offset%1!==0||offset<0)throw new RangeError("offset is not uint");if(offset+ext>length)throw new RangeError("Trying to access beyond buffer length")}Buffer.prototype.readUIntLE=function readUIntLE(offset,byteLength,noAssert){offset=offset|0;byteLength=byteLength|0;if(!noAssert)checkOffset(offset,byteLength,this.length);var val=this[offset];var mul=1;var i=0;while(++i<byteLength&&(mul*=256)){val+=this[offset+i]*mul}return val};Buffer.prototype.readUIntBE=function readUIntBE(offset,byteLength,noAssert){offset=offset|0;byteLength=byteLength|0;if(!noAssert){checkOffset(offset,byteLength,this.length)}var val=this[offset+--byteLength];var mul=1;while(byteLength>0&&(mul*=256)){val+=this[offset+--byteLength]*mul}return val};Buffer.prototype.readUInt8=function readUInt8(offset,noAssert){if(!noAssert)checkOffset(offset,1,this.length);return this[offset]};Buffer.prototype.readUInt16LE=function readUInt16LE(offset,noAssert){if(!noAssert)checkOffset(offset,2,this.length);return this[offset]|this[offset+1]<<8};Buffer.prototype.readUInt16BE=function readUInt16BE(offset,noAssert){if(!noAssert)checkOffset(offset,2,this.length);return this[offset]<<8|this[offset+1]};Buffer.prototype.readUInt32LE=function readUInt32LE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length);return(this[offset]|this[offset+1]<<8|this[offset+2]<<16)+this[offset+3]*16777216};Buffer.prototype.readUInt32BE=function readUInt32BE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length);return this[offset]*16777216+(this[offset+1]<<16|this[offset+2]<<8|this[offset+3])};Buffer.prototype.readIntLE=function readIntLE(offset,byteLength,noAssert){offset=offset|0;byteLength=byteLength|0;if(!noAssert)checkOffset(offset,byteLength,this.length);var val=this[offset];var mul=1;var i=0;while(++i<byteLength&&(mul*=256)){val+=this[offset+i]*mul}mul*=128;if(val>=mul)val-=Math.pow(2,8*byteLength);return val};Buffer.prototype.readIntBE=function readIntBE(offset,byteLength,noAssert){offset=offset|0;byteLength=byteLength|0;if(!noAssert)checkOffset(offset,byteLength,this.length);var i=byteLength;var mul=1;var val=this[offset+--i];while(i>0&&(mul*=256)){val+=this[offset+--i]*mul}mul*=128;if(val>=mul)val-=Math.pow(2,8*byteLength);return val};Buffer.prototype.readInt8=function readInt8(offset,noAssert){if(!noAssert)checkOffset(offset,1,this.length);if(!(this[offset]&128))return this[offset];return(255-this[offset]+1)*-1};Buffer.prototype.readInt16LE=function readInt16LE(offset,noAssert){if(!noAssert)checkOffset(offset,2,this.length);var val=this[offset]|this[offset+1]<<8;return val&32768?val|4294901760:val};Buffer.prototype.readInt16BE=function readInt16BE(offset,noAssert){if(!noAssert)checkOffset(offset,2,this.length);var val=this[offset+1]|this[offset]<<8;return val&32768?val|4294901760:val};Buffer.prototype.readInt32LE=function readInt32LE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length);return this[offset]|this[offset+1]<<8|this[offset+2]<<16|this[offset+3]<<24};Buffer.prototype.readInt32BE=function readInt32BE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length);return this[offset]<<24|this[offset+1]<<16|this[offset+2]<<8|this[offset+3]};Buffer.prototype.readFloatLE=function readFloatLE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length);return ieee754.read(this,offset,true,23,4)};Buffer.prototype.readFloatBE=function readFloatBE(offset,noAssert){if(!noAssert)checkOffset(offset,4,this.length);return ieee754.read(this,offset,false,23,4)};Buffer.prototype.readDoubleLE=function readDoubleLE(offset,noAssert){if(!noAssert)checkOffset(offset,8,this.length);return ieee754.read(this,offset,true,52,8)};Buffer.prototype.readDoubleBE=function readDoubleBE(offset,noAssert){if(!noAssert)checkOffset(offset,8,this.length);return ieee754.read(this,offset,false,52,8)};function checkInt(buf,value,offset,ext,max,min){if(!Buffer.isBuffer(buf))throw new TypeError("buffer must be a Buffer instance");if(value>max||value<min)throw new RangeError("value is out of bounds");if(offset+ext>buf.length)throw new RangeError("index out of range")}Buffer.prototype.writeUIntLE=function writeUIntLE(value,offset,byteLength,noAssert){value=+value;offset=offset|0;byteLength=byteLength|0;if(!noAssert)checkInt(this,value,offset,byteLength,Math.pow(2,8*byteLength),0);var mul=1;var i=0;this[offset]=value&255;while(++i<byteLength&&(mul*=256)){this[offset+i]=value/mul&255}return offset+byteLength};Buffer.prototype.writeUIntBE=function writeUIntBE(value,offset,byteLength,noAssert){value=+value;offset=offset|0;byteLength=byteLength|0;if(!noAssert)checkInt(this,value,offset,byteLength,Math.pow(2,8*byteLength),0);var i=byteLength-1;var mul=1;this[offset+i]=value&255;while(--i>=0&&(mul*=256)){this[offset+i]=value/mul&255}return offset+byteLength};Buffer.prototype.writeUInt8=function writeUInt8(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,1,255,0);if(!Buffer.TYPED_ARRAY_SUPPORT)value=Math.floor(value);this[offset]=value&255;return offset+1};function objectWriteUInt16(buf,value,offset,littleEndian){if(value<0)value=65535+value+1;for(var i=0,j=Math.min(buf.length-offset,2);i<j;i++){buf[offset+i]=(value&255<<8*(littleEndian?i:1-i))>>>(littleEndian?i:1-i)*8}}Buffer.prototype.writeUInt16LE=function writeUInt16LE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,2,65535,0);if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value&255;this[offset+1]=value>>>8}else{objectWriteUInt16(this,value,offset,true)}return offset+2};Buffer.prototype.writeUInt16BE=function writeUInt16BE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,2,65535,0);if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value>>>8;this[offset+1]=value&255}else{objectWriteUInt16(this,value,offset,false)}return offset+2};function objectWriteUInt32(buf,value,offset,littleEndian){if(value<0)value=4294967295+value+1;for(var i=0,j=Math.min(buf.length-offset,4);i<j;i++){buf[offset+i]=value>>>(littleEndian?i:3-i)*8&255}}Buffer.prototype.writeUInt32LE=function writeUInt32LE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,4,4294967295,0);if(Buffer.TYPED_ARRAY_SUPPORT){this[offset+3]=value>>>24;this[offset+2]=value>>>16;this[offset+1]=value>>>8;this[offset]=value&255}else{objectWriteUInt32(this,value,offset,true)}return offset+4};Buffer.prototype.writeUInt32BE=function writeUInt32BE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,4,4294967295,0);if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value>>>24;this[offset+1]=value>>>16;this[offset+2]=value>>>8;this[offset+3]=value&255}else{objectWriteUInt32(this,value,offset,false)}return offset+4};Buffer.prototype.writeIntLE=function writeIntLE(value,offset,byteLength,noAssert){value=+value;offset=offset|0;if(!noAssert){var limit=Math.pow(2,8*byteLength-1);checkInt(this,value,offset,byteLength,limit-1,-limit)}var i=0;var mul=1;var sub=value<0?1:0;this[offset]=value&255;while(++i<byteLength&&(mul*=256)){this[offset+i]=(value/mul>>0)-sub&255}return offset+byteLength};Buffer.prototype.writeIntBE=function writeIntBE(value,offset,byteLength,noAssert){value=+value;offset=offset|0;if(!noAssert){var limit=Math.pow(2,8*byteLength-1);checkInt(this,value,offset,byteLength,limit-1,-limit)}var i=byteLength-1;var mul=1;var sub=value<0?1:0;this[offset+i]=value&255;while(--i>=0&&(mul*=256)){this[offset+i]=(value/mul>>0)-sub&255}return offset+byteLength};Buffer.prototype.writeInt8=function writeInt8(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,1,127,-128);if(!Buffer.TYPED_ARRAY_SUPPORT)value=Math.floor(value);if(value<0)value=255+value+1;this[offset]=value&255;return offset+1};Buffer.prototype.writeInt16LE=function writeInt16LE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,2,32767,-32768);if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value&255;this[offset+1]=value>>>8}else{objectWriteUInt16(this,value,offset,true)}return offset+2};Buffer.prototype.writeInt16BE=function writeInt16BE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,2,32767,-32768);if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value>>>8;this[offset+1]=value&255}else{objectWriteUInt16(this,value,offset,false)}return offset+2};Buffer.prototype.writeInt32LE=function writeInt32LE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,4,2147483647,-2147483648);if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value&255;this[offset+1]=value>>>8;this[offset+2]=value>>>16;this[offset+3]=value>>>24}else{objectWriteUInt32(this,value,offset,true)}return offset+4};Buffer.prototype.writeInt32BE=function writeInt32BE(value,offset,noAssert){value=+value;offset=offset|0;if(!noAssert)checkInt(this,value,offset,4,2147483647,-2147483648);if(value<0)value=4294967295+value+1;if(Buffer.TYPED_ARRAY_SUPPORT){this[offset]=value>>>24;this[offset+1]=value>>>16;this[offset+2]=value>>>8;this[offset+3]=value&255}else{objectWriteUInt32(this,value,offset,false)}return offset+4};function checkIEEE754(buf,value,offset,ext,max,min){if(offset+ext>buf.length)throw new RangeError("index out of range");if(offset<0)throw new RangeError("index out of range")}function writeFloat(buf,value,offset,littleEndian,noAssert){if(!noAssert){checkIEEE754(buf,value,offset,4,3.4028234663852886e38,-3.4028234663852886e38)}ieee754.write(buf,value,offset,littleEndian,23,4);return offset+4}Buffer.prototype.writeFloatLE=function writeFloatLE(value,offset,noAssert){return writeFloat(this,value,offset,true,noAssert)};Buffer.prototype.writeFloatBE=function writeFloatBE(value,offset,noAssert){return writeFloat(this,value,offset,false,noAssert)};function writeDouble(buf,value,offset,littleEndian,noAssert){if(!noAssert){checkIEEE754(buf,value,offset,8,1.7976931348623157e308,-1.7976931348623157e308)}ieee754.write(buf,value,offset,littleEndian,52,8);return offset+8}Buffer.prototype.writeDoubleLE=function writeDoubleLE(value,offset,noAssert){return writeDouble(this,value,offset,true,noAssert)};Buffer.prototype.writeDoubleBE=function writeDoubleBE(value,offset,noAssert){return writeDouble(this,value,offset,false,noAssert)};Buffer.prototype.copy=function copy(target,targetStart,start,end){if(!start)start=0;if(!end&&end!==0)end=this.length;if(targetStart>=target.length)targetStart=target.length;if(!targetStart)targetStart=0;if(end>0&&end<start)end=start;if(end===start)return 0;if(target.length===0||this.length===0)return 0;if(targetStart<0){throw new RangeError("targetStart out of bounds")}if(start<0||start>=this.length)throw new RangeError("sourceStart out of bounds");if(end<0)throw new RangeError("sourceEnd out of bounds");if(end>this.length)end=this.length;if(target.length-targetStart<end-start){end=target.length-targetStart+start}var len=end-start;var i;if(this===target&&start<targetStart&&targetStart<end){for(i=len-1;i>=0;i--){target[i+targetStart]=this[i+start]}}else if(len<1e3||!Buffer.TYPED_ARRAY_SUPPORT){for(i=0;i<len;i++){target[i+targetStart]=this[i+start]}}else{Uint8Array.prototype.set.call(target,this.subarray(start,start+len),targetStart)}return len};Buffer.prototype.fill=function fill(value,start,end){if(!value)value=0;if(!start)start=0;if(!end)end=this.length;if(end<start)throw new RangeError("end < start");if(end===start)return;if(this.length===0)return;if(start<0||start>=this.length)throw new RangeError("start out of bounds");if(end<0||end>this.length)throw new RangeError("end out of bounds");var i;if(typeof value==="number"){for(i=start;i<end;i++){this[i]=value}}else{var bytes=utf8ToBytes(value.toString());var len=bytes.length;for(i=start;i<end;i++){this[i]=bytes[i%len]}}return this};var INVALID_BASE64_RE=/[^+\/0-9A-Za-z-_]/g;function base64clean(str){str=stringtrim(str).replace(INVALID_BASE64_RE,"");if(str.length<2)return"";while(str.length%4!==0){str=str+"="}return str}function stringtrim(str){if(str.trim)return str.trim();return str.replace(/^\s+|\s+$/g,"")}function toHex(n){if(n<16)return"0"+n.toString(16);return n.toString(16)}function utf8ToBytes(string,units){units=units||Infinity;var codePoint;var length=string.length;var leadSurrogate=null;var bytes=[];for(var i=0;i<length;i++){codePoint=string.charCodeAt(i);if(codePoint>55295&&codePoint<57344){if(!leadSurrogate){if(codePoint>56319){if((units-=3)>-1)bytes.push(239,191,189);continue}else if(i+1===length){if((units-=3)>-1)bytes.push(239,191,189);continue}leadSurrogate=codePoint;continue}if(codePoint<56320){if((units-=3)>-1)bytes.push(239,191,189);leadSurrogate=codePoint;continue}codePoint=(leadSurrogate-55296<<10|codePoint-56320)+65536}else if(leadSurrogate){if((units-=3)>-1)bytes.push(239,191,189)}leadSurrogate=null;if(codePoint<128){if((units-=1)<0)break;bytes.push(codePoint)}else if(codePoint<2048){if((units-=2)<0)break;bytes.push(codePoint>>6|192,codePoint&63|128)}else if(codePoint<65536){if((units-=3)<0)break;bytes.push(codePoint>>12|224,codePoint>>6&63|128,codePoint&63|128)}else if(codePoint<1114112){if((units-=4)<0)break;bytes.push(codePoint>>18|240,codePoint>>12&63|128,codePoint>>6&63|128,codePoint&63|128)}else{throw new Error("Invalid code point")}}return bytes}function asciiToBytes(str){var byteArray=[];for(var i=0;i<str.length;i++){byteArray.push(str.charCodeAt(i)&255)}return byteArray}function utf16leToBytes(str,units){var c,hi,lo;var byteArray=[];for(var i=0;i<str.length;i++){if((units-=2)<0)break;c=str.charCodeAt(i);hi=c>>8;lo=c%256;byteArray.push(lo);byteArray.push(hi)}return byteArray}function base64ToBytes(str){return base64.toByteArray(base64clean(str))}function blitBuffer(src,dst,offset,length){for(var i=0;i<length;i++){if(i+offset>=dst.length||i>=src.length)break;dst[i+offset]=src[i]}return i}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"base64-js":52,ieee754:53,isarray:54}],52:[function(require,module,exports){(function(exports){"use strict";var i;var code="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";var lookup=[];for(i=0;i<code.length;i++){lookup[i]=code[i]}var revLookup=[];for(i=0;i<code.length;++i){revLookup[code.charCodeAt(i)]=i}revLookup["-".charCodeAt(0)]=62;revLookup["_".charCodeAt(0)]=63;var Arr=typeof Uint8Array!=="undefined"?Uint8Array:Array;function decode(elt){var v=revLookup[elt.charCodeAt(0)];return v!==undefined?v:-1}function b64ToByteArray(b64){var i,j,l,tmp,placeHolders,arr;if(b64.length%4>0){throw new Error("Invalid string. Length must be a multiple of 4")}var len=b64.length;placeHolders=b64.charAt(len-2)==="="?2:b64.charAt(len-1)==="="?1:0;arr=new Arr(b64.length*3/4-placeHolders);l=placeHolders>0?b64.length-4:b64.length;var L=0;function push(v){arr[L++]=v}for(i=0,j=0;i<l;i+=4,j+=3){tmp=decode(b64.charAt(i))<<18|decode(b64.charAt(i+1))<<12|decode(b64.charAt(i+2))<<6|decode(b64.charAt(i+3));push((tmp&16711680)>>16);push((tmp&65280)>>8);push(tmp&255)}if(placeHolders===2){tmp=decode(b64.charAt(i))<<2|decode(b64.charAt(i+1))>>4;push(tmp&255)}else if(placeHolders===1){tmp=decode(b64.charAt(i))<<10|decode(b64.charAt(i+1))<<4|decode(b64.charAt(i+2))>>2;push(tmp>>8&255);push(tmp&255)}return arr}function encode(num){return lookup[num]}function tripletToBase64(num){return encode(num>>18&63)+encode(num>>12&63)+encode(num>>6&63)+encode(num&63)}function encodeChunk(uint8,start,end){var temp;var output=[];for(var i=start;i<end;i+=3){temp=(uint8[i]<<16)+(uint8[i+1]<<8)+uint8[i+2];output.push(tripletToBase64(temp))}return output.join("")}function uint8ToBase64(uint8){var i;var extraBytes=uint8.length%3;var output="";var parts=[];var temp,length;var maxChunkLength=16383;for(i=0,length=uint8.length-extraBytes;i<length;i+=maxChunkLength){parts.push(encodeChunk(uint8,i,i+maxChunkLength>length?length:i+maxChunkLength))}switch(extraBytes){case 1:temp=uint8[uint8.length-1];output+=encode(temp>>2);output+=encode(temp<<4&63);output+="==";break;case 2:temp=(uint8[uint8.length-2]<<8)+uint8[uint8.length-1];output+=encode(temp>>10);output+=encode(temp>>4&63);output+=encode(temp<<2&63);output+="=";break;default:break}parts.push(output);return parts.join("")}exports.toByteArray=b64ToByteArray;exports.fromByteArray=uint8ToBase64})(typeof exports==="undefined"?this.base64js={}:exports)},{}],53:[function(require,module,exports){exports.read=function(buffer,offset,isLE,mLen,nBytes){var e,m;var eLen=nBytes*8-mLen-1;var eMax=(1<<eLen)-1;var eBias=eMax>>1;var nBits=-7;var i=isLE?nBytes-1:0;var d=isLE?-1:1;var s=buffer[offset+i];i+=d;e=s&(1<<-nBits)-1;s>>=-nBits;nBits+=eLen;for(;nBits>0;e=e*256+buffer[offset+i],i+=d,nBits-=8){}m=e&(1<<-nBits)-1;e>>=-nBits;nBits+=mLen;for(;nBits>0;m=m*256+buffer[offset+i],i+=d,nBits-=8){}if(e===0){e=1-eBias}else if(e===eMax){return m?NaN:(s?-1:1)*Infinity}else{m=m+Math.pow(2,mLen);e=e-eBias}return(s?-1:1)*m*Math.pow(2,e-mLen)};exports.write=function(buffer,value,offset,isLE,mLen,nBytes){var e,m,c;var eLen=nBytes*8-mLen-1;var eMax=(1<<eLen)-1;var eBias=eMax>>1;var rt=mLen===23?Math.pow(2,-24)-Math.pow(2,-77):0;var i=isLE?0:nBytes-1;var d=isLE?1:-1;var s=value<0||value===0&&1/value<0?1:0;value=Math.abs(value);if(isNaN(value)||value===Infinity){m=isNaN(value)?1:0;e=eMax}else{e=Math.floor(Math.log(value)/Math.LN2);if(value*(c=Math.pow(2,-e))<1){e--;c*=2}if(e+eBias>=1){value+=rt/c}else{value+=rt*Math.pow(2,1-eBias)}if(value*c>=2){e++;c/=2}if(e+eBias>=eMax){m=0;e=eMax}else if(e+eBias>=1){m=(value*c-1)*Math.pow(2,mLen);e=e+eBias}else{m=value*Math.pow(2,eBias-1)*Math.pow(2,mLen);e=0}}for(;mLen>=8;buffer[offset+i]=m&255,i+=d,m/=256,mLen-=8){}e=e<<mLen|m;eLen+=mLen;for(;eLen>0;buffer[offset+i]=e&255,i+=d,e/=256,eLen-=8){}buffer[offset+i-d]|=s*128}},{}],54:[function(require,module,exports){var toString={}.toString;module.exports=Array.isArray||function(arr){return toString.call(arr)=="[object Array]"}},{}]},{},[])("/js/docxgen.js")});
;
/*!

JSZip - A Javascript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2014 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/master/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/master/LICENSE
*/
!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;"undefined"!=typeof window?b=window:"undefined"!=typeof global?b=global:"undefined"!=typeof self&&(b=self),b.JSZip=a()}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);throw new Error("Cannot find module '"+g+"'")}var j=c[g]={exports:{}};b[g][0].call(j.exports,function(a){var c=b[g][1][a];return e(c?c:a)},j,j.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){"use strict";var d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";c.encode=function(a){for(var b,c,e,f,g,h,i,j="",k=0;k<a.length;)b=a.charCodeAt(k++),c=a.charCodeAt(k++),e=a.charCodeAt(k++),f=b>>2,g=(3&b)<<4|c>>4,h=(15&c)<<2|e>>6,i=63&e,isNaN(c)?h=i=64:isNaN(e)&&(i=64),j=j+d.charAt(f)+d.charAt(g)+d.charAt(h)+d.charAt(i);return j},c.decode=function(a){var b,c,e,f,g,h,i,j="",k=0;for(a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");k<a.length;)f=d.indexOf(a.charAt(k++)),g=d.indexOf(a.charAt(k++)),h=d.indexOf(a.charAt(k++)),i=d.indexOf(a.charAt(k++)),b=f<<2|g>>4,c=(15&g)<<4|h>>2,e=(3&h)<<6|i,j+=String.fromCharCode(b),64!=h&&(j+=String.fromCharCode(c)),64!=i&&(j+=String.fromCharCode(e));return j}},{}],2:[function(a,b){"use strict";function c(){this.compressedSize=0,this.uncompressedSize=0,this.crc32=0,this.compressionMethod=null,this.compressedContent=null}c.prototype={getContent:function(){return null},getCompressedContent:function(){return null}},b.exports=c},{}],3:[function(a,b,c){"use strict";c.STORE={magic:"\x00\x00",compress:function(a){return a},uncompress:function(a){return a},compressInputType:null,uncompressInputType:null},c.DEFLATE=a("./flate")},{"./flate":8}],4:[function(a,b){"use strict";var c=a("./utils"),d=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918e3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117];b.exports=function(a,b){if("undefined"==typeof a||!a.length)return 0;var e="string"!==c.getTypeOf(a);"undefined"==typeof b&&(b=0);var f=0,g=0,h=0;b=-1^b;for(var i=0,j=a.length;j>i;i++)h=e?a[i]:a.charCodeAt(i),g=255&(b^h),f=d[g],b=b>>>8^f;return-1^b}},{"./utils":21}],5:[function(a,b){"use strict";function c(){this.data=null,this.length=0,this.index=0}var d=a("./utils");c.prototype={checkOffset:function(a){this.checkIndex(this.index+a)},checkIndex:function(a){if(this.length<a||0>a)throw new Error("End of data reached (data length = "+this.length+", asked index = "+a+"). Corrupted zip ?")},setIndex:function(a){this.checkIndex(a),this.index=a},skip:function(a){this.setIndex(this.index+a)},byteAt:function(){},readInt:function(a){var b,c=0;for(this.checkOffset(a),b=this.index+a-1;b>=this.index;b--)c=(c<<8)+this.byteAt(b);return this.index+=a,c},readString:function(a){return d.transformTo("string",this.readData(a))},readData:function(){},lastIndexOfSignature:function(){},readDate:function(){var a=this.readInt(4);return new Date((a>>25&127)+1980,(a>>21&15)-1,a>>16&31,a>>11&31,a>>5&63,(31&a)<<1)}},b.exports=c},{"./utils":21}],6:[function(a,b,c){"use strict";c.base64=!1,c.binary=!1,c.dir=!1,c.createFolders=!1,c.date=null,c.compression=null,c.compressionOptions=null,c.comment=null,c.unixPermissions=null,c.dosPermissions=null},{}],7:[function(a,b,c){"use strict";var d=a("./utils");c.string2binary=function(a){return d.string2binary(a)},c.string2Uint8Array=function(a){return d.transformTo("uint8array",a)},c.uint8Array2String=function(a){return d.transformTo("string",a)},c.string2Blob=function(a){var b=d.transformTo("arraybuffer",a);return d.arrayBuffer2Blob(b)},c.arrayBuffer2Blob=function(a){return d.arrayBuffer2Blob(a)},c.transformTo=function(a,b){return d.transformTo(a,b)},c.getTypeOf=function(a){return d.getTypeOf(a)},c.checkSupport=function(a){return d.checkSupport(a)},c.MAX_VALUE_16BITS=d.MAX_VALUE_16BITS,c.MAX_VALUE_32BITS=d.MAX_VALUE_32BITS,c.pretty=function(a){return d.pretty(a)},c.findCompression=function(a){return d.findCompression(a)},c.isRegExp=function(a){return d.isRegExp(a)}},{"./utils":21}],8:[function(a,b,c){"use strict";var d="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,e=a("pako");c.uncompressInputType=d?"uint8array":"array",c.compressInputType=d?"uint8array":"array",c.magic="\b\x00",c.compress=function(a,b){return e.deflateRaw(a,{level:b.level||-1})},c.uncompress=function(a){return e.inflateRaw(a)}},{pako:24}],9:[function(a,b){"use strict";function c(a,b){return this instanceof c?(this.files={},this.comment=null,this.root="",a&&this.load(a,b),void(this.clone=function(){var a=new c;for(var b in this)"function"!=typeof this[b]&&(a[b]=this[b]);return a})):new c(a,b)}var d=a("./base64");c.prototype=a("./object"),c.prototype.load=a("./load"),c.support=a("./support"),c.defaults=a("./defaults"),c.utils=a("./deprecatedPublicUtils"),c.base64={encode:function(a){return d.encode(a)},decode:function(a){return d.decode(a)}},c.compressions=a("./compressions"),b.exports=c},{"./base64":1,"./compressions":3,"./defaults":6,"./deprecatedPublicUtils":7,"./load":10,"./object":13,"./support":17}],10:[function(a,b){"use strict";var c=a("./base64"),d=a("./zipEntries");b.exports=function(a,b){var e,f,g,h;for(b=b||{},b.base64&&(a=c.decode(a)),f=new d(a,b),e=f.files,g=0;g<e.length;g++)h=e[g],this.file(h.fileName,h.decompressed,{binary:!0,optimizedBinaryString:!0,date:h.date,dir:h.dir,comment:h.fileComment.length?h.fileComment:null,unixPermissions:h.unixPermissions,dosPermissions:h.dosPermissions,createFolders:b.createFolders});return f.zipComment.length&&(this.comment=f.zipComment),this}},{"./base64":1,"./zipEntries":22}],11:[function(a,b){(function(a){"use strict";b.exports=function(b,c){return new a(b,c)},b.exports.test=function(b){return a.isBuffer(b)}}).call(this,"undefined"!=typeof Buffer?Buffer:void 0)},{}],12:[function(a,b){"use strict";function c(a){this.data=a,this.length=this.data.length,this.index=0}var d=a("./uint8ArrayReader");c.prototype=new d,c.prototype.readData=function(a){this.checkOffset(a);var b=this.data.slice(this.index,this.index+a);return this.index+=a,b},b.exports=c},{"./uint8ArrayReader":18}],13:[function(a,b){"use strict";var c=a("./support"),d=a("./utils"),e=a("./crc32"),f=a("./signature"),g=a("./defaults"),h=a("./base64"),i=a("./compressions"),j=a("./compressedObject"),k=a("./nodeBuffer"),l=a("./utf8"),m=a("./stringWriter"),n=a("./uint8ArrayWriter"),o=function(a){if(a._data instanceof j&&(a._data=a._data.getContent(),a.options.binary=!0,a.options.base64=!1,"uint8array"===d.getTypeOf(a._data))){var b=a._data;a._data=new Uint8Array(b.length),0!==b.length&&a._data.set(b,0)}return a._data},p=function(a){var b=o(a),e=d.getTypeOf(b);return"string"===e?!a.options.binary&&c.nodebuffer?k(b,"utf-8"):a.asBinary():b},q=function(a){var b=o(this);return null===b||"undefined"==typeof b?"":(this.options.base64&&(b=h.decode(b)),b=a&&this.options.binary?D.utf8decode(b):d.transformTo("string",b),a||this.options.binary||(b=d.transformTo("string",D.utf8encode(b))),b)},r=function(a,b,c){this.name=a,this.dir=c.dir,this.date=c.date,this.comment=c.comment,this.unixPermissions=c.unixPermissions,this.dosPermissions=c.dosPermissions,this._data=b,this.options=c,this._initialMetadata={dir:c.dir,date:c.date}};r.prototype={asText:function(){return q.call(this,!0)},asBinary:function(){return q.call(this,!1)},asNodeBuffer:function(){var a=p(this);return d.transformTo("nodebuffer",a)},asUint8Array:function(){var a=p(this);return d.transformTo("uint8array",a)},asArrayBuffer:function(){return this.asUint8Array().buffer}};var s=function(a,b){var c,d="";for(c=0;b>c;c++)d+=String.fromCharCode(255&a),a>>>=8;return d},t=function(){var a,b,c={};for(a=0;a<arguments.length;a++)for(b in arguments[a])arguments[a].hasOwnProperty(b)&&"undefined"==typeof c[b]&&(c[b]=arguments[a][b]);return c},u=function(a){return a=a||{},a.base64!==!0||null!==a.binary&&void 0!==a.binary||(a.binary=!0),a=t(a,g),a.date=a.date||new Date,null!==a.compression&&(a.compression=a.compression.toUpperCase()),a},v=function(a,b,c){var e,f=d.getTypeOf(b);if(c=u(c),"string"==typeof c.unixPermissions&&(c.unixPermissions=parseInt(c.unixPermissions,8)),c.unixPermissions&&16384&c.unixPermissions&&(c.dir=!0),c.dosPermissions&&16&c.dosPermissions&&(c.dir=!0),c.dir&&(a=x(a)),c.createFolders&&(e=w(a))&&y.call(this,e,!0),c.dir||null===b||"undefined"==typeof b)c.base64=!1,c.binary=!1,b=null,f=null;else if("string"===f)c.binary&&!c.base64&&c.optimizedBinaryString!==!0&&(b=d.string2binary(b));else{if(c.base64=!1,c.binary=!0,!(f||b instanceof j))throw new Error("The data of '"+a+"' is in an unsupported format !");"arraybuffer"===f&&(b=d.transformTo("uint8array",b))}var g=new r(a,b,c);return this.files[a]=g,g},w=function(a){"/"==a.slice(-1)&&(a=a.substring(0,a.length-1));var b=a.lastIndexOf("/");return b>0?a.substring(0,b):""},x=function(a){return"/"!=a.slice(-1)&&(a+="/"),a},y=function(a,b){return b="undefined"!=typeof b?b:!1,a=x(a),this.files[a]||v.call(this,a,null,{dir:!0,createFolders:b}),this.files[a]},z=function(a,b,c){var f,g=new j;return a._data instanceof j?(g.uncompressedSize=a._data.uncompressedSize,g.crc32=a._data.crc32,0===g.uncompressedSize||a.dir?(b=i.STORE,g.compressedContent="",g.crc32=0):a._data.compressionMethod===b.magic?g.compressedContent=a._data.getCompressedContent():(f=a._data.getContent(),g.compressedContent=b.compress(d.transformTo(b.compressInputType,f),c))):(f=p(a),(!f||0===f.length||a.dir)&&(b=i.STORE,f=""),g.uncompressedSize=f.length,g.crc32=e(f),g.compressedContent=b.compress(d.transformTo(b.compressInputType,f),c)),g.compressedSize=g.compressedContent.length,g.compressionMethod=b.magic,g},A=function(a,b){var c=a;return a||(c=b?16893:33204),(65535&c)<<16},B=function(a){return 63&(a||0)},C=function(a,b,c,g,h){var i,j,k,m,n=(c.compressedContent,d.transformTo("string",l.utf8encode(b.name))),o=b.comment||"",p=d.transformTo("string",l.utf8encode(o)),q=n.length!==b.name.length,r=p.length!==o.length,t=b.options,u="",v="",w="";k=b._initialMetadata.dir!==b.dir?b.dir:t.dir,m=b._initialMetadata.date!==b.date?b.date:t.date;var x=0,y=0;k&&(x|=16),"UNIX"===h?(y=798,x|=A(b.unixPermissions,k)):(y=20,x|=B(b.dosPermissions,k)),i=m.getHours(),i<<=6,i|=m.getMinutes(),i<<=5,i|=m.getSeconds()/2,j=m.getFullYear()-1980,j<<=4,j|=m.getMonth()+1,j<<=5,j|=m.getDate(),q&&(v=s(1,1)+s(e(n),4)+n,u+="up"+s(v.length,2)+v),r&&(w=s(1,1)+s(this.crc32(p),4)+p,u+="uc"+s(w.length,2)+w);var z="";z+="\n\x00",z+=q||r?"\x00\b":"\x00\x00",z+=c.compressionMethod,z+=s(i,2),z+=s(j,2),z+=s(c.crc32,4),z+=s(c.compressedSize,4),z+=s(c.uncompressedSize,4),z+=s(n.length,2),z+=s(u.length,2);var C=f.LOCAL_FILE_HEADER+z+n+u,D=f.CENTRAL_FILE_HEADER+s(y,2)+z+s(p.length,2)+"\x00\x00\x00\x00"+s(x,4)+s(g,4)+n+u+p;return{fileRecord:C,dirRecord:D,compressedObject:c}},D={load:function(){throw new Error("Load method is not defined. Is the file jszip-load.js included ?")},filter:function(a){var b,c,d,e,f=[];for(b in this.files)this.files.hasOwnProperty(b)&&(d=this.files[b],e=new r(d.name,d._data,t(d.options)),c=b.slice(this.root.length,b.length),b.slice(0,this.root.length)===this.root&&a(c,e)&&f.push(e));return f},file:function(a,b,c){if(1===arguments.length){if(d.isRegExp(a)){var e=a;return this.filter(function(a,b){return!b.dir&&e.test(a)})}return this.filter(function(b,c){return!c.dir&&b===a})[0]||null}return a=this.root+a,v.call(this,a,b,c),this},folder:function(a){if(!a)return this;if(d.isRegExp(a))return this.filter(function(b,c){return c.dir&&a.test(b)});var b=this.root+a,c=y.call(this,b),e=this.clone();return e.root=c.name,e},remove:function(a){a=this.root+a;var b=this.files[a];if(b||("/"!=a.slice(-1)&&(a+="/"),b=this.files[a]),b&&!b.dir)delete this.files[a];else for(var c=this.filter(function(b,c){return c.name.slice(0,a.length)===a}),d=0;d<c.length;d++)delete this.files[c[d].name];return this},generate:function(a){a=t(a||{},{base64:!0,compression:"STORE",compressionOptions:null,type:"base64",platform:"DOS",comment:null,mimeType:"application/zip"}),d.checkSupport(a.type),("darwin"===a.platform||"freebsd"===a.platform||"linux"===a.platform||"sunos"===a.platform)&&(a.platform="UNIX"),"win32"===a.platform&&(a.platform="DOS");var b,c,e=[],g=0,j=0,k=d.transformTo("string",this.utf8encode(a.comment||this.comment||""));for(var l in this.files)if(this.files.hasOwnProperty(l)){var o=this.files[l],p=o.options.compression||a.compression.toUpperCase(),q=i[p];if(!q)throw new Error(p+" is not a valid compression method !");var r=o.options.compressionOptions||a.compressionOptions||{},u=z.call(this,o,q,r),v=C.call(this,l,o,u,g,a.platform);g+=v.fileRecord.length+u.compressedSize,j+=v.dirRecord.length,e.push(v)}var w="";w=f.CENTRAL_DIRECTORY_END+"\x00\x00\x00\x00"+s(e.length,2)+s(e.length,2)+s(j,4)+s(g,4)+s(k.length,2)+k;var x=a.type.toLowerCase();for(b="uint8array"===x||"arraybuffer"===x||"blob"===x||"nodebuffer"===x?new n(g+j+w.length):new m(g+j+w.length),c=0;c<e.length;c++)b.append(e[c].fileRecord),b.append(e[c].compressedObject.compressedContent);for(c=0;c<e.length;c++)b.append(e[c].dirRecord);b.append(w);var y=b.finalize();switch(a.type.toLowerCase()){case"uint8array":case"arraybuffer":case"nodebuffer":return d.transformTo(a.type.toLowerCase(),y);case"blob":return d.arrayBuffer2Blob(d.transformTo("arraybuffer",y),a.mimeType);case"base64":return a.base64?h.encode(y):y;default:return y}},crc32:function(a,b){return e(a,b)},utf8encode:function(a){return d.transformTo("string",l.utf8encode(a))},utf8decode:function(a){return l.utf8decode(a)}};b.exports=D},{"./base64":1,"./compressedObject":2,"./compressions":3,"./crc32":4,"./defaults":6,"./nodeBuffer":11,"./signature":14,"./stringWriter":16,"./support":17,"./uint8ArrayWriter":19,"./utf8":20,"./utils":21}],14:[function(a,b,c){"use strict";c.LOCAL_FILE_HEADER="PK",c.CENTRAL_FILE_HEADER="PK",c.CENTRAL_DIRECTORY_END="PK",c.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",c.ZIP64_CENTRAL_DIRECTORY_END="PK",c.DATA_DESCRIPTOR="PK\b"},{}],15:[function(a,b){"use strict";function c(a,b){this.data=a,b||(this.data=e.string2binary(this.data)),this.length=this.data.length,this.index=0}var d=a("./dataReader"),e=a("./utils");c.prototype=new d,c.prototype.byteAt=function(a){return this.data.charCodeAt(a)},c.prototype.lastIndexOfSignature=function(a){return this.data.lastIndexOf(a)},c.prototype.readData=function(a){this.checkOffset(a);var b=this.data.slice(this.index,this.index+a);return this.index+=a,b},b.exports=c},{"./dataReader":5,"./utils":21}],16:[function(a,b){"use strict";var c=a("./utils"),d=function(){this.data=[]};d.prototype={append:function(a){a=c.transformTo("string",a),this.data.push(a)},finalize:function(){return this.data.join("")}},b.exports=d},{"./utils":21}],17:[function(a,b,c){(function(a){"use strict";if(c.base64=!0,c.array=!0,c.string=!0,c.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,c.nodebuffer="undefined"!=typeof a,c.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)c.blob=!1;else{var b=new ArrayBuffer(0);try{c.blob=0===new Blob([b],{type:"application/zip"}).size}catch(d){try{var e=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder,f=new e;f.append(b),c.blob=0===f.getBlob("application/zip").size}catch(d){c.blob=!1}}}}).call(this,"undefined"!=typeof Buffer?Buffer:void 0)},{}],18:[function(a,b){"use strict";function c(a){a&&(this.data=a,this.length=this.data.length,this.index=0)}var d=a("./dataReader");c.prototype=new d,c.prototype.byteAt=function(a){return this.data[a]},c.prototype.lastIndexOfSignature=function(a){for(var b=a.charCodeAt(0),c=a.charCodeAt(1),d=a.charCodeAt(2),e=a.charCodeAt(3),f=this.length-4;f>=0;--f)if(this.data[f]===b&&this.data[f+1]===c&&this.data[f+2]===d&&this.data[f+3]===e)return f;return-1},c.prototype.readData=function(a){if(this.checkOffset(a),0===a)return new Uint8Array(0);var b=this.data.subarray(this.index,this.index+a);return this.index+=a,b},b.exports=c},{"./dataReader":5}],19:[function(a,b){"use strict";var c=a("./utils"),d=function(a){this.data=new Uint8Array(a),this.index=0};d.prototype={append:function(a){0!==a.length&&(a=c.transformTo("uint8array",a),this.data.set(a,this.index),this.index+=a.length)},finalize:function(){return this.data}},b.exports=d},{"./utils":21}],20:[function(a,b,c){"use strict";for(var d=a("./utils"),e=a("./support"),f=a("./nodeBuffer"),g=new Array(256),h=0;256>h;h++)g[h]=h>=252?6:h>=248?5:h>=240?4:h>=224?3:h>=192?2:1;g[254]=g[254]=1;var i=function(a){var b,c,d,f,g,h=a.length,i=0;for(f=0;h>f;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),i+=128>c?1:2048>c?2:65536>c?3:4;for(b=e.uint8array?new Uint8Array(i):new Array(i),g=0,f=0;i>g;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),128>c?b[g++]=c:2048>c?(b[g++]=192|c>>>6,b[g++]=128|63&c):65536>c?(b[g++]=224|c>>>12,b[g++]=128|c>>>6&63,b[g++]=128|63&c):(b[g++]=240|c>>>18,b[g++]=128|c>>>12&63,b[g++]=128|c>>>6&63,b[g++]=128|63&c);return b},j=function(a,b){var c;for(b=b||a.length,b>a.length&&(b=a.length),c=b-1;c>=0&&128===(192&a[c]);)c--;return 0>c?b:0===c?b:c+g[a[c]]>b?c:b},k=function(a){var b,c,e,f,h=a.length,i=new Array(2*h);for(c=0,b=0;h>b;)if(e=a[b++],128>e)i[c++]=e;else if(f=g[e],f>4)i[c++]=65533,b+=f-1;else{for(e&=2===f?31:3===f?15:7;f>1&&h>b;)e=e<<6|63&a[b++],f--;f>1?i[c++]=65533:65536>e?i[c++]=e:(e-=65536,i[c++]=55296|e>>10&1023,i[c++]=56320|1023&e)}return i.length!==c&&(i.subarray?i=i.subarray(0,c):i.length=c),d.applyFromCharCode(i)};c.utf8encode=function(a){return e.nodebuffer?f(a,"utf-8"):i(a)},c.utf8decode=function(a){if(e.nodebuffer)return d.transformTo("nodebuffer",a).toString("utf-8");a=d.transformTo(e.uint8array?"uint8array":"array",a);for(var b=[],c=0,f=a.length,g=65536;f>c;){var h=j(a,Math.min(c+g,f));b.push(e.uint8array?k(a.subarray(c,h)):k(a.slice(c,h))),c=h}return b.join("")}},{"./nodeBuffer":11,"./support":17,"./utils":21}],21:[function(a,b,c){"use strict";function d(a){return a}function e(a,b){for(var c=0;c<a.length;++c)b[c]=255&a.charCodeAt(c);return b}function f(a){var b=65536,d=[],e=a.length,f=c.getTypeOf(a),g=0,h=!0;try{switch(f){case"uint8array":String.fromCharCode.apply(null,new Uint8Array(0));break;case"nodebuffer":String.fromCharCode.apply(null,j(0))}}catch(i){h=!1}if(!h){for(var k="",l=0;l<a.length;l++)k+=String.fromCharCode(a[l]);return k}for(;e>g&&b>1;)try{d.push("array"===f||"nodebuffer"===f?String.fromCharCode.apply(null,a.slice(g,Math.min(g+b,e))):String.fromCharCode.apply(null,a.subarray(g,Math.min(g+b,e)))),g+=b}catch(i){b=Math.floor(b/2)}return d.join("")}function g(a,b){for(var c=0;c<a.length;c++)b[c]=a[c];return b}var h=a("./support"),i=a("./compressions"),j=a("./nodeBuffer");c.string2binary=function(a){for(var b="",c=0;c<a.length;c++)b+=String.fromCharCode(255&a.charCodeAt(c));return b},c.arrayBuffer2Blob=function(a,b){c.checkSupport("blob"),b=b||"application/zip";try{return new Blob([a],{type:b})}catch(d){try{var e=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder||window.MSBlobBuilder,f=new e;return f.append(a),f.getBlob(b)}catch(d){throw new Error("Bug : can't construct the Blob.")}}},c.applyFromCharCode=f;var k={};k.string={string:d,array:function(a){return e(a,new Array(a.length))},arraybuffer:function(a){return k.string.uint8array(a).buffer},uint8array:function(a){return e(a,new Uint8Array(a.length))},nodebuffer:function(a){return e(a,j(a.length))}},k.array={string:f,array:d,arraybuffer:function(a){return new Uint8Array(a).buffer},uint8array:function(a){return new Uint8Array(a)},nodebuffer:function(a){return j(a)}},k.arraybuffer={string:function(a){return f(new Uint8Array(a))},array:function(a){return g(new Uint8Array(a),new Array(a.byteLength))},arraybuffer:d,uint8array:function(a){return new Uint8Array(a)},nodebuffer:function(a){return j(new Uint8Array(a))}},k.uint8array={string:f,array:function(a){return g(a,new Array(a.length))},arraybuffer:function(a){return a.buffer},uint8array:d,nodebuffer:function(a){return j(a)}},k.nodebuffer={string:f,array:function(a){return g(a,new Array(a.length))},arraybuffer:function(a){return k.nodebuffer.uint8array(a).buffer},uint8array:function(a){return g(a,new Uint8Array(a.length))},nodebuffer:d},c.transformTo=function(a,b){if(b||(b=""),!a)return b;c.checkSupport(a);var d=c.getTypeOf(b),e=k[d][a](b);return e},c.getTypeOf=function(a){return"string"==typeof a?"string":"[object Array]"===Object.prototype.toString.call(a)?"array":h.nodebuffer&&j.test(a)?"nodebuffer":h.uint8array&&a instanceof Uint8Array?"uint8array":h.arraybuffer&&a instanceof ArrayBuffer?"arraybuffer":void 0},c.checkSupport=function(a){var b=h[a.toLowerCase()];if(!b)throw new Error(a+" is not supported by this browser")},c.MAX_VALUE_16BITS=65535,c.MAX_VALUE_32BITS=-1,c.pretty=function(a){var b,c,d="";for(c=0;c<(a||"").length;c++)b=a.charCodeAt(c),d+="\\x"+(16>b?"0":"")+b.toString(16).toUpperCase();return d},c.findCompression=function(a){for(var b in i)if(i.hasOwnProperty(b)&&i[b].magic===a)return i[b];return null},c.isRegExp=function(a){return"[object RegExp]"===Object.prototype.toString.call(a)}},{"./compressions":3,"./nodeBuffer":11,"./support":17}],22:[function(a,b){"use strict";function c(a,b){this.files=[],this.loadOptions=b,a&&this.load(a)}var d=a("./stringReader"),e=a("./nodeBufferReader"),f=a("./uint8ArrayReader"),g=a("./utils"),h=a("./signature"),i=a("./zipEntry"),j=a("./support"),k=a("./object");c.prototype={checkSignature:function(a){var b=this.reader.readString(4);if(b!==a)throw new Error("Corrupted zip or bug : unexpected signature ("+g.pretty(b)+", expected "+g.pretty(a)+")")},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2),this.zipComment=this.reader.readString(this.zipCommentLength),this.zipComment=k.utf8decode(this.zipComment)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.versionMadeBy=this.reader.readString(2),this.versionNeeded=this.reader.readInt(2),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var a,b,c,d=this.zip64EndOfCentralSize-44,e=0;d>e;)a=this.reader.readInt(2),b=this.reader.readInt(4),c=this.reader.readString(b),this.zip64ExtensibleData[a]={id:a,length:b,value:c}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),this.disksCount>1)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var a,b;for(a=0;a<this.files.length;a++)b=this.files[a],this.reader.setIndex(b.localHeaderOffset),this.checkSignature(h.LOCAL_FILE_HEADER),b.readLocalPart(this.reader),b.handleUTF8(),b.processAttributes()},readCentralDir:function(){var a;for(this.reader.setIndex(this.centralDirOffset);this.reader.readString(4)===h.CENTRAL_FILE_HEADER;)a=new i({zip64:this.zip64},this.loadOptions),a.readCentralPart(this.reader),this.files.push(a)},readEndOfCentral:function(){var a=this.reader.lastIndexOfSignature(h.CENTRAL_DIRECTORY_END);if(-1===a){var b=!0;try{this.reader.setIndex(0),this.checkSignature(h.LOCAL_FILE_HEADER),b=!1}catch(c){}throw new Error(b?"Can't find end of central directory : is this a zip file ? If it is, see http://stuk.github.io/jszip/documentation/howto/read_zip.html":"Corrupted zip : can't find end of central directory")}if(this.reader.setIndex(a),this.checkSignature(h.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===g.MAX_VALUE_16BITS||this.diskWithCentralDirStart===g.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===g.MAX_VALUE_16BITS||this.centralDirRecords===g.MAX_VALUE_16BITS||this.centralDirSize===g.MAX_VALUE_32BITS||this.centralDirOffset===g.MAX_VALUE_32BITS){if(this.zip64=!0,a=this.reader.lastIndexOfSignature(h.ZIP64_CENTRAL_DIRECTORY_LOCATOR),-1===a)throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator");this.reader.setIndex(a),this.checkSignature(h.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(h.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}},prepareReader:function(a){var b=g.getTypeOf(a);this.reader="string"!==b||j.uint8array?"nodebuffer"===b?new e(a):new f(g.transformTo("uint8array",a)):new d(a,this.loadOptions.optimizedBinaryString)},load:function(a){this.prepareReader(a),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},b.exports=c},{"./nodeBufferReader":12,"./object":13,"./signature":14,"./stringReader":15,"./support":17,"./uint8ArrayReader":18,"./utils":21,"./zipEntry":23}],23:[function(a,b){"use strict";function c(a,b){this.options=a,this.loadOptions=b}var d=a("./stringReader"),e=a("./utils"),f=a("./compressedObject"),g=a("./object"),h=0,i=3;c.prototype={isEncrypted:function(){return 1===(1&this.bitFlag)},useUTF8:function(){return 2048===(2048&this.bitFlag)},prepareCompressedContent:function(a,b,c){return function(){var d=a.index;a.setIndex(b);var e=a.readData(c);return a.setIndex(d),e}},prepareContent:function(a,b,c,d,f){return function(){var a=e.transformTo(d.uncompressInputType,this.getCompressedContent()),b=d.uncompress(a);if(b.length!==f)throw new Error("Bug : uncompressed data size mismatch");return b}},readLocalPart:function(a){var b,c;if(a.skip(22),this.fileNameLength=a.readInt(2),c=a.readInt(2),this.fileName=a.readString(this.fileNameLength),a.skip(c),-1==this.compressedSize||-1==this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory (compressedSize == -1 || uncompressedSize == -1)");if(b=e.findCompression(this.compressionMethod),null===b)throw new Error("Corrupted zip : compression "+e.pretty(this.compressionMethod)+" unknown (inner file : "+this.fileName+")");if(this.decompressed=new f,this.decompressed.compressedSize=this.compressedSize,this.decompressed.uncompressedSize=this.uncompressedSize,this.decompressed.crc32=this.crc32,this.decompressed.compressionMethod=this.compressionMethod,this.decompressed.getCompressedContent=this.prepareCompressedContent(a,a.index,this.compressedSize,b),this.decompressed.getContent=this.prepareContent(a,a.index,this.compressedSize,b,this.uncompressedSize),this.loadOptions.checkCRC32&&(this.decompressed=e.transformTo("string",this.decompressed.getContent()),g.crc32(this.decompressed)!==this.crc32))throw new Error("Corrupted zip : CRC32 mismatch")},readCentralPart:function(a){if(this.versionMadeBy=a.readInt(2),this.versionNeeded=a.readInt(2),this.bitFlag=a.readInt(2),this.compressionMethod=a.readString(2),this.date=a.readDate(),this.crc32=a.readInt(4),this.compressedSize=a.readInt(4),this.uncompressedSize=a.readInt(4),this.fileNameLength=a.readInt(2),this.extraFieldsLength=a.readInt(2),this.fileCommentLength=a.readInt(2),this.diskNumberStart=a.readInt(2),this.internalFileAttributes=a.readInt(2),this.externalFileAttributes=a.readInt(4),this.localHeaderOffset=a.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");this.fileName=a.readString(this.fileNameLength),this.readExtraFields(a),this.parseZIP64ExtraField(a),this.fileComment=a.readString(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var a=this.versionMadeBy>>8;this.dir=16&this.externalFileAttributes?!0:!1,a===h&&(this.dosPermissions=63&this.externalFileAttributes),a===i&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||"/"!==this.fileName.slice(-1)||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var a=new d(this.extraFields[1].value);this.uncompressedSize===e.MAX_VALUE_32BITS&&(this.uncompressedSize=a.readInt(8)),this.compressedSize===e.MAX_VALUE_32BITS&&(this.compressedSize=a.readInt(8)),this.localHeaderOffset===e.MAX_VALUE_32BITS&&(this.localHeaderOffset=a.readInt(8)),this.diskNumberStart===e.MAX_VALUE_32BITS&&(this.diskNumberStart=a.readInt(4))}},readExtraFields:function(a){var b,c,d,e=a.index;for(this.extraFields=this.extraFields||{};a.index<e+this.extraFieldsLength;)b=a.readInt(2),c=a.readInt(2),d=a.readString(c),this.extraFields[b]={id:b,length:c,value:d}},handleUTF8:function(){if(this.useUTF8())this.fileName=g.utf8decode(this.fileName),this.fileComment=g.utf8decode(this.fileComment);else{var a=this.findExtraFieldUnicodePath();null!==a&&(this.fileName=a);var b=this.findExtraFieldUnicodeComment();null!==b&&(this.fileComment=b)}},findExtraFieldUnicodePath:function(){var a=this.extraFields[28789];if(a){var b=new d(a.value);return 1!==b.readInt(1)?null:g.crc32(this.fileName)!==b.readInt(4)?null:g.utf8decode(b.readString(a.length-5))
}return null},findExtraFieldUnicodeComment:function(){var a=this.extraFields[25461];if(a){var b=new d(a.value);return 1!==b.readInt(1)?null:g.crc32(this.fileComment)!==b.readInt(4)?null:g.utf8decode(b.readString(a.length-5))}return null}},b.exports=c},{"./compressedObject":2,"./object":13,"./stringReader":15,"./utils":21}],24:[function(a,b){"use strict";var c=a("./lib/utils/common").assign,d=a("./lib/deflate"),e=a("./lib/inflate"),f=a("./lib/zlib/constants"),g={};c(g,d,e,f),b.exports=g},{"./lib/deflate":25,"./lib/inflate":26,"./lib/utils/common":27,"./lib/zlib/constants":30}],25:[function(a,b,c){"use strict";function d(a,b){var c=new s(b);if(c.push(a,!0),c.err)throw c.msg;return c.result}function e(a,b){return b=b||{},b.raw=!0,d(a,b)}function f(a,b){return b=b||{},b.gzip=!0,d(a,b)}var g=a("./zlib/deflate.js"),h=a("./utils/common"),i=a("./utils/strings"),j=a("./zlib/messages"),k=a("./zlib/zstream"),l=0,m=4,n=0,o=1,p=-1,q=0,r=8,s=function(a){this.options=h.assign({level:p,method:r,chunkSize:16384,windowBits:15,memLevel:8,strategy:q,to:""},a||{});var b=this.options;b.raw&&b.windowBits>0?b.windowBits=-b.windowBits:b.gzip&&b.windowBits>0&&b.windowBits<16&&(b.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new k,this.strm.avail_out=0;var c=g.deflateInit2(this.strm,b.level,b.method,b.windowBits,b.memLevel,b.strategy);if(c!==n)throw new Error(j[c]);b.header&&g.deflateSetHeader(this.strm,b.header)};s.prototype.push=function(a,b){var c,d,e=this.strm,f=this.options.chunkSize;if(this.ended)return!1;d=b===~~b?b:b===!0?m:l,e.input="string"==typeof a?i.string2buf(a):a,e.next_in=0,e.avail_in=e.input.length;do{if(0===e.avail_out&&(e.output=new h.Buf8(f),e.next_out=0,e.avail_out=f),c=g.deflate(e,d),c!==o&&c!==n)return this.onEnd(c),this.ended=!0,!1;(0===e.avail_out||0===e.avail_in&&d===m)&&this.onData("string"===this.options.to?i.buf2binstring(h.shrinkBuf(e.output,e.next_out)):h.shrinkBuf(e.output,e.next_out))}while((e.avail_in>0||0===e.avail_out)&&c!==o);return d===m?(c=g.deflateEnd(this.strm),this.onEnd(c),this.ended=!0,c===n):!0},s.prototype.onData=function(a){this.chunks.push(a)},s.prototype.onEnd=function(a){a===n&&(this.result="string"===this.options.to?this.chunks.join(""):h.flattenChunks(this.chunks)),this.chunks=[],this.err=a,this.msg=this.strm.msg},c.Deflate=s,c.deflate=d,c.deflateRaw=e,c.gzip=f},{"./utils/common":27,"./utils/strings":28,"./zlib/deflate.js":32,"./zlib/messages":37,"./zlib/zstream":39}],26:[function(a,b,c){"use strict";function d(a,b){var c=new m(b);if(c.push(a,!0),c.err)throw c.msg;return c.result}function e(a,b){return b=b||{},b.raw=!0,d(a,b)}var f=a("./zlib/inflate.js"),g=a("./utils/common"),h=a("./utils/strings"),i=a("./zlib/constants"),j=a("./zlib/messages"),k=a("./zlib/zstream"),l=a("./zlib/gzheader"),m=function(a){this.options=g.assign({chunkSize:16384,windowBits:0,to:""},a||{});var b=this.options;b.raw&&b.windowBits>=0&&b.windowBits<16&&(b.windowBits=-b.windowBits,0===b.windowBits&&(b.windowBits=-15)),!(b.windowBits>=0&&b.windowBits<16)||a&&a.windowBits||(b.windowBits+=32),b.windowBits>15&&b.windowBits<48&&0===(15&b.windowBits)&&(b.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new k,this.strm.avail_out=0;var c=f.inflateInit2(this.strm,b.windowBits);if(c!==i.Z_OK)throw new Error(j[c]);this.header=new l,f.inflateGetHeader(this.strm,this.header)};m.prototype.push=function(a,b){var c,d,e,j,k,l=this.strm,m=this.options.chunkSize;if(this.ended)return!1;d=b===~~b?b:b===!0?i.Z_FINISH:i.Z_NO_FLUSH,l.input="string"==typeof a?h.binstring2buf(a):a,l.next_in=0,l.avail_in=l.input.length;do{if(0===l.avail_out&&(l.output=new g.Buf8(m),l.next_out=0,l.avail_out=m),c=f.inflate(l,i.Z_NO_FLUSH),c!==i.Z_STREAM_END&&c!==i.Z_OK)return this.onEnd(c),this.ended=!0,!1;l.next_out&&(0===l.avail_out||c===i.Z_STREAM_END||0===l.avail_in&&d===i.Z_FINISH)&&("string"===this.options.to?(e=h.utf8border(l.output,l.next_out),j=l.next_out-e,k=h.buf2string(l.output,e),l.next_out=j,l.avail_out=m-j,j&&g.arraySet(l.output,l.output,e,j,0),this.onData(k)):this.onData(g.shrinkBuf(l.output,l.next_out)))}while(l.avail_in>0&&c!==i.Z_STREAM_END);return c===i.Z_STREAM_END&&(d=i.Z_FINISH),d===i.Z_FINISH?(c=f.inflateEnd(this.strm),this.onEnd(c),this.ended=!0,c===i.Z_OK):!0},m.prototype.onData=function(a){this.chunks.push(a)},m.prototype.onEnd=function(a){a===i.Z_OK&&(this.result="string"===this.options.to?this.chunks.join(""):g.flattenChunks(this.chunks)),this.chunks=[],this.err=a,this.msg=this.strm.msg},c.Inflate=m,c.inflate=d,c.inflateRaw=e,c.ungzip=d},{"./utils/common":27,"./utils/strings":28,"./zlib/constants":30,"./zlib/gzheader":33,"./zlib/inflate.js":35,"./zlib/messages":37,"./zlib/zstream":39}],27:[function(a,b,c){"use strict";var d="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;c.assign=function(a){for(var b=Array.prototype.slice.call(arguments,1);b.length;){var c=b.shift();if(c){if("object"!=typeof c)throw new TypeError(c+"must be non-object");for(var d in c)c.hasOwnProperty(d)&&(a[d]=c[d])}}return a},c.shrinkBuf=function(a,b){return a.length===b?a:a.subarray?a.subarray(0,b):(a.length=b,a)};var e={arraySet:function(a,b,c,d,e){if(b.subarray&&a.subarray)return void a.set(b.subarray(c,c+d),e);for(var f=0;d>f;f++)a[e+f]=b[c+f]},flattenChunks:function(a){var b,c,d,e,f,g;for(d=0,b=0,c=a.length;c>b;b++)d+=a[b].length;for(g=new Uint8Array(d),e=0,b=0,c=a.length;c>b;b++)f=a[b],g.set(f,e),e+=f.length;return g}},f={arraySet:function(a,b,c,d,e){for(var f=0;d>f;f++)a[e+f]=b[c+f]},flattenChunks:function(a){return[].concat.apply([],a)}};c.setTyped=function(a){a?(c.Buf8=Uint8Array,c.Buf16=Uint16Array,c.Buf32=Int32Array,c.assign(c,e)):(c.Buf8=Array,c.Buf16=Array,c.Buf32=Array,c.assign(c,f))},c.setTyped(d)},{}],28:[function(a,b,c){"use strict";function d(a,b){if(65537>b&&(a.subarray&&g||!a.subarray&&f))return String.fromCharCode.apply(null,e.shrinkBuf(a,b));for(var c="",d=0;b>d;d++)c+=String.fromCharCode(a[d]);return c}var e=a("./common"),f=!0,g=!0;try{String.fromCharCode.apply(null,[0])}catch(h){f=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(h){g=!1}for(var i=new e.Buf8(256),j=0;256>j;j++)i[j]=j>=252?6:j>=248?5:j>=240?4:j>=224?3:j>=192?2:1;i[254]=i[254]=1,c.string2buf=function(a){var b,c,d,f,g,h=a.length,i=0;for(f=0;h>f;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),i+=128>c?1:2048>c?2:65536>c?3:4;for(b=new e.Buf8(i),g=0,f=0;i>g;f++)c=a.charCodeAt(f),55296===(64512&c)&&h>f+1&&(d=a.charCodeAt(f+1),56320===(64512&d)&&(c=65536+(c-55296<<10)+(d-56320),f++)),128>c?b[g++]=c:2048>c?(b[g++]=192|c>>>6,b[g++]=128|63&c):65536>c?(b[g++]=224|c>>>12,b[g++]=128|c>>>6&63,b[g++]=128|63&c):(b[g++]=240|c>>>18,b[g++]=128|c>>>12&63,b[g++]=128|c>>>6&63,b[g++]=128|63&c);return b},c.buf2binstring=function(a){return d(a,a.length)},c.binstring2buf=function(a){for(var b=new e.Buf8(a.length),c=0,d=b.length;d>c;c++)b[c]=a.charCodeAt(c);return b},c.buf2string=function(a,b){var c,e,f,g,h=b||a.length,j=new Array(2*h);for(e=0,c=0;h>c;)if(f=a[c++],128>f)j[e++]=f;else if(g=i[f],g>4)j[e++]=65533,c+=g-1;else{for(f&=2===g?31:3===g?15:7;g>1&&h>c;)f=f<<6|63&a[c++],g--;g>1?j[e++]=65533:65536>f?j[e++]=f:(f-=65536,j[e++]=55296|f>>10&1023,j[e++]=56320|1023&f)}return d(j,e)},c.utf8border=function(a,b){var c;for(b=b||a.length,b>a.length&&(b=a.length),c=b-1;c>=0&&128===(192&a[c]);)c--;return 0>c?b:0===c?b:c+i[a[c]]>b?c:b}},{"./common":27}],29:[function(a,b){"use strict";function c(a,b,c,d){for(var e=65535&a|0,f=a>>>16&65535|0,g=0;0!==c;){g=c>2e3?2e3:c,c-=g;do e=e+b[d++]|0,f=f+e|0;while(--g);e%=65521,f%=65521}return e|f<<16|0}b.exports=c},{}],30:[function(a,b){b.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],31:[function(a,b){"use strict";function c(){for(var a,b=[],c=0;256>c;c++){a=c;for(var d=0;8>d;d++)a=1&a?3988292384^a>>>1:a>>>1;b[c]=a}return b}function d(a,b,c,d){var f=e,g=d+c;a=-1^a;for(var h=d;g>h;h++)a=a>>>8^f[255&(a^b[h])];return-1^a}var e=c();b.exports=d},{}],32:[function(a,b,c){"use strict";function d(a,b){return a.msg=G[b],b}function e(a){return(a<<1)-(a>4?9:0)}function f(a){for(var b=a.length;--b>=0;)a[b]=0}function g(a){var b=a.state,c=b.pending;c>a.avail_out&&(c=a.avail_out),0!==c&&(C.arraySet(a.output,b.pending_buf,b.pending_out,c,a.next_out),a.next_out+=c,b.pending_out+=c,a.total_out+=c,a.avail_out-=c,b.pending-=c,0===b.pending&&(b.pending_out=0))}function h(a,b){D._tr_flush_block(a,a.block_start>=0?a.block_start:-1,a.strstart-a.block_start,b),a.block_start=a.strstart,g(a.strm)}function i(a,b){a.pending_buf[a.pending++]=b}function j(a,b){a.pending_buf[a.pending++]=b>>>8&255,a.pending_buf[a.pending++]=255&b}function k(a,b,c,d){var e=a.avail_in;return e>d&&(e=d),0===e?0:(a.avail_in-=e,C.arraySet(b,a.input,a.next_in,e,c),1===a.state.wrap?a.adler=E(a.adler,b,e,c):2===a.state.wrap&&(a.adler=F(a.adler,b,e,c)),a.next_in+=e,a.total_in+=e,e)}function l(a,b){var c,d,e=a.max_chain_length,f=a.strstart,g=a.prev_length,h=a.nice_match,i=a.strstart>a.w_size-jb?a.strstart-(a.w_size-jb):0,j=a.window,k=a.w_mask,l=a.prev,m=a.strstart+ib,n=j[f+g-1],o=j[f+g];a.prev_length>=a.good_match&&(e>>=2),h>a.lookahead&&(h=a.lookahead);do if(c=b,j[c+g]===o&&j[c+g-1]===n&&j[c]===j[f]&&j[++c]===j[f+1]){f+=2,c++;do;while(j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&j[++f]===j[++c]&&m>f);if(d=ib-(m-f),f=m-ib,d>g){if(a.match_start=b,g=d,d>=h)break;n=j[f+g-1],o=j[f+g]}}while((b=l[b&k])>i&&0!==--e);return g<=a.lookahead?g:a.lookahead}function m(a){var b,c,d,e,f,g=a.w_size;do{if(e=a.window_size-a.lookahead-a.strstart,a.strstart>=g+(g-jb)){C.arraySet(a.window,a.window,g,g,0),a.match_start-=g,a.strstart-=g,a.block_start-=g,c=a.hash_size,b=c;do d=a.head[--b],a.head[b]=d>=g?d-g:0;while(--c);c=g,b=c;do d=a.prev[--b],a.prev[b]=d>=g?d-g:0;while(--c);e+=g}if(0===a.strm.avail_in)break;if(c=k(a.strm,a.window,a.strstart+a.lookahead,e),a.lookahead+=c,a.lookahead+a.insert>=hb)for(f=a.strstart-a.insert,a.ins_h=a.window[f],a.ins_h=(a.ins_h<<a.hash_shift^a.window[f+1])&a.hash_mask;a.insert&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[f+hb-1])&a.hash_mask,a.prev[f&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=f,f++,a.insert--,!(a.lookahead+a.insert<hb)););}while(a.lookahead<jb&&0!==a.strm.avail_in)}function n(a,b){var c=65535;for(c>a.pending_buf_size-5&&(c=a.pending_buf_size-5);;){if(a.lookahead<=1){if(m(a),0===a.lookahead&&b===H)return sb;if(0===a.lookahead)break}a.strstart+=a.lookahead,a.lookahead=0;var d=a.block_start+c;if((0===a.strstart||a.strstart>=d)&&(a.lookahead=a.strstart-d,a.strstart=d,h(a,!1),0===a.strm.avail_out))return sb;if(a.strstart-a.block_start>=a.w_size-jb&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.strstart>a.block_start&&(h(a,!1),0===a.strm.avail_out)?sb:sb}function o(a,b){for(var c,d;;){if(a.lookahead<jb){if(m(a),a.lookahead<jb&&b===H)return sb;if(0===a.lookahead)break}if(c=0,a.lookahead>=hb&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart),0!==c&&a.strstart-c<=a.w_size-jb&&(a.match_length=l(a,c)),a.match_length>=hb)if(d=D._tr_tally(a,a.strstart-a.match_start,a.match_length-hb),a.lookahead-=a.match_length,a.match_length<=a.max_lazy_match&&a.lookahead>=hb){a.match_length--;do a.strstart++,a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart;while(0!==--a.match_length);a.strstart++}else a.strstart+=a.match_length,a.match_length=0,a.ins_h=a.window[a.strstart],a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+1])&a.hash_mask;else d=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++;if(d&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=a.strstart<hb-1?a.strstart:hb-1,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function p(a,b){for(var c,d,e;;){if(a.lookahead<jb){if(m(a),a.lookahead<jb&&b===H)return sb;if(0===a.lookahead)break}if(c=0,a.lookahead>=hb&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart),a.prev_length=a.match_length,a.prev_match=a.match_start,a.match_length=hb-1,0!==c&&a.prev_length<a.max_lazy_match&&a.strstart-c<=a.w_size-jb&&(a.match_length=l(a,c),a.match_length<=5&&(a.strategy===S||a.match_length===hb&&a.strstart-a.match_start>4096)&&(a.match_length=hb-1)),a.prev_length>=hb&&a.match_length<=a.prev_length){e=a.strstart+a.lookahead-hb,d=D._tr_tally(a,a.strstart-1-a.prev_match,a.prev_length-hb),a.lookahead-=a.prev_length-1,a.prev_length-=2;do++a.strstart<=e&&(a.ins_h=(a.ins_h<<a.hash_shift^a.window[a.strstart+hb-1])&a.hash_mask,c=a.prev[a.strstart&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=a.strstart);while(0!==--a.prev_length);if(a.match_available=0,a.match_length=hb-1,a.strstart++,d&&(h(a,!1),0===a.strm.avail_out))return sb}else if(a.match_available){if(d=D._tr_tally(a,0,a.window[a.strstart-1]),d&&h(a,!1),a.strstart++,a.lookahead--,0===a.strm.avail_out)return sb}else a.match_available=1,a.strstart++,a.lookahead--}return a.match_available&&(d=D._tr_tally(a,0,a.window[a.strstart-1]),a.match_available=0),a.insert=a.strstart<hb-1?a.strstart:hb-1,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function q(a,b){for(var c,d,e,f,g=a.window;;){if(a.lookahead<=ib){if(m(a),a.lookahead<=ib&&b===H)return sb;if(0===a.lookahead)break}if(a.match_length=0,a.lookahead>=hb&&a.strstart>0&&(e=a.strstart-1,d=g[e],d===g[++e]&&d===g[++e]&&d===g[++e])){f=a.strstart+ib;do;while(d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&d===g[++e]&&f>e);a.match_length=ib-(f-e),a.match_length>a.lookahead&&(a.match_length=a.lookahead)}if(a.match_length>=hb?(c=D._tr_tally(a,1,a.match_length-hb),a.lookahead-=a.match_length,a.strstart+=a.match_length,a.match_length=0):(c=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++),c&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function r(a,b){for(var c;;){if(0===a.lookahead&&(m(a),0===a.lookahead)){if(b===H)return sb;break}if(a.match_length=0,c=D._tr_tally(a,0,a.window[a.strstart]),a.lookahead--,a.strstart++,c&&(h(a,!1),0===a.strm.avail_out))return sb}return a.insert=0,b===K?(h(a,!0),0===a.strm.avail_out?ub:vb):a.last_lit&&(h(a,!1),0===a.strm.avail_out)?sb:tb}function s(a){a.window_size=2*a.w_size,f(a.head),a.max_lazy_match=B[a.level].max_lazy,a.good_match=B[a.level].good_length,a.nice_match=B[a.level].nice_length,a.max_chain_length=B[a.level].max_chain,a.strstart=0,a.block_start=0,a.lookahead=0,a.insert=0,a.match_length=a.prev_length=hb-1,a.match_available=0,a.ins_h=0}function t(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=Y,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new C.Buf16(2*fb),this.dyn_dtree=new C.Buf16(2*(2*db+1)),this.bl_tree=new C.Buf16(2*(2*eb+1)),f(this.dyn_ltree),f(this.dyn_dtree),f(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new C.Buf16(gb+1),this.heap=new C.Buf16(2*cb+1),f(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new C.Buf16(2*cb+1),f(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function u(a){var b;return a&&a.state?(a.total_in=a.total_out=0,a.data_type=X,b=a.state,b.pending=0,b.pending_out=0,b.wrap<0&&(b.wrap=-b.wrap),b.status=b.wrap?lb:qb,a.adler=2===b.wrap?0:1,b.last_flush=H,D._tr_init(b),M):d(a,O)}function v(a){var b=u(a);return b===M&&s(a.state),b}function w(a,b){return a&&a.state?2!==a.state.wrap?O:(a.state.gzhead=b,M):O}function x(a,b,c,e,f,g){if(!a)return O;var h=1;if(b===R&&(b=6),0>e?(h=0,e=-e):e>15&&(h=2,e-=16),1>f||f>Z||c!==Y||8>e||e>15||0>b||b>9||0>g||g>V)return d(a,O);8===e&&(e=9);var i=new t;return a.state=i,i.strm=a,i.wrap=h,i.gzhead=null,i.w_bits=e,i.w_size=1<<i.w_bits,i.w_mask=i.w_size-1,i.hash_bits=f+7,i.hash_size=1<<i.hash_bits,i.hash_mask=i.hash_size-1,i.hash_shift=~~((i.hash_bits+hb-1)/hb),i.window=new C.Buf8(2*i.w_size),i.head=new C.Buf16(i.hash_size),i.prev=new C.Buf16(i.w_size),i.lit_bufsize=1<<f+6,i.pending_buf_size=4*i.lit_bufsize,i.pending_buf=new C.Buf8(i.pending_buf_size),i.d_buf=i.lit_bufsize>>1,i.l_buf=3*i.lit_bufsize,i.level=b,i.strategy=g,i.method=c,v(a)}function y(a,b){return x(a,b,Y,$,_,W)}function z(a,b){var c,h,k,l;if(!a||!a.state||b>L||0>b)return a?d(a,O):O;if(h=a.state,!a.output||!a.input&&0!==a.avail_in||h.status===rb&&b!==K)return d(a,0===a.avail_out?Q:O);if(h.strm=a,c=h.last_flush,h.last_flush=b,h.status===lb)if(2===h.wrap)a.adler=0,i(h,31),i(h,139),i(h,8),h.gzhead?(i(h,(h.gzhead.text?1:0)+(h.gzhead.hcrc?2:0)+(h.gzhead.extra?4:0)+(h.gzhead.name?8:0)+(h.gzhead.comment?16:0)),i(h,255&h.gzhead.time),i(h,h.gzhead.time>>8&255),i(h,h.gzhead.time>>16&255),i(h,h.gzhead.time>>24&255),i(h,9===h.level?2:h.strategy>=T||h.level<2?4:0),i(h,255&h.gzhead.os),h.gzhead.extra&&h.gzhead.extra.length&&(i(h,255&h.gzhead.extra.length),i(h,h.gzhead.extra.length>>8&255)),h.gzhead.hcrc&&(a.adler=F(a.adler,h.pending_buf,h.pending,0)),h.gzindex=0,h.status=mb):(i(h,0),i(h,0),i(h,0),i(h,0),i(h,0),i(h,9===h.level?2:h.strategy>=T||h.level<2?4:0),i(h,wb),h.status=qb);else{var m=Y+(h.w_bits-8<<4)<<8,n=-1;n=h.strategy>=T||h.level<2?0:h.level<6?1:6===h.level?2:3,m|=n<<6,0!==h.strstart&&(m|=kb),m+=31-m%31,h.status=qb,j(h,m),0!==h.strstart&&(j(h,a.adler>>>16),j(h,65535&a.adler)),a.adler=1}if(h.status===mb)if(h.gzhead.extra){for(k=h.pending;h.gzindex<(65535&h.gzhead.extra.length)&&(h.pending!==h.pending_buf_size||(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending!==h.pending_buf_size));)i(h,255&h.gzhead.extra[h.gzindex]),h.gzindex++;h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),h.gzindex===h.gzhead.extra.length&&(h.gzindex=0,h.status=nb)}else h.status=nb;if(h.status===nb)if(h.gzhead.name){k=h.pending;do{if(h.pending===h.pending_buf_size&&(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending===h.pending_buf_size)){l=1;break}l=h.gzindex<h.gzhead.name.length?255&h.gzhead.name.charCodeAt(h.gzindex++):0,i(h,l)}while(0!==l);h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),0===l&&(h.gzindex=0,h.status=ob)}else h.status=ob;if(h.status===ob)if(h.gzhead.comment){k=h.pending;do{if(h.pending===h.pending_buf_size&&(h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),g(a),k=h.pending,h.pending===h.pending_buf_size)){l=1;break}l=h.gzindex<h.gzhead.comment.length?255&h.gzhead.comment.charCodeAt(h.gzindex++):0,i(h,l)}while(0!==l);h.gzhead.hcrc&&h.pending>k&&(a.adler=F(a.adler,h.pending_buf,h.pending-k,k)),0===l&&(h.status=pb)}else h.status=pb;if(h.status===pb&&(h.gzhead.hcrc?(h.pending+2>h.pending_buf_size&&g(a),h.pending+2<=h.pending_buf_size&&(i(h,255&a.adler),i(h,a.adler>>8&255),a.adler=0,h.status=qb)):h.status=qb),0!==h.pending){if(g(a),0===a.avail_out)return h.last_flush=-1,M}else if(0===a.avail_in&&e(b)<=e(c)&&b!==K)return d(a,Q);if(h.status===rb&&0!==a.avail_in)return d(a,Q);if(0!==a.avail_in||0!==h.lookahead||b!==H&&h.status!==rb){var o=h.strategy===T?r(h,b):h.strategy===U?q(h,b):B[h.level].func(h,b);if((o===ub||o===vb)&&(h.status=rb),o===sb||o===ub)return 0===a.avail_out&&(h.last_flush=-1),M;if(o===tb&&(b===I?D._tr_align(h):b!==L&&(D._tr_stored_block(h,0,0,!1),b===J&&(f(h.head),0===h.lookahead&&(h.strstart=0,h.block_start=0,h.insert=0))),g(a),0===a.avail_out))return h.last_flush=-1,M}return b!==K?M:h.wrap<=0?N:(2===h.wrap?(i(h,255&a.adler),i(h,a.adler>>8&255),i(h,a.adler>>16&255),i(h,a.adler>>24&255),i(h,255&a.total_in),i(h,a.total_in>>8&255),i(h,a.total_in>>16&255),i(h,a.total_in>>24&255)):(j(h,a.adler>>>16),j(h,65535&a.adler)),g(a),h.wrap>0&&(h.wrap=-h.wrap),0!==h.pending?M:N)}function A(a){var b;return a&&a.state?(b=a.state.status,b!==lb&&b!==mb&&b!==nb&&b!==ob&&b!==pb&&b!==qb&&b!==rb?d(a,O):(a.state=null,b===qb?d(a,P):M)):O}var B,C=a("../utils/common"),D=a("./trees"),E=a("./adler32"),F=a("./crc32"),G=a("./messages"),H=0,I=1,J=3,K=4,L=5,M=0,N=1,O=-2,P=-3,Q=-5,R=-1,S=1,T=2,U=3,V=4,W=0,X=2,Y=8,Z=9,$=15,_=8,ab=29,bb=256,cb=bb+1+ab,db=30,eb=19,fb=2*cb+1,gb=15,hb=3,ib=258,jb=ib+hb+1,kb=32,lb=42,mb=69,nb=73,ob=91,pb=103,qb=113,rb=666,sb=1,tb=2,ub=3,vb=4,wb=3,xb=function(a,b,c,d,e){this.good_length=a,this.max_lazy=b,this.nice_length=c,this.max_chain=d,this.func=e};B=[new xb(0,0,0,0,n),new xb(4,4,8,4,o),new xb(4,5,16,8,o),new xb(4,6,32,32,o),new xb(4,4,16,16,p),new xb(8,16,32,32,p),new xb(8,16,128,128,p),new xb(8,32,128,256,p),new xb(32,128,258,1024,p),new xb(32,258,258,4096,p)],c.deflateInit=y,c.deflateInit2=x,c.deflateReset=v,c.deflateResetKeep=u,c.deflateSetHeader=w,c.deflate=z,c.deflateEnd=A,c.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":27,"./adler32":29,"./crc32":31,"./messages":37,"./trees":38}],33:[function(a,b){"use strict";function c(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}b.exports=c},{}],34:[function(a,b){"use strict";var c=30,d=12;b.exports=function(a,b){var e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C;e=a.state,f=a.next_in,B=a.input,g=f+(a.avail_in-5),h=a.next_out,C=a.output,i=h-(b-a.avail_out),j=h+(a.avail_out-257),k=e.dmax,l=e.wsize,m=e.whave,n=e.wnext,o=e.window,p=e.hold,q=e.bits,r=e.lencode,s=e.distcode,t=(1<<e.lenbits)-1,u=(1<<e.distbits)-1;a:do{15>q&&(p+=B[f++]<<q,q+=8,p+=B[f++]<<q,q+=8),v=r[p&t];b:for(;;){if(w=v>>>24,p>>>=w,q-=w,w=v>>>16&255,0===w)C[h++]=65535&v;else{if(!(16&w)){if(0===(64&w)){v=r[(65535&v)+(p&(1<<w)-1)];continue b}if(32&w){e.mode=d;break a}a.msg="invalid literal/length code",e.mode=c;break a}x=65535&v,w&=15,w&&(w>q&&(p+=B[f++]<<q,q+=8),x+=p&(1<<w)-1,p>>>=w,q-=w),15>q&&(p+=B[f++]<<q,q+=8,p+=B[f++]<<q,q+=8),v=s[p&u];c:for(;;){if(w=v>>>24,p>>>=w,q-=w,w=v>>>16&255,!(16&w)){if(0===(64&w)){v=s[(65535&v)+(p&(1<<w)-1)];continue c}a.msg="invalid distance code",e.mode=c;break a}if(y=65535&v,w&=15,w>q&&(p+=B[f++]<<q,q+=8,w>q&&(p+=B[f++]<<q,q+=8)),y+=p&(1<<w)-1,y>k){a.msg="invalid distance too far back",e.mode=c;break a}if(p>>>=w,q-=w,w=h-i,y>w){if(w=y-w,w>m&&e.sane){a.msg="invalid distance too far back",e.mode=c;break a}if(z=0,A=o,0===n){if(z+=l-w,x>w){x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}}else if(w>n){if(z+=l+n-w,w-=n,x>w){x-=w;do C[h++]=o[z++];while(--w);if(z=0,x>n){w=n,x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}}}else if(z+=n-w,x>w){x-=w;do C[h++]=o[z++];while(--w);z=h-y,A=C}for(;x>2;)C[h++]=A[z++],C[h++]=A[z++],C[h++]=A[z++],x-=3;x&&(C[h++]=A[z++],x>1&&(C[h++]=A[z++]))}else{z=h-y;do C[h++]=C[z++],C[h++]=C[z++],C[h++]=C[z++],x-=3;while(x>2);x&&(C[h++]=C[z++],x>1&&(C[h++]=C[z++]))}break}}break}}while(g>f&&j>h);x=q>>3,f-=x,q-=x<<3,p&=(1<<q)-1,a.next_in=f,a.next_out=h,a.avail_in=g>f?5+(g-f):5-(f-g),a.avail_out=j>h?257+(j-h):257-(h-j),e.hold=p,e.bits=q}},{}],35:[function(a,b,c){"use strict";function d(a){return(a>>>24&255)+(a>>>8&65280)+((65280&a)<<8)+((255&a)<<24)}function e(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new r.Buf16(320),this.work=new r.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function f(a){var b;return a&&a.state?(b=a.state,a.total_in=a.total_out=b.total=0,a.msg="",b.wrap&&(a.adler=1&b.wrap),b.mode=K,b.last=0,b.havedict=0,b.dmax=32768,b.head=null,b.hold=0,b.bits=0,b.lencode=b.lendyn=new r.Buf32(ob),b.distcode=b.distdyn=new r.Buf32(pb),b.sane=1,b.back=-1,C):F}function g(a){var b;return a&&a.state?(b=a.state,b.wsize=0,b.whave=0,b.wnext=0,f(a)):F}function h(a,b){var c,d;return a&&a.state?(d=a.state,0>b?(c=0,b=-b):(c=(b>>4)+1,48>b&&(b&=15)),b&&(8>b||b>15)?F:(null!==d.window&&d.wbits!==b&&(d.window=null),d.wrap=c,d.wbits=b,g(a))):F}function i(a,b){var c,d;return a?(d=new e,a.state=d,d.window=null,c=h(a,b),c!==C&&(a.state=null),c):F}function j(a){return i(a,rb)}function k(a){if(sb){var b;for(p=new r.Buf32(512),q=new r.Buf32(32),b=0;144>b;)a.lens[b++]=8;for(;256>b;)a.lens[b++]=9;for(;280>b;)a.lens[b++]=7;for(;288>b;)a.lens[b++]=8;for(v(x,a.lens,0,288,p,0,a.work,{bits:9}),b=0;32>b;)a.lens[b++]=5;v(y,a.lens,0,32,q,0,a.work,{bits:5}),sb=!1}a.lencode=p,a.lenbits=9,a.distcode=q,a.distbits=5}function l(a,b,c,d){var e,f=a.state;return null===f.window&&(f.wsize=1<<f.wbits,f.wnext=0,f.whave=0,f.window=new r.Buf8(f.wsize)),d>=f.wsize?(r.arraySet(f.window,b,c-f.wsize,f.wsize,0),f.wnext=0,f.whave=f.wsize):(e=f.wsize-f.wnext,e>d&&(e=d),r.arraySet(f.window,b,c-d,e,f.wnext),d-=e,d?(r.arraySet(f.window,b,c-d,d,0),f.wnext=d,f.whave=f.wsize):(f.wnext+=e,f.wnext===f.wsize&&(f.wnext=0),f.whave<f.wsize&&(f.whave+=e))),0}function m(a,b){var c,e,f,g,h,i,j,m,n,o,p,q,ob,pb,qb,rb,sb,tb,ub,vb,wb,xb,yb,zb,Ab=0,Bb=new r.Buf8(4),Cb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!a||!a.state||!a.output||!a.input&&0!==a.avail_in)return F;c=a.state,c.mode===V&&(c.mode=W),h=a.next_out,f=a.output,j=a.avail_out,g=a.next_in,e=a.input,i=a.avail_in,m=c.hold,n=c.bits,o=i,p=j,xb=C;a:for(;;)switch(c.mode){case K:if(0===c.wrap){c.mode=W;break}for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(2&c.wrap&&35615===m){c.check=0,Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0),m=0,n=0,c.mode=L;break}if(c.flags=0,c.head&&(c.head.done=!1),!(1&c.wrap)||(((255&m)<<8)+(m>>8))%31){a.msg="incorrect header check",c.mode=lb;break}if((15&m)!==J){a.msg="unknown compression method",c.mode=lb;break}if(m>>>=4,n-=4,wb=(15&m)+8,0===c.wbits)c.wbits=wb;else if(wb>c.wbits){a.msg="invalid window size",c.mode=lb;break}c.dmax=1<<wb,a.adler=c.check=1,c.mode=512&m?T:V,m=0,n=0;break;case L:for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(c.flags=m,(255&c.flags)!==J){a.msg="unknown compression method",c.mode=lb;break}if(57344&c.flags){a.msg="unknown header flags set",c.mode=lb;break}c.head&&(c.head.text=m>>8&1),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0,c.mode=M;case M:for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.head&&(c.head.time=m),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,Bb[2]=m>>>16&255,Bb[3]=m>>>24&255,c.check=t(c.check,Bb,4,0)),m=0,n=0,c.mode=N;case N:for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.head&&(c.head.xflags=255&m,c.head.os=m>>8),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0,c.mode=O;case O:if(1024&c.flags){for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.length=m,c.head&&(c.head.extra_len=m),512&c.flags&&(Bb[0]=255&m,Bb[1]=m>>>8&255,c.check=t(c.check,Bb,2,0)),m=0,n=0}else c.head&&(c.head.extra=null);c.mode=P;case P:if(1024&c.flags&&(q=c.length,q>i&&(q=i),q&&(c.head&&(wb=c.head.extra_len-c.length,c.head.extra||(c.head.extra=new Array(c.head.extra_len)),r.arraySet(c.head.extra,e,g,q,wb)),512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,c.length-=q),c.length))break a;c.length=0,c.mode=Q;case Q:if(2048&c.flags){if(0===i)break a;q=0;do wb=e[g+q++],c.head&&wb&&c.length<65536&&(c.head.name+=String.fromCharCode(wb));while(wb&&i>q);if(512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,wb)break a}else c.head&&(c.head.name=null);c.length=0,c.mode=R;case R:if(4096&c.flags){if(0===i)break a;q=0;do wb=e[g+q++],c.head&&wb&&c.length<65536&&(c.head.comment+=String.fromCharCode(wb));while(wb&&i>q);if(512&c.flags&&(c.check=t(c.check,e,q,g)),i-=q,g+=q,wb)break a}else c.head&&(c.head.comment=null);c.mode=S;case S:if(512&c.flags){for(;16>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m!==(65535&c.check)){a.msg="header crc mismatch",c.mode=lb;break}m=0,n=0}c.head&&(c.head.hcrc=c.flags>>9&1,c.head.done=!0),a.adler=c.check=0,c.mode=V;break;case T:for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}a.adler=c.check=d(m),m=0,n=0,c.mode=U;case U:if(0===c.havedict)return a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,E;a.adler=c.check=1,c.mode=V;case V:if(b===A||b===B)break a;case W:if(c.last){m>>>=7&n,n-=7&n,c.mode=ib;break}for(;3>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}switch(c.last=1&m,m>>>=1,n-=1,3&m){case 0:c.mode=X;break;case 1:if(k(c),c.mode=bb,b===B){m>>>=2,n-=2;break a}break;case 2:c.mode=$;break;case 3:a.msg="invalid block type",c.mode=lb}m>>>=2,n-=2;break;case X:for(m>>>=7&n,n-=7&n;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if((65535&m)!==(m>>>16^65535)){a.msg="invalid stored block lengths",c.mode=lb;break}if(c.length=65535&m,m=0,n=0,c.mode=Y,b===B)break a;case Y:c.mode=Z;case Z:if(q=c.length){if(q>i&&(q=i),q>j&&(q=j),0===q)break a;r.arraySet(f,e,g,q,h),i-=q,g+=q,j-=q,h+=q,c.length-=q;break}c.mode=V;break;case $:for(;14>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(c.nlen=(31&m)+257,m>>>=5,n-=5,c.ndist=(31&m)+1,m>>>=5,n-=5,c.ncode=(15&m)+4,m>>>=4,n-=4,c.nlen>286||c.ndist>30){a.msg="too many length or distance symbols",c.mode=lb;break}c.have=0,c.mode=_;case _:for(;c.have<c.ncode;){for(;3>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.lens[Cb[c.have++]]=7&m,m>>>=3,n-=3}for(;c.have<19;)c.lens[Cb[c.have++]]=0;if(c.lencode=c.lendyn,c.lenbits=7,yb={bits:c.lenbits},xb=v(w,c.lens,0,19,c.lencode,0,c.work,yb),c.lenbits=yb.bits,xb){a.msg="invalid code lengths set",c.mode=lb;break}c.have=0,c.mode=ab;case ab:for(;c.have<c.nlen+c.ndist;){for(;Ab=c.lencode[m&(1<<c.lenbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(16>sb)m>>>=qb,n-=qb,c.lens[c.have++]=sb;else{if(16===sb){for(zb=qb+2;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m>>>=qb,n-=qb,0===c.have){a.msg="invalid bit length repeat",c.mode=lb;break}wb=c.lens[c.have-1],q=3+(3&m),m>>>=2,n-=2}else if(17===sb){for(zb=qb+3;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=qb,n-=qb,wb=0,q=3+(7&m),m>>>=3,n-=3}else{for(zb=qb+7;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=qb,n-=qb,wb=0,q=11+(127&m),m>>>=7,n-=7}if(c.have+q>c.nlen+c.ndist){a.msg="invalid bit length repeat",c.mode=lb;break}for(;q--;)c.lens[c.have++]=wb}}if(c.mode===lb)break;if(0===c.lens[256]){a.msg="invalid code -- missing end-of-block",c.mode=lb;break}if(c.lenbits=9,yb={bits:c.lenbits},xb=v(x,c.lens,0,c.nlen,c.lencode,0,c.work,yb),c.lenbits=yb.bits,xb){a.msg="invalid literal/lengths set",c.mode=lb;break}if(c.distbits=6,c.distcode=c.distdyn,yb={bits:c.distbits},xb=v(y,c.lens,c.nlen,c.ndist,c.distcode,0,c.work,yb),c.distbits=yb.bits,xb){a.msg="invalid distances set",c.mode=lb;break}if(c.mode=bb,b===B)break a;case bb:c.mode=cb;case cb:if(i>=6&&j>=258){a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,u(a,p),h=a.next_out,f=a.output,j=a.avail_out,g=a.next_in,e=a.input,i=a.avail_in,m=c.hold,n=c.bits,c.mode===V&&(c.back=-1);
break}for(c.back=0;Ab=c.lencode[m&(1<<c.lenbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(rb&&0===(240&rb)){for(tb=qb,ub=rb,vb=sb;Ab=c.lencode[vb+((m&(1<<tb+ub)-1)>>tb)],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=tb+qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=tb,n-=tb,c.back+=tb}if(m>>>=qb,n-=qb,c.back+=qb,c.length=sb,0===rb){c.mode=hb;break}if(32&rb){c.back=-1,c.mode=V;break}if(64&rb){a.msg="invalid literal/length code",c.mode=lb;break}c.extra=15&rb,c.mode=db;case db:if(c.extra){for(zb=c.extra;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.length+=m&(1<<c.extra)-1,m>>>=c.extra,n-=c.extra,c.back+=c.extra}c.was=c.length,c.mode=eb;case eb:for(;Ab=c.distcode[m&(1<<c.distbits)-1],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(0===(240&rb)){for(tb=qb,ub=rb,vb=sb;Ab=c.distcode[vb+((m&(1<<tb+ub)-1)>>tb)],qb=Ab>>>24,rb=Ab>>>16&255,sb=65535&Ab,!(n>=tb+qb);){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}m>>>=tb,n-=tb,c.back+=tb}if(m>>>=qb,n-=qb,c.back+=qb,64&rb){a.msg="invalid distance code",c.mode=lb;break}c.offset=sb,c.extra=15&rb,c.mode=fb;case fb:if(c.extra){for(zb=c.extra;zb>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}c.offset+=m&(1<<c.extra)-1,m>>>=c.extra,n-=c.extra,c.back+=c.extra}if(c.offset>c.dmax){a.msg="invalid distance too far back",c.mode=lb;break}c.mode=gb;case gb:if(0===j)break a;if(q=p-j,c.offset>q){if(q=c.offset-q,q>c.whave&&c.sane){a.msg="invalid distance too far back",c.mode=lb;break}q>c.wnext?(q-=c.wnext,ob=c.wsize-q):ob=c.wnext-q,q>c.length&&(q=c.length),pb=c.window}else pb=f,ob=h-c.offset,q=c.length;q>j&&(q=j),j-=q,c.length-=q;do f[h++]=pb[ob++];while(--q);0===c.length&&(c.mode=cb);break;case hb:if(0===j)break a;f[h++]=c.length,j--,c.mode=cb;break;case ib:if(c.wrap){for(;32>n;){if(0===i)break a;i--,m|=e[g++]<<n,n+=8}if(p-=j,a.total_out+=p,c.total+=p,p&&(a.adler=c.check=c.flags?t(c.check,f,p,h-p):s(c.check,f,p,h-p)),p=j,(c.flags?m:d(m))!==c.check){a.msg="incorrect data check",c.mode=lb;break}m=0,n=0}c.mode=jb;case jb:if(c.wrap&&c.flags){for(;32>n;){if(0===i)break a;i--,m+=e[g++]<<n,n+=8}if(m!==(4294967295&c.total)){a.msg="incorrect length check",c.mode=lb;break}m=0,n=0}c.mode=kb;case kb:xb=D;break a;case lb:xb=G;break a;case mb:return H;case nb:default:return F}return a.next_out=h,a.avail_out=j,a.next_in=g,a.avail_in=i,c.hold=m,c.bits=n,(c.wsize||p!==a.avail_out&&c.mode<lb&&(c.mode<ib||b!==z))&&l(a,a.output,a.next_out,p-a.avail_out)?(c.mode=mb,H):(o-=a.avail_in,p-=a.avail_out,a.total_in+=o,a.total_out+=p,c.total+=p,c.wrap&&p&&(a.adler=c.check=c.flags?t(c.check,f,p,a.next_out-p):s(c.check,f,p,a.next_out-p)),a.data_type=c.bits+(c.last?64:0)+(c.mode===V?128:0)+(c.mode===bb||c.mode===Y?256:0),(0===o&&0===p||b===z)&&xb===C&&(xb=I),xb)}function n(a){if(!a||!a.state)return F;var b=a.state;return b.window&&(b.window=null),a.state=null,C}function o(a,b){var c;return a&&a.state?(c=a.state,0===(2&c.wrap)?F:(c.head=b,b.done=!1,C)):F}var p,q,r=a("../utils/common"),s=a("./adler32"),t=a("./crc32"),u=a("./inffast"),v=a("./inftrees"),w=0,x=1,y=2,z=4,A=5,B=6,C=0,D=1,E=2,F=-2,G=-3,H=-4,I=-5,J=8,K=1,L=2,M=3,N=4,O=5,P=6,Q=7,R=8,S=9,T=10,U=11,V=12,W=13,X=14,Y=15,Z=16,$=17,_=18,ab=19,bb=20,cb=21,db=22,eb=23,fb=24,gb=25,hb=26,ib=27,jb=28,kb=29,lb=30,mb=31,nb=32,ob=852,pb=592,qb=15,rb=qb,sb=!0;c.inflateReset=g,c.inflateReset2=h,c.inflateResetKeep=f,c.inflateInit=j,c.inflateInit2=i,c.inflate=m,c.inflateEnd=n,c.inflateGetHeader=o,c.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":27,"./adler32":29,"./crc32":31,"./inffast":34,"./inftrees":36}],36:[function(a,b){"use strict";var c=a("../utils/common"),d=15,e=852,f=592,g=0,h=1,i=2,j=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],k=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],l=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],m=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];b.exports=function(a,b,n,o,p,q,r,s){var t,u,v,w,x,y,z,A,B,C=s.bits,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=null,O=0,P=new c.Buf16(d+1),Q=new c.Buf16(d+1),R=null,S=0;for(D=0;d>=D;D++)P[D]=0;for(E=0;o>E;E++)P[b[n+E]]++;for(H=C,G=d;G>=1&&0===P[G];G--);if(H>G&&(H=G),0===G)return p[q++]=20971520,p[q++]=20971520,s.bits=1,0;for(F=1;G>F&&0===P[F];F++);for(F>H&&(H=F),K=1,D=1;d>=D;D++)if(K<<=1,K-=P[D],0>K)return-1;if(K>0&&(a===g||1!==G))return-1;for(Q[1]=0,D=1;d>D;D++)Q[D+1]=Q[D]+P[D];for(E=0;o>E;E++)0!==b[n+E]&&(r[Q[b[n+E]]++]=E);if(a===g?(N=R=r,y=19):a===h?(N=j,O-=257,R=k,S-=257,y=256):(N=l,R=m,y=-1),M=0,E=0,D=F,x=q,I=H,J=0,v=-1,L=1<<H,w=L-1,a===h&&L>e||a===i&&L>f)return 1;for(var T=0;;){T++,z=D-J,r[E]<y?(A=0,B=r[E]):r[E]>y?(A=R[S+r[E]],B=N[O+r[E]]):(A=96,B=0),t=1<<D-J,u=1<<I,F=u;do u-=t,p[x+(M>>J)+u]=z<<24|A<<16|B|0;while(0!==u);for(t=1<<D-1;M&t;)t>>=1;if(0!==t?(M&=t-1,M+=t):M=0,E++,0===--P[D]){if(D===G)break;D=b[n+r[E]]}if(D>H&&(M&w)!==v){for(0===J&&(J=H),x+=F,I=D-J,K=1<<I;G>I+J&&(K-=P[I+J],!(0>=K));)I++,K<<=1;if(L+=1<<I,a===h&&L>e||a===i&&L>f)return 1;v=M&w,p[v]=H<<24|I<<16|x-q|0}}return 0!==M&&(p[x+M]=D-J<<24|64<<16|0),s.bits=H,0}},{"../utils/common":27}],37:[function(a,b){"use strict";b.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],38:[function(a,b,c){"use strict";function d(a){for(var b=a.length;--b>=0;)a[b]=0}function e(a){return 256>a?gb[a]:gb[256+(a>>>7)]}function f(a,b){a.pending_buf[a.pending++]=255&b,a.pending_buf[a.pending++]=b>>>8&255}function g(a,b,c){a.bi_valid>V-c?(a.bi_buf|=b<<a.bi_valid&65535,f(a,a.bi_buf),a.bi_buf=b>>V-a.bi_valid,a.bi_valid+=c-V):(a.bi_buf|=b<<a.bi_valid&65535,a.bi_valid+=c)}function h(a,b,c){g(a,c[2*b],c[2*b+1])}function i(a,b){var c=0;do c|=1&a,a>>>=1,c<<=1;while(--b>0);return c>>>1}function j(a){16===a.bi_valid?(f(a,a.bi_buf),a.bi_buf=0,a.bi_valid=0):a.bi_valid>=8&&(a.pending_buf[a.pending++]=255&a.bi_buf,a.bi_buf>>=8,a.bi_valid-=8)}function k(a,b){var c,d,e,f,g,h,i=b.dyn_tree,j=b.max_code,k=b.stat_desc.static_tree,l=b.stat_desc.has_stree,m=b.stat_desc.extra_bits,n=b.stat_desc.extra_base,o=b.stat_desc.max_length,p=0;for(f=0;U>=f;f++)a.bl_count[f]=0;for(i[2*a.heap[a.heap_max]+1]=0,c=a.heap_max+1;T>c;c++)d=a.heap[c],f=i[2*i[2*d+1]+1]+1,f>o&&(f=o,p++),i[2*d+1]=f,d>j||(a.bl_count[f]++,g=0,d>=n&&(g=m[d-n]),h=i[2*d],a.opt_len+=h*(f+g),l&&(a.static_len+=h*(k[2*d+1]+g)));if(0!==p){do{for(f=o-1;0===a.bl_count[f];)f--;a.bl_count[f]--,a.bl_count[f+1]+=2,a.bl_count[o]--,p-=2}while(p>0);for(f=o;0!==f;f--)for(d=a.bl_count[f];0!==d;)e=a.heap[--c],e>j||(i[2*e+1]!==f&&(a.opt_len+=(f-i[2*e+1])*i[2*e],i[2*e+1]=f),d--)}}function l(a,b,c){var d,e,f=new Array(U+1),g=0;for(d=1;U>=d;d++)f[d]=g=g+c[d-1]<<1;for(e=0;b>=e;e++){var h=a[2*e+1];0!==h&&(a[2*e]=i(f[h]++,h))}}function m(){var a,b,c,d,e,f=new Array(U+1);for(c=0,d=0;O-1>d;d++)for(ib[d]=c,a=0;a<1<<_[d];a++)hb[c++]=d;for(hb[c-1]=d,e=0,d=0;16>d;d++)for(jb[d]=e,a=0;a<1<<ab[d];a++)gb[e++]=d;for(e>>=7;R>d;d++)for(jb[d]=e<<7,a=0;a<1<<ab[d]-7;a++)gb[256+e++]=d;for(b=0;U>=b;b++)f[b]=0;for(a=0;143>=a;)eb[2*a+1]=8,a++,f[8]++;for(;255>=a;)eb[2*a+1]=9,a++,f[9]++;for(;279>=a;)eb[2*a+1]=7,a++,f[7]++;for(;287>=a;)eb[2*a+1]=8,a++,f[8]++;for(l(eb,Q+1,f),a=0;R>a;a++)fb[2*a+1]=5,fb[2*a]=i(a,5);kb=new nb(eb,_,P+1,Q,U),lb=new nb(fb,ab,0,R,U),mb=new nb(new Array(0),bb,0,S,W)}function n(a){var b;for(b=0;Q>b;b++)a.dyn_ltree[2*b]=0;for(b=0;R>b;b++)a.dyn_dtree[2*b]=0;for(b=0;S>b;b++)a.bl_tree[2*b]=0;a.dyn_ltree[2*X]=1,a.opt_len=a.static_len=0,a.last_lit=a.matches=0}function o(a){a.bi_valid>8?f(a,a.bi_buf):a.bi_valid>0&&(a.pending_buf[a.pending++]=a.bi_buf),a.bi_buf=0,a.bi_valid=0}function p(a,b,c,d){o(a),d&&(f(a,c),f(a,~c)),E.arraySet(a.pending_buf,a.window,b,c,a.pending),a.pending+=c}function q(a,b,c,d){var e=2*b,f=2*c;return a[e]<a[f]||a[e]===a[f]&&d[b]<=d[c]}function r(a,b,c){for(var d=a.heap[c],e=c<<1;e<=a.heap_len&&(e<a.heap_len&&q(b,a.heap[e+1],a.heap[e],a.depth)&&e++,!q(b,d,a.heap[e],a.depth));)a.heap[c]=a.heap[e],c=e,e<<=1;a.heap[c]=d}function s(a,b,c){var d,f,i,j,k=0;if(0!==a.last_lit)do d=a.pending_buf[a.d_buf+2*k]<<8|a.pending_buf[a.d_buf+2*k+1],f=a.pending_buf[a.l_buf+k],k++,0===d?h(a,f,b):(i=hb[f],h(a,i+P+1,b),j=_[i],0!==j&&(f-=ib[i],g(a,f,j)),d--,i=e(d),h(a,i,c),j=ab[i],0!==j&&(d-=jb[i],g(a,d,j)));while(k<a.last_lit);h(a,X,b)}function t(a,b){var c,d,e,f=b.dyn_tree,g=b.stat_desc.static_tree,h=b.stat_desc.has_stree,i=b.stat_desc.elems,j=-1;for(a.heap_len=0,a.heap_max=T,c=0;i>c;c++)0!==f[2*c]?(a.heap[++a.heap_len]=j=c,a.depth[c]=0):f[2*c+1]=0;for(;a.heap_len<2;)e=a.heap[++a.heap_len]=2>j?++j:0,f[2*e]=1,a.depth[e]=0,a.opt_len--,h&&(a.static_len-=g[2*e+1]);for(b.max_code=j,c=a.heap_len>>1;c>=1;c--)r(a,f,c);e=i;do c=a.heap[1],a.heap[1]=a.heap[a.heap_len--],r(a,f,1),d=a.heap[1],a.heap[--a.heap_max]=c,a.heap[--a.heap_max]=d,f[2*e]=f[2*c]+f[2*d],a.depth[e]=(a.depth[c]>=a.depth[d]?a.depth[c]:a.depth[d])+1,f[2*c+1]=f[2*d+1]=e,a.heap[1]=e++,r(a,f,1);while(a.heap_len>=2);a.heap[--a.heap_max]=a.heap[1],k(a,b),l(f,j,a.bl_count)}function u(a,b,c){var d,e,f=-1,g=b[1],h=0,i=7,j=4;for(0===g&&(i=138,j=3),b[2*(c+1)+1]=65535,d=0;c>=d;d++)e=g,g=b[2*(d+1)+1],++h<i&&e===g||(j>h?a.bl_tree[2*e]+=h:0!==e?(e!==f&&a.bl_tree[2*e]++,a.bl_tree[2*Y]++):10>=h?a.bl_tree[2*Z]++:a.bl_tree[2*$]++,h=0,f=e,0===g?(i=138,j=3):e===g?(i=6,j=3):(i=7,j=4))}function v(a,b,c){var d,e,f=-1,i=b[1],j=0,k=7,l=4;for(0===i&&(k=138,l=3),d=0;c>=d;d++)if(e=i,i=b[2*(d+1)+1],!(++j<k&&e===i)){if(l>j){do h(a,e,a.bl_tree);while(0!==--j)}else 0!==e?(e!==f&&(h(a,e,a.bl_tree),j--),h(a,Y,a.bl_tree),g(a,j-3,2)):10>=j?(h(a,Z,a.bl_tree),g(a,j-3,3)):(h(a,$,a.bl_tree),g(a,j-11,7));j=0,f=e,0===i?(k=138,l=3):e===i?(k=6,l=3):(k=7,l=4)}}function w(a){var b;for(u(a,a.dyn_ltree,a.l_desc.max_code),u(a,a.dyn_dtree,a.d_desc.max_code),t(a,a.bl_desc),b=S-1;b>=3&&0===a.bl_tree[2*cb[b]+1];b--);return a.opt_len+=3*(b+1)+5+5+4,b}function x(a,b,c,d){var e;for(g(a,b-257,5),g(a,c-1,5),g(a,d-4,4),e=0;d>e;e++)g(a,a.bl_tree[2*cb[e]+1],3);v(a,a.dyn_ltree,b-1),v(a,a.dyn_dtree,c-1)}function y(a){var b,c=4093624447;for(b=0;31>=b;b++,c>>>=1)if(1&c&&0!==a.dyn_ltree[2*b])return G;if(0!==a.dyn_ltree[18]||0!==a.dyn_ltree[20]||0!==a.dyn_ltree[26])return H;for(b=32;P>b;b++)if(0!==a.dyn_ltree[2*b])return H;return G}function z(a){pb||(m(),pb=!0),a.l_desc=new ob(a.dyn_ltree,kb),a.d_desc=new ob(a.dyn_dtree,lb),a.bl_desc=new ob(a.bl_tree,mb),a.bi_buf=0,a.bi_valid=0,n(a)}function A(a,b,c,d){g(a,(J<<1)+(d?1:0),3),p(a,b,c,!0)}function B(a){g(a,K<<1,3),h(a,X,eb),j(a)}function C(a,b,c,d){var e,f,h=0;a.level>0?(a.strm.data_type===I&&(a.strm.data_type=y(a)),t(a,a.l_desc),t(a,a.d_desc),h=w(a),e=a.opt_len+3+7>>>3,f=a.static_len+3+7>>>3,e>=f&&(e=f)):e=f=c+5,e>=c+4&&-1!==b?A(a,b,c,d):a.strategy===F||f===e?(g(a,(K<<1)+(d?1:0),3),s(a,eb,fb)):(g(a,(L<<1)+(d?1:0),3),x(a,a.l_desc.max_code+1,a.d_desc.max_code+1,h+1),s(a,a.dyn_ltree,a.dyn_dtree)),n(a),d&&o(a)}function D(a,b,c){return a.pending_buf[a.d_buf+2*a.last_lit]=b>>>8&255,a.pending_buf[a.d_buf+2*a.last_lit+1]=255&b,a.pending_buf[a.l_buf+a.last_lit]=255&c,a.last_lit++,0===b?a.dyn_ltree[2*c]++:(a.matches++,b--,a.dyn_ltree[2*(hb[c]+P+1)]++,a.dyn_dtree[2*e(b)]++),a.last_lit===a.lit_bufsize-1}var E=a("../utils/common"),F=4,G=0,H=1,I=2,J=0,K=1,L=2,M=3,N=258,O=29,P=256,Q=P+1+O,R=30,S=19,T=2*Q+1,U=15,V=16,W=7,X=256,Y=16,Z=17,$=18,_=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],ab=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],bb=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],cb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],db=512,eb=new Array(2*(Q+2));d(eb);var fb=new Array(2*R);d(fb);var gb=new Array(db);d(gb);var hb=new Array(N-M+1);d(hb);var ib=new Array(O);d(ib);var jb=new Array(R);d(jb);var kb,lb,mb,nb=function(a,b,c,d,e){this.static_tree=a,this.extra_bits=b,this.extra_base=c,this.elems=d,this.max_length=e,this.has_stree=a&&a.length},ob=function(a,b){this.dyn_tree=a,this.max_code=0,this.stat_desc=b},pb=!1;c._tr_init=z,c._tr_stored_block=A,c._tr_flush_block=C,c._tr_tally=D,c._tr_align=B},{"../utils/common":27}],39:[function(a,b){"use strict";function c(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}b.exports=c},{}]},{},[9])(9)});;
/*!

 JSZipUtils - A collection of cross-browser utilities to go along with JSZip.
 <http://stuk.github.io/jszip-utils>

 (c) 2014 Stuart Knightley, David Duponchel
 Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip-utils/master/LICENSE.markdown.

 */
!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.JSZipUtils=e():"undefined"!=typeof global?global.JSZipUtils=e():"undefined"!=typeof self&&(self.JSZipUtils=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
  'use strict';

  var JSZipUtils = {};
// just use the responseText with xhr1, response with xhr2.
// The transformation doesn't throw away high-order byte (with responseText)
// because JSZip handles that case. If not used with JSZip, you may need to
// do it, see https://developer.mozilla.org/En/Using_XMLHttpRequest#Handling_binary_data
  JSZipUtils._getBinaryFromXHR = function (xhr) {
    // for xhr.responseText, the 0xFF mask is applied by JSZip
    return xhr.response || xhr.responseText;
  };

// taken from jQuery
  function createStandardXHR() {
    try {
      return new window.XMLHttpRequest();
    } catch( e ) {}
  }

  function createActiveXHR() {
    try {
      return new window.ActiveXObject("Microsoft.XMLHTTP");
    } catch( e ) {}
  }

// Create the request object
  var createXHR = window.ActiveXObject ?
    /* Microsoft failed to properly
     * implement the XMLHttpRequest in IE7 (can't request local files),
     * so we use the ActiveXObject when it is available
     * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
     * we need a fallback.
     */
    function() {
      return createStandardXHR() || createActiveXHR();
    } :
    // For all other browsers, use the standard XMLHttpRequest object
    createStandardXHR;



  JSZipUtils.getBinaryContent = function(path, callback) {
    /*
     * Here is the tricky part : getting the data.
     * In firefox/chrome/opera/... setting the mimeType to 'text/plain; charset=x-user-defined'
     * is enough, the result is in the standard xhr.responseText.
     * cf https://developer.mozilla.org/En/XMLHttpRequest/Using_XMLHttpRequest#Receiving_binary_data_in_older_browsers
     * In IE <= 9, we must use (the IE only) attribute responseBody
     * (for binary data, its content is different from responseText).
     * In IE 10, the 'charset=x-user-defined' trick doesn't work, only the
     * responseType will work :
     * http://msdn.microsoft.com/en-us/library/ie/hh673569%28v=vs.85%29.aspx#Binary_Object_upload_and_download
     *
     * I'd like to use jQuery to avoid this XHR madness, but it doesn't support
     * the responseType attribute : http://bugs.jquery.com/ticket/11461
     */
    try {

      var xhr = createXHR();

      xhr.open('GET', path, true);

      // recent browsers
      if ("responseType" in xhr) {
        xhr.responseType = "arraybuffer";
      }

      // older browser
      if(xhr.overrideMimeType) {
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
      }

      xhr.onreadystatechange = function(evt) {
        var file, err;
        // use `xhr` and not `this`... thanks IE
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 0) {
            file = null;
            err = null;
            try {
              file = JSZipUtils._getBinaryFromXHR(xhr);
            } catch(e) {
              err = new Error(e);
            }
            callback(err, file);
          } else {
            callback(new Error("Ajax error for " + path + " : " + this.status + " " + this.statusText), null);
          }
        }
      };

      xhr.send();

    } catch (e) {
      callback(new Error(e), null);
    }
  };

// export
  module.exports = JSZipUtils;

// enforcing Stuk's coding style
// vim: set shiftwidth=4 softtabstop=4:

},{}]},{},[1])
(1)
});
;
;
/*global Blob, saveAs, JSZipUtils, Docxgen */
var H5P = H5P || {};

/**
 * Class responsible for creating an export page
 */
H5P.ExportPage = (function ($, EventDispatcher) {

  var isMobile = {
    Android: function () {
      return (/Android/i).test(navigator.userAgent);
    },
    BlackBerry: function () {
      return (/BlackBerry/i).test(navigator.userAgent);
    },
    iOS: function () {
      return (/iPhone|iPad|iPod/i).test(navigator.userAgent);
    },
    ie9: function () {
      return (/MSIE 9/i).test(navigator.userAgent);
    },
    Windows: function () {
      return (/IEMobile/i).test(navigator.userAgent);
    },
    any: function () {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    }
  };

  /**
   * Display a pop-up containing an exportable text area with action buttons.
   *
   * @param {String} header Header message
   * @param {jQuery} $body The container which message dialog will be appended to
   * @param {boolean} enableSubmit Determines whether a submit button is shown
   * @param {String} submitTextLabel Submit button label
   * @param {String} submitSuccessTextLabel Submit success message
   * @param {String} selectAllTextLabel Select all text button label
   * @param {String} exportTextLabel Export text button label
   * @param {String} templatePath Path to docx template
   * @param {Object} templateContent Object containing template content
   */
  function ExportPage(header, $body, enableSubmit, submitTextLabel, submitSuccessTextLabel, selectAllTextLabel, exportTextLabel, templatePath, templateContent) {
    EventDispatcher.call(this);
    var self = this;

    this.templatePath = templatePath;
    this.templateContent = templateContent;

    // Standard labels:
    var standardSelectAllTextLabel = selectAllTextLabel || 'Select';
    var standardExportTextLabel = exportTextLabel || 'Export';
    var standardSubmitTextLabel = submitTextLabel || 'Submit';
    self.standardSubmitSuccessTextLabel = submitSuccessTextLabel || 'Your report was submitted successfully!';

    var exportPageTemplate =
      '<div class="joubel-create-document" role="dialog">' +
      ' <div class="joubel-exportable-header">' +
      '   <div class="joubel-exportable-header-inner" role="toolbar">' +
      '     <div class="joubel-exportable-header-text" tabindex="-1">' +
      '       <span>' + header + '</span>' +
      '     </div>' +
      '     <button class="joubel-export-page-close" title="Exit" aria-label="Exit" tabindex="3"></button>' +
      '     <button class="joubel-exportable-copy-button" title ="' + standardSelectAllTextLabel + '" tabindex="2">' +
      '       <span>' + standardSelectAllTextLabel + '</span>' +
      '     </button>' +
      '     <button class="joubel-exportable-export-button" title="' + standardExportTextLabel + '" tabindex="1">' +
      '       <span>' + standardExportTextLabel + '</span>' +
      '     </button>' +
            (enableSubmit ?
              '     <button class="joubel-exportable-submit-button" title="' + standardSubmitTextLabel + '" tabindex="1">' +
      '       <span>' + standardSubmitTextLabel + '</span>' +
      '     </button>'
              : '') +
      '   </div>' +
      ' </div>' +
      ' <div class="joubel-exportable-body">' +
      '   <div class="joubel-exportable-area" tabindex="0"></div>' +
      ' </div>' +
      '</div>';

    this.$inner = $(exportPageTemplate);
    this.$exportableBody = this.$inner.find('.joubel-exportable-body');
    this.$submitButton = this.$inner.find('.joubel-exportable-submit-button');
    this.$exportButton = this.$inner.find('.joubel-exportable-export-button');
    this.$exportCloseButton = this.$inner.find('.joubel-export-page-close');
    this.$exportCopyButton = this.$inner.find('.joubel-exportable-copy-button');

    // Replace newlines with html line breaks
    var $bodyReplacedLineBreaks = $body.replace(/(?:\r\n|\r|\n)/g, '<br />');

    // Append body to exportable area
    self.$exportableArea = $('.joubel-exportable-area', self.$inner).append($bodyReplacedLineBreaks);

    self.initExitExportPageButton();
    self.initSubmitButton();
    self.initExportButton();
    self.initSelectAllTextButton();

    // Does not work on IE9 and mobiles except android
    if (isMobile.ie9() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows()) {
      self.$exportButton.remove();
    }

    // Does not work on mobiles, but works on IE9
    if (isMobile.any()) {
      self.$exportCopyButton.remove();
    }

    // Initialize resize listener for responsive design
    this.initResizeFunctionality();
  }

  // Setting up inheritance
  ExportPage.prototype = Object.create(EventDispatcher.prototype);
  ExportPage.prototype.constructor = ExportPage;

  /**
   * Return reference to main DOM element
   * @return {H5P.jQuery}
   */
  ExportPage.prototype.getElement = function () {
    return this.$inner;
  };

  /**
   * Initialize exit export page button
   */
  ExportPage.prototype.initExitExportPageButton = function () {
    var self = this;

    self.$exportCloseButton.on('click', function () {
      // Remove export page.
      self.$inner.remove();
      self.trigger('closed');
    });
  };

  /**
   * Sets focus on page
   */
  ExportPage.prototype.focus = function () {
    this.$submitButton ? this.$submitButton.focus() : this.$exportButton.focus();
  };

  /**
   * Initialize Submit button interactions
   */
  ExportPage.prototype.initSubmitButton = function () {
    var self = this;
    // Submit document button event
    self.$submitButton.on('click', function () {

      self.$submitButton.attr('disabled','disabled');
      self.$submitButton.addClass('joubel-exportable-button-disabled');

      // Trigger a submit event so the report can be saved via xAPI at the
      // documentation tool level
      self.trigger('submitted');

      self.$successDiv = $('<div/>', {
        text: self.standardSubmitSuccessTextLabel,
        'class': 'joubel-exportable-success-message'
      });

      self.$exportableBody.prepend(self.$successDiv);

      self.$exportableBody.addClass('joubel-has-success');
    });
  };

  /**
   * Initialize export button interactions
   */
  ExportPage.prototype.initExportButton = function () {
    var self = this;
    // Export document button event
    self.$exportButton.on('click', function () {
      self.saveText(self.$exportableArea.html());
    });
  };


  /**
   * Initialize select all text button interactions
   */
  ExportPage.prototype.initSelectAllTextButton = function () {
    var self = this;
    // Select all text button event
    self.$exportCopyButton.on('click', function () {
      self.selectText(self.$exportableArea);
    });
  };

  /**
   * Initializes listener for resize and performs initial resize when rendered
   */
  ExportPage.prototype.initResizeFunctionality = function () {
    var self = this;

    // Listen for window resize
    $(window).resize(function () {
      self.resize();
    });

    // Initialize responsive view when view is rendered
    setTimeout(function () {
      self.resize();
    }, 0);
  };

  /**
   * Select all text in container
   * @param {jQuery} $container Container containing selected text
   */
  ExportPage.prototype.selectText = function ($container) {
    var doc = document;
    var text = $container.get(0);
    var range;
    var selection;

    if (doc.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(text);
      range.select();
    }
    else if (window.getSelection) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(text);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  /**
   * Save html string to file
   * @param {string} html html string
   */
  ExportPage.prototype.saveText = function (html) {
    var self = this;

    if (this.templatePath === undefined) {
      // Use old method

      // Save it as a file:
      var blob = new Blob([this.createDocContent(html)], {
        type: "application/msword;charset=utf-8"
      });
      saveAs(blob, 'exported-text.doc');
    }
    else {
      var loadFile = function (url, callback) {
        JSZipUtils.getBinaryContent(url, function (err, data) {
          callback(null, data);
        });
      };

      loadFile(self.templatePath, function (err, content) {
        var doc = new Docxgen(content);
        if (self.templateContent !== undefined) {
          doc.setData(self.templateContent); //set the templateVariables
        }
        doc.render(); //apply them
        var out = doc.getZip().generate({type: "blob"}); //Output the document using Data-URI
        saveAs(out, "exported-text.docx");
      });
    }
  };

  /**
   * Create doc content from html
   * @param {string} html Html content
   * @returns {string} html embedded content
   */
  ExportPage.prototype.createDocContent = function (html) {
    // Create HTML:
    // me + ta and other hacks to avoid that new relic injects script...
    return '<ht' + 'ml><he' + 'ad><me' + 'ta charset="UTF-8"></me' + 'ta></he' + 'ad><bo' + 'dy>' + html + '</bo' + 'dy></ht' + 'ml>';
  };

  /**
   * Responsive resize function
   */
  ExportPage.prototype.resize = function () {
    var self = this;
    var $innerTmp = self.$inner.clone()
      .css('position', 'absolute')
      .removeClass('responsive')
      .removeClass('no-title')
      .appendTo(self.$inner.parent());

    // Determine if view should be responsive
    var $headerInner = $('.joubel-exportable-header-inner', $innerTmp);
    var leftMargin = parseInt($('.joubel-exportable-header-text', $headerInner).css('font-size'), 10);
    var rightMargin = parseInt($('.joubel-export-page-close', $headerInner).css('font-size'), 10);

    var dynamicRemoveLabelsThreshold = this.calculateHeaderThreshold($innerTmp, (leftMargin + rightMargin));
    var headerWidth = $headerInner.width();

    if (headerWidth <= dynamicRemoveLabelsThreshold) {
      self.$inner.addClass('responsive');
      $innerTmp.addClass('responsive');

      if (self.$successDiv) {
        self.$successDiv.addClass('joubel-narrow-view');
      }
    }
    else {
      self.$inner.removeClass('responsive');
      $innerTmp.remove();

      if (self.$successDiv) {
        self.$successDiv.removeClass('joubel-narrow-view');
      }
      return;
    }


    // Determine if view should have no title
    headerWidth = $headerInner.width();
    var dynamicRemoveTitleThreshold = this.calculateHeaderThreshold($innerTmp, (leftMargin + rightMargin));

    if (headerWidth <= dynamicRemoveTitleThreshold) {
      self.$inner.addClass('no-title');
    }
    else {
      self.$inner.removeClass('no-title');
    }

    $innerTmp.remove();
  };

  /**
   * Calculates width of header elements
   */
  ExportPage.prototype.calculateHeaderThreshold = function ($container, margin) {
    var staticPadding = 1;

    if (margin === undefined || isNaN(margin)) {
      margin = 0;
    }

    // Calculate elements width
    var $submitButtonTmp = $('.joubel-exportable-submit-button', $container);
    var $exportButtonTmp = $('.joubel-exportable-export-button', $container);
    var $selectTextButtonTmp = $('.joubel-exportable-copy-button', $container);
    var $removeDialogButtonTmp = $('.joubel-export-page-close', $container);
    var $titleTmp = $('.joubel-exportable-header-text', $container);

    var dynamicThreshold = $submitButtonTmp.outerWidth() +
      $exportButtonTmp.outerWidth() +
      $selectTextButtonTmp.outerWidth() +
      $removeDialogButtonTmp.outerWidth() +
      $titleTmp.outerWidth();

    return dynamicThreshold + margin + staticPadding;
  };

  return ExportPage;
}(H5P.jQuery, H5P.EventDispatcher));
;
/* Blob.js
 * A Blob implementation.
 * 2014-07-24
 *
 * By Eli Grey, http://eligrey.com
 * By Devin Samarin, https://github.com/dsamarin
 * License: MIT
 *   See https://github.com/eligrey/Blob.js/blob/master/LICENSE.md
 */

/*global self, unescape */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true */

/*! @source http://purl.eligrey.com/github/Blob.js/blob/master/Blob.js */

(function (view) {
	"use strict";

	view.URL = view.URL || view.webkitURL;

	if (view.Blob && view.URL) {
		try {
			new Blob;
			return;
		} catch (e) {}
	}

	// Internally we use a BlobBuilder implementation to base Blob off of
	// in order to support older browsers that only have BlobBuilder
	var BlobBuilder = view.BlobBuilder || view.WebKitBlobBuilder || view.MozBlobBuilder || (function(view) {
		var
			  get_class = function(object) {
				return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
			}
			, FakeBlobBuilder = function BlobBuilder() {
				this.data = [];
			}
			, FakeBlob = function Blob(data, type, encoding) {
				this.data = data;
				this.size = data.length;
				this.type = type;
				this.encoding = encoding;
			}
			, FBB_proto = FakeBlobBuilder.prototype
			, FB_proto = FakeBlob.prototype
			, FileReaderSync = view.FileReaderSync
			, FileException = function(type) {
				this.code = this[this.name = type];
			}
			, file_ex_codes = (
				  "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR "
				+ "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
			).split(" ")
			, file_ex_code = file_ex_codes.length
			, real_URL = view.URL || view.webkitURL || view
			, real_create_object_URL = real_URL.createObjectURL
			, real_revoke_object_URL = real_URL.revokeObjectURL
			, URL = real_URL
			, btoa = view.btoa
			, atob = view.atob

			, ArrayBuffer = view.ArrayBuffer
			, Uint8Array = view.Uint8Array

			, origin = /^[\w-]+:\/*\[?[\w\.:-]+\]?(?::[0-9]+)?/
		;
		FakeBlob.fake = FB_proto.fake = true;
		while (file_ex_code--) {
			FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
		}
		// Polyfill URL
		if (!real_URL.createObjectURL) {
			URL = view.URL = function(uri) {
				var
					  uri_info = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
					, uri_origin
				;
				uri_info.href = uri;
				if (!("origin" in uri_info)) {
					if (uri_info.protocol.toLowerCase() === "data:") {
						uri_info.origin = null;
					} else {
						uri_origin = uri.match(origin);
						uri_info.origin = uri_origin && uri_origin[1];
					}
				}
				return uri_info;
			};
		}
		URL.createObjectURL = function(blob) {
			var
				  type = blob.type
				, data_URI_header
			;
			if (type === null) {
				type = "application/octet-stream";
			}
			if (blob instanceof FakeBlob) {
				data_URI_header = "data:" + type;
				if (blob.encoding === "base64") {
					return data_URI_header + ";base64," + blob.data;
				} else if (blob.encoding === "URI") {
					return data_URI_header + "," + decodeURIComponent(blob.data);
				} if (btoa) {
					return data_URI_header + ";base64," + btoa(blob.data);
				} else {
					return data_URI_header + "," + encodeURIComponent(blob.data);
				}
			} else if (real_create_object_URL) {
				return real_create_object_URL.call(real_URL, blob);
			}
		};
		URL.revokeObjectURL = function(object_URL) {
			if (object_URL.substring(0, 5) !== "data:" && real_revoke_object_URL) {
				real_revoke_object_URL.call(real_URL, object_URL);
			}
		};
		FBB_proto.append = function(data/*, endings*/) {
			var bb = this.data;
			// decode data to a binary string
			if (Uint8Array && (data instanceof ArrayBuffer || data instanceof Uint8Array)) {
				var
					  str = ""
					, buf = new Uint8Array(data)
					, i = 0
					, buf_len = buf.length
				;
				for (; i < buf_len; i++) {
					str += String.fromCharCode(buf[i]);
				}
				bb.push(str);
			} else if (get_class(data) === "Blob" || get_class(data) === "File") {
				if (FileReaderSync) {
					var fr = new FileReaderSync;
					bb.push(fr.readAsBinaryString(data));
				} else {
					// async FileReader won't work as BlobBuilder is sync
					throw new FileException("NOT_READABLE_ERR");
				}
			} else if (data instanceof FakeBlob) {
				if (data.encoding === "base64" && atob) {
					bb.push(atob(data.data));
				} else if (data.encoding === "URI") {
					bb.push(decodeURIComponent(data.data));
				} else if (data.encoding === "raw") {
					bb.push(data.data);
				}
			} else {
				if (typeof data !== "string") {
					data += ""; // convert unsupported types to strings
				}
				// decode UTF-16 to binary string
				bb.push(unescape(encodeURIComponent(data)));
			}
		};
		FBB_proto.getBlob = function(type) {
			if (!arguments.length) {
				type = null;
			}
			return new FakeBlob(this.data.join(""), type, "raw");
		};
		FBB_proto.toString = function() {
			return "[object BlobBuilder]";
		};
		FB_proto.slice = function(start, end, type) {
			var args = arguments.length;
			if (args < 3) {
				type = null;
			}
			return new FakeBlob(
				  this.data.slice(start, args > 1 ? end : this.data.length)
				, type
				, this.encoding
			);
		};
		FB_proto.toString = function() {
			return "[object Blob]";
		};
		FB_proto.close = function() {
			this.size = 0;
			delete this.data;
		};
		return FakeBlobBuilder;
	}(view));

	view.Blob = function(blobParts, options) {
		var type = options ? (options.type || "") : "";
		var builder = new BlobBuilder();
		if (blobParts) {
			for (var i = 0, len = blobParts.length; i < len; i++) {
				if (Uint8Array && blobParts[i] instanceof Uint8Array) {
					builder.append(blobParts[i].buffer);
				}
				else {
					builder.append(blobParts[i]);
				}
			}
		}
		var blob = builder.getBlob(type);
		if (!blob.slice && blob.webkitSlice) {
			blob.slice = blob.webkitSlice;
		}
		return blob;
	};

	var getPrototypeOf = Object.getPrototypeOf || function(object) {
		return object.__proto__;
	};
	view.Blob.prototype = getPrototypeOf(new view.Blob());
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content || this));
;
/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.1.20151003
 *
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent)
		, webkit_req_fs = view.webkitRequestFileSystem
		, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		, fs_min_size = 0
		// See https://code.google.com/p/chromium/issues/detail?id=375297#c7 and
		// https://github.com/eligrey/FileSaver.js/commit/485930a#commitcomment-8768047
		// for the reasoning behind the timeout and revocation flow
		, arbitrary_revoke_timeout = 500 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			if (view.chrome) {
				revoker();
			} else {
				setTimeout(revoker, arbitrary_revoke_timeout);
			}
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob(["\ufeff", blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, blob_changed = false
				, object_url
				, target_view
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if (/*target_view &&*/ is_safari && typeof FileReader !== "undefined") {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var base64Data = reader.result;
							/*target_*/view.location.href = "data:attachment/file" + base64Data.slice(base64Data.search(/[,;]/));
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (blob_changed || !object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (target_view) {
						target_view.location.href = object_url;
					} else {
						var new_tab = view.open(object_url, "_blank");
						if (new_tab == undefined && is_safari) {
							//Apple do not allow window.open, see http://bit.ly/1kZffRI
							view.location.href = object_url
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
				, abortable = function(func) {
					return function() {
						if (filesaver.readyState !== filesaver.DONE) {
							return func.apply(this, arguments);
						}
					};
				}
				, create_if_not_found = {create: true, exclusive: false}
				, slice
			;
			filesaver.readyState = filesaver.INIT;
			if (!name) {
				name = "download";
			}
			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function() {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}
			// Object and web filesystem URLs have a problem saving in Google Chrome when
			// viewed in a tab, so I force save with application/octet-stream
			// http://code.google.com/p/chromium/issues/detail?id=91158
			// Update: Google errantly closed 91158, I submitted it again:
			// https://code.google.com/p/chromium/issues/detail?id=389642
			if (view.chrome && type && type !== force_saveable_type) {
				slice = blob.slice || blob.webkitSlice;
				blob = slice.call(blob, 0, blob.size, force_saveable_type);
				blob_changed = true;
			}
			// Since I can't be sure that the guessed media type will trigger a download
			// in WebKit, I append .download to the filename.
			// https://bugs.webkit.org/show_bug.cgi?id=65440
			if (webkit_req_fs && name !== "download") {
				name += ".download";
			}
			if (type === force_saveable_type || webkit_req_fs) {
				target_view = view;
			}
			if (!req_fs) {
				fs_error();
				return;
			}
			fs_min_size += blob.size;
			req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
				fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
					var save = function() {
						dir.getFile(name, create_if_not_found, abortable(function(file) {
							file.createWriter(abortable(function(writer) {
								writer.onwriteend = function(event) {
									target_view.location.href = file.toURL();
									filesaver.readyState = filesaver.DONE;
									dispatch(filesaver, "writeend", event);
									revoke(file);
								};
								writer.onerror = function() {
									var error = writer.error;
									if (error.code !== error.ABORT_ERR) {
										fs_error();
									}
								};
								"writestart progress write abort".split(" ").forEach(function(event) {
									writer["on" + event] = filesaver["on" + event];
								});
								writer.write(blob);
								filesaver.abort = function() {
									writer.abort();
									filesaver.readyState = filesaver.DONE;
								};
								filesaver.readyState = filesaver.WRITING;
							}), fs_error);
						}), fs_error);
					};
					dir.getFile(name, {create: false}, abortable(function(file) {
						// delete file if it already exists
						file.remove();
						save();
					}), abortable(function(ex) {
						if (ex.code === ex.NOT_FOUND_ERR) {
							save();
						} else {
							fs_error();
						}
					}));
				}), fs_error);
			}), fs_error);
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name, no_auto_bom);
		}
	;
	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name || "download");
		};
	}

	FS_proto.abort = function() {
		var filesaver = this;
		filesaver.readyState = filesaver.DONE;
		dispatch(filesaver, "abort");
	};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
  define([], function() {
    return saveAs;
  });
}
;
var H5P = H5P || {};

/**
 * Document Export Page module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.DocumentExportPage = (function ($, EventDispatcher) {
  // CSS Classes:
  var MAIN_CONTAINER = 'h5p-document-export-page';

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @returns {Object} DocumentExportPage DocumentExportPage instance
   */
  function DocumentExportPage(params, id, extras) {
    EventDispatcher.call(this);
    this.id = id;
    this.extras = extras;

    this.inputArray = [];
    this.exportTitle = '';
    this.requiredInputsAreFilled = true;

    // Set default behavior.
    this.params = $.extend({
      title: this.getTitle(),
      description: '',
      createDocumentLabel: 'Proceed',
      submitTextLabel: 'Submit',
      submitSuccessTextLabel: 'Your report was submitted successfully!',
      selectAllTextLabel: 'Select',
      exportTextLabel: 'Export',
      requiresInputErrorMessage: 'The following pages contain required input fields that need to be filled: @pages',
      helpTextLabel: 'Read more',
      helpText: 'Help text'
    }, params);
  }

  DocumentExportPage.prototype = Object.create(EventDispatcher.prototype);
  DocumentExportPage.prototype.constructor = DocumentExportPage;

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  DocumentExportPage.prototype.attach = function ($container) {
    var self = this;

    this.$wrapper = $container;

    this.$inner = $('<div>', {
      'class': MAIN_CONTAINER
    }).prependTo($container);

    var documentExportTemplate =
        '<div class="page-header" role="heading" tabindex="-1">' +
        ' <div class="page-title">{{{title}}}</div>' +
        ' <button class="page-help-text">{{{helpTextLabel}}}</button>' +
        '</div>' +
        '<div class="export-description">{{{description}}}</div>' +
        '<div class="export-error-message" role="alert" aria-live="assertive">{{{requiresInputErrorMessage}}}</div>' +
        '<div class="export-footer">' +
        '  <div role="button" tabindex="0" class="joubel-simple-rounded-button export-document-button" title="{{{createDocumentLabel}}}">' +
        '    <span class="joubel-simple-rounded-button-text">{{{createDocumentLabel}}}</span>' +
        '  </div>' +
        '</div>';

    /* global Mustache */
    self.$inner.append(Mustache.render(documentExportTemplate, self.params));

    self.$pageTitle = self.$inner.find('.page-header');
    self.$helpButton = self.$inner.find('.page-help-text');
    self.$exportDocumentButton = self.$inner.find('.export-document-button');

    self.initHelpTextButton();
    self.initDocumentExportButton();
  };

  /**
   * Setup button for creating a document from stored input array
   */
  DocumentExportPage.prototype.initDocumentExportButton = function () {
    var self = this;
    H5P.DocumentationTool.handleButtonClick(self.$exportDocumentButton, function () {
      // Check if all required input fields are filled
      if (self.isRequiredInputsFilled()) {
        var exportDocument = new H5P.DocumentExportPage.CreateDocument(self.params, self.exportTitle, self.submitEnabled, self.inputArray, self.inputGoals, self.getLibraryFilePath('exportTemplate.docx'));
        exportDocument.attach(self.$wrapper.parent().parent());
        exportDocument.on('export-page-closed', function () {
          self.trigger('export-page-closed');

          // Set focus back on button
          self.$exportDocumentButton.focus();
        });

        self.trigger('export-page-opened');

        exportDocument.on('submitted', function (event) {
          self.trigger('submitted', event.data);
        });
      }
    });
  };

  /**
   * Setup help text functionality for reading more about the task
   */
  DocumentExportPage.prototype.initHelpTextButton = function () {
    var self = this;

    if (this.params.helpText !== undefined && this.params.helpText.length) {
      // Handle help button action
      self.$helpButton.on('click', function () {
        self.trigger('open-help-dialog', {
          title: self.params.title,
          helpText: self.params.helpText
        });
      });
    }
    else {
      self.$helpButton.remove();
    }
  };

  DocumentExportPage.prototype.getTitle = function () {
    return H5P.createTitle((this.extras && this.extras.metadata && this.extras.metadata.title) ? this.extras.metadata.title : 'Document Export');
  };

  DocumentExportPage.prototype.setExportTitle = function (title) {
    this.exportTitle = title;
    return this;
  };

  DocumentExportPage.prototype.setSumbitEnabled = function (submitEnabled) {
    this.submitEnabled = submitEnabled;
    return this;
  };

  DocumentExportPage.prototype.updateOutputFields = function (inputs) {
    this.inputArray = inputs;
    return this;
  };

  DocumentExportPage.prototype.updateExportableGoals = function (newGoals) {
    this.inputGoals = newGoals;
    return this;
  };

  DocumentExportPage.prototype.isRequiredInputsFilled = function () {
    return this.requiredInputsAreFilled;
  };

  /**
   * Update the message for required fields.
   * @param {object[]} pageTitles Page titles.
   */
  DocumentExportPage.prototype.updateRequiredInputsFilled = function (pageTitles) {
    const requiredInputsAreFilled = pageTitles && pageTitles.length === 0;
    this.$inner.toggleClass('required-inputs-not-filled', !requiredInputsAreFilled);

    // Update message text
    let message = this.params.requiresInputErrorMessage;
    if (!pageTitles || pageTitles.length === 0) {
      message = message.replace('@pages', '-');
    }
    else {
      let list = '<ul>';
      pageTitles.forEach(function (title) {
        list += '<li>' + title + '</li>';
      });
      list += '</ul>';
      message = message.replace('@pages', list);
    }

    this.$inner.find('.export-error-message').html(message);
    this.requiredInputsAreFilled = requiredInputsAreFilled;

    return this;
  };

  /**
   * Sets focus on the page
   */
  DocumentExportPage.prototype.focus = function () {
    this.$pageTitle.focus();
  };

  return DocumentExportPage;
}(H5P.jQuery, H5P.EventDispatcher));
;
var H5P = H5P || {};
H5P.DocumentExportPage = H5P.DocumentExportPage || {};

/**
 * Create Document module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.DocumentExportPage.CreateDocument = (function ($, ExportPage, EventDispatcher) {
  /**
   * Initialize module.
   * @param {Array} inputFields Array of input strings that should be exported
   * @returns {Object} CreateDocument CreateDocument instance
   */
  function CreateDocument(params, title, submitEnabled, inputFields, inputGoals, template) {
    EventDispatcher.call(this);

    this.inputFields = inputFields;
    this.inputGoals = inputGoals;
    this.template = template;

    this.params = params;
    this.title = title;
    this.submitEnabled = submitEnabled;
  }

  // Setting up inheritance
  CreateDocument.prototype = Object.create(EventDispatcher.prototype);
  CreateDocument.prototype.constructor = CreateDocument;

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  CreateDocument.prototype.attach = function ($container) {
    var self = this;

    var exportString = this.getExportString();
    exportString += this.createGoalsOutput() || '';
    var exportObject = this.getExportObject();
    var exportPage = new ExportPage(this.title,
      exportString,
      this.submitEnabled,
      this.params.submitTextLabel,
      this.params.submitSuccessTextLabel,
      this.params.selectAllTextLabel,
      this.params.exportTextLabel,
      this.template,
      exportObject
    );
    exportPage.getElement().prependTo($container);
    exportPage.focus();

    exportPage.on('closed', function () {
      self.trigger('export-page-closed');
    });

    exportPage.on('submitted', function (event) {
      self.trigger('submitted', event.data);
    });
  };

  /**
   * Generate export object that will be applied to the export template
   * @returns {Object} exportObject Exportable content for filling template
   */
  CreateDocument.prototype.getExportObject = function () {
    var sortedGoalsList = [];

    this.inputGoals.inputArray.forEach(function (inputGoalPage) {
      inputGoalPage.forEach(function (inputGoal) {
        // Do not include unassessed goals
        if (inputGoal.goalAnswer() === -1) {
          return;
        }
        var goalCategoryExists = false;
        var listIndex = -1;
        sortedGoalsList.forEach(function (sortedGoalEntry, entryIndex) {
          if (inputGoal.goalAnswer() === sortedGoalEntry.goalAnswer) {
            listIndex = entryIndex;
            goalCategoryExists = true;
          }
        });
        if (!goalCategoryExists) {
          sortedGoalsList.push({label: '', goalArray: [], goalAnswer: inputGoal.goalAnswer()});
          listIndex = sortedGoalsList.length - 1;
          if (inputGoal.getTextualAnswer().length) {
            sortedGoalsList[listIndex].label = inputGoal.getTextualAnswer();
          }
        }

        if (inputGoal.goalText().length && inputGoal.getTextualAnswer().length) {
          sortedGoalsList[listIndex].goalArray.push({text: inputGoal.goalText()});
        }
      });
    });

    var flatInputsList = [];
    this.inputFields.forEach(function (inputFieldPage) {
      if (inputFieldPage.inputArray && inputFieldPage.inputArray.length) {
        var standardPage = {title: '', inputArray: []};
        if (inputFieldPage.title) {
          standardPage.title = inputFieldPage.title;
        }
        inputFieldPage.inputArray.forEach(function (inputField) {
          standardPage.inputArray.push({description: inputField.description, value: inputField.value});
        });
        flatInputsList.push(standardPage);
      }
    });

    var exportObject = {
      title: this.title,
      goalsTitle: this.inputGoals.title,
      flatInputList: flatInputsList,
      sortedGoalsList: sortedGoalsList
    };

    return exportObject;
  };

  /**
   * Generate complete html string for export
   * @returns {string} exportString Html string for export
   */
  CreateDocument.prototype.getExportString = function () {
    var self = this;
    var exportString = self.getInputBlocksString();

    return exportString;
  };

  /**
   * Generates html string for input fields
   * @returns {string} inputBlocksString Html string from input fields
   */
  CreateDocument.prototype.getInputBlocksString = function () {
    var inputBlocksString = '<div class="textfields-output">';

    this.inputFields.forEach(function (inputPage) {
      if (inputPage.inputArray && inputPage.inputArray.length && inputPage.title.length) {
        inputBlocksString +=
          '<h2>' + inputPage.title + '</h2>';
      }
      if (inputPage.inputArray && inputPage.inputArray.length) {
        inputPage.inputArray.forEach(function (inputInstance) {
          if (inputInstance) {
            // remove paragraph tags
            inputBlocksString +=
              '<p>' +
                (inputInstance.description ? '<strong>' + inputInstance.description + '</strong>\n' : '') +
                inputInstance.value +
              '</p>';
          }
        });
      }
    });

    inputBlocksString += '</div>';

    return inputBlocksString;
  };

  /**
   * Generates html string for all goals
   * @returns {string} goalsOutputString Html string from all goals
   */
  CreateDocument.prototype.createGoalsOutput = function () {

    var goalsOutputString = '<div class="goals-output">';

    if (this.inputGoals === undefined || !this.inputGoals.inputArray || this.inputGoals.inputArray.length === 0) {
      return;
    }

    if (this.inputGoals.title.length) {
      goalsOutputString +=
        '<h2>' + this.inputGoals.title + '</h2>';
    }

    this.inputGoals.inputArray.forEach(function (inputGoalPage) {
      var goalOutputArray = [];

      inputGoalPage.forEach(function (inputGoalInstance) {
        if (inputGoalInstance !== undefined && inputGoalInstance.goalAnswer() > -1) {
          // Sort goals on answer
          var htmlString = '';
          if (goalOutputArray[inputGoalInstance.goalAnswer()] === undefined) {
            goalOutputArray[inputGoalInstance.goalAnswer()] = [];
            var answerStringTitle = '<p class="category"><strong>' + inputGoalInstance.getTextualAnswer() + ':</strong></p><ul>';
            goalOutputArray[inputGoalInstance.goalAnswer()].push(answerStringTitle);
          }
          htmlString += '<li>' + inputGoalInstance.text + '</li>';
          goalOutputArray[inputGoalInstance.goalAnswer()].push(htmlString);
        }
      });

      goalOutputArray.forEach(function (goalOutput) {
        goalOutput.forEach(function (goalString) {
          goalsOutputString += goalString;
        });
        if (goalOutput.length) {
          goalsOutputString += '</ul>';
        }
      });
    });

    goalsOutputString += '</div>';

    return goalsOutputString;
  };

  return CreateDocument;
}(H5P.jQuery, H5P.ExportPage, H5P.EventDispatcher));
;
var H5P = H5P || {};
H5P.DocumentationTool = H5P.DocumentationTool || {};

/**
 * Naivgation Menu module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.DocumentationTool.NavigationMenu = (function ($, EventDispatcher) {

  /**
   * @private
   * @type {number}
   */
  var numInstances = 0;

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @returns {Object} NavigationMenu NavigationMenu instance
   */
  function NavigationMenu(docTool, navMenuLabel) {
    EventDispatcher.call(this);
    var self = this;
    this.$ = $(this);
    this.docTool = docTool;
    this.highlightIncompletePages = false;
    this.navMenuLabel = navMenuLabel;

    // Hide menu if body is clicked
    $('body').click(function () {
      self.$documentationToolContaner.removeClass('expanded');
    });

    numInstances++;
  }

  NavigationMenu.prototype = Object.create(EventDispatcher.prototype);
  NavigationMenu.prototype.constructor = NavigationMenu;

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  NavigationMenu.prototype.attach = function ($container) {
    var self = this;
    this.$documentationToolContaner = $container;

    var $navigationMenu = $('<div/>', {
      'class': 'h5p-navigation-menu'
    }).prependTo($container);

    var menuHeaderId = 'h5p-navigation-menu-' + numInstances;
    var $navigationMenuHeader = $('<div>', {
      'class': 'h5p-navigation-menu-header',
      'id': menuHeaderId
    }).appendTo($navigationMenu);

    $('<span>', {
      'html': self.navMenuLabel
    }).appendTo($navigationMenuHeader);

    var $navigationMenuEntries = $('<div>', {
      'class': 'h5p-navigation-menu-entries',
      role: 'menu',
      'aria-labelledby': menuHeaderId
    }).appendTo($navigationMenu);

    this.docTool.pageInstances.forEach(function (page, pageIndex) {
      var pageTitle = '';

      // Try to get page title
      try {
        pageTitle = page.getTitle();
      }
      catch (e) {
        throw new Error('Page does not have a getTitle() function - ' + e);
      }

      // Create page entry
      var $navigationMenuEntry = $('<div/>', {
        'class': 'h5p-navigation-menu-entry',
        'role': 'menuitem',
        'tabindex': '0'
      }).appendTo($navigationMenuEntries);

      H5P.DocumentationTool.handleButtonClick($navigationMenuEntry, function (event) {
        self.$documentationToolContaner.removeClass('expanded');
        self.docTool.movePage(pageIndex, event);
        var progressedEvent = self.docTool.createXAPIEventTemplate('progressed'); // Using the parent documentation tool to create xapi template
        progressedEvent.data.statement.object.definition.extensions['http://id.tincanapi.com/extension/ending-point'] = pageIndex;
        self.trigger(progressedEvent);
      });

      $('<span>', {
        'html': pageTitle
      }).appendTo($navigationMenuEntry);

      // Add current class to the first item
      if (pageIndex === 0) {
        $navigationMenuEntry.addClass('current');
      }

    });

    this.$navigationMenuHeader = $navigationMenuHeader;
    this.$navigationMenu = $navigationMenu;
    this.$navigationMenuEntries = $navigationMenuEntries;
  };

  /**
   * Updates current navigation menu entry with proper style
   * @param {Number} currentPageIndex Current page index
   */
  NavigationMenu.prototype.updateNavigationMenu = function (currentPageIndex) {
    const self = this;

    if (this.highlightIncompletePages === false) {
      if (self.docTool.pageInstances[currentPageIndex].libraryInfo.machineName === 'H5P.DocumentExportPage') {
        this.highlightIncompletePages = true;
      }
    }

    // Get Ids of pages that contain required fields that are not filled
    const incompletePageIds = this.docTool.getIncompletePages().map(function (page) {
      return self.docTool.pageInstances.indexOf(page);
    });

    if (incompletePageIds.length === 0) {
      this.highlightIncompletePages = false;
    }

    this.$navigationMenuEntries.children().each(function (entryIndex) {
      // Mark currently activated menu entry
      if (currentPageIndex === entryIndex) {
        $(this).addClass('current');
      }
      else {
        $(this).removeClass('current');
      }

      // Highlight menu entries that contain required fields not filled
      if (self.highlightIncompletePages && incompletePageIds.indexOf(entryIndex) !== -1) {
        $(this).addClass('required-inputs-not-filled');
      }
      else {
        $(this).removeClass('required-inputs-not-filled');
      }
    });
  };

  /**
   * Toggle responsive layout on or off
   * @param {boolean} isEnabled True to enable responsive layout
   */
  NavigationMenu.prototype.setResponsiveLayout = function (isEnabled) {
    var self = this;
    if (isEnabled) {
      // Bind click to expand navigation menu
      this.$navigationMenuHeader.unbind('click');
      this.$navigationMenuHeader.click(function () {
        self.$documentationToolContaner.toggleClass('expanded');
        return false;
      });
      // Add responsive class
      this.$documentationToolContaner.addClass('responsive');
    }
    else {
      // Remove click action and remove responsive classes
      this.$navigationMenuHeader.unbind('click');
      this.$documentationToolContaner.removeClass('expanded');
      this.$documentationToolContaner.removeClass('responsive');
    }
  };

  return NavigationMenu;

}(H5P.jQuery, H5P.EventDispatcher));
;
/**
 * Documentation tool module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.DocumentationTool = (function ($, NavigationMenu, JoubelUI, EventDispatcher) {
  // CSS Classes:
  var MAIN_CONTAINER = 'h5p-documentation-tool';
  var PAGES_CONTAINER = 'h5p-documentation-tool-page-container';
  var PAGE_INSTANCE = 'h5p-documentation-tool-page';
  var FOOTER = 'h5p-documentation-tool-footer';

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @returns {Object} DocumentationTool DocumentationTool instance
   */
  function DocumentationTool(params, id, extras) {
    var self = this;
    this.$ = $(this);
    this.id = id;

    this.extras = extras;

    // Set default behavior.
    this.params = $.extend({
      taskDescription: (this.extras.metadata && this.extras.metadata.title) ? this.extras.metadata.title : 'Documentation Tool',
      pagesList: [],
      l10n: {
        nextLabel: 'Next',
        previousLabel: 'Previous',
        closeLabel: 'Close'
      }
    }, params);

    if (params.taskDescription === undefined && params.navMenuLabel !== undefined) {
      this.params.taskDescription = params.navMenuLabel;
    }

    EventDispatcher.call(this);

    this.on('resize', self.resize, self);
  }

  DocumentationTool.prototype = Object.create(EventDispatcher.prototype);
  DocumentationTool.prototype.constructor = DocumentationTool;

  /**
   * Make a non-button element behave as a button. I.e handle enter and space
   * keydowns as click
   *
   * @param  {H5P.jQuery} $element The "button" element
   * @param  {Function} callback
   */
  DocumentationTool.handleButtonClick = function ($element, callback) {
    $element.click(function (event) {
      callback.call($(this), event);
    });
    $element.keydown(function (event) {
      // 32 - space, 13 - enter
      if ([32, 13].indexOf(event.which) !== -1) {
        event.preventDefault();
        callback.call($(this), event);
      }
    });
  };

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  DocumentationTool.prototype.attach = function ($container) {

    var self = this;
    this.pageInstances = [];
    this.currentPageIndex = 0;

    this.$inner = $container.addClass(MAIN_CONTAINER);

    this.$mainContent = $('<div/>', {
      'class': 'h5p-documentation-tool-main-content'
    }).appendTo(this.$inner);

    // Create pages
    var $pagesContainer = self.createPages().appendTo(this.$mainContent);
    self.$pagesArray = $pagesContainer.children();

    // Create navigation menu
    var navigationMenu = new NavigationMenu(self, this.params.taskDescription);
    navigationMenu.attach(this.$mainContent);

    if (this.$inner.children().length) {
      self.$pagesArray.eq(self.currentPageIndex).addClass('current');
    }

    this.navigationMenu = navigationMenu;

    self.resize();
  };

  /**
   * Creates the footer.
   * @returns {jQuery} $footer Footer element
   */
  DocumentationTool.prototype.createFooter = function (enablePrevious, enableNext) {
    var $footer = $('<div>', {
      'class': FOOTER
    });

    // Next page button
    this.createNavigationButton(1, enableNext).appendTo($footer);

    // Previous page button
    this.createNavigationButton(-1, enablePrevious).appendTo($footer);

    return $footer;
  };

  /**
   * Create navigation button
   * @param {Number} moveDirection An integer for how many pages the button will move, and in which direction
   * @returns {*}
   */
  DocumentationTool.prototype.createNavigationButton = function (moveDirection, enabled) {
    var self = this;
    var type = 'next';
    var navigationLabel = this.params.l10n.nextLabel;
    if (moveDirection === -1) {
      type = 'prev';
      navigationLabel = this.params.l10n.previousLabel;
    }

    var $navButton = $('<div>', {
      'class': 'joubel-simple-rounded-button h5p-documentation-tool-nav-button ' + type,
      'aria-label': navigationLabel,
      'title': navigationLabel,
      'aria-disabled': !enabled,
      'tabindex': enabled ? 0 : undefined,
      'html': '<span class="joubel-simple-rounded-button-text"></span>'
    });

    DocumentationTool.handleButtonClick($navButton, function (event) {
      self.movePage(self.currentPageIndex + moveDirection, event);
    });

    return $navButton;
  };

  /**
   * Populate container and array with page instances.
   * @returns {jQuery} Container
   */
  DocumentationTool.prototype.createPages = function () {
    var self = this;

    var $pagesContainer = $('<div>', {
      'class': PAGES_CONTAINER
    });

    var numPages = this.params.pagesList.length;

    for (var i = 0; i < numPages; i++) {
      var page = this.params.pagesList[i];

      var $pageInstance = $('<div>', {
        'class': PAGE_INSTANCE
      }).appendTo($pagesContainer);

      var singlePage = H5P.newRunnable(page, self.id, undefined, undefined, {
        parent: self // Set the parent for xapi context
      });
      if (singlePage.libraryInfo.machineName === 'H5P.DocumentExportPage') {
        singlePage.setExportTitle(self.params.taskDescription);
        singlePage.setSumbitEnabled(H5PIntegration.reportingIsEnabled);
      }
      singlePage.attach($pageInstance);
      self.createFooter(i !== 0, i < (numPages - 1)).appendTo($pageInstance);
      self.pageInstances.push(singlePage);

      singlePage.on('resize', function () {
        self.trigger('resize');
      });

      singlePage.on('export-page-opened', self.hide, self);
      singlePage.on('export-page-closed', self.show, self);
      singlePage.on('open-help-dialog', self.showHelpDialog, self);
      singlePage.on('submitted', function () {
        self.triggerAnsweredEvents();
        /*
         * There's no score attached to Documentation Tool, but
         * it may be used in Column which needs a score that's not null.
         */
        var completedEvent = self.createXAPIEventTemplate('completed');
        completedEvent.setScoredResult(0, 0);
        self.trigger(completedEvent);
      });
    }

    return $pagesContainer;
  };

  /**
   * Remove tabindex for main content.
   */
  DocumentationTool.prototype.untabalize = function () {
    // Make all other elements in container not tabbable. When dialog is open,
    // it's like the elements behind does not exist.
    this.$tabbables = this.$mainContent.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').each(function () {
      var $tabbable = $(this);
      // Store current tabindex, so we can set it back when dialog closes
      $tabbable.data('tabindex', $tabbable.attr('tabindex'));
      // Make it non tabbable
      $tabbable.attr('tabindex', '-1');
    });

    // Make sure container and all content within it is not seen by screenreaders
    this.$mainContent.attr('aria-hidden', true);
  };

  /**
   * Set back tabindex for main container.
   */
  DocumentationTool.prototype.tabalize = function () {
    if (this.$tabbables) {
      this.$tabbables.each(function () {
        var $element = $(this);
        var tabindex = $element.data('tabindex');
        if (tabindex !== undefined) {
          $element.attr('tabindex', tabindex);
          $element.removeData('tabindex');
        }
        else {
          $element.removeAttr('tabindex');
        }
      });
    }

    this.$mainContent.removeAttr('aria-hidden');
  };

  /**
   * Show help dialog
   *
   * @param  {Object} event
   */
  DocumentationTool.prototype.showHelpDialog = function (event) {
    var self = this;

    self.untabalize();

    var helpTextDialog = new H5P.JoubelUI.createHelpTextDialog(event.data.title, event.data.helpText, self.params.l10n.closeLabel);

    // Handle closing of the dialog
    helpTextDialog.on('closed', function () {
      // Set focus back on the page
      self.tabalize();
      self.getCurrentPage().$helpButton.focus();
    });

    this.$inner.append(helpTextDialog.getElement());

    helpTextDialog.focus();
  };

  /**
   * Hide me
   */
  DocumentationTool.prototype.hide = function () {
    this.$mainContent.addClass('hidden');
  };

  /**
   * Show me
   */
  DocumentationTool.prototype.show = function () {
    this.$mainContent.removeClass('hidden');
  };

  /**
   * Moves the documentation tool to the specified page
   * @param {Number} toPageIndex Move to this page index
   */
  DocumentationTool.prototype.movePage = function (toPageIndex) {
    var self = this;

    // Invalid value
    if ((toPageIndex + 1 > this.$pagesArray.length) || (toPageIndex < 0)) {
      return;
    }

    var assessmentGoals = self.getGoalAssessments(self.pageInstances);
    var newGoals = self.getGoals(self.pageInstances);
    assessmentGoals.forEach(function (assessmentPage) {
      newGoals = self.mergeGoals(newGoals, assessmentPage);
    });

    // Update page depending on what page type it is
    self.updatePage(toPageIndex, newGoals);

    this.$pagesArray.eq(this.currentPageIndex).removeClass('current');
    this.currentPageIndex = toPageIndex;
    this.$pagesArray.eq(this.currentPageIndex).addClass('current');

    // Update navigation menu
    this.navigationMenu.updateNavigationMenu(this.currentPageIndex);

    // Scroll to top
    this.scrollToTop();

    // Set focus on the new page after navigating to it
    var pageInstance = self.pageInstances[toPageIndex];
    if (pageInstance.focus) {
      // Trigger focus on text tick
      setTimeout(function () {
        pageInstance.focus();
      }, 0);
    }

    // Trigger xAPI event
    var progressedEvent = self.createXAPIEventTemplate('progressed');
    progressedEvent.data.statement.object.definition.extensions['http://id.tincanapi.com/extension/ending-point'] = toPageIndex;
    self.trigger(progressedEvent);

    self.trigger('resize');
  };

  /**
   * Get current page instance
   * @return {Object} The page instance
   */
  DocumentationTool.prototype.getCurrentPage = function () {
    return this.pageInstances[this.currentPageIndex];
  };

  /**
   * Scroll to top if changing page and below y position is above threshold
   */
  DocumentationTool.prototype.scrollToTop = function () {
    var staticScrollToTopPadding = 90;
    var yPositionThreshold = 75;

    // Scroll to top of content type if above y threshold
    if ($(window).scrollTop() - $(this.$inner).offset().top > yPositionThreshold) {
      $(window).scrollTop(this.$inner.offset().top - staticScrollToTopPadding);
    }
  };

  /**
   * Update page depending on what type of page it is
   * @param {Object} toPageIndex Page object that will be updated
   * @param {Array} newGoals Array containing updated goals
   */
  DocumentationTool.prototype.updatePage = function (toPageIndex, newGoals) {
    var self = this;
    var pageInstance = self.pageInstances[toPageIndex];

    if (pageInstance.libraryInfo.machineName === 'H5P.GoalsAssessmentPage') {
      self.setGoals(self.pageInstances, newGoals);
    }
    else if (pageInstance.libraryInfo.machineName === 'H5P.DocumentExportPage') {

      // Check if all required input fields are filled
      var allRequiredInputsAreFilled = self.checkIfAllRequiredInputsAreFilled(self.pageInstances);
      self.setRequiredInputsFilled(self.pageInstances, allRequiredInputsAreFilled);

      // Get all input fields, goals and goal assessments
      var allInputs = self.getDocumentExportInputs(self.pageInstances);
      self.setDocumentExportOutputs(self.pageInstances, allInputs);
      self.setDocumentExportGoals(self.pageInstances, newGoals);
    }
  };

  /**
   * Merge assessment goals and newly created goals
   *
   * @returns {Array} newGoals Merged goals list with updated assessments
   */
  DocumentationTool.prototype.mergeGoals = function (newGoals, assessmentGoals) {
    // Not an assessment page
    if (!assessmentGoals.length) {
      return newGoals;
    }
    newGoals.forEach(function (goalPage, pageIndex) {
      goalPage.forEach(function (goalInstance) {
        var result = $.grep(assessmentGoals[pageIndex], function (assessmentInstance) {
          return assessmentInstance.getUniqueId() === goalInstance.getUniqueId();
        });
        if (result.length) {
          goalInstance.goalAnswer(result[0].goalAnswer());
        }
      });
    });
    return newGoals;
  };

  /**
   * Gets goals assessments from all goals assessment pages and returns update goals list.
   *
   * @param {Array} pageInstances Array of pages contained within the documentation tool
   * @returns {Array} goals Updated goals list
   */
  DocumentationTool.prototype.getGoalAssessments = function (pageInstances) {
    var goals = [];
    pageInstances.forEach(function (page) {
      if (page.libraryInfo.machineName === 'H5P.GoalsAssessmentPage') {
        goals.push(page.getAssessedGoals());
      }
    });
    return goals;
  };

  /**
   * Retrieves all input fields from the documentation tool
   * @returns {Array} inputArray Array containing all inputs of the documentation tool
   */
  DocumentationTool.prototype.getDocumentExportInputs = function (pageInstances) {
    var inputArray = [];
    pageInstances.forEach(function (page) {
      var pageInstanceInput = [];
      var title = '';
      if (page.libraryInfo.machineName === 'H5P.StandardPage') {
        pageInstanceInput = page.getInputArray();
        title = page.getTitle();
      }
      inputArray.push({inputArray: pageInstanceInput, title: title});
    });

    return inputArray;
  };

  /**
   * Checks if all required inputs are filled
   * @returns {boolean} True if all required inputs are filled
   */
  DocumentationTool.prototype.checkIfAllRequiredInputsAreFilled = function (pageInstances) {
    var allRequiredInputsAreFilled = true;
    pageInstances.forEach(function (page) {
      if (page.libraryInfo.machineName === 'H5P.StandardPage') {
        if (!page.requiredInputsIsFilled()) {
          allRequiredInputsAreFilled = false;
        }
      }
    });

    return allRequiredInputsAreFilled;
  };

  /**
   * Gets goals from all goal pages and returns updated goals list.
   *
   * @param {Array} pageInstances Array containing all pages.
   * @returns {Array} goals Updated goals list.
   */
  DocumentationTool.prototype.getGoals = function (pageInstances) {
    var goals = [];
    pageInstances.forEach(function (page) {
      if (page.libraryInfo.machineName === 'H5P.GoalsPage') {
        goals.push(page.getGoals());
      }
    });
    return goals;
  };

  /**
   * Insert goals to all goal assessment pages.
   * @param {Array} pageInstances Page instances
   * @param {Array} goals Array of goals.
   */
  DocumentationTool.prototype.setGoals = function (pageInstances, goals) {
    pageInstances.forEach(function (page) {
      if (page.libraryInfo.machineName === 'H5P.GoalsAssessmentPage') {
        page.updateAssessmentGoals(goals);
      }
    });
  };

  /**
   * Sets the output for all document export pages
   * @param {Array} inputs Array of input strings
   */
  DocumentationTool.prototype.setDocumentExportOutputs  = function (pageInstances, inputs) {
    pageInstances.forEach(function (page) {
      if (page.libraryInfo.machineName === 'H5P.DocumentExportPage') {
        page.updateOutputFields(inputs);
      }
    });
  };

  /**
   * Sets the output for all document export pages
   * @param {Array} inputs Array of input strings
   */
  DocumentationTool.prototype.setDocumentExportGoals  = function (pageInstances, newGoals) {
    var assessmentPageTitle = '';
    pageInstances.forEach(function (page) {
      if (page.libraryInfo.machineName === 'H5P.GoalsAssessmentPage') {
        assessmentPageTitle = page.getTitle();
      }
    });

    pageInstances.forEach(function (page) {
      if (page.libraryInfo.machineName === 'H5P.DocumentExportPage') {
        page.updateExportableGoals({inputArray: newGoals, title: assessmentPageTitle});
      }
    });
  };

  /**
   * Sets the required inputs filled boolean in all document export pages
   * @param {object[]} pageInstances All page instances.
   */
  DocumentationTool.prototype.setRequiredInputsFilled  = function (pageInstances) {
    // Get titles of pages that contain required fields that are not filled
    const titlesPagesIncomplete = this.getIncompletePages().map(function (page) {
      return page.getTitle();
    });

    // Update document export page
    pageInstances.forEach(function (page) {
      if (page.libraryInfo.machineName === 'H5P.DocumentExportPage') {
        page.updateRequiredInputsFilled(titlesPagesIncomplete);
      }
      else if (page.libraryInfo.machineName === 'H5P.StandardPage') {
        page.markRequiredInputFields();
      }
    });
  };

  /**
   * Get page instances with required fields that are not filled.
   * @return {object[]} Page instances with required fields that are not filled.
   */
  DocumentationTool.prototype.getIncompletePages = function () {
    return this.pageInstances.filter(function (page) {
      return page.libraryInfo.machineName === 'H5P.StandardPage' &&
        !page.requiredInputsIsFilled();
    });
  };

  /**
   * Resize function for responsiveness.
   */
  DocumentationTool.prototype.resize = function () {
    // Width calculations
    this.adjustDocumentationToolWidth();
    this.adjustNavBarHeight();
  };

  /**
   * Adjusts navigation menu minimum height
   */
  DocumentationTool.prototype.adjustNavBarHeight = function () {
    var headerHeight = this.navigationMenu.$navigationMenuHeader.get(0).getBoundingClientRect().height +
        parseFloat(this.navigationMenu.$navigationMenuHeader.css('margin-top')) +
        parseFloat(this.navigationMenu.$navigationMenuHeader.css('margin-bottom'));
    var entriesHeight = this.navigationMenu.$navigationMenuEntries.get(0).getBoundingClientRect().height;
    var minHeight = headerHeight + entriesHeight;
    this.$mainContent.css('min-height', minHeight + 'px');
  };

  /**
   * Resizes navigation menu depending on task width
   */
  DocumentationTool.prototype.adjustDocumentationToolWidth = function () {
    // Show responsive design when width relative to font size is less than static threshold
    var staticResponsiveLayoutThreshold = 40;
    var relativeWidthOfContainer = this.$inner.width() / parseInt(this.$inner.css('font-size'), 10);
    var responsiveLayoutRequirement = relativeWidthOfContainer < staticResponsiveLayoutThreshold;
    this.navigationMenu.setResponsiveLayout(responsiveLayoutRequirement);
  };

  /**
   * Triggers an 'answered' xAPI event for all inputs
   * We do this because we can only trigger answered events once per submission
   * therefore, we have to trigger all of them simultaneously with one function.
   */
  DocumentationTool.prototype.triggerAnsweredEvents = function () {
    this.pageInstances.forEach(function (page) {
      if (page.triggerAnsweredEvents) {
        page.triggerAnsweredEvents();
      }
    });
  };

  /**
   * Generate xAPI object definition used in xAPI statements.
   * @return {Object}
   */
  DocumentationTool.prototype.getxAPIDefinition = function () {
    var definition = {};

    definition.interactionType = 'compound';
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.description = {
      'en-US': ''
    };
    definition.extensions = {
      'https://h5p.org/x-api/h5p-machine-name': 'H5P.DocumentationTool'
    };

    return definition;
  };

  /**
   * Add the question itself to the definition part of an xAPIEvent
   */
  DocumentationTool.prototype.addQuestionToXAPI = function (xAPIEvent) {
    var definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
    $.extend(definition, this.getxAPIDefinition());
  };

  /**
   * Get xAPI data from sub content types
   *
   * @param {Object} metaContentType
   * @returns {array}
   */
  DocumentationTool.prototype.getXAPIDataFromChildren = function () {

    var children = [];

    this.pageInstances.forEach(function (page) {
      if (page.getXAPIData) {
        children.push(page.getXAPIData());
      }
    });

    return children;
  };

  /**
   * Get xAPI data.
   * Contract used by report rendering engine.
   *
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  DocumentationTool.prototype.getXAPIData = function () {
    var xAPIEvent = this.createXAPIEventTemplate('answered');
    this.addQuestionToXAPI(xAPIEvent);
    return {
      statement: xAPIEvent.data.statement,
      children: this.getXAPIDataFromChildren()
    };
  };

  /**
   * Get the content type title.
   *
   * @return {string} title.
   */
  DocumentationTool.prototype.getTitle = function () {
    return H5P.createTitle((this.extras.metadata && this.extras.metadata.title) ? this.extras.metadata.title : 'Documentation Tool');
  };

  return DocumentationTool;
}(H5P.jQuery, H5P.DocumentationTool.NavigationMenu, H5P.JoubelUI, H5P.EventDispatcher));
;

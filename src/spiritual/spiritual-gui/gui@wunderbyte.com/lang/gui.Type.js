/**
 * Type checking studio. All checks are string based.
 */
gui.Type = {
	/**
	 * Get type of argument. Note that response may differ between user agents.
	 * @see	http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator
	 * @param {object} o
	 * @returns {String}
	 */
	of: function(o) {
		var type = {}.toString
			.call(o)
			.match(this._typeexp)[1]
			.toLowerCase();
		if (type === 'domwindow' && String(typeof o) === 'undefined') {
			type = 'undefined'; // some kind of degenerate bug in Safari on iPad
		}
		return type;
	},

	/**
	 * Is object defined?
	 * TODO: unlimited arguments support
	 * @param {object} o
	 * @returns {boolean}
	 */
	isDefined: function(o) {
		return this.of(o) !== 'undefined';
	},

	/**
	 * Is complex type?
	 * @param {object} o
	 * @returns {boolean}
	 */
	isComplex: function(o) {
		switch (this.of(o)) {
			case 'undefined':
			case 'boolean':
			case 'number':
			case 'string':
			case 'null':
				return false;
		}
		return true;
	},

	/**
	 * Is Window object?
	 * @param {object} o
	 * @returns {boolean}
	 */
	isWindow: function(o) {
		return o && o.document && o.location && o.alert && o.setInterval;
	},

	/**
	 * Is Event object?
	 * @pram {object} o
	 * @returns {boolean}
	 */
	isEvent: function(o) {
		return this.of(o).endsWith('event') && this.isDefined(o.type);
	},

	/**
	 * Is DOM element?
	 * @param {object} o
	 * @returns {boolean}
	 */
	isElement: function(o) {
		return this.of(o).endsWith('element') && o.nodeType === Node.ELEMENT_NODE;
	},

	/**
	 * Is Document Fragment?
	 * @param {object} o
	 * @returns {boolean}
	 */
	isDocumentFragment: function(o) {
		return o && o.nodeName && o.nodeName === '#document-fragment';
	},

	/**
	 * Is Document?
	 * @param {object} o
	 * @returns {boolean}
	 */
	isDocument: function(o) {
		return o && o.nodeType === Node.DOCUMENT_NODE;
	},

	/**
	 * Is most likely a method?
	 * @param {object} o
	 * @return {boolean}
	 */
	isMethod: function(o) {
		return (
			o && this.isFunction(o) && !this.isConstructor(o) && !String(o).includes('[native code]')
		); // hotfix 'Array' and 'Object' ...
	},

	/**
	 * Is spirit instance?
	 * @returns {boolean}
	 */
	isSpirit: function(o) {
		return o && o instanceof gui.Spirit;
	},

	/**
	 * Is Map instance?
	 * @returns {boolean}
	 */
	isMap: function(o) {
		return o && o instanceof Map;
	},

	/**
	 * Is function fit to be invoked via the "new" operator?
	 * We assume so if the prototype reveals any properties.
	 * @param {function} what
	 * @returns {boolean}
	 */
	isConstructor: function(what) {
		return (
			this.isFunction(what) && this.isObject(what.prototype) && Object.keys(what.prototype).length
		);
	},

	/**
	 * Is {gui.Class} constructor?
	 */
	isGuiClass: function(what) {
		return this.isConstructor(what) && what.$classname;
	},

	/**
	 * Is constructor for a Spirit?
	 * TODO: Why can't isConstructor be used here?
	 * TODO: something more reliable than "summon".
	 * @param {function} what
	 * @returns {boolean}
	 */
	isSpiritConstructor: function(what) {
		return this.isFunction(what) && this.isFunction(what.summon); // lousy
	},

	/**
	 * Something appears to be something array-like?
	 * @param {object} what
	 * @returns {boolean}
	 */
	isArrayLike: function(what) {
		return '0' in what && !this.isArray(what);
	},

	/**
	 * Autocast string to an inferred type. "123" will
	 * return a number, "false" will return a boolean.
	 * @param {String} string
	 * @returns {object}
	 */
	cast: function(string) {
		var result = String(string);
		switch (result) {
			case 'null':
				result = null;
				break;
			case 'true':
			case 'false':
				result = result === 'true';
				break;
			default:
				if (String(parseInt(result, 10)) === result) {
					result = parseInt(result, 10);
				} else if (String(parseFloat(result)) === result) {
					result = parseFloat(result);
				}
				break;
		}
		return result;
	},

	// Private ...................................................................

	/**
	 * Match "Array" in "[object Array]" and so on.
	 * @type {RegExp}
	 */
	_typeexp: /\s([a-zA-Z]+)/
};

/**
 * Generate methods for isArray, isFunction, isBoolean etc.
 * TODO: can we do an "isError" here?
 */
(function generatecode() {
	[
		'array',
		'function',
		'object',
		'string',
		'number',
		'boolean',
		'null',
		'arguments',
		'file'
	].forEach(function(type) {
		this['is' + type[0].toUpperCase() + type.slice(1)] = function is(o) {
			return this.of(o) === type;
		};
	}, this);
}.call(gui.Type));

/**
 * Bind the "this" keyword for all methods.
 */
gui.Object.bindall(gui.Type);

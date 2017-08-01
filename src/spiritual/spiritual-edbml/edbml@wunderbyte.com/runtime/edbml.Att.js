/**
 * Converts JS props to HTML attributes during EDBML rendering phase.
 * Any methods added to this prototype will become available in EDBML
 * scripts as `$att.mymethod()`
 * @param @optional Map<String,object> atts Default properties
 */
edbml.Att = function Att(atts) {
	if (atts) {
		gui.Object.extend(this, atts);
	}
};

edbml.Att.prototype = gui.Object.create(null, {
	/**
	 * Identification.
	 * @returns {String}
	 */
	toString: function() {
		return '[object edbml.Att]';
	},

	// Privileged ................................................................

	/**
	 * Resolve single key-value to HTML attribute declaration.
	 * @param {String} att
	 * @returns {String}
	 */
	$: function(att) {
		var val = this[att],
			html = '';
		switch (gui.Type.of(val)) {
			case 'null':
			case 'undefined':
				break;
			default:
				val = edbml.Att.$encode(this[att]);
				html += att + '="' + val + '" ';
				break;
		}
		return html;
	},

	/**
	 * Resolve key-value, then delete it to prevent reuse.
	 * @param {String} att
	 */
	$pop: function(att) {
		var html = this.$(att);
		delete this[att];
		return html;
	},

	/**
	 * Resolve all key-values to HTML attribute declarations.
	 * @returns {String}
	 */
	$all: function() {
		var html = '';
		gui.Object.nonmethods(this).forEach(function(att) {
			html += this.$(att);
		}, this);
		return html;
	}
});

// Static privileged ...........................................................

/**
 * Stringify stuff to be used as HTML attribute values.
 * TODO: in "string", support simple/handcoded JSON object/array.
 * @param {object} data
 * @returns {String}
 */
edbml.Att.$encode = function(data) {
	var type = gui.Type.of(data);
	switch (type) {
		case 'string':
			data = edbml.safeattr(data);
			break;
		case 'number':
		case 'boolean':
			data = String(data);
			break;
		case 'object':
		case 'array':
			try {
				data = encodeURIComponent(JSON.stringify(data));
			} catch (jsonex) {
				throw new Error('Could not create HTML attribute: ' + jsonex);
			}
			break;
		case 'date':
			throw new Error('TODO: edbml.Att.encode standard date format?');
		default:
			throw new Error('Could not create HTML attribute for ' + type);
	}
	return data;
};

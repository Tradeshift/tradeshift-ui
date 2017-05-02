/**
 * Attribute wrapper.
 * @param {String} name
 * @param {String} value
 */
gui.Att = function Att(name, value) {
	this.value = gui.Type.cast(value);
	this.name = this.type = name;
};

gui.Att.prototype = {
	/**
	 * Attribute name.
	 * @type {String}
	 */
	name: null,

	/**
	 * Alias 'name' to conform the API with events, broadcasts, actions etc.
	 * @type {String}
	 */
	type: null,

	/**
	 * Attribute value will be cast to an inferred type, eg. "false" becomes
	 * boolean and "23" becomes number. When handling an attribute, 'null'
	 * implies that the attribute WILL be deleted (it happens after 'onatt').
	 * TODO: look into deleting the attribute first
	 * @type {String|number|boolean|null}
	 */
	value: null
};

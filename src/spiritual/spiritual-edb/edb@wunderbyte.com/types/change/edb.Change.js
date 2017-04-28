/**
 * Micro change summary.
 */
edb.Change = function() {};
edb.Change.prototype = {
	/**
	 * Type that changed.
	 * @type {edb.Object|edb.Array}
	 */
	object: null,

	/**
	 * Update type.
	 * @type {String}
	 */
	type: null
};

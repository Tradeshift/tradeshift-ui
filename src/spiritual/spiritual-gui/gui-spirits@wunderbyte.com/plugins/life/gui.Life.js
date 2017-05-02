/**
 * SpiritLife is a non-bubbling event type that covers the life cycle of a spirit.
 * @see {gui.LifePlugin}
 * @param {gui.Spirit} target
 * @param {String} type
 */
gui.Life = function Life(target, type) {
	this.target = target;
	this.type = type;
};

gui.Life.prototype = {
	/**
	 * @type {gui.Spirit}
	 */
	target: null,

	/**
	 * @type {String}
	 */
	type: null,

	/**
	 * Identification.
	 * @returns {String}
	 */
	toString: function() {
		return '[object gui.Life]';
	}
};

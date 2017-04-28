/**
 * Details for ended CSS transition.
 * @param {String} propertyName
 * @param {number} elapsedTime
 */
gui.Transition = function(propertyName, elapsedTime) {
	this.duration = Math.round(elapsedTime / 1000);
	this.type = propertyName;
};

gui.Transition.prototype = {
	/**
	 * Property that finished transitioning ("width","height").
	 * @TODO un-camelcase this to CSS syntax.
	 * @TODO adjust vendor prefix to "beta".
	 * @type {String}
	 */
	type: null,

	/**
	 * Elapsed time in milliseconds. This may
	 * not be identical to the specified time.
	 * @type {number}
	 */
	duration: 0
};

/**
 * Something that has position.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
gui.Position = function(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
};

gui.Position.prototype = {
	/**
	 * X position.
	 * @type {number}
	 */
	x: 0,

	/**
	 * Y position.
	 * @type {number}
	 */
	y: 0,

	/**
	 * Z position.
	 * @type {number}
	 */
	z: 0,

	/**
	 * Identification.
	 * @returns {String}
	 */
	toString: function() {
		return '[object gui.Position]';
	},

	/**
	 * Clone position.
	 * @returns {gui.Position}
	 */
	clone: function() {
		return new gui.Position(this.x, this.y, this.z);
	}
};

// Static ......................................................................

/**
 * Compare two positions.
 * @param {gui.Position} p1
 * @param {gui.Position} p2
 * @return {boolean}
 */
gui.Position.isEqual = function(p1, p2) {
	return p1.x === p2.x && p1.y === p2.y;
};

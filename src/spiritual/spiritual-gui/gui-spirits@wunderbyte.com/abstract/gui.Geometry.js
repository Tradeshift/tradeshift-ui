/**
 * Something that has 2D position and width and height.
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
gui.Geometry = function(x, y, w, h) {
	this.x = x || 0;
	this.y = y || 0;
	this.w = w || 0;
	this.h = h || 0;
};

gui.Geometry.prototype = {
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
	 * Width.
	 * @type {number}
	 */
	w: 0,

	/**
	 * Height.
	 * @type {number}
	 */
	h: 0,

	/**
	 * Identification.
	 * @returns {String}
	 */
	toString: function() {
		return '[object gui.Geometry]';
	},

	/**
	 * Intersects another (2D) geometry?
	 * @param {gui.Geometry} geo
	 */
	hitTest: function(geo) {
		return gui.Geometry.hitTest(this, geo);
	}
};

// Static ......................................................................

/**
 * Compare two geometries.
 * @param {gui.Geometry} geo1
 * @param {gui.Geometry} geo2
 * @returns {boolean}
 */
gui.Geometry.isEqual = function(geo1, geo2) {
	return geo1.x === geo2.x && geo1.y === geo2.y && geo1.w === geo2.w && geo1.h === geo2.h;
};

/**
 * Hittest two geometries.
 * @param {gui.Geometry} geo1
 * @param {gui.Geometry} geo2
 * @returns {boolean}
 */
gui.Geometry.hitTest = function(geo1, geo2) {
	function x(g1, g2) {
		return g1.x >= g2.x && g1.x <= g2.x + g2.w;
	}

	function y(g1, g2) {
		return g1.y >= g2.y && g1.y <= g2.y + g2.h;
	}
	var hitx = x(geo1, geo2) || x(geo2, geo1);
	var hity = y(geo1, geo2) || y(geo2, geo1);
	return hitx && hity;
};

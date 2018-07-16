/**
 * Working with arrays.
 */
gui.Array = {
	/**
	 * Takes a variable number of arguments and produces
	 * an instance of Array containing those elements.
	 * http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
	 * @returns {Array}
	 */
	of: (function() {
		var slice = Array.prototype.slice;
		return (
			Array.of ||
			function() {
				return slice.call(arguments);
			}
		);
	})(),

	/**
	 * Converts a single argument that is an array-like
	 * object or list into a fresh array.
	 * https://gist.github.com/rwaldron/1074126
	 * @param {object} arg
	 * @returns {Array}
	 */
	from: (function() {
		return (
			Array.from ||
			function(arg) {
				var array = [];
				var object = Object(arg);
				var len = object.length >>> 0;
				var i = 0;
				while (i < len) {
					if (i in object) {
						array[i] = object[i];
					}
					i++;
				}
				return array;
			}
		);
	})(),

	/**
	 * Resolve single argument into an array with one or more
	 * entries with special handling of single string argument:
	 *
	 * 1. Strings to be split at spaces into an array
	 * 3. Arrays are converted to a similar but fresh array
	 * 2. Array-like objects transformed into real arrays.
	 * 3. Other objects are pushed into a one entry array.
	 *
	 * @param {object} arg
	 * @returns {Array} Always return an array
	 */
	make: function(arg) {
		switch (gui.Type.of(arg)) {
			case 'string':
				return arg.split(' ');
			case 'array':
				return this.from(arg);
			default:
				if (gui.Type.isArrayLike(arg)) {
					return this.from(arg);
				} else {
					return [arg];
				}
		}
	},

	/**
	 * Remove array member(s) by index (given numbers) or reference (given other).
	 * @see http://ejohn.org/blog/javascript-array-remove/#comment-296114
	 * TODO: Special setup for handling strings????
	 * TODO: More corner case handling of types...
	 * @param {Array} array
	 * @param {number|object} from
	 * @param @optional {number|object} to
	 * @returns {number} new length
	 */
	remove: function(array, from, to) {
		var markers = gui.Array.from(arguments).slice(1);
		if (markers.some(isNaN)) {
			return this.remove.apply(
				this,
				[array].concat(
					markers.map(function toindex(m) {
						return isNaN(m) ? array.indexOf(m) : m;
					})
				)
			);
		} else {
			array.splice(
				from,
				!to || 1 + to - from + (!((to < 0) ^ (from >= 0)) && (to < 0 || -1) * array.length)
			);
			return array.length;
		}
	},
	diffSymmetric: function diffSymmetric(arr, otherArr) {
		if (!Array.isArray(arr)) {
			throw new TypeError('arr must be an Array');
		}
		if (!Array.isArray(otherArr)) {
			throw new TypeError('otherArr must be an Array');
		}
		return arr
			.filter(function(x) {
				return otherArr.indexOf(x) === -1;
			})
			.concat(
				otherArr.filter(function(x) {
					return arr.indexOf(x) === -1;
				})
			);
	}
};

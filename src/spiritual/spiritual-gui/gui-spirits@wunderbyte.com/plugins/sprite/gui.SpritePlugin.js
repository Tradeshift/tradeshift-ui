/**
 * Transformation time!
 * @TODO: transform more
 * @TODO: support non-px units
 */
gui.SpritePlugin = (function() {
	// eslint-disable-next-line no-unused-vars
	function total(a, b) {
		return (a || 0) + b;
	}

	return gui.Plugin.extend({
		/**
		 * X position.
		 * @type {number}
		 */
		x: {
			getter: function() {
				return this._pos.x;
			},
			setter: function(x) {
				this._pos.x = x;
				this._apply();
			}
		},

		/**
		 * Y position.
		 * @type {number}
		 */
		y: {
			getter: function() {
				return this._pos.y;
			},
			setter: function(y) {
				this._pos.y = y;
				this._apply();
			}
		},

		/**
		 * Z position.
		 * @type {number}
		 */
		z: {
			getter: function() {
				return this._pos.z;
			},
			setter: function(z) {
				this._pos.z = z;
				this._apply();
			}
		},

		/**
		 * Construction time.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this._pos = new gui.Position();
		},

		/**
		 * Reset transformations.
		 */
		reset: function() {
			if (gui.Client.has3D) {
				this.spirit.css.set('-beta-transform', '');
			} else {
				this.spirit.css.left = '';
				this.spirit.css.top = '';
			}
		},

		// Private ...............................................

		/**
		 * Position tracking.
		 * @type {gui.Position}
		 */
		_pos: null,

		/**
		 * Default position as assigned by stylesheet (for IE9).
		 * @type {gui.Position}
		 */
		_def: null,

		/**
		 * Compute default position (in IE9).
		 * @param {gui.CSSPlugin} css
		 * @returns {gui.Position}
		 */
		_defpos: function(css) {
			return (
				this._def ||
				(this._def = new gui.Position(
					parseInt(css.compute('left'), 10),
					parseInt(css.compute('top'), 10)
				))
			);
		},

		/**
		 * Go ahead.
		 */
		_apply: function() {
			var pos = this._pos;
			var set = [pos.x, pos.y, pos.z].map(Math.round);
			var css = this.spirit.css;
			// if (false && set.reduce(total) === 0) {
			// 	this.reset(); // DISABLED FOR NOW!
			// } else {
			if (gui.Client.has3D) {
				css.set('-beta-transform', 'translate3d(' + set.join('px,') + 'px)');
			} else {
				var def = this._defpos(css);
				css.left = def.x + set[0];
				css.top = def.y + set[1];
			}
			// }
		}
	});
})();

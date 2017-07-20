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
		 * Scale.
		 * @type {number}
		 */
		scale: {
			getter: function() {
				return this._gro;
			},
			setter: function(scale) {
				this._gro = scale;
				this._apply();
			}
		},

		/**
		 * X Offset.
		 * @type {number}
		 */
		xoffset: {
			getter: function() {
				return this._org.x;
			},
			setter: function(x) {
				this._org.x = x;
				this._apply();
			}
		},

		/**
		 * Y Offset.
		 * @type {number}
		 */
		yoffset: {
			getter: function() {
				return this._org.y;
			},
			setter: function(y) {
				this._org.y = y;
				this._apply();
			}
		},

		/**
		 * Z Offset.
		 * @type {number}
		 */
		zoffset: {
			getter: function() {
				return this._org.z;
			},
			setter: function(z) {
				this._org.z = z;
				this._apply();
			}
		},

		/**
		 * Construction time.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this._pos = new gui.Position();
			this._org = new gui.Position();
			this._gro = 1;
		},

		/**
		 * Reset transformations.
		 * @TODO Should reset to CSS values, not remove them
		 */
		reset: function() {
			this.spirit.css.set('-beta-transform', '');
			this.spirit.css.set('-beta-transform-origin', '');
			if (!gui.Client.has3D) {
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
		 * Scale.
		 * @type {number}
		 */
		_gro: null,

		/**
		 * Origin offset tracking.
		 * @type {gui.Position}
		 */
		_org: null,

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
			var coords = this._pos;
			var origin = this._org;
			var scaled = parseFloat(this._gro);
			var tforms = [coords.x, coords.y, coords.z].map(parseFloat);
			var offset = [origin.x, origin.y, origin.z].map(parseFloat);
			var plugin = this.spirit.css;
			// if (set.reduce(total) === 0) {
			// 	this.reset(); // Should reset to CSS values, not remove them
			// } else {}
			if (gui.Client.has3D) {
				plugin.style({
					'-beta-transform-origin': offset.join('px ') + 'px',
					'-beta-transform': 'translate3d(' + tforms.join('px,') + 'px) scale(' + scaled + ')'
				});
			} else {
				var iepos = this._defpos(plugin);
				plugin.style({
					left: Math.round(iepos.x + tforms[0] + offset[0]),
					top: Math.round(iepos.y + tforms[1] + offset[1]),
					msTransformOrigin: offset[0] + 'px' + ' ' + offset[1] + 'px',
					msTransform: 'scale(' + scaled + ')'
				});
			}
		}
	});
})();

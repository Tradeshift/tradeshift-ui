/**
 * Spirit box object. Note that these are all properties, not methods.
 * @extends {gui.Plugin}
 * TODO: Support globalX, globalY, screenX, screenY
 */
gui.BoxPlugin = gui.Plugin.extend({
	width: 0, // width
	height: 0, // height
	localX: 0, // X relative to positioned ancestor
	localY: 0, // Y relative to positioned ancestor
	pageX: 0, // X relative to the full page (includes scrolling)
	pageY: 0, // Y telative to the full page (includes scrolling)
	clientX: 0, // X relative to the viewport (excludes scrolling)
	clientY: 0, // Y relative to the viewport (excludes scrolling)

	/**
	 * Returns local scrolling element (hotfixed)
	 * TODO: Fix this in gui.Client...
	 * @returns {Element}
	 */
	_scrollroot: function() {
		return (function(doc) {
			if (gui.Client.scrollRoot.localName === 'html') {
				return doc.documentElement;
			} else {
				return doc.body;
			}
		})(this.spirit.document);
	}
});

Object.defineProperties(gui.BoxPlugin.prototype, {
	/**
	 * Width.
	 * @type {number}
	 */
	width: {
		get: function() {
			return this.spirit.element.offsetWidth;
		}
	},

	/**
	 * Height.
	 * @type {number}
	 */
	height: {
		get: function() {
			return this.spirit.element.offsetHeight;
		}
	},

	/**
	 * X relative to positioned ancestor.
	 * @type {number}
	 */
	localX: {
		get: function() {
			return this.spirit.element.offsetLeft;
		}
	},

	/**
	 * Y relative to positioned ancestor.
	 * @type {number}
	 */
	localY: {
		get: function() {
			return this.spirit.element.offsetTop;
		}
	},

	/**
	 * X relative to the full page (includes scrolling).
	 * TODO: IMPORTANT scrollroot must be local to context
	 * @type {number}
	 */
	pageX: {
		get: function() {
			return this.clientX + this._scrollroot().scrollLeft;
		}
	},

	/**
	 * Y relative to the full page (includes scrolling).
	 * TODO: IMPORTANT scrollroot must be local to context
	 * @type {number}
	 */
	pageY: {
		get: function() {
			return this.clientY + this._scrollroot().scrollTop;
		}
	},

	/**
	 * X relative to the viewport (excludes scrolling).
	 * @type {number}
	 */
	clientX: {
		get: function() {
			return this.spirit.element.getBoundingClientRect().left;
		}
	},

	/**
	 * Y relative to the viewport (excludes scrolling).
	 * @type {number}
	 */
	clientY: {
		get: function() {
			return this.spirit.element.getBoundingClientRect().top;
		}
	}
});

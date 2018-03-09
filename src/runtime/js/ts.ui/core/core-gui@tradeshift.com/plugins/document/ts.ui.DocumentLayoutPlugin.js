/**
 * Manage the {ts.ui.LayoutModel}. We've rigged this up so that the
 * model is always output when the app is running standalone (without
 * the chrome). If and when the chrome transmits a global model, the
 * {ts.ui.DocumentSpirit} will output that in replacement of ours.
 * @see {ts.ui.DocumentSpirit#_outputmodels}
 */
ts.ui.DocumentLayoutPlugin = ts.ui.Plugin.extend({
	/**
	 * The window width is currently zero in Frankenstein
	 * so we will have to go about it in a delicate way.
	 */
	managelayout: function() {
		this._points = this._computepoints();
		new ts.ui.LayoutModel(this._computelayout()).output();
		this._updateBreakpoints();
		gui.Broadcast.add(gui.BROADCAST_RESIZE_END, this);
	},

	/**
	 * If in top frame (or in Frankenstein), update
	 * the global layoutmodel on breakpoint change.
	 * @param {gui.Broadcast} b
	 */
	onbroadcast: function(b) {
		switch (b.type) {
			case gui.BROADCAST_RESIZE_END:
				this._updateBreakpoints();
				break;
		}
	},

	// Private ...................................................................

	/**
	 * Listing breakpoints ascending.
	 * @see {ts.ui.LayoutModel#BREAKPOINTS}
	 * @type {Array<number>}
	 */
	_points: null,

	/**
	 * Frankenstein resize timeout index.
	 * TODO(jmo@): Move this hack to (as yet nonexistent) {ts.ui.Document}
	 * or figure out why the original broadcast isn't propagated in from above.
	 * @type {number}
	 */
	_timeout: -1,

	/**
	 * Compute breakpoints array.
	 */
	_computepoints: function() {
		var points = ts.ui.LayoutModel.BREAKPOINTS;
		return Object.keys(points)
			.map(function(point) {
				return parseInt(point, 10);
			})
			.sort(function(a, b) {
				return a - b;
			});
	},

	/**
	 * Compute layout.
	 * @returns {object}
	 */
	_computelayout: function() {
		var point,
			next,
			points = [],
			width = this._getwidth(document.documentElement),
			presets = ts.ui.LayoutModel.BREAKPOINTS;
		this._points.every(function(p) {
			if ((next = p <= width)) {
				point = presets[p];
				points.push(point);
			}
			return next;
		});
		return {
			breakpoints: points,
			breakpoint: point
		};
	},

	/**
	 * Measure the document width in such a way that the iPhone might look OK.
	 * @param {HTMLHtmlElement} root
	 * @returns {number}
	 */
	_getwidth: function(root) {
		return Math.max(root.clientWidth, root.offsetWidth, root.scrollWidth);
	},

	/**
	 * Update breakpoints. On startup, our window has no width when running
	 * inside the Frankenstein chrome. But that's the least of our worries.
	 */
	_updateBreakpoints: function() {
		var layout = this._computelayout();
		var model = ts.ui.LayoutModel.output.get();
		model.breakpoint = layout.breakpoint;
		model.breakpoints = layout.breakpoints;
	}
});

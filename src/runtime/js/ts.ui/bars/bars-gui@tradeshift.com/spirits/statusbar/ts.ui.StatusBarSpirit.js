/**
 * Spirit of the statusbar.
 * @using {ts.ui.PagerModel} PagerModel
 * @using {gui.Type} Type
 * @using {gui.Combo.chained} chained
 * @using {gui.Arguments.confirmed} confirmed
 */
ts.ui.StatusBarSpirit = (function using(PagerModel, Type, chained, confirmed) {
	return ts.ui.ToolBarSpirit.extend({
		/**
		 * Open for implementation: Called when message link is clicked.
		 * @type {function}
		 */
		onlink: null,

		/**
		 * Open for implementation: Called when the layout mode shifts (vertically).
		 * @type {function}
		 */
		onlayout: null,

		/**
		 * Set the message.
		 * @alias {ts.ui.StatusBarSpirit#title}
		 * @param @optional {string} text
		 */
		message: confirmed('(string)')(function(text) {
			return this.title.apply(this, arguments);
		}),

		/**
		 * @param {Object|null} [json]
		 * @returns {this|ts.ui.Model}
		 */
		checkbox: chained(function(json) {
			var model = this.model();
			if (arguments.length) {
				model.checkbox = json;
			} else {
				return model.checkbox;
			}
		}),

		/**
		 * Get or set the pager. Pass `null` to remove the pager (via bad API :/)
		 * @param @optional {object|ts.ui.PagerModel|null} opt_json
		 * @returns {ts.ui.PagerModel|this}
		 */
		pager: confirmed('(object|null)')(
			chained(function(opt_json) {
				var model = this.model();
				if (arguments.length) {
					if (model.pager) {
						model.pager.dispose();
					}
					if (opt_json === null) {
						model.pager = null;
					} else {
						model.pager = PagerModel.from(opt_json);
					}
				} else {
					if (!model.pager) {
						this.pager({});
					}
					return model.pager;
				}
			})
		),

		/**
		 * Manually enable support for links in the status message (just to
		 * remind yourself that you may now be enncouraging phishing attacks).
		 * @param @optional {function} onlink
		 * @returns {ts.ui.StatusBarSpirit}
		 */
		linkable: confirmed('(function)')(
			chained(function(onlink) {
				this.model().linkable = true;
				this.action.add(ts.ui.ACTION_SAFE_LINK);
				if (arguments.length) {
					this.onlink = onlink;
				}
			})
		),

		/**
		 * Handle action.
		 * @param {gui.Action} a
		 */
		onaction: function(a) {
			this.super.onaction(a);
			if (a.type === ts.ui.ACTION_SAFE_LINK) {
				if (Type.isFunction(this.onlink)) {
					this.onlink.call(this, a.data);
				}
				a.consume();
			}
		},

		/**
		 * To support tabs, we would at least need to revisit the CSS.
		 * @overwrites {ts.ui.ToolBar#title}
		 */
		tabs: function() {
			throw new Error("The StatusBar doesn't support tabs :(");
		},

		/**
		 * TODO: Can this be privatized?
		 * Get or set the model. Not recommended.
		 * @param {object|ts.ui.StatusBarModel} model
		 * @returns {ts.ui.StatusBarModel|ts.ui.StatusBarSpirit}
		 */
		model: ts.ui.Spirit.createModelMethod(
			ts.ui.StatusBarModel,
			'ts.ui.ToolBarSpirit.edbml',
			function observe(model) {
				model.addObserver(this);
			}
		),

		// Private .................................................................

		/**
		 * Add some special styling hooks for mobile breakpoint.
		 * @override {ts.ui.ToolBarSpirit#_docss}
		 * TODO: Also account for statusbar levels in file "ts-main.less"
		 * @param {gui.CSSPlugin} css
		 * @param {boolean} small
		 * @param {truthy} lefts
		 * @param {truthy} right
		 * @param {truthy} extra
		 * @param {truthy} search
		 */
		_docss: function(css, small, lefts, right, extra, search) {
			this.super._docss(css, small, lefts, right, extra, search);
			this._gotoLevel(small ? this._computelevel(lefts, right, extra, search) : 3);
		},

		/**
		 * Update `ts-level-x` classname and dispatch an action if it changed.
		 * This will probably cause an ancestor component to update its classname.
		 * @see {ts.ui.LayoutPlugin#gotoLevel}
		 * @param {number} level
		 */
		_gotoLevel: function(level) {
			var oldname = this.css.name();
			this.guilayout.gotoLevel(level);
			if (this.css.name() !== oldname) {
				this.action.dispatch(ts.ui.ACTION_STATUSBAR_LEVEL, level);
				if (Type.isFunction(this.onlayout)) {
					this.onlayout.call(this);
				}
			}
		},

		/**
		 * The numbers here translate to "units" which are currently set at `22px`.
		 * @param {truthy} lefts
		 * @param {truthy} right
		 * @param {truthy} extra
		 * @param {truthy} search
		 * @returns {number}
		 */
		_computelevel: function(lefts, right, extra, search) {
			if (lefts && right && !extra) {
				return search ? 5 : 4.5;
			} else if (lefts && extra && !right) {
				return search ? 5 : 4.5;
			} else if (right && extra && !lefts) {
				return 6;
			} else if (lefts && right && extra) {
				return search ? 8 : 7.5;
			}
			return 3;
		}

		/**
		 * @param {truthy} lefts
		 * @param {truthy} right
		 * @param {truthy} extra
		 * @param {truthy} search
		 * @returns {number}
		 *
		_computelevel: function(lefts, right, extra, search) {
			if (lefts && right && !extra) {
				return search ? 2 : 1.5;
			} else if (lefts && extra && !right) {
				return search ? 2 : 1.5;
			} else if (right && extra && !lefts) {
				return 2;
			} else if (lefts && right && extra) {
				return search ? 3 : 2.5;
			}
			return 1;
		}
		*/
	});
})(ts.ui.PagerModel, gui.Type, gui.Combo.chained, gui.Arguments.confirmed);

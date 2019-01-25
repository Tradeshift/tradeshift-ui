/**
 * Superspirit for some big bars that are made of multiple bars.
 * @see {ts.ui.HeaderBarSpirit}
 * @see {ts.ui.HeaderBarSpirit}
 * @using {ts.ui.ToolBarSpirit} ToolBarSpirit
 * @using {gui.Combo#chained} chained
 */
ts.ui.MajorBarSpirit = (function(ToolBarSpirit, chained) {
	return ts.ui.Spirit.extend({
		/**
		 * Is the "Main" Header or Footer?
		 * @type {boolean}
		 */
		global: false,

		/**
		 * Get or set visibility.
		 * TODO: Simplify via new property `this.dom.visible`
		 * @type {boolean}
		 */
		visible: {
			getter: function() {
				return this._visible;
			},
			setter: function(is) {
				if (is !== this._visible) {
					if ((this._visible = is)) {
						this.dom.show();
					} else {
						this.dom.hide();
					}
					this._layout();
				}
			}
		},

		/**
		 * Get or set the buttons.
		 * [The buttons will be rendered in the `bufferbar`!]
		 * @param {Array<object>|ts.ui.ButtonCollection|null} [json]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		buttons: chained(function(json) {
			var model = this.model();
			if (arguments.length) {
				if (json === null) {
					model.buttons.clear();
				} else {
					model.buttons = json;
				}
			} else {
				return model.buttons;
			}
		}),

		/**
		 * Layout whenever the bars render.
		 * @param {gui.Life} l
		 */
		onlife: function xxx(l) {
			this.super.onlife(l);
			if (l.type === gui.LIFE_RENDER) {
				this._layout();
			}
		},

		/**
		 * @returns {this}
		 */
		hide: chained(function() {
			this.visible = false;
		}),

		/**
		 * @returns {this}
		 */
		show: chained(function() {
			this.visible = true;
		}),

		// Privileged ..............................................................

		/**
		 * The system will call this in mobile breakpoint upon SideBar open.
		 * @param {boolean} now - Skip the transition?
		 * @returns {this}
		 */
		$fadeOut: chained(function(now) {
			if (now) {
				this.dom.hide();
			} else {
				this.css.opacity = 0;
				this.tick.time(function() {
					this.dom.hide();
				}, 30);
			}
		}),

		/**
		 * The system will call this in mobile breakpoint upon SideBar closed.
		 * @param {boolean} now - Skip the transition?
		 * @returns {this}
		 */
		$fadeIn: chained(function(now) {
			if (now) {
				this.css.opacity = 1;
				this.dom.show();
			} else {
				this.dom.show();
				this.tick.time(function() {
					this.css.opacity = 1;
				}, 30);
			}
		}),

		// Private .................................................................

		/**
		 * Visible? Please only update this via the `visible` property (no underscore).
		 * @type {boolean}
		 */
		_visible: true,

		/**
		 * Forcefully hidden by the developer (overwriting `_visible` above)?
		 * @type {boolean}
		 */
		_hidden: false,

		/**
		 * Lookup ToolBarSpirit by selector.
		 * @param {string} selector
		 * @returns {ts.ui.ToolBarSpirit}
		 */
		_getbar: function(selector) {
			return this.dom.q(selector, ToolBarSpirit);
		},

		/**
		 * There's just no way that this can work with pure CSS, so here it is: 
		 * Style the thing so that there is a 1px border separator between bars.
		 *
		_refresh: function(bars) {
			bars.slice(1).reduce(function(was, bar) {
				var is = bar.visible;
				bar.css.shift(is && was, 'ts-toolbar-divider');
				return was || is;
			}, bars[0].visible);
		},
		*/

		/**
		 * Dispatch some action bearing offset info for the general environment to handle.
		 * If no bars are visible, we'll hide ourselves not to show an awkward dropshadow.
		 * @param {string} action
		 * @param {Array<Array<ts.ui.ToolBarSpirit|number>>}
		 */
		_layout: function(action, bars) {
			if (this._hidden) {
				this.action.dispatch(action, 0);
			} else {
				var offset = this._offset(bars);
				this.action.dispatch(action, offset);
				this.visible = !!offset;
			}
		},

		/**
		 * Compute the total height of bars measured in units (currently at `22px`).
		 * @param {Array<Array<ts.ui.ToolBarSpirit|number>>}
		 * @returns {number}
		 */
		_offset: function(bars) {
			return bars.reduce(function sum(offset, entry, index) {
				return offset + (entry[0].visible ? entry[1] : 0);
			}, 0);
		}
	});
})(ts.ui.ToolBarSpirit, gui.Combo.chained);

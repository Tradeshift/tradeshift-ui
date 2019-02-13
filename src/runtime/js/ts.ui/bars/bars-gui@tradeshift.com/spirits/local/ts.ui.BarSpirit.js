/**
 * Spirit of the bar.
 * @see http://www.amazon.co.uk/Spirit-bar-delivered-students-Lectures/dp/B0008AZ278
 * @see {ts.ui.TopBarSpirit}
 * @see {ts.ui.ToolBarSpirit}
 * @using {ts.ui.TopBar} TopBar
 * @using {gui.Client} Client
 * @using {gui.Combo.chained} chained
 * @using {number} UNIT_DOUBLE
 * @using {number} UNIT_TRIPLE
 */
ts.ui.BarSpirit = (function(TopBar, Client, chained, UNIT_DOUBLE, UNIT_TRIPLE) {
	return ts.ui.Spirit.extend({
		/**
		 * Scroll the bar whenever MAIN is scrolling. This always applies to the
		 * TopBar. It applies to the ToolBar (which is different) only in mobile
		 * breakpoint and only when it's positioned directly before `ts-main`.
		 * TODO: Big time `pointer-events:none` while scrolling!
		 * @param {Event} e
		 */
		onevent: function(e) {
			this.super.onevent(e);
			if (e.type === 'scroll') {
				this._slide(e.target.scrollTop);
			}
		},

		/**
		 * TODO
		 */
		hide: function() {
			alert('TODO!');
		},

		/**
		 * TODO
		 */
		show: function() {
			alert('TODO!');
		},

		// Privileged ..............................................................

		/**
		 * Track the scroll position of a different main (top level panel layout).
		 * Note that the scrolling BarSpirit only works in the mobile breakpoint.
		 * @param {HTMLMainElement} main
		 * @returns {ts.ui.BarSpirit}
		 */
		$setmain: chained(function(main) {
			this._main = main;
			this._onbreakpoint();
			this._slide(main.scrollTop);
		}),

		/**
		 * Get specifically assigned Main or just the first Main on the page.
		 * @returns {HTMLMainElement}
		 */
		$getmain: function() {
			return this._main || (this._main = this.dom.qdoc('.ts-main'));
		},

		// Private .................................................................

		/**
		 * Snapshot scrolling.
		 * @type {number}
		 */
		_scroll: 0,

		/**
		 * Supporting multiple Main elements.
		 * @type {HTMLMainElement}
		 */
		_main: null,

		/**
		 * Setup stuff in mobule breakpoint (the subclass will decide if and when).
		 * Note that the floating bar is not floating in IE9 because of certain
		 * conflicts with JS positioning versus CSS positioning (IE9 must use
		 * `left` and `top` in both cases) but IE9 users are after all not mobile.
		 * TODO: Make sure to also remove the breakpoint listener when we terminate.
		 */
		_initbreakpoint: function(attach) {
			var main = this.$getmain();
			if (main && Client.has3D) {
				this.sprite.y = 0;
				if (attach) {
					this._onbreakpoint();
					this._breakfunction = function(newpoint, oldpoint) {
						this._onbreakpoint();
						if (oldpoint && oldpoint === 'mobile') {
							this.sprite.y = 0;
						}
					}.bind(this);
					ts.ui.addBreakPointListener(this._breakfunction);
				} else if (this._breakfunction) {
					ts.ui.removeBreakPointListener(this._breakfunction);
				}
			}
		},

		/**
		 * Breakpoint changed (or was initialized).
		 * @param @optional {HTMLMainElement} main
		 */
		_onbreakpoint: function() {
			var main = this.$getmain();
			var mobi = ts.ui.isMobilePoint();
			this._scroll = main.scrollTop;
			this.event.shift(mobi, 'scroll', main, this);
		},

		/**
		 * Scroll TopBar when MAIN is scrolled
		 * (this happens in mobile breakpoint).
		 * @param {number} scroll Main scrollTop
		 */
		_slide: function(scroll) {
			if (Client.has3D) {
				var stop = 0 - this._offsetLimit();
				var delt = scroll - this._scroll;
				var down = delt > 0;
				var doit = false;
				var next = 0;
				if (down) {
					doit = this.sprite.y > stop;
				} else {
					doit = this.sprite.y < 0;
				}
				if (doit) {
					next = this.sprite.y - delt;
					next = next < stop ? stop : next;
					next = next > 0 ? 0 : next;
					this.sprite.y = next;
				}
				this._scroll = scroll;
			}
		},

		/**
		 * The bar should stop sliding after this many pixels.
		 * @returns {number}
		 */
		_offsetLimit: function() {
			return UNIT_TRIPLE + (TopBar.tabs().length ? UNIT_DOUBLE : 0);
		}
	});
})(ts.ui.TopBar, gui.Client, gui.Combo.chained, ts.ui.UNIT_DOUBLE, ts.ui.UNIT_TRIPLE);

/**
 * Generate methods `blue` `green` `purple` and so
 * on to change the general color scheme of the Bar.
 * @using {Object} methods
 */
(function generatercode(methods) {
	var proto = ts.ui.BarSpirit.prototype;
	var names = Object.keys(methods).map(function(key) {
		return methods[key];
	});
	gui.Object.each(methods, function(method, classname) {
		proto[method] = function() {
			(this._model || {}).color = classname;
			this.css.remove(names).add(classname);
			return this;
		};
	});
})(ts.ui.BACKGROUND_COLORS);

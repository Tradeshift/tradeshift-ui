/**
 * Spirit of the SideBar.
 * @extends {ts.ui.SideShowSpirit}
 * @using {ts.ui.layoutSpirit} LayoutSpirit
 * @using {gui.Type} Type
 * @using {gui.Client} Client
 * @using {gui.CSSPlugin} CSSPlugin
 * @using {gui.Combo.chained} chained
 */
ts.ui.SideBarSpirit = (function using(LayoutSpirit, Type, Client, CSSPlugin, chained) {
	// consuming all actions from nested asides
	var willopen = ts.ui.ACTION_ASIDE_WILL_OPEN,
		didopen = ts.ui.ACTION_ASIDE_DID_OPEN,
		willclose = ts.ui.ACTION_ASIDE_WILL_CLOSE,
		didclose = ts.ui.ACTION_ASIDE_DID_CLOSE;

	return ts.ui.SideShowSpirit.extend({
		/**
			 * Open by default.
			 * @type {boolean}
			 */
		isOpen: true,

		/**
			 * Automatically close the SideBar in mobile breakpoint?
			 * Note that the SideBar must then be *manually* opened.
			 * TODO: Once Collaboration has been refactored to *not*
			 * be in a SideBar, perhaps this property can be removed.
			 * @type {boolean}
			 */
		autoclose: {
			getter: function() {
				return this._autoclose;
			},
			setter: function(autoclose) {
				if (Type.isBoolean(Type.cast(autoclose))) {
					// no weird moustache syntax
					this.css.shift(autoclose, 'ts-autoclose');
					this._autoclose = !!autoclose;
					if (this.life.ready) {
						// changed post init
						if (this._autoclose) {
							if (ts.ui.isMobilePoint()) {
								this._breakpoint();
							}
						} else {
							this._closebutton(false);
							this.isOpen = true;
							this.reflex();
						}
					}
				}
			}
		},

		/**
			 * Setup to consume actions from nested Asides.
			 */
		onconfigure: function() {
			this.super.onconfigure();
			this.action.add([willopen, didopen, willclose, didclose]);
			this.open();
		},

		/**
			 * Add assistant classnames and fix the layout.
			 */
		onattach: function() {
			this.super.onattach();
			this._layout(true);
			if (ts.ui.isMobilePoint()) {
				this._breakpoint();
			}
		},

		/**
			 * Setup the stuff.
			 */
		onenter: function() {
			this.super.onenter();
			this._breakpointwatch();
			this.css.shift(this._autoclose, 'ts-autoclose');
		},

		/**
			 * Remove assistant classnames.
			 */
		ondetach: function() {
			this.super.ondetach();
			this._layout(false);
		},

		/**
			 * Consume all nested aside actions
			 * so as not to trigger the cover.
			 * @param {gui.Action} a
			 */
		onaction: function(a) {
			this.super.onaction(a);
			switch (a.type) {
				case willopen:
				case didopen:
				case willclose:
				case didclose:
					a.consume();
					break;
			}
		},

		/**
			 * Cleanup (using a temporary API that should be refactored).
			 */
		ondestruct: function() {
			this.super.ondestruct();
			ts.ui.removeBreakPointListener(this);
		},

		// Privileged ............................................................

		/**
			 * Show the SideBar.
			 */
		$onopen: function() {
			this.css.add(ts.ui.CLASS_OPEN);
			this.doorman.didopen();
		},

		/**
			 * Don't show the SideBar.
			 */
		$onclose: function() {
			this.css.remove(ts.ui.CLASS_OPEN);
			this.doorman.didclose();
		},

		// Private ...............................................................

		/**
			 * Automatically close the SideBar in mobile breakpoint?
			 * @type {boolean}
			 */
		_autoclose: true,

		/**
		 * If the SideBar is nested below the main header, 
		 * make the SideBar header become less prominent.
		 * @returns {ts.ui.HeaderBarSpirit}
		 */
		_head: function() {
			return this.dom.parent(ts.ui.MainSpirit)
				? ts.ui.LayoutSpirit.microHeader(this)
				: ts.ui.LayoutSpirit.macroHeader(this);
		},

		/**
		 * @param {boolean} attaching This is `false' when SideBar gets removed.
		 */
		_layout: function(attaching) {
			var parent = this.dom.parent();
			if (this.dom.next(LayoutSpirit)) {
				this.css.shift(attaching, 'ts-sidebar-first');
				CSSPlugin.shift(parent, attaching, 'ts-has-sidebar-first');
			} else if (this.dom.previous(LayoutSpirit)) {
				this.css.shift(attaching, 'ts-sidebar-last');
				CSSPlugin.shift(parent, attaching, 'ts-has-sidebar-last');
			}
		},

		/**
		 * Watch for breakpoint changes (using some
		 * temporary API that should be refactored).
		 */
		_breakpointwatch: function() {
			ts.ui.addBreakPointListener(
				function() {
					this._breakpoint();
				}.bind(this)
			);
		},

		/**
		 * Collapse the SideBar on mobile breakpoint.
		 * Setup to avoid CSS transition on collapse.
		 * @param {boolean} go
		 */
		_breakpoint: function() {
			var go = ts.ui.isMobilePoint();
			if (this._autoclose) {
				this._closebutton(go);
				if (go) {
					if (this.isOpen) {
						this.close();
						this.isOpen = false;
					}
				} else {
					if (!this.isOpen) {
						this.isOpen = true;
						this.guilayout.flexGlobal();
					}
				}
			}
		}
	});
})(ts.ui.LayoutSpirit, gui.Type, gui.Client, gui.CSSPlugin, gui.Combo.chained);

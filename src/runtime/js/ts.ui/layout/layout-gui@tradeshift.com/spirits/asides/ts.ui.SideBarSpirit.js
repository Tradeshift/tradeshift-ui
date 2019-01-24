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

	/**
	 * Does not exist on startup (for legacy reasons).
	 * @returns {ts.ui.LayoutModel}
	 */
	function layoutmodel() {
		return ts.ui.LayoutModel.output.get();
	}

	return ts.ui.SideShowSpirit.extend({
		/**
		 * Open by default.
		 * @type {boolean}
		 */
		isOpen: true,

		/**
		 * @deprecated
		 * Automatically close the SideBar in mobile breakpoint?
		 * @type {boolean}
		 */
		autoclose: {
			getter: function() {
				return this._autoclose;
			},
			setter: function(is) {
				this.event.shift((this._autoclose = is), 'ts-breakpoint', document);
			}
		},

		/**
		 * Setup to consume actions from nested Asides.
		 */
		onconfigure: function() {
			this.event.add('ts-breakpoint', document);
			this.super.onconfigure();
			this.action.add([willopen, didopen, willclose, didclose]);
		},

		/**
		 * Handle event.
		 * @param {Event} e
		 */
		onevent: function(e) {
			this.super.onevent(e);
			if (e.type === 'ts-breakpoint') {
				this._breakpoint();
			}
		},

		/**
		 * Add assistant classnames and fix the layout.
		 */
		onattach: function() {
			this.super.onattach();
			this._layout(true);
			this._breakpoint();
		},

		/**
		 * Remove assistant classnames.
		 */
		ondetach: function() {
			this.super.ondetach();
			this._layout(false);
			if (this.isOpen) {
				layoutmodel().sidebaropen = false;
			}
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

		// Privileged ..............................................................

		/**
		 *
		 */
		$onopen: function() {
			if (this._autoclose) {
				layoutmodel().sidebaropen = true;
				this.super.$onopen();
			}
		},

		/**
		 *
		 */
		$onclose: function() {
			if (this._autoclose) {
				layoutmodel().sidebaropen = false;
				this.super.$onclose();
			}
		},

		/**
		 * Trransition ended.
		 */
		_ontransitionend: function() {
			if (this.isOpen) {
				this.css.add(ts.ui.CLASS_OPEN);
				this.doorman.didopen();
			} else {
				this.css.add(ts.ui.CLASS_OPEN);
				this.doorman.didclose();
			}
		},

		// Private ...............................................................

		/**
		 * @type {boolean}
		 */
		_autoclose: true,

		/**
		 * THIS WILL UNDOUBTEDLY BE NEEDED AGAIN SOMETIME
		 * If the SideBar is nested below the main header, 
		 * make the SideBar header become less prominent.
		 * @returns {ts.ui.HeaderBarSpirit}
		 *
		_head: function() {
			return this.dom.parent(ts.ui.MainSpirit)
				? ts.ui.LayoutSpirit.microHeader(this)
				: ts.ui.LayoutSpirit.macroHeader(this);
		},
		*/

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
		 * Collapse the SideBar on mobile breakpoint.
		 * Setup to avoid CSS transition on collapse.
		 * @param {boolean} [go] Switch to mobile?
		 */
		_breakpoint: function(go) {
			var is = ts.ui.isMobilePoint();
			if (this._autoclose) {
				this._closebutton(is);
				if (is) {
					this.isOpen = false;
					this.dom.hide();
					this._position(100);
					layoutmodel().sidebaropen = false;
				} else {
					this.isOpen = true;
					this._position(0);
					this.dom.show();
				}
			}
		}
	});
})(ts.ui.LayoutSpirit, gui.Type, gui.Client, gui.CSSPlugin, gui.Combo.chained);

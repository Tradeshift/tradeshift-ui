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
	 * There is no need for Collaboration to be in a SideBar anymore, so we will remove this questionable feature.
	 * @type {string}
	 */
	var warning = 'SideBar "autoclose" is deprecated';

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
				console.error(warning);
			},
			setter: function() {
				console.error(warning);
			}
		},

		/**
		 * Setup to consume actions from nested Asides.
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.event.add('ts-breakpoint');
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
			if (ts.ui.isMobilePoint()) {
				this._breakpoint();
			}
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

		// Privileged ..............................................................

		/**
		 * Open.
		 * TODO: Validate that we are not opening inside .ts-main
		 * @param {boolean} animated (not supported just yet)
		 */
		$onopen: function(animated) {
			// this._delayedAngularInitialization();
			// this._trapattention();
			// this._willopen();
			this.dom.show();
			this._slideopen(true).then(
				function done() {
					this._ontransitionend();
				}.bind(this)
			);
		},

		/**
		 * Close.
		 * @param {boolean} animated (not supported)
		 */
		$onclose: function(animated) {
			// this._willclose();
			this._slideopen(false).then(
				function done() {
					this._ontransitionend();
					this.dom.hide();
				}.bind(this)
			);
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

		/**
		 * Show the SideBar.
		 *
		$onopen: function() {
			this.css.add(ts.ui.CLASS_OPEN);
			this.doorman.didopen();
		},

		/**
		 * Don't show the SideBar.
		 *
		$onclose: function() {
			this.css.remove(ts.ui.CLASS_OPEN);
			this.doorman.didclose();
		},
		*/

		// Private ...............................................................

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
		 * Collapse the SideBar on mobile breakpoint.
		 * Setup to avoid CSS transition on collapse.
		 * @param {boolean} go
		 */
		_breakpoint: function() {
			var is = ts.ui.isMobilePoint();
			this._closebutton(is);
			if (is) {
				this.isOpen = false;
				this._position(100);
				this.dom.hide();
			} else {
				this.isOpen = true;
				this._position(0);
			}
			/*
			var go = ts.ui.isMobilePoint();
			this._closebutton(go);
			if (go) {
				if (this.isOpen) {
					this.close();
					this.isOpen = false;
				}
			} else {
				if (!this.isOpen) {
					this.isOpen = true;
				}
			}
			*/
		}
	});
})(ts.ui.LayoutSpirit, gui.Type, gui.Client, gui.CSSPlugin, gui.Combo.chained);

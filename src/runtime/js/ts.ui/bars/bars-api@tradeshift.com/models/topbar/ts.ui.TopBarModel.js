/**
 * Advanced topbar model.
 * @extends {ts.ui.BarModel}
 */
ts.ui.TopBarModel = (function using(chained) {
	var UPDATE_DEFAULT_TITLE = ts.ui.BROADCAST_GLOBAL_TOPBAR_UPDATE_DEFAULT_TITLE;

	return ts.ui.ToolBarModel.extend({
		/**
		 * Monitored by the {ts.ui.TopBar}. Remember, we're setting a property
		 * instead of calling a method so that this can be syncrhonized xframe
		 * (noting that this setup can be safely deprecated by now).
		 * @type {string} Matches back|next
		 */
		navigate: null,

		/**
		 * Back/Forward buttons.
		 * @type {ts.ui.ButtonCollection}
		 */
		navigation: ts.ui.ButtonCollection,

		/**
		 * Menuswitch button (burger button) for mobile view.
		 * @type {ts.ui.ButtonModel}
		 */
		menubutton: ts.ui.ButtonModel,

		/**
		 * It's a dark.
		 * @overrides {ts.ui.ToolBarModel#color}
		 */
		color: ts.ui.CLASS_BG_DARK,

		/**
		 * visible.
		 * @type {boolean}
		 */
		visible: true,

		/**
		 * Observe tabs and buttons.
		 * Create menu-toggle button.
		 */
		onconstruct: function() {
			this.navigation = this.navigaton || [];
			this.super.onconstruct();
			gui.Broadcast.addGlobal([UPDATE_DEFAULT_TITLE], this);
			this.menubutton = {
				id: 'ts-button-menuswitch',
				icon: 'ts-icon-menuswitch',
				type: 'ts-tertiary ts-topbar-menubutton',
				onclick: function() {
					ts.ui.openMenu();
				}
			};
		},

		/**
		 * Show a "spinner" in the (mobile breakpoint) menu button while loading.
		 * These broadcasts are only really transmitted in the Client-Docs chrome
		 * (the documentation website), so we will not bundle a real spinner yet.
		 * TODO: Perhaps the {ts.ui.TopBarSpirit} should manage these icons instead.
		 * @param {gui.Broadcast} b
		 */
		onbroadcast: function(b) {
			switch (b.type) {
				case UPDATE_DEFAULT_TITLE:
					this.defaultTitle = b.data;
					break;
			}
		},

		/**
		 * Handle model changes.
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			this.super.onchange(changes);
			if (
				changes.some(function(c) {
					return c.name === 'defaultTitle';
				})
			) {
				this._updatehascontent();
			}
		},

		/**
		 * Clear everything.
		 * @returns {ts.ui.TopBarModel}
		 */
		clear: chained(function() {
			this.navigation.clear();
			this.super.clear();
		}),

		// Private .................................................................

		/**
		 * Also watch the navigation collection (of buttons).
		 * @override {ts.ui.ToolBarModel#_watchmodels}
		 * @param {boolean} doit
		 */
		_watchmodels: function(doit) {
			this.super._watchmodels(doit);
			var nav = this.navigation;
			if (doit) {
				nav.addObserver(this);
			} else {
				nav.removeObserver(this);
			}
		},

		/**
		 * Compute the property `hascontent` with some expanded fields.
		 * @override {ts.ui.ToolBarModel#_updatehascontent}
		 * @returns {boolean} True when there's content
		 */
		_updatehascontent: function() {
			if (!this.super._updatehascontent()) {
				this.hascontent = !!this.navigation.length;
			}
			return this.hascontent;
		}
	});
})(gui.Combo.chained);

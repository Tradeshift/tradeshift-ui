/**
 * Spirit of the Docs sidebar.
 * @extends {ts.ui.SideBarSpirit}
 */
ts.dox.SideBarSpirit = ts.ui.SideBarSpirit.extend({
	/**
	 * Don't close the menu in mobile breakpoint :)
	 */
	onconstruct: function() {
		this.super.onconstruct();
		this.autoclose = false;
	},

	/**
	 * Apparently we need to dispatch this action for the chrome to close menu.
	 * This method is triggered by the closebutton, which the Chrome has enabled.
	 */
	close: function() {
		this.super.close();
		this.action.dispatch('action-close-menu');
	},

	/**
	 * This particular sidebar should just have a regular toolbar
	 * header (because we like how the Search looks in that one).
	 * @returns {ts.ui.ToolBarSpirit}
	 */
	_head: function() {
		return ts.ui.LayoutSpirit.macroToolBar(this);
	}
});

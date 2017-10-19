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
	 * This particular sidebar should just have a regular toolbar 
	 * header (because we like how the Search looks in that one).
	 * @returns {ts.ui.ToolBarSpirit}
	 */
	_head: function() {
		return ts.ui.LayoutSpirit.macroToolBar(this);
	}
});

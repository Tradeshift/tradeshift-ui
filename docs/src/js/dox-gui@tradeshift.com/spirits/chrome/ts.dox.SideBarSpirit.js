/**
 * Spirit of the Docs sidebar.
 * @extends {ts.ui.SideBarSpirit}
 */
ts.dox.SideBarSpirit = ts.ui.SideBarSpirit.extend({
	/**
	 * This sidebar should just have a regular toolbar header.
	 * @returns {ts.ui.ToolBarSpirit}
	 */
	_head: function() {
		return ts.ui.BoxSpirit.macroHeader(this);
	}
});

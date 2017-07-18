/**
 * Spirit of the header.
 * @extends {ts.ui.Spirit}
 */
ts.ui.HeaderBarSpirit = (function() {
	return ts.ui.Spirit.extend({
		/**
		 * @type {ts.ui.TopBarSpirit}
		 */
		_topbar: null,

		/**
		 * @type {ts.ui.TabBarSpirit}
		 */
		_tabbar: null,

		/**
		 * @type {ts.ui.ToolBarSpirit}
		 */
		_toolbar: null
	});
})();

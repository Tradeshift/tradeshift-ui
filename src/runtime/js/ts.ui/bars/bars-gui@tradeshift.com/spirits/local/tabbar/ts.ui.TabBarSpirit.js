/**
 * Spirit of the tabbar.
 * @extends {ts.ui.ToolBarSpirit}
 * @using {string} CLASS_MACRO
 * @using {string} CLASS_MICRO
 */
ts.ui.TabBarSpirit = (function(CLASS_MACRO, CLASS_MICRO) {
	return ts.ui.ToolBarSpirit.extend({
		/**
		 * Set `ts-micro` for the default style.
		 */
		onconfigure: function() {
			this.super.onconfigure();
			if (!this.css.contains(CLASS_MACRO)) {
				this.micro();
			}
		},

		/**
		 * The title would anyway be hidden by the tabs.
		 * @overwrites {ts.ui.ToolBar#title}
		 */
		title: function() {
			console.error("The TabBar doesn't support a title :(");
		}
	});
})(ts.ui.CLASS_MACRO, ts.ui.CLASS_MICRO);

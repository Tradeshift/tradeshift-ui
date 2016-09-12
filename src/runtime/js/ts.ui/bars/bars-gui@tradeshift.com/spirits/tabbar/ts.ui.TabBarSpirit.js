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
				this.css.add(CLASS_MICRO);
			}
		}

	});

}(ts.ui.CLASS_MACRO, ts.ui.CLASS_MICRO));

/**
 * Spirit of the panels.
 * @extends {ts.ui.Spirit}
 */
ts.ui.PanelsSpirit = (function() {
	return ts.ui.Spirit.extend({
		/**
		 * Get selected panel via the {ts.ui.PanelsPlugin}.
		 * @returns {ts.ui.PanelSpirit}
		 */
		current: function() {
			return this.panels.current();
		},

		// Privileged ..............................................................

		/**
		 * Called by the {ts.ui.PanelsPlugin} to append a tab.
		 * @param {Object} json
		 * @param {number} index
		 */
		$insertTab: function(json, index) {
			this._box(function(box) {
				box.$insertTab(json, index);
			});
		},

		/**
		 * Called by the {ts.ui.PanelsPlugin} when a tab is selected.
		 * @param {ts.ui.PanelSpirit} panel The associated Panel (not the tab!).
		 * @param {number} index
		 */
		$selectTab: function(panel) {
			this._box(function(box) {
				box.$selectTab(panel);
			});
		},

		// Private .................................................................

		/**
		 * Do something with the parent box (if it exists).
		 * @param {Function} action - Callback with box as argument
		 * @returns {*} - Returns the callback return value (if any)
		 */
		_box: function(action) {
			var box = this.dom.parent(ts.ui.LayoutSpirit);
			if (box) {
				return action.call(this, box);
			}
		}
	});
})();

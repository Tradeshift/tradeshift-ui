/**
 * Spirit of the tabbox.
 * @extends {ts.ui.Spirit}
 * @using {Class<ts.ui.TabBoxSpirit>} TabBoxSpirit
 */
ts.ui.TabPanelsSpirit = (function(TabBoxSpirit) {
	return ts.ui.Spirit.extend({
		// Privileged ..............................................................

		/**
		 * Called by the {ts.ui.PanelsPlugin} to append a tab.
		 * @param {Object} json
		 * @param {number} index
		 */
		$insertTab: function(json, index) {
			this._tabbox(function(tabbox) {
				tabbox.$insertTab(json, index);
			});
		},

		$selectTab: function() {
			console.log('TODO: $selectTab');
		},

		// Private .................................................................

		/**
		 * Call function on parent tabbox.
		 * @param {Function} action
		 */
		_tabbox: function(action) {
			var tabbox = this.dom.parent(TabBoxSpirit);
			if (tabbox) {
				action.call(this, tabbox);
			}
		}
	});
})(ts.ui.TabBoxSpirit);

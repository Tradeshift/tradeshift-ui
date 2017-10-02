/**
 * Spirit of the tabbox.
 * @extends {ts.ui.Spirit}
 * @using {Constructor<ts.ui.TabBarSpirit>} TabBarSpirit
 * @using {gui.Combo#chained} chained
 */
ts.ui.TabBoxSpirit = (function using(TabBarSpirit, chained) {
	return ts.ui.BoxSpirit.extend({

		onenter: function() {
			this.super.onenter();
			this._bar();
		},

		/**
		 * Get or set the tabs.
		 * @param @optional {Array<Object>} json
		 * @returns {Array<ts.ui.TabModel>|ts.ui.ModalSpirit}
		 */
		tabs: chained(function(json) {
			var bar = this._bar();
			if (arguments.length) {
				bar.tabs(json);
			} else {
				return bar.tabs();
			}
		}),

		// Privileged ..............................................................

		/**
		 * Called by the {ts.ui.PanelsPlugin} to append a tab.
		 * @param {Object} json
		 * @param {number} index
		 */
		$insertTab: function(json, index) {
			var tabs = this._bar().tabs();
			tabs.splice(index, 0, json);
		},

		$selectTab: function() {
			console.log('TODO: $selectTab');
		}

		// Private .................................................................

	});
})(ts.ui.TabBarSpirit, gui.Combo.chained);

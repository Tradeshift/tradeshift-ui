/**
 * Spirit of the box.
 */
ts.ui.BoxSpirit = (function using(TabBarSpirit, chained) {
	return ts.ui.Spirit.extend({
		onenter: function() {
			this.super.onenter();
			// this._bar();
		},

		/**
		 * Get or set the buttons in the statusbar.
		 * so will simply not allow that.
		 * @param @optional {Array<Object>} json
		 * @returns {ts.ui.ButtonsCollection|ts.ui.ModalSpirit}
		 */
		buttons: chained(function(json) {
			var bar = this._bar();
			if (arguments.length) {
				bar.buttons(json);
			} else {
				return bar.buttons();
			}
		}),

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
		},

		// Private .................................................................

		/**
		 *
		 */
		_tabbar: null,

		/**
		 * @returns {ts.ui.TabBarSpirit}
		 */
		_bar: function() {
			this.css.add('ts-box-hasbar');
			return this._tabbar || (this._tabbar = this.dom.prepend(TabBarSpirit.summon()));
		}
	});
})(ts.ui.TabBarSpirit, gui.Combo.chained);

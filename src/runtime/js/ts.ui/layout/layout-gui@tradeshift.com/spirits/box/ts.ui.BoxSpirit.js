/**
 * Spirit of the box.
 */
ts.ui.BoxSpirit = (function using(TabBarSpirit, chained) {
	return ts.ui.Spirit.extend({

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

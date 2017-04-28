/**
 * Spirit of the SELECT.
 * @extends {gui.Spirit}
 */
ts.ui.AutocompleteInputSpirit = (function using(chained) {
	return ts.ui.TextInputSpirit.extend({
		/**
		 * Get ready.
		 */
		onready: function() {
			this.super.onready();
			this._getdropdown().proxy(this.element);

			this._label(function(label) {
				label.css.add('ts-autocompletelabel');
			});
		},

		/**
		 * Load autocomplete items into the model through the spirit
		 * @param {Array.<{key: String, value: String}>} d
		 */
		data: chained(function(d) {
			this._getdropdown().data(d);
		}),

		/**
		 * Load filtering function into the model through the spirit
		 * @param {Function} f
		 */
		onfilter: chained(function(f) {
			this._getdropdown().onfilter(f);
			return this;
		}),

		/**
		 * Load selection function into the model through the spirit
		 * @param {Function} f
		 */
		onselect: chained(function(f) {
			this._getdropdown().onselect(f);
			return this;
		}),

		// Private ...................................................................

		/**
		 * Get or create the dropdown spirit
		 * @returns {ts.ui.AutocompleteDropdownSpirit}
		 */
		_getdropdown: function() {
			var AutocompleteDropdown = ts.ui.AutocompleteDropdownSpirit;
			var dropdown = this.dom.following(AutocompleteDropdown);
			if (dropdown[0]) {
				return dropdown[0];
			} else {
				return this.dom.after(AutocompleteDropdown.summon());
			}
		}
	});
})(gui.Combo.chained);

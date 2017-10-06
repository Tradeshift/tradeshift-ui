/**
 * Header API.
 * @using {gui.Combo#chained} chained
 */
ts.ui.Header = (function using(chained) {
	/**
	 * Creates the header when first invoked.
	 * @returns {ts.ui.HeaderBarSpirit}
	 */
	function bar() {
		return bar.spirit || ts.ui.MainSpirit.$inject((bar.spirit = ts.ui.HeaderBarSpirit.summon()));
	}

	return {
		/**
		 * Get or set the title.
		 * @param {string} [string]
		 * @returns {this|string}
		 */
		title: chained(function(string) {
			if (arguments.length) {
				bar().title(string);
			} else {
				return bar.title();
			}
		}),

		/**
		 * Get or set the icon image.
		 * @param {string} [string]
		 * @returns {this|string}
		 */
		icon: chained(function(string) {
			if (arguments.length) {
				bar().icon(string);
			} else {
				return bar.icon();
			}
		}),

		/**
		 * @param {Array<object>|ts.ui.ButtonCollection|null} [buttons]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		buttons: chained(function(buttons) {
			if (arguments.length) {
				bar().buttons(buttons);
			} else {
				return bar().buttons();
			}
		}),

		/**
		 * @param {Array<object>|ts.ui.TabCollection|null} [tabs]
		 * @returns {this|ts.ui.TabCollection}
		 */
		tabs: chained(function(tabs) {
			if (arguments.length) {
				bar().tabs(tabs);
			} else {
				return bar().tabs();
			}
		}),

		/**
		 * @param {Object|ts.ui.SearchModel} [search]
		 * @returns {this|ts.ui.SearchModel}
		 */
		search: chained(function(search) {
			if (arguments.length) {
				bar().search(search);
			} else {
				return bar().search();
			}
		}),

		/**
		 *
		 */
		localize: function(locale) {
			if (arguments.length) {
				console.log('TODO: ts.ui.Header.localize');
			} else {
				console.log('TODO: ts.ui.Header.localize');
			}
		},

		// Privileged ..............................................................

		/**
		 * The {ts.ui.MainSpirit} will request this at some point.
		 * @see {ts.ui.MainSpirit}
		 * @returns {ts.ui.HeaderBarSpirit}
		 */
		$spirit: function() {
			return bar.spirit || null;
		}
	};
})(gui.Combo.chained);

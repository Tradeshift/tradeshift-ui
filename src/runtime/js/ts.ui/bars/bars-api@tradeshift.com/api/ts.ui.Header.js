/**
 * Header API.
 * @using {gui.Combo#chained} chained
 */
ts.ui.Header = (function using(chained) {
	/**
	 * Creates and appends the {ts.ui.HeaderBarSpirit} when first invoked.
	 * @returns {ts.ui.FooterBarSpirit}
	 */
	function bar() {
		if (!bar.spirit) {
			var spirit = (bar.spirit = ts.ui.HeaderBarSpirit.summon());
			ts.ui.ready(function inject() {
				spirit.dom.prependTo(document.body);
			});
		}
		return bar.spirit;
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
		}
	};
})(gui.Combo.chained);

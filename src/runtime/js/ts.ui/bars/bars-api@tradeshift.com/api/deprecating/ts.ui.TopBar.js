/**
 * @using {ts.ui.Header} Header
 * @using {gui.Combo#chained} chained
 */
ts.ui.TopBar = (function using(Header, chained) {
	return {
		/**
		 * @deprecated
		 */
		setup: function() {
			console.error('Deprecated API is deprecated: TopBar.setup');
		},

		/**
		 *
		 */
		title: chained(function(string) {
			if (arguments.length) {
				Header.title(string);
			} else {
				return Header.title();
			}
		}),

		/**
		 *
		 */
		defaultTitle: chained(function(string) {
			console.error('TODO: TopBar.defaultTitle');
		}),

		/**
		 * Get or set tabs.
		 * @param @optional {Array<object>} opt_json
		 * @returns {this|ts.ui.TabCollection}
		 */
		tabs: chained(function(json) {
			if (arguments.length) {
				Header.tabs(json);
			} else {
				return Header.tabs();
			}
		}),

		/**
		 * Get or set buttons.
		 * @param @optional {Array<object>} opt_json
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		buttons: chained(function(json) {
			if (arguments.length) {
				Header.buttons(json);
			} else {
				return Header.buttons();
			}
		}),

		/**
		 * Setup to show Back button (with associated callback).
		 * Use 'null' argument to remove the button.
		 * @param {function|null} callback
		 * @returns {ts.ui.TopBarModel}
		 */
		showBack: chained(function(callback) {
			console.error('TODO: TopBar.showBack');
		}),

		/**
		 * Setup to show Forward button (with associated callback).
		 * Use 'null' argument to remove the button.
		 * @param {function|null} callback
		 * @returns {ts.ui.TopBarModel}
		 */
		showNext: chained(function(callback) {
			console.error('TODO: TopBar.showNext');
		}),

		/**
		 * Hide the Back button.
		 * @returns {ts.ui.TopBarModel}
		 */
		hideBack: chained(function() {
			console.error('TODO: TopBar.hideBack');
		}),

		/**
		 * Hide the Forward button.
		 * @returns {ts.ui.TopBarModel}
		 */
		hideNext: chained(function() {
			console.error('TODO: TopBar.hideNext');
		}),

		/**
		 * Setup to show ts.ui.Topbar.
		 * @returns {ts.ui.TopBarModel}
		 */
		show: chained(function() {
			console.error('TODO: TopBar.show');
		}),

		/**
		 * Hide the ts.ui.Topbar.
		 * @returns {ts.ui.TopBarModel}
		 */
		hide: chained(function() {
			console.error('TODO: TopBar.hide');
		}),

		/**
		 * Generally dark appearance.
		 */
		dark: chained(function() {
			console.error('TODO: TopBar.dark');
		}),

		/**
		 * Generally green appearance.
		 */
		green: chained(function() {
			console.error('TODO: TopBar.green');
		}),

		/**
		 * Generally blue appearance.
		 */
		blue: chained(function() {
			console.error('TODO: TopBar.blue');
		}),

		/**
		 * Generally purple appearance.
		 */
		purple: chained(function() {
			console.error('TODO: TopBar.purple');
		}),

		/**
		 * Identification.
		 * @returns {string}
		 */
		toString: function() {
			return '[object ts.ui.TopBar]';
		},

		/**
		 * Ad-hoc localization interface. Omit the
		 * argument to get the current localization.
		 * TODO: Greenfield this (add xframe support).
		 * @param @optional {Object} config
		 * @returns {Object}
		 */
		localize: function(config) {
			if (arguments.length) {
				Header.localize(config);
			} else {
				return ts.ui.Header.localize();
			}
		}
	};
})(ts.ui.Header, gui.Combo.chained);

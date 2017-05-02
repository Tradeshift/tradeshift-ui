/**
 * TopBar API.
 * TODO (jmo@): clear methods
 */
ts.ui.TopBar = {
	/**
	 * @deprecated so don't use this!
	 * Get or set tabs and/or buttons.
	 * @param @optional {object} opt_json
	 * @returns {ts.ui.TopBarModel}
	 */
	setup: function(opt_json) {},

	/**
	 * Get or set tabs.
	 * @param @optional {Array<object>} opt_json
	 * @returns {ts.ui.TabCollection}
	 */
	tabs: function(opt_json) {},

	/**
	 * Get or set buttons.
	 * @param @optional {Array<object>} opt_json
	 * @returns {ts.ui.ButtonCollection}
	 */
	buttons: function(opt_json) {},

	/**
	 * @param {string} title
	 * @returns {ts.ui.TopBarModel}
	 */
	title: function(title) {},

	/**
	 * @param {string} title
	 * @returns {ts.ui.TopBarModel}
	 */
	defaultTitle: function(defaultTitle) {},

	/**
	 * Setup to show Back button (with associated callback).
	 * Use 'null' argument to remove the button.
	 * @param {function|null} callback
	 * @returns {ts.ui.TopBarModel}
	 */
	showBack: function(callback) {},

	/**
	 * Setup to show Forward button (with associated callback).
	 * Use 'null' argument to remove the button.
	 * @param {function|null} callback
	 * @returns {ts.ui.TopBarModel}
	 */
	showNext: function(callback) {},

	/**
	 * Hide the Back button.
	 * @returns {ts.ui.TopBarModel}
	 */
	hideBack: function() {},

	/**
	 * Hide the Forward button.
	 * @returns {ts.ui.TopBarModel}
	 */
	hideNext: function() {},

	/**
	 * Setup to show ts.ui.Topbar.
	 * @returns {ts.ui.TopBarModel}
	 */
	show: function() {},

	/**
	 * Hide the ts.ui.Topbar.
	 * @returns {ts.ui.TopBarModel}
	 */
	hide: function() {},

	/**
	 * Generally dark appearance.
	 */
	dark: function() {},

	/**
	 * Generally green appearance.
	 */
	green: function() {},

	/**
	 * Generally blue appearance.
	 */
	blue: function() {},

	/**
	 * Generally purple appearance.
	 */
	purple: function() {},

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
	localize: function(config) {}
};

// Implementation ..............................................................

/**
 * @using {ts.ui.Greenfield#api} api
 * @using {gui.Object#hidden} hidden
 * @using {gui.Combo#chained} chained
 * @using {gui.Arguments#confirmed} confirmed
 * @using {gui.Type} Type
 */
(function using(api, hidden, chained, confirmed, Type) {
	var topbar = null; // {ts.ui.TopBarModel}
	var locale = null;

	/**
	 * Setup to initialize the topbar whenever any method is called upon it.
	 * @param {function) base
	 * @returns {function}
	 */
	function init(base) {
		return function() {
			topbar = topbar || new ts.ui.TopBarModel();
			return base.apply(null, arguments);
		};
	}

	/**
	 * Append or remove Back/Forward button.
	 * We always nuke the existing button.
	 * @param {string} insert (unshift|push)
	 * @param {object} button
	 */
	function navigation(insert, button) {
		var nav = topbar.navigation;
		var but = nav.get(button.id);
		var add = button.onclick !== null;
		if (but) {
			nav.remove(but);
		}
		if (add) {
			nav[insert](button);
		}
	}

	/**
	 * API methods.
	 */
	gui.Object.extend(ts.ui.TopBar, {
		/**
		 * @deprecated (never documented)
		 * @param @optional {object} opt_json
		 */
		setup: api(
			chained(function(opt_json) {
				console.error('Deprecated API is deprected');
			})
		),

		/**
		 * Get or set new tab collection.
		 * @param @optional {Array<object>} opt_json
		 * @returns {object|ts.ui.TabCollection}
		 */
		tabs: api(
			chained(
				confirmed('(array)')(
					init(function(opt_json) {
						if (opt_json) {
							topbar.tabs.clear();
							opt_json.forEach(function(json) {
								topbar.tabs.push(json);
							});
						}
						if (!arguments.length) {
							return topbar.tabs;
						}
					})
				)
			)
		),

		/**
		 * Get or set new button collection.
		 * @param @optional {Array<object>} opt_json
		 * @return {object|ts.ui.ButtonCollection}
		 */
		buttons: api(
			chained(
				confirmed('(array)')(
					init(function(opt_json) {
						if (opt_json) {
							topbar.buttons.clear();
							opt_json.forEach(function(json) {
								topbar.buttons.push(json);
							});
						}
						if (!arguments.length) {
							return topbar.buttons;
						}
					})
				)
			)
		),

		/**
		 * Set topbar title.
		 * @param @optional {string} title
		 * @returns {object|string}
		 */
		title: api(
			chained(
				confirmed('(string)')(
					init(function(title) {
						if (arguments.length) {
							topbar.title = title;
						} else {
							return topbar.title;
						}
					})
				)
			)
		),

		/**
		 * Set topbar default title.
		 * @param @optional {string} defaultTitle
		 * @returns {object|string}
		 */
		defaultTitle: api(
			chained(
				confirmed('(string)')(
					init(function(defaultTitle) {
						if (arguments.length) {
							topbar.defaultTitle = defaultTitle;
						} else {
							return topbar.defaultTitle;
						}
					})
				)
			)
		),

		/**
		 * Append or remove Back button with a callback.
		 * Pass 'null' as callback to remove the button.
		 * @param {function|null} callback
		 */
		showBack: api(
			chained(
				confirmed('function|null')(
					init(function(callback) {
						navigation('unshift', {
							icon: 'ts-icon-back',
							onclick: callback,
							id: 'back'
						});
					})
				)
			)
		),

		/**
		 * Append or remove Forward button with a callback.
		 * Pass 'null' as callback to remove the button.
		 * Pass 'null' to remove the button.
		 * @param {function|null} callback
		 */
		showNext: api(
			chained(
				confirmed('function|null')(
					init(function(callback) {
						navigation('push', {
							icon: 'ts-icon-next',
							onclick: callback,
							id: 'next'
						});
					})
				)
			)
		),

		/**
		 * Remove Back button.
		 * @returns {ts.ui.TopBar}
		 */
		hideBack: api(
			chained(function() {
				this.showBack(null);
			})
		),

		/**
		 * Remove Forward button.
		 * @returns {ts.ui.TopBar}
		 */
		hideNext: api(
			chained(function() {
				this.showNext(null);
			})
		),

		/**
		 * Show ts.ui.Topbar.
		 * @returns {ts.ui.TopBar}
		 */
		show: api(
			chained(function() {
				topbar.visible = true;
			})
		),

		/**
		 * Hide ts.ui.Topbar. Because this won't have any effect in
		 * mobile	breakpoint, we'll also clear the TopBar (so that
		 * in mobile, the effect is simply to clear the TopBar).
		 * @returns {ts.ui.TopBar}
		 */
		hide: api(
			chained(function() {
				topbar.visible = false;
				topbar.clear();
			})
		),

		/**
		 * Clear the tabs and buttons and title and so on.
		 * @returns {ts.ui.TopBar}
		 */
		clear: api(
			chained(function() {
				topbar.clear();
			})
		),

		// Privileged ..............................................................

		/**
		 *
		 * @see {ts.ui.TopBarSpirit#onconfigure}
		 */
		$getmodel: init(function() {
			return topbar;
		}),

		/**
		 * TODO: This is copy-pasted from some other API, refactor for common
		 * inheritance chain (and supress "privacy" concerns for simpler code).
		 */
		localize: api(
			chained(function(arg) {
				if (arguments.length) {
					switch (gui.Type.of(arg)) {
						case 'object':
							var newlocale = arg;
							if (
								!locale ||
								Object.keys(locale).every(function(key) {
									var has = newlocale.hasOwnProperty(key);
									if (!has) {
										console.error('Missing translations for ' + key);
									}
									return has;
								})
							) {
								locale = newlocale;
							}
							break;
						case 'string':
							var key = arg;
							if (locale && locale.hasOwnProperty(key)) {
								return locale[key];
							} else {
								console.error('Missing translations for ' + key);
							}
							break;
					}
				} else {
					return locale;
				}
			})
		)
	});

	/**
	 * Generate methods `blue` `green` `purple` and so
	 * on to change the general color scheme of the TopBar.
	 */
	gui.Object.each(ts.ui.BACKGROUND_COLORS, function(methodname, classname) {
		ts.ui.TopBar[methodname] = init(function() {
			topbar.color = classname;
			return ts.ui.TopBar;
		});
	});
})(
	ts.ui.Greenfield.api, // TODO: This is not used no more...
	gui.Object.hidden, // TODO: This also makes litte sense now...
	gui.Combo.chained,
	gui.Arguments.confirmed,
	gui.Type
);

/**
 * Default-localize the TopBar.
 */
ts.ui.TopBar.localize({
	options: 'Options',
	more: 'More...'
});

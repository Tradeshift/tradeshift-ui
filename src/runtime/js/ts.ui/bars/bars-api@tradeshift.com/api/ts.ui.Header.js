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
		return (
			bar.spirit || ts.ui.AppSpirit.$inject((bar.spirit = setup(ts.ui.HeaderBarSpirit.summon())))
		);
	}

	/**
	 * Is mobile breakpoint?
	 * @returns {string}
	 */
	function ismobile() {
		return document.documentElement.classList.contains(ts.ui.CLASS_MOBILE_ONLY);
	}

	/**
	 * Similar setup for "special" buttons (Settings, Support, etc).
	 * @param {string} method
	 * @param {Arguments} args
	 * @param {Function} onclick
	 */
	function specialbutton(method, args, onclick) {
		return args.length ? bar()[method](onclick) : bar()[method]();
	}

	/**
	 * Observe the {ts.ui.LayoutModel} to hide the header
	 * in mobile breakpoint whenever a SideBar is opened.
	 * This could unfortunately not be solved by z-index :/
	 */
	ts.ui.ready(function() {
		var model = ts.ui.LayoutModel.output.get();
		model.addObserver({
			onchange: function(changes) {
				changes.forEach(function(c) {
					if (c.name === 'sidebaropen') {
						if (bar.spirit && ismobile()) {
							if (c.newValue === true) {
								bar.spirit.$fadeOut();
							} else {
								bar.spirit.$fadeIn();
							}
						}
					}
				});
			}
		});
	});

	/**
	 * Setup to show the burger button (instead of the app icon) in mobile breakpoint.
	 * When switching out of mobile breakpoints, make sure that the header is visible.
	 * @param {ts.ui.HeaderBarSpirit} bar
	 * @returns {ts.ui.HeaderBarSpirit}
	 */
	function setup(bar) {
		ts.ui.ready(function() {
			function openmenu() {
				ts.ui.openMenu();
			}
			function burger() {
				if (ismobile()) {
					bar.burgerbutton(openmenu);
				} else {
					bar.burgerbutton(null);
					bar.$scroll(0);
				}
			}
			function sidebar() {
				if (!ismobile()) {
					bar.$fadeIn(true);
				}
			}
			if (ts.ui.appframe) {
				document.addEventListener('ts-breakpoint', function() {
					sidebar();
					burger();
				});
				burger();
			}
		});
		return bar;
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
				return bar().title();
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
		 * @TODO hide
		 * @returns {this}
		 */
		hide: chained(function() {}),

		/**
		 * @TODO show
		 * @returns {this}
		 */
		show: chained(function() {}),

		/**
		 * @param {string} [string]
		 * @returns {this|string}
		 */
		color: chained(function(color) {
			if (arguments.length) {
				bar().color(color);
			} else {
				return bar().color();
			}
		}),

		/**
		 * @TODO ts.ui.Header.localize
		 */
		localize: function(locale) {},

		/**
		 * Get or set the Settings button.
		 * @param {Function|null} onclick - use `null` to hide the button
		 * @returns {this|ts.ui.ButtonSpirit}
		 */
		settingsbutton: chained(function(onclick) {
			return specialbutton('settingsbutton', arguments, onclick);
		}),

		/**
		 * Get or set the Support button.
		 * @param {Function|null} onclick - use `null` to hide the button
		 * @returns {this|ts.ui.ButtonSpirit}
		 */
		supportbutton: chained(function(onclick) {
			return specialbutton('supportbutton', arguments, onclick);
		}),

		/**
		 * Get or set the Back button.
		 * @param {Function|null} onclick - use `null` to hide the button
		 * @returns {this|ts.ui.ButtonSpirit}
		 */
		backbutton: chained(function(onclick) {
			return specialbutton('backbutton', arguments, onclick);
		}),

		/**
		 * Get or set the Forward button.
		 * @param {Function|null} onclick - use `null` to hide the button
		 * @returns {this|ts.ui.ButtonSpirit}
		 */
		forwardbutton: chained(function(onclick) {
			return specialbutton('forwardbutton', arguments, onclick);
		}),

		// Privileged ..............................................................

		/**
		 * Get the main header, if it exists.
		 * @see {ts.ui.MainSpirit}
		 * @returns {ts.ui.HeaderBarSpirit}
		 */
		$spirit: function() {
			return bar.spirit || null;
		},

		/**
		 * Scrolling the sticky header (if it exists) in mobile breakpoint.
		 * @param {number} scroll
		 */
		$scroll: function(scroll) {
			if (bar.spirit && ismobile()) {
				bar.spirit.$scroll(scroll);
			}
		}
	};
})(gui.Combo.chained);

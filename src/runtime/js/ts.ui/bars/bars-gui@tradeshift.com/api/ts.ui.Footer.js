/**
 * Footer API.
 * @using {gui.Combo#chained} chained
 */
ts.ui.Footer = (function using(chained) {
	/**
	 * Creates and appends the {ts.ui.FooterBarSpirit} when first invoked.
	 * @returns {ts.ui.FooterBarSpirit}
	 */
	function bar() {
		if (!bar.spirit) {
			var spirit = ts.ui.FooterBarSpirit.summon();
			spirit.dom.appendTo(document.body);
			bar.spirit = spirit;
		}
		return bar.spirit;
	}

	/*
	 * Public methods ............................................................
	 */
	var Footer = {
		/**
		 * Identification.
		 * @returns {string}
		 */
		toString: function() {
			return '[object ts.ui.Footer]';
		},

		/**
		 * @param {Object|null} [json]
		 * @returns {this|ts.ui.Model}
		 */
		checkbox: chained(function(json) {
			if (arguments.length) {
				bar().checkbox(json);
			} else {
				return bar().checkbox();
			}
		}),

		/**
		 * 
		 */
		status: chained(function(message) {
			if (arguments.length) {
				bar().status(message);
			} else {
				return bar().status();
			}
		}),

		/**
		 * @param {Array<object>|ts.ui.ButtonCollection} [buttons]
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
		 * @param {Array<object>|ts.ui.ActionCollection} [actions]
		 * @returns {this|ts.ui.ActionCollection}
		 */
		actions: chained(function(buttons) {
			if (arguments.length) {
				bar().actions(buttons);
			} else {
				return bar().actions();
			}
		}),

		/**
		 * @param @optional {Object|ts.ui.PagerModel|null} [pager]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		pager: chained(function(pager) {
			if (arguments.length) {
				bar().pager(pager);
			} else {
				return bar().pager();
			}
		}),

		/**
		 * @param {Function} [onclick]
		 * @returns {this}
		 */
		showConfig: chained(function(onclick) {
			bar().showConfig(onclick);
		}),

		/**
		 * @returns {this}
		 */
		hideConfig: chained(function() {
			bar().hideConfig();
		}),

		/**
		 * Show collaboration button.
		 * @param {Function} [onclick]
		 * @returns {this}
		 */
		showCollaboration: chained(function(onclick) {
			bar().showCollaboration(onclick);
		}),

		/**
		 * Hide collaboration button.
		 * @returns {this}
		 */
		hideCollaboration: chained(function() {
			bar().hideCollaboration();
		}),

		/**
		 * Hide the whole footer.
		 * @returns {this}
		 */
		hide: chained(function() {
			bar().hide();
		}),

		/**
		 * Show that footer.
		 * @returns {this}
		 */
		show: chained(function() {
			bar().show();
		}),

		// Privileged ..............................................................

		/**
		 * Toggle the checkbox to indicate something or nothing selected.
		 * @param {boolean} checked
		 */
		$check: function(checked) {
			bar().checkbox().checked = checked;
		}
	};

	/**
	 * Generate methods to hide and show the various elements.
	 * TODO: Think much harder and much much longer about it.
	 */
	['hideActions', 'showActions', 'hidePager', 'showPager'].forEach(function generate(method) {
		Footer[method] = chained(function() {
			bar()[method]();
		});
	});

	return Footer;
})(gui.Combo.chained);

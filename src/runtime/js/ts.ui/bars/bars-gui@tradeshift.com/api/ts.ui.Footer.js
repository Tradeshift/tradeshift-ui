/**
 * Footer API.
 * @using {gui.Combo#chained} chained
 */
ts.ui.Footer = (function using(chained) {
	/**
	 * Creates the spirit when first invoked.
	 * @returns {ts.ui.FooterBarSpirit}
	 */
	function footer() {
		if (!footer.spirit) {
			var spirit = ts.ui.FooterBarSpirit.summon();
			spirit.dom.appendTo(document.body);
			footer.spirit = spirit;
		}
		return footer.spirit;
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
				footer().checkbox(json);
			} else {
				return footer().checkbox();
			}
		}),

		/**
		 * 
		 */
		status: chained(function(message) {
			if (arguments.length) {
				footer().status(message);
			} else {
				return footer().status();
			}
		}),

		/**
		 * @param {Array<object>|ts.ui.ButtonCollection} [buttons]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		buttons: chained(function(buttons) {
			if (arguments.length) {
				footer().buttons(buttons);
			} else {
				return footer().buttons();
			}
		}),

		/**
		 * @param {Array<object>|ts.ui.ActionCollection} [actions]
		 * @returns {this|ts.ui.ActionCollection}
		 */
		actions: chained(function(buttons) {
			if (arguments.length) {
				footer().actions(buttons);
			} else {
				return footer().actions();
			}
		}),

		/**
		 * @param @optional {Object|ts.ui.PagerModel|null} [pager]
		 * @returns {this|ts.ui.ButtonCollection}
		 */
		pager: chained(function(pager) {
			if (arguments.length) {
				footer().pager(pager);
			} else {
				return footer().pager();
			}
		}),

		/**
		 * @param {Function} [onconfig]
		 * @returns {this}
		 */
		configurable: chained(function(onconfig) {
			footer().configurable(onconfig);
		}),

		/**
		 * @returns {this}
		 */
		unconfigurable: chained(function() {
			footer().unconfigurable();
		}),

		/**
		 * Hide the whole footer.
		 * @returns {this}
		 */
		hide: chained(function() {
			footer().hide();
		}),

		/**
		 * Show that footer.
		 * @returns {this}
		 */
		show: chained(function() {
			footer().show();
		}),

		// Privileged ..............................................................

		/**
		 * Toggle the checkbox to indicate something or nothing selected.
		 * @param {boolean} checked
		 */
		$check: function(checked) {
			footer().checkbox().checked = checked;
		}
	};

	/**
	 * Generate methods to hide and show the various elements.
	 * TODO: Think much harder and much much longer about it.
	 */
	['hideActions', 'showActions', 'hidePager', 'showPager'].forEach(function generate(method) {
		Footer[method] = chained(function() {
			footer()[method]();
		});
	});

	return Footer;
})(gui.Combo.chained);

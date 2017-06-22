/**
 * Footer API.
 * @using {gui.Combo#chained} chained
 */
ts.ui.Footer = (function using(chained) {
	/**
	 * @returns {ts.ui.FooterSpirit}
	 */
	function footer() {
		if (!footer.spirit) {
			var spirit = ts.ui.FooterSpirit.summon();
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

	[
		'hideActions',
		'showActions',
		'hidePager',
		'showPager',
		'hideButtons',
		'showButtons'
	].forEach(function generate(method) {
		Footer[method] = chained(function() {
			footer()[method]();
		});
	});

	return Footer;
})(gui.Combo.chained);

/**
 * This thing should be implemented as an accessor because 
 * some API with a single boolean argument just aint right.
 *
(function scoped(now) {
	Object.defineProperty(ts.ui.Footer, 'checked', {
		get: function() {
			return now;
		},
		set: function(value) {
			var was = now;
			now = !!value;
			if (now !== was) {
				this.$check(now);
			}
		}
	});
})(ts.ui.Footer.selected);
*/

/**
 * The StatusBar has been replace by the Footer, but we'll keep this deprecated 
 * API around for some time yet. Note: The StatusBar API was never used in V4.
 * TODO: In a future release, remove this deprecated API once and for all.
 * @using {gui.Combo#chained}
 */
ts.ui.StatusBar = (function using(chained) {
	/**
	 * Log this warning whenever a method on the deprecated API was attempted.
	 * @param {Function} action
	 * @returns {*}
	 */
	function deprecated(action) {
		return function() {
			console.warn(
				'Deprecated API is deprecated: The StatusBar has been replaced with ' +
					'the Footer as seen on http://ui.tradeshift.com/#components/footer/'
			);
			return action.apply(this, arguments);
		};
	}

	/**
	 * Get the Footer (API object) in a load order insensitive manner.
	 * @returns {Object}
	 */
	function footer() {
		return ts.ui.Footer;
	}

	return {
		/**
		 * Get or set the buttons.
		 */
		buttons: chained(
			deprecated(function() {
				var res = footer().buttons.apply(footer(), arguments);
				if (arguments.length) {
					return res;
				}
			})
		),

		/**
		 * Get or set the pager.
		 */
		pager: chained(
			deprecated(function() {
				var res = footer().pager.apply(footer(), arguments);
				if (arguments.length) {
					return res;
				}
			})
		),

		/**
		 * Show the Footer.
		 */
		show: chained(
			deprecated(function() {
				ts.ui.Footer.show();
			})
		),

		/**
		 * Hide the Footer.
		 */
		hide: chained(
			deprecated(function() {
				ts.ui.Footer.hide();
			})
		),

		/**
		 * Show some kind of status message.
		 */
		message: chained(
			deprecated(function() {
				var res = footer().status.apply(footer(), arguments);
				if (arguments.length) {
					return res;
				}
			})
		),

		/**
		 * Enable links.
		 * @param {Function} [onlink]
		 */
		linkable: chained(
			deprecated(function(onlink) {
				footer().linkable(onlink);
			})
		),

		/**
		 * Disable links.
		 * @param {Function} [onlink]
		 */
		unlinkable: chained(
			deprecated(function(onlink) {
				footer().unlinkable();
			})
		)
	};
})(gui.Combo.chained);

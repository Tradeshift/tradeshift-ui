/**
 * Location.
 */
ts.lib.Location = (function() {
	/**
	 * Request for the hosting {ts.ui.FrameSpirit} to update location href.
	 * @param {string} href
	 * @param {string=} opt_target
	 */
	function dohref(href, opt_target) {
		ts.ui.get('html').action.dispatchGlobal(ts.ui.ACTION_GLOBAL_LOAD, {
			target: opt_target || null,
			href: href
		});
	}

	/**
	 * Update location hash somehow without appending to history.
	 * TODO (jmo@): Some day rename this whole thing or do it elsehow.
	 * http://stackoverflow.com/questions/9235304/
	 *		 how-to-replace-the-location-hash-and-only-keep-the-last-history-entry
	 * @param {String} hash
	 */
	function dohash(hash) {
		hash = hash.startsWith('#') ? hash.slice(1) : hash;
		location.replace('#' + hash);
	}

	return {
		// Public ...............................

		/**
		 * Identification.
		 * @return {string}
		 */
		toString: function() {
			return '[object ts.lib.Location]';
		},

		/**
		 * Load something or change the hash *without* updating history;
		 * since this may become a problem at some point...
		 * @param {string} href
		 * @param {string=} opt_target
		 */
		assign: function(href, opt_target) {
			if (href.startsWith('#')) {
				dohash(href);
			} else {
				dohref(href, opt_target);
			}
		},

		/**
		 * Reload.
		 */
		reload: function() {
			console.error('todo');
		}
	};
})();

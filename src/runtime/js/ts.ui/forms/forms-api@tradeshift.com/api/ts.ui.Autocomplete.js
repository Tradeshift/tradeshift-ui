/**
 * Autocomplete API
 * @returns {ts.ui.AutocompleteDropdownModel}
 * @constructor
 */
ts.ui.Autocomplete = function() {
	return new ts.ui.AutocompleteDropdownModel();
};

/**
 * Identification.
 * @return {string}
 */
ts.ui.Autocomplete.toString = function() {
	return '[function ts.ui.Autocomplete]';
};

/**
 * Ad-hoc localization interface. Omit the
 * argument to get the current localization.
 * @param @optional {Object} config
 * @returns {Object}
 */
ts.ui.Autocomplete.localize = function(config) {};

// Implementation ..............................................................

(function Autocomplete() {
	var locale = null;

	gui.Object.extend(ts.ui.Autocomplete, {
		/**
		 * Localize.
		 * @param {object} newlocale
		 */
		localize: function(newlocale) {
			if (arguments.length) {
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
			} else {
				return locale;
			}
		}
	});
})();

/**
 * Default-localize the Autocomplete.
 */
ts.ui.Autocomplete.localize({
	/**
	 * String for number of matches found
	 * @param {number} count
	 * @returns {string}
	 */
	matchString: function(count) {
		if (!count) {
			return '';
		} else if (count === 1) {
			return '1 match';
		} else {
			return count + ' matches';
		}
	}
});

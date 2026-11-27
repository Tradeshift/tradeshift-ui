(function() {
	// browserify's require()
	var match = require('@tradeshift/g11n-langneg').match;

	// RTL language tags — add any future RTL locales here
	var RTL_LOCALES = ['ar', 'ar-SA', 'he', 'he-IL', 'fa', 'ur'];

	/**
	 * Returns true if the given locale tag is a right-to-left language.
	 * @param {string} locale
	 * @returns {boolean}
	 */
	function isRTL(locale) {
		var base = locale.split('-')[0].toLowerCase();
		return RTL_LOCALES.some(function(rtl) {
			return rtl.toLowerCase() === locale.toLowerCase() || rtl.toLowerCase() === base;
		});
	}

	if (typeof match === 'undefined') {
		throw new Error('Language negotiation method "match" was not available');
	} else {
		var currentLocale = document.documentElement.lang || 'en-US';
		var candidateLocales = [].concat(['en'], Object.keys(formatDataLoader)); // eslint-disable-line no-undef
		var best = match(currentLocale, candidateLocales).toString();

		// Actually loads formatting data from best locale into the lib
		formatDataLoader[best](); // eslint-disable-line no-undef

		// Automatically apply dir="rtl" to <html> for RTL locales if not already set.
		// The host application can override this by setting dir explicitly before the
		// script runs; we only write it when the attribute is absent or set to "auto".
		var htmlDir = document.documentElement.getAttribute('dir');
		if (!htmlDir || htmlDir === 'auto') {
			document.documentElement.setAttribute('dir', isRTL(best) ? 'rtl' : 'ltr');
		}
	}
}.call(ts.ui));

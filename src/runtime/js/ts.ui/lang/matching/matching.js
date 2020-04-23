(function() {
	// browserify's require()
	var match = require('@tradeshift/g11n-langneg').match;

	if (typeof match === 'undefined') {
		throw new Error('Language negotiation method "match" was not available');
	} else {
		var currentLocale = document.documentElement.lang || 'en-US';
		var candidateLocales = [].concat(['en'], Object.keys(formatDataLoader)); // eslint-disable-line no-undef
		var best = match(currentLocale, candidateLocales).toString();

		// Actually loads formatting data from best locale into the lib
		formatDataLoader[best](); // eslint-disable-line no-undef
	}
}.call(ts.ui));

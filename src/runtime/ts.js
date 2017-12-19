/**
 * Make sure that we are not loaded async (although we should, really)
 */
(function boostrap(sources) {
	'use strict';
	if (document.readyState !== 'loading' && !document.all) {
		console.error('ts.js should really not be loaded async at this point...');
	}
})();

/**
 * Bootstrap tradeshift-ui from single script.
 * The "?internal" flag will also load the CSS.
 */
(function boostrap(sources) {
	'use strict';
	var scripts = document.querySelectorAll('script'),
		head = document.querySelector('head'),
		script = scripts[scripts.length - 1];

	// assign an ID to this script so that if we break up into "bundles",
	// the scripts ID can be used as an ad hoc bundle detection feature.
	script.id = script.id || 'ts-js';

	// fix relative protocols in blob (not terribly relevant now)
	if (location.protocol === 'blob:') {
		Object.keys(sources).forEach(function(key) {
			sources[key] = 'http:' + sources[key];
		});
	}

	// always load the CSS (internal flag ignored for now)
	stylesheet(document.querySelector('#ts-css'));

	// make sure that we are not loaded async (although we should, really)
	if (document.readyState !== 'loading' && !document.all) {
		console.error('ts.js should really not be loaded async at this point...');
	}

	/**
	 * Make sure that the stylesheet goes into
	 * HEAD as the first stylesheet on the page.
	 * TODO (jmo@): Minimize repaint by letting
	 * this go into document.write if conditions
	 * are right (ts.js loaded in HEAD already).
	 * @param {HTMLLinkElement} existing
	 */
	function stylesheet(existing) {
		if (!existing) {
			var oldsheet = document.querySelector('link[rel=stylesheet]');
			var newsheet = document.createElement('link');
			newsheet.id = 'ts-css'; // prepare for multiple bundles...
			newsheet.rel = 'stylesheet';
			newsheet.href = sources.runtimecss;
			head.insertBefore(newsheet, oldsheet || head.lastElementChild);
		}
	}
})({
	runtimecss: '${runtimecss}'
});

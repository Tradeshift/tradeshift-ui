/**
 * Bootstrap tradeshift-ui from single script.
 * The "?internal" flag will also load the CSS.
 */
(function boostrap(sources) {

	console.log(JSON.stringify(sources, 0, 4));

	var intern, sheet, 
		scripts = document.querySelectorAll('script'),
		head = document.querySelector('head'),
		body = document.querySelector('body') || head,
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

	// Always load the CSS (internal flag ignored for now)
	stylesheet(document.querySelector('#ts-css'));

	// load JS (synchronously for now)
	if (document.readyState === 'loading' || document.all) {
		loadsync();
	} else {
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
		if(!existing) { // testing a theory...
			var oldsheet = document.querySelector('link[rel=stylesheet]');
			var newsheet = document.createElement('link');
			newsheet.id = 'ts-css'; // prepare for multiple bundles...
			newsheet.rel = 'stylesheet';
			newsheet.href = sources.runtimecss;
			head.insertBefore(newsheet, oldsheet || head.lastElementChild);
		}
	}

	/*
	 * Inject the script(s). Not quite as sync as it used to be 
	 * because `document.write` is being phased out (in Chrome).
	 */
	function loadsync() {
		var srcs = [];
		var lang = document.querySelector('html').getAttribute('lang');
		if (lang) {
			lang = lang.toLowerCase().replace('_', '-');
			srcs.push(sources.langbundle.replace('<LANG>', lang));
		} else if (!document.all) { // IE9 doesn't console.log
			// note that it's because en-US is default in JS...
			console.log('No lang given. Will default to en-US');
		}
		if(srcs.length) {
			var next, prev = script, head = script.parentNode;
			srcs.forEach(function(src) {
				next = document.createElement('script');
				next.src = src;
				next.async = false;
				head.insertBefore(next, prev.nextSibling);
				prev = next;
			});
		}
	}

}({
	langbundle: '${langbundle}',
	runtimecss: '${runtimecss}'
}));

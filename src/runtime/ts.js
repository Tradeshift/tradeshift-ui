/**
 * Bootstrap tradeshift-ui from single script.
 * The "?internal" flag will also load the CSS.
 */
(function boostrap(sources) {
	var scripts = document.querySelectorAll('script'),
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

	// load JS
	if (document.readyState === 'loading' || document.all) {
		loadscripts(scriptsources());
	} else {
		console.error('ts.js should really not be loaded async at this point...');
	}

	/**
	 * Compile list of script sources to load asynchronously.
	 * This basically boils down to the localization script.
	 * @returns {Array<string>}
	 */
	function scriptsources() {
		var srcs = [];
		var root = document.documentElement;
		var lang = root.getAttribute('lang');
		if (lang) {
			lang = lang.toLowerCase().replace('_', '-');
			srcs.push(sources.langbundle.replace('<LANG>', lang));
		} else if (!document.all) {
			console.log('No lang given. Will default to en-US');
		}
		return srcs;
	}

	/*
	 * Inject the script(s). Not quite as sync as it used to be
	 * because `document.write` is being phased out (in Chrome).
	 * @param {Array<string>} src
	 */
	function loadscripts(srcs) {
		var next = null;
		var prev = script;
		var left = srcs.length;
		var root = script.parentNode;
		function onload() {
			if (--left === 0) {
				ts.ui.$maybebootstrap(true);
			}
		}
		function onerror(error) {
			var src = error.target.src;
			throw new URIError('The script ' + src + ' is not accessible :/');
		}
		if (srcs.length) {
			/*
			 * In most real world cases, the app will have a `lang` attribute
			 * on the root `html` element and we load the localization script.
			 */
			srcs.forEach(function(src) {
				next = document.createElement('script');
				next.src = src;
				next.defer = true;
				next.onload = onload;
				next.onerror = onerror;
				root.insertBefore(next, prev.nextSibling);
				prev = next;
			});
		} else {
			/*
			 * Otherwise we attempt bootstrap. All the Runtime code will be
			 * parsed after this code, so we have to take a break before we
			 * can address it. TODO: Let's micro-task instead of a timeout!
			 */
			setTimeout(function deferred() {
				ts.ui.$maybebootstrap(true);
			});
		}
	}
})({
	langbundle: '${langbundle}',
	runtimecss: '${runtimecss}'
});

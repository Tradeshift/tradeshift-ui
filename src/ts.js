/**
 * Bootstrap tradeshift-ui from single script.
 * The "?internal" flag will also load the CSS.
 */
(function boostrap(sources) {
	var intern,
		script,
		scripts = document.querySelectorAll('script'),
		head = document.querySelector('head');

	// fix relative protocols in blob
	if (location.protocol === 'blob:') {
		Object.keys(sources).forEach(function(key) {
			sources[key] = 'http:' + sources[key];
		});
	}

	// include the stylesheet?

	/*
	 * Big disaster: Karma cannot all of a sudden work with querystring paramters
	 * to the file because it expects a file (and not a web resource). This means
	 * that we cannot append '?internal' in the karma config. We can bypass this
	 * terrible dilemma, however, by adding simply '?' because Karma does that
	 * internally. We'll just do that for now, since the whole testing shebang
	 * (which now depends or IP adresses on localhost) must be refactored anyhow.
	 */
	script = scripts[scripts.length - 1];
	if ((intern = script.src.indexOf('?') > -1)) {
		// ?internal
		stylesheet();
	}

	// load sync (for now)
	if (document.readyState === 'loading' || document.all) {
		loadsync();
		if (intern) {
			internal(scripts);
		}
	} else {
		console.error('ts.js should really not be loaded async at this point...');
	}

	/**
	 * Make sure that the stylesheet goes into
	 * HEAD as the first stylesheet on the page.
	 * TODO (jmo@): Minimize repaint by letting
	 * this go into document.write if conditions
	 * are right (ts.js loaded in HEAD already).
	 */
	function stylesheet() {
		var oldsheet = document.querySelector('link[rel=stylesheet]');
		var newsheet = document.createElement('link');
		newsheet.rel = 'stylesheet';
		newsheet.href = sources.runtimecss;
		head.insertBefore(newsheet, oldsheet || head.lastElementChild);
	}

	/*
	 * Document write sync (and blocking if in HEAD).
	 */
	function loadsync() {
		var api = [sources.spiritsapi, sources.runtimeapi];
		var gui = [sources.spiritsgui, sources.runtimegui];
		var lang = document.querySelector('html').getAttribute('lang');

		if (lang) {
			lang = lang.toLowerCase().replace('_', '-');
			gui.push(sources.langbundle.replace('<LANG>', lang));
		} else if (!document.all && window.console && console.log) {
			// !
			console.log('No lang given. Will default to en-us');
		}

		document.write(
			api
				.concat(intern ? gui : [])
				.map(function(src) {
					return '<script src="' + src + '"></script>';
				})
				.join('\n')
		);
	}

	/**
	 * Setup for internal TS development by
	 * flipping 'ts.ui.greenfield' to false.
	 */
	function internal() {
		scripts = document.querySelectorAll('script');

		// TODO: didn't we delete this code at some point? what happened?
		scripts[scripts.length - 1].addEventListener('load', function() {
			gui.init(function oninit() {
				ts.ui.greenfield = false;
			});
		});
	}
})({
	langbundle: '${langbundle}',
	spiritsapi: '${spiritsapi}',
	runtimeapi: '${runtimeapi}',
	spiritsgui: '${spiritsgui}',
	runtimegui: '${runtimegui}',
	runtimecss: '${runtimecss}'
});

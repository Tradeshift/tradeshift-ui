/*
 * When `true`, the menu will not actually load anything 
 * (so that we can safely mess around with the styling). 
 * This should only ever be `true` while on localhost.
 */
var develop = false;

/*
 * Fetch the `package json` as soon as the DOM is ready.
 */
addEventListener('DOMContentLoaded', function() {
	requestJSON('package.json', function(json) {
		bootstrap(json, document.querySelector('menu'), window.frameElement);
	});
});

/**
 * Request JSON via URL and call that callback.
 * TODO: Refactor something to skip this request
 * @param {string} url
 * @param {Function} cb
 */
function requestJSON(url, cb) {
	var request = new XMLHttpRequest();
	var nocache = Date.now();
	request.open('GET', url + '?' + nocache);
	request.send();
	request.addEventListener('load', function() {
		if(request.readyState === XMLHttpRequest.DONE) {
			cb(JSON.parse(request.responseText));
		}
	});
}

/**
 * Bootstrap the whole thing.
 * @param {Object} package
 */
function bootstrap(package, menu, frame) {
	var current = top.location.pathname.match(/^\/v\d*\//)[0];
	var latest = getfolder(package.versions[0]);
	var folders = new Map(package.versions.map(function(v) {
		return [getfolder(v), v];
	}));
	function update(next) {
		updateMenu(menu, package.versions, next);
		updateText(next, latest, folders.get(next));
	}
	initMenu(menu, frame, update);
	update(current);
}

/**
 * Get folder name to match semantic version.
 * @param {string} version
 * @returns {string}
 */
function getfolder(version) {
	return '/v' + parseInt(version, 10) + '/';
}

/**
 * Update the banner text.
 * @param {string} current
 * @param {string} latest
 * @param {string} version
 */
function updateText(current, latest, version) {
	document.body.className = current === latest ? '' : 'danger';
	document.querySelector('p').innerHTML = (current === latest
		? 'This is the latest version'
		: 'This is an obsolete version') +
		'<strong>' + version + '</strong>';
}

/**
 * Populate the version selector.
 * @param {HTMLMenuElement} menu
 * @param {Array<string>} versions
 * @param {string} current
 */
function updateMenu(menu, versions, current) {
	menu.innerHTML = versions.map(function(ver) {
		var dir = getfolder(ver);
		var css = dir === current ? 'selected' : '';
		return (
			'<li class="' + css + '">' +
				'<a href="' + dir + '" target="_top">' + ver + '</a>' +
			'</li>'
		);
	}).join('\n');
}

/**
 * Setup to toggle the version selector. This iframe will 
 * expand to fill the entire screen when the menu is open.
 * @param {HTMLMenuElement} menu
 * @param {HTMLIframeElement} frame
 * @param {Function} update
 */
function initMenu(menu, frame, update) {
	function toggle() {
		toggle.open = !toggle.open;
		menu.style.display = toggle.open ? 'block' : 'none';
		frame.style.height = toggle.open ? '100%' : '30px';
	}
	document.addEventListener('click', function(e) {
		toggle();
		if(e.target.href && develop) {
			update(e.target.pathname);
			e.preventDefault();
		}
	});
	document.addEventListener('keypress', function(e) {
		if (toggle.open && e.keyCode === 27) {
			toggle();
		}
	});
}
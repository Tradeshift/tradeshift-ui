var menu;
var json;
var current = top.location.pathname.match(/^\/v\d*\//)[0];

/*
 * Fetch the `package json` as soon as the DOM is ready.
 */
addEventListener('DOMContentLoaded', function() {
	requestJSON('package.json', function(json) {
		menu = document.querySelector('menu');
		package = json; 
		bootstrap(window.frameElement);
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
 * Bootstrap the whole thing. Note that only the newest 
 * version must be marked as `beta` for this to work out.
 * @param {Object} package
 */
function bootstrap(frame) {
	var latest = getfolder(package.versions.reduce(function(res, ver) {
		return isPrerelease(res) ? ver : res;
	}, package.versions[0]));

	var folders = [];
	for (var i = 0, len = package.versions.length; i < len; i++) {
		folders.push({
			key: getfolder(package.versions[i]),
			value: package.versions[i]
		});
	}

	function update() {
		var found = folders.filter(function (folder) {
			return folder.key === current;
		});		
		
		updateMenu();
		updateText(latest, found[0].value);
	}
	initMenu(frame, update);
	update();
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
 * Update the banner text and classname (to change the color).
 * @param {string} current
 * @param {string} latest
 * @param {string} version
 */
function updateText(latest, version) {
	var safe = current === latest;
	var beta = isPrerelease(version);
	document.body.className = safe 
		? ''
		: beta
			? 'preview'
			: 'obsolete';
	document.querySelector('p').innerHTML = (safe
		? 'Latest'
		: beta
			? 'Preview'
			: 'Obsolete') +
		'<strong>' + version + '</strong>';
}

/**
 * Populate the version selector.
 * @param {HTMLMenuElement} menu
 * @param {Array<string>} versions
 * @param {string} current
 */
function updateMenu() {
	menu.innerHTML = package.versions.map(function(ver, idx) {
		var dir = getfolder(ver);
		var url = window.top.location.href.replace(current, dir);
		var css = [dir === current ? 'selected' : '', (isPrerelease(ver) ? 'preview' : (idx ? 'obsolete' : ''))].join(' ');
		return (
			'<li class="' + css + '">' +
				'<a href="' + url + '" target="_top">' + ver + '</a>' +
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
function initMenu(frame, update) {
	function toggle() {
		toggle.open = !toggle.open;
		menu.style.display = toggle.open ? 'block' : 'none';
		frame.style.height = toggle.open ? '100%' : '40px';
	}
	document.addEventListener('click', function(e) {
		updateMenu();
		toggle();
	});
	document.addEventListener('keypress', function(e) {
		if (toggle.open && e.keyCode === 27) {
			toggle();
		}
	});
}

function isPrerelease(version) {
	return version.indexOf('-') !== -1;
}

addEventListener('DOMContentLoaded', function() {

	var iframe = window.frameElement;
	var menu = document.querySelector('menu');
	var hide = document.querySelector('.cover');

	// iframe.src = 'http://127.0.0.1:10114';

	function load(majorversion) {
		alert(iframe);
		console.log('Load', majorversion);
		// iframe.src = 'v' + majorversion + '/';
	}

	requestJSON('package.json', function(json) {
		createMenu(menu, json.versions);
		setupMenu(menu, hide, load);
		load(parseInt(json.versions[0]));
	});

	addEventListener('message', function(e) {
		if(e.data.startsWith('#')) {
			console.log('parent', e.data);
			location.hash = e.data.slice(1);
		}
	});

	addEventListener('hashchange', function() {
		iframe.contentWindow.postMessage(location.hash, '*');
	}); 

});

/**
 * Request JSON via URL.
 * TODO: Refactor something to skip this request
 * @param {string} url
 * @param {Function} cb
 */
function requestJSON(url, cb) {
	var request = new XMLHttpRequest();
	request.open('GET', url);
	request.send();
	request.addEventListener('load', function() {
		if(request.readyState === XMLHttpRequest.DONE) {
			cb(JSON.parse(request.responseText));
		}
	});
}

/**
 * Populate the version selector.
 * @param {HTMLMenuElement} menu
 * @param {Array<string>} versions
 */
function createMenu(menu, versions) {
	menu.innerHTML = versions.map(function(version) {
		return '<li><a href="' + parseInt(version, 10) + '/">' + version + '</a></li>';
	});
}

/**
 * @param {HTMLMenuElement} menu
 * @param {HTMLDivElement} hide
 */
function setupMenu(menu, hide, load) {
	document.addEventListener('click', function toggle(e) {
		hide.style.display = toggle.open ? 'none' : 'block';
		menu.style.display = toggle.open ? 'none' : 'block';
		toggle.open = !toggle.open;
		e.preventDefault();
	});
}
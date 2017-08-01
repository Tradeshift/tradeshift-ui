/**
 * Resolve an URL string relative to a document.
 * TODO: Read https://gist.github.com/jlong/2428561
 * @param {Document} doc TODO: Move to second arg!
 * @param {String} href
 */
gui.URL = function(doc, href) {
	if (doc && doc.nodeType === Node.DOCUMENT_NODE) {
		var val,
			link = gui.URL._createLink(doc, href);
		Object.keys(gui.URL.prototype).forEach(function(key) {
			// TODO: exclude toString somehow...
			if (gui.Type.isString((val = link[key]))) {
				if (key === 'pathname' && !val.startsWith('/')) {
					val = '/' + val; // http://stackoverflow.com/questions/956233/javascript-pathname-ie-quirk
				}
				this[key] = val;
			}
		}, this);
		this.id = this.hash ? this.hash.substring(1) : null;
		this.external = this.href.split('#')[0] !== doc.URL.split('#')[0];
	} else {
		throw new TypeError('Document expected');
	}
};

gui.URL.prototype = {
	hash: null, // #test
	host: null, // www.example.com:80
	hostname: null, // www.example.com
	href: null, // http://www.example.com:80/search?q=devmo#test
	pathname: null, // search
	port: null, // 80
	protocol: null, // http:
	search: null, // ?q=devmo
	id: null, // test,
	external: false, // external relative to the *document*, not the server host!!! (rename "outbound" to clear this up?)
	toString: function() {
		// behave somewhat like window.location ....
		return this.href;
	}
};

// Statics ..............................................................................................

/**
 * Convert relative path to absolute path in context of base where base is a document or an absolute path.
 * @see http://stackoverflow.com/questions/14780350/convert-relative-path-to-absolute-using-javascript
 * @param {String|Document} base
 * @param {String} href
 * @returns {String}
 */
gui.URL.absolute = function(base, href) {
	// return /(^data:)|(^http[s]?:)|(^\/)/.test(inUrl);
	href = href || '';
	if (base.nodeType === Node.DOCUMENT_NODE) {
		return new gui.URL(base, href).href;
	} else if (typeof base === 'string') {
		var stack = base.split('/');
		var parts = href.split('/');
		stack.pop(); // remove current filename (or empty string) (omit if "base" is the current folder without trailing slash)
		parts.forEach(function(part) {
			if (part !== '.') {
				if (part === '..') {
					stack.pop();
				} else {
					stack.push(part);
				}
			}
		});
		return stack.join('/');
	}
};

/**
 * Is URL external to document (as in external host)?
 * @param {String} url
 * @param {Document} doc
 * @returns {boolean}
 */
gui.URL.external = function(src, doc) {
	doc = doc || document;
	var url = new gui.URL(doc, src);
	return url.host !== doc.location.host || url.port !== doc.location.port;
};

/**
 * Extract querystring parameter value from URL.
 * @param {String} url
 * @param {String} name
 * @returns {String} String or null
 */
gui.URL.getParam = function(url, name) {
	name = name.replace(/(\[|\])/g, '\\$1');
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
	return results === null ? null : results[1];
};

/**
 * Add or remove (unencoded) querystring parameter from URL. If it
 * already exists, we'll replace it's (first ancountered) value.
 * TODO: Something simpler
 * @param {String} url
 * @param {String} name
 * @param {String} value Use null to remove
 * @returns {String} String
 */
gui.URL.setParam = function(url, name, value) {
	var params = [],
		cut,
		index = -1;
	var path = url.split('#')[0];
	var hash = url.split('#')[1];
	if (path.indexOf('?') > -1) {
		cut = path.split('?');
		path = cut[0];
		params = cut[1].split('&');
		params.every(function(param, i) {
			var x = param.split('=');
			if (x[0] === name) {
				index = i;
				if (value !== null) {
					x[1] = value;
					params[i] = x.join('=');
				}
			}
			return index < 0;
		});
	}
	if (value === null) {
		if (index > -1) {
			params.remove(index, index);
		}
	} else if (index < 0) {
		params[params.length] = [name, value].join('=');
	}
	params = params.length > 0 ? '?' + params.join('&') : '';
	return path + params + (hash ? '#' + hash : '');
};

/**
 * Format URL with hashmap key-values as querystring parameters.
 * @param {String} baseurl
 * param @optional {Map<String,String|number|boolean|Array>} params
 * @returns {String}
 */
gui.URL.parametrize = function(baseurl, params) {
	if (gui.Type.isObject(params)) {
		gui.Object.each(params, function(key, value) {
			baseurl += baseurl.includes('?') ? '&' : '?';
			switch (gui.Type.of(value)) {
				case 'array':
					baseurl += value
						.map(function(member) {
							return key + '=' + String(member);
						})
						.join('&');
					break;
				default:
					baseurl += key + '=' + String(value);
					break;
			}
		});
	}
	return baseurl;
};

/**
 * @TODO: fix this
 * @param {Window} win
 * @returns {String}
 */
gui.URL.origin = function(win) {
	var loc = win.location;
	return loc.origin || loc.protocol + '//' + loc.host;
};

/**
 * @param {Document} doc
 * @param @optional {String} href
 */
gui.URL._createLink = function(doc, href) {
	var link = doc.createElement('a');
	link.href = href || '';
	if (gui.Client.isExplorer) {
		// IE9???
		var uri = gui.URL.parseUri(link.href);
		Object.keys(uri).forEach(function(key) {
			if (!link[key]) {
				link[key] = uri[key]; // this is wrong...
			}
		});
	}
	return link;
};

/**
 * Temp IE hotfix...
 * @see http://blog.stevenlevithan.com/archives/parseuri
 * TODO: https://github.com/websanova/js-url
 * TODO: https://github.com/allmarkedup/purl
 */
gui.URL.parseUri = function(str) {
	var o = gui.URL.parseOptions,
		m = o.parser[o.strictMode ? 'strict' : 'loose'].exec(str),
		uri = {},
		i = 14;
	while (i--) {
		uri[o.key[i]] = m[i] || '';
	}
	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) {
		if ($1) {
			uri[o.q.name][$1] = $2;
		}
	});
	return uri;
};

/**
 * Temp IE hotfix...
 * TODO: Now that it's not so temp anymore, at least figure out where it came from...
 */
gui.URL.parseOptions = {
	strictMode: true,
	key: [
		'source',
		'protocol',
		'authority',
		'userInfo',
		'user',
		'password',
		'host',
		'port',
		'relative',
		'path',
		'directory',
		'file',
		'query',
		'anchor'
	],
	q: {
		name: 'queryKey',
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

/**
 * Simplistic XMLHttpRequest wrapper.
 * @param @optional {String} url
 * @param @optional {Document} doc Resolve URL relative to given document location.
 */
gui.Request = function Request(url, doc) {
	doc = doc || document;
	this._headers = {
		Accept: 'application/json'
	};
	if (url) {
		this.url(url, doc);
	}
};

/**
 * @using {gui.Combo#chained}
 */
gui.Request.prototype = (function using(chained) {
	return {
		/**
		 * Set request address.
		 * @param {String} url
		 * @param @optional {Document} doc Resolve URL relative to this document
		 */
		url: chained(function(url, doc) {
			this._url = doc ? new gui.URL(doc, url).href : url;
		}),

		/**
		 * Convert to synchronous request.
		 */
		sync: chained(function() {
			this._async = false;
		}),

		/**
		 * Convert to asynchronous request.
		 */
		async: chained(function() {
			this._async = true;
		}),

		/**
		 * Expected response type. Sets the accept header and formats
		 * callback result accordingly (eg. as JSON object, XML document)
		 * @param {String} mimetype
		 * @returns {gui.Request}
		 */
		accept: chained(function(mimetype) {
			this._headers.Accept = mimetype;
		}),

		/**
		 * Expect JSON response.
		 * @returns {gui.Request}
		 */
		acceptJSON: chained(function() {
			this.accept('application/json');
		}),

		/**
		 * Expect XML response.
		 * @returns {gui.Request}
		 */
		acceptXML: chained(function() {
			this.accept('text/xml');
		}),

		/**
		 * Expect text response.
		 * @returns {gui.Request}
		 */
		acceptText: chained(function() {
			this.accept('text/plain');
		}),

		/**
		 * Format response to this type.
		 * @param {String} mimetype
		 * @returns {gui.Request}
		 */
		format: chained(function(mimetype) {
			this._format = mimetype;
		}),

		/**
		 * Override mimetype to fit accept.
		 * @returns {gui.Request}
		 */
		override: chained(function(doit) {
			this._override = doit || true;
		}),

		/**
		 * Append request headers.
		 * @param {Map<String,String>} headers
		 * @returns {gui.Request}
		 */
		headers: chained(function(headers) {
			if (gui.Type.isObject(headers)) {
				gui.Object.each(
					headers,
					function(name, value) {
						this._headers[name] = String(value);
					},
					this
				);
			} else {
				throw new TypeError('Object expected');
			}
		}),

		// Private ...................................................................................

		/**
		 * @type {boolean}
		 */
		_async: true,

		/**
		 * @type {String}
		 */
		_url: null,

		/**
		 * Default request type. Defaults to JSON.
		 * @type {String}
		 */
		_format: 'application/json',

		/**
		 * Override response mimetype?
		 * @type {String}
		 */
		_override: false,

		/**
		 * Request headers.
		 * @type {Map<String,String}
		 */
		_headers: null,

		/**
		 * Do the XMLHttpRequest.
		 * TODO: http://mathiasbynens.be/notes/xhr-responsetype-json
		 * @param {String} method
		 * @param {object} payload
		 * @param {function} callback
		 */
		_request: function(method, payload, callback) {
			var that = this,
				request = new XMLHttpRequest();
			var xtarget = gui.URL.external(this._url, document);
			request.onreadystatechange = function() {
				if (this.readyState === XMLHttpRequest.DONE) {
					var data = that._response(this.responseText);
					callback(this.status, data, this.responseText);
				}
			};
			if (this._override) {
				request.overrideMimeType(this._headers.Accept);
			}
			request.open(method.toUpperCase(), this._url, true);
			if (!xtarget) {
				// headers not used xdomain per spec
				gui.Object.each(this._headers, function(name, value) {
					request.setRequestHeader(name, value, false);
				});
			}
			request.send(payload);
		},

		/**
		 * Parse response to expected type.
		 * @param {String} text
		 * @returns {object}
		 */
		_response: function(text) {
			var result = text;
			try {
				switch (this._headers.Accept) {
					case 'application/json':
						result = JSON.parse(text);
						break;
					case 'text/xml':
						result = new DOMParser().parseFromString(text, 'text/xml');
						break;
				}
			} catch (exception) {
				if (gui.debug) {
					console.error(this._headers.Accept + ' dysfunction at ' + this._url);
				}
			}
			return result;
		}
	};
})(gui.Combo.chained);

/**
 * Generating methods for GET PUT POST DELETE.
 * @param @optional {object} payload
 */
['get', 'post', 'put', 'delete'].forEach(function(method) {
	gui.Request.prototype[method] = function(payload) {
		if (gui.Type.isFunction(payload)) {
			throw new Error('Deprecated: gui.Request returns a gui.Then');
		}
		var then = new gui.Then();
		payload = method === 'get' ? null : payload;
		this._request(method, payload, function(status, data, text) {
			then.now(status, data, text);
		});
		return then;
	};
});

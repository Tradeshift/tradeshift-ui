/**
 * Work in progress. Not tested at all.
 */
gui.module('edb-crud@wunderbyte.com', {

	oncontextinitialize: function() {
		edb.Type.mixin({

			/**
			 * Warning to use some kind of factory pattern.
			 */
			GET: function() {
				throw new Error(
					'Not supported. Use ' + this.constructor + '.GET(optionalid)'
				);
			},

			/**
			 * PUT resource.
			 * @param @optional {Map<String,object>} options
			 * @returns {gui.Then}
			 */
			PUT: function(options) {
				return this.constructor.PUT(this, options);
			},

			/**
			 * POST resource.
			 * @param @optional {Map<String,object>} options
			 * @returns {gui.Then}
			 */
			POST: function(options) {
				return this.constructor.POST(this, options);
			},

			/**
			 * DELETE resource.
			 * @param @optional {Map<String,object>} options
			 * @returns {gui.Then}
			 */
			DELETE: function(options) {
				return this.constructor.DELETE(this, options);
			}

		}, { // Xstatic ............................................................

			/**
			 * The resource URI-reference is the base URL for
			 * resources of this type excluding the resource
			 * primary key. This might be inferred from JSON.
			 * @type {String}
			 */
			uri: null,

			/**
			 * When requesting a list of resources, a property
			 * of this name should be found in the JSON for
			 * each individual resource. The property value
			 * will be auto-inserted into URL paths when
			 * the resource is fetched, updated or deleted.
			 * @type {String}
			 */
			primarykey: '_id',

			/**
			 * GET resource.
			 *
			 * 1. Any string argument will become the resource ID.
			 * 2. Any object argument will resolve to querystring paramters.
			 *
			 * @param @optional {Map<String,object>|String} arg1
			 * @param @optional {Map<String,object>} arg2
			 * @returns {gui.Then}
			 */
			GET: function() {
				return this.$httpread.apply(this, arguments);
			},

			/**
			 * PUT resource.
			 * @param {edb.Object|edb.Array} inst
			 * @param @optional {Map<String,object>} options
			 * @param {String} $method (Framework internal)
			 * @returns {gui.Then}
			 */
			PUT: function(inst, options) {
				return this.$httpupdate('PUT', inst, options);
			},

			/**
			 * POST resource.
			 * @param {edb.Object|edb.Array} inst
			 * @param @optional {Map<String,object>} options
			 * @param {String} $method (Framework internal)
			 * @returns {gui.Then}
			 */
			POST: function(inst, options) {
				return this.$httpupdate('POST', inst, options);
			},

			/**
			 * DELETE resource.
			 * @param {edb.Object|edb.Array} inst
			 * @param @optional {Map<String,object>} options
			 * @param {String} $method (Framework internal)
			 * @returns {gui.Then}
			 */
			DELETE: function(inst, options) {
				return this.$httpupdate('DELETE', inst, options);
			},

			// Privileged static .....................................................

			/**
			 * GET resource.
			 */
			$httpread: function() {
				var type = this;
				var then = new gui.Then();
				var href, options;
				Array.forEach(arguments, function(arg) {
					switch (gui.Type.of(arg)) {
						case 'object':
							options = arg;
							break;
					}
				});
				href = gui.URL.parametrize(this.uri, options);
				this.$httprequest(href, 'GET', null, function(response) {
					then.now(type.$httpresponse(response));
				});
				return then;
			},

			/**
			 * PUT POST DELETE resource.
			 * @param {String} method (Framework internal)
			 * @param {edb.Object|edb.Array} inst
			 * @param @optional {Map<String,object>} options
			 * @returns {gui.Then}
			 */
			$httpupdate: function(method, inst, options) {
				var type = this;
				var then = new gui.Then();
				var href = gui.URL.parametrize(inst.uri, options);
				var data = gui.Type.isInstance(inst) ? inst.toJSON() : inst;
				this.$httprequest(href, method || 'PUT', data, function(response) {
					then.now(type.$httpresponse(response, options, method));
				});
				return then;
			},

			/**
			 * Performs the request. Perhaps you would like to overwrite this method.
			 * TODO: Somehow handle HTTP status codes.
			 * @param {String} url
			 * @param {String} method
			 * @param {object} payload
			 * @param {function} callback
			 */
			$httprequest: function(url, method, payload, callback) {
				var request = new gui.Request(url);
				method = method.toLowerCase();
				request[method](payload).then(function(status, data, text) {
					callback(data);
				});
			},

			/**
			 * Formats the reponse. Perhaps you would like to overwrite this method.
			 * If the service returns an object or an array, we assume that service
			 * is echoing the posted data and new up an instance of this constructor.
			 * @param {object} response
			 * param @optional {Map<String,object>} options
			 * @param {String} $method GET PUT POST DELETE
			 * @returns {object}
			 */
			$httpresponse: function(response, options, method) {
				var Type = this;
				switch (gui.Type.of(response)) {
					case 'object':
					case 'array':
						response = new Type(response);
						break;
				}
				return response;
			}

		});
	}
});

edb.Parser = (function() {
	function Parser() {}
	Parser.prototype = {
		/**
		 * @param {String} json
		 * @param @optional {function} type
		 * @returns {edb.Object|edb.Array}
		 */
		parseFromString: function(json, type) {
			try {
				json = JSON.parse(json);
			} catch (JSONException) {
				throw new TypeError('Bad JSON: ' + JSONException.message);
			} finally {
				if (isType(json)) {
					return parse(json, type);
				} else {
					throw new TypeError('Expected serialized edb.Object|edb.Array');
				}
			}
		}
	};

	/**
	 * @returns {edb.Object|edb.Array}
	 */
	function parse(json, type) {
		var Type, name;
		if (type === null) {
			// eslint-disable-line no-empty
		} else if (type) {
			name = type.$classname || name;
			Type = name ? type : gui.Object.lookup(name);
		} else {
			name = json.$object.$classname;
			Type = gui.Object.lookup(name);
		}
		json = mapValue(json);
		if (type === null) {
			return json;
		} else if (Type) {
			return Type.from(json);
		} else {
			var error = new TypeError(name + ' is not defined');
			if (name === gui.Class.ANONYMOUS) {
				console.error(
					'TODO: Spiritual should make sure ' +
						'that nothing is ever "' +
						name +
						'"\n' +
						JSON.stringify(json, null, 4)
				);
			}
			throw error;
		}
	}

	/**
	 * Is typed node?
	 * @param {object} json
	 * @returns {boolean}
	 */
	function isType(json) {
		return gui.Type.isComplex(json) && (json.$array || json.$object);
	}

	/**
	 * Parse node as typed instance.
	 * @param {object} type
	 * @return {object}
	 */
	function asObject(type) {
		return gui.Object.map(type.$object, mapObject);
	}

	/**
	 * Parse array node to a simple array.
	 * Stamp object properties onto array.
	 * @returns {Array}
	 */
	function asArray(type) {
		var members = type.$array.map(mapValue);
		members.$object = type.$object;
		return members;
	}

	/**
	 *
	 */
	function mapObject(key, value) {
		switch (key) {
			case '$classname': // TODO: think about this at some point...
				// case '$instanceid'
				// case '$originalid'
				return undefined;
			default:
				return mapValue(value);
		}
	}

	/**
	 * @returns {}
	 */
	function mapValue(value) {
		if (isType(value)) {
			return value.$array ? asArray(value) : asObject(value);
		}
		return value;
	}

	return Parser;
})();

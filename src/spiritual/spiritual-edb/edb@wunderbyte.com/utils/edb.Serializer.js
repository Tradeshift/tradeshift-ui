edb.Serializer = (function scoped() {
	function Serializer() {}
	Serializer.prototype = {
		/**
		 * Serialize type.
		 * @param {edb.Object|edb.Array} type
		 * @param @optional {function} filter
		 * @param @optional {String|number} tabs
		 * @returns {String}
		 */
		serializeToString: function(type, filter, tabs) {
			if (isType(type)) {
				return JSON.stringify(parse(type), filter, tabs);
			} else {
				throw new TypeError('Expected edb.Object|edb.Array');
			}
		}
	};

	/**
	 * Match array features leaking into objects.
	 * @type {RegExp}
	 */
	var INTRINSIC = /^length|^\d+/;

	/**
	 * Thing is a type?
	 * @param {object} thing
	 * @returns {boolean}
	 */
	function isType(thing) {
		return edb.Type.is(thing);
	}

	/**
	 * Thing is edb.Array?
	 * @param {object} thing
	 * @returns {boolean}
	 */
	function isArray(type) {
		return edb.Array.is(type);
	}

	/**
	 * Parse as object node or array node.
	 */
	function parse(type) {
		return isArray(type) ? asArray(type) : asObject(type);
	}

	/**
	 * Compute object node.
	 * @param {edb.Object|edb.Array} type
	 * @returns {object}
	 */
	function asObject(type) {
		var map = gui.Object.map(type, mapObject, type);
		return {
			$object: gui.Object.extend(
				{
					$classname: type.$classname,
					$instanceid: type.$instanceid,
					$originalid: type.$originalid
				},
				map
			)
		};
	}

	/**
	 * Compute array node.
	 * @param {edb.Object|edb.Array} type
	 * @returns {object}
	 */
	function asArray(type) {
		return gui.Object.extend(asObject(type), {
			$array: mapArray(type)
		});
	}

	/**
	 * Map the object properties of a type.
	 *
	 * - Skip private (underscore) fields.
	 * - Skip all array intrinsic properties.
	 * - Skip what looks like instance objects.
	 * - Skip getters and setters.
	 * @param {String} key
	 * @param {object} value
	 */
	function mapObject(key, value) {
		var c = key.charAt(0);
		if (c === '_' || c === '$') {
			return undefined;
		} else if (isArray(this) && key.match(INTRINSIC)) {
			return undefined;
		} else if (isType(value)) {
			return parse(value);
		} else if (gui.Type.isComplex(value)) {
			switch (value.constructor) {
				case Object:
				case Array:
					return value;
			}
			return undefined;
		} else {
			if (isType(this)) {
				var base = this.constructor.prototype;
				var desc = Object.getOwnPropertyDescriptor(base, key);
				if (desc && (desc.set || desc.get)) {
					return undefined;
				}
			}
			return value;
		}
	}

	/**
	 * Map array members.
	 * @param {edb.Array} type
	 */
	function mapArray(type) {
		return Array.map(type, function(thing) {
			return isType(thing) ? parse(thing) : thing;
		});
	}

	return Serializer;
})();

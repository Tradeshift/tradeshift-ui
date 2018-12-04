/**
 * Populates an {edb.Object} type.
 * @using {gui.Type#isDefined}
 * @using {gui.Type#isComplex},
 * @using {gui.Type#isFunction}
 * @using {gui.Type#isConstructor}
 */
edb.ObjectPopulator = (function using(isdefined, iscomplex, isfunction, isconstructor) {
	/**
	 * List non-private fields names from handler that are not
	 * mixed in from {edb.Type} and not inherited from native.
	 * @param {edb.Object} handler
	 * @returns {Array<String>}
	 */
	function definitions(handler) {
		var Type = edb.Object.is(handler) ? edb.Object : edb.Array;
		var Base = edb.Object.is(handler) ? Object : Array;
		var keys = [],
			classes = [edb.Type, Type, Base];
		gui.Object.all(handler, function(key) {
			if (
				isregular(key) &&
				classes.every(function(o) {
					return o.prototype[key] === undefined;
				})
			) {
				keys.push(key);
			}
		});
		return keys;
	}

	/**
	 * TODO: Call this something else...
	 * @param {object} json
	 * @param {edb.Object|edb.Array} type
	 */
	function evalheaders(json, type) {
		var id = json.$originalid || json.$instanceid;
		delete json.$instanceid;
		delete json.$originalid;
		if (id) {
			Object.defineProperty(
				type,
				'$originalid',
				gui.Property.nonenumerable({
					value: id
				})
			);
		}
	}

	/**
	 * Fail me once.
	 * @param {String} name
	 * @param {String} key
	 */
	function faildefined(name, key) {
		throw new TypeError(name + ' declares "' + key + '" as something undefined');
	}

	/**
	 * Fail me twice.
	 * @param {String} name
	 * @param {String} key
	 */
	function failconstructor(name, key) {
		throw new TypeError(name + ' "' + key + '" must resolve to a constructor');
	}

	/**
	 * Object key is not a number and doesn't start with exotic character?
	 * @param {String|number} key
	 * @returns {boolean}
	 */
	function isregular(key) {
		return key.match(/^[a-z]/i);
	}

	/**
	 * Lookup property descriptor for key.
	 * @param {object} proto
	 * @param {string} key
	 * @returns {object}
	 */
	function lookupDescriptor(proto, key) {
		if (proto.hasOwnProperty(key)) {
			return Object.getOwnPropertyDescriptor(proto, key);
		} else if ((proto = Object.getPrototypeOf(proto))) {
			return lookupDescriptor(proto, key);
		} else {
			return null;
		}
	}

	return {
		// Public ...............................................................

		/**
		 * Populate object properties of type instance.
		 * @param {object} json
		 * @param {edb.Object|edb.Array} type
		 * @return {Map<String,edb.Object|edb.Array>} types
		 */
		populate: function(json, type) {
			var Def,
				def,
				val,
				desc,
				types = Object.create(null);
			var base = type.constructor.prototype;
			var name = type.constructor.$classname;
			var pure = [];
			evalheaders(json, type);
			definitions(type).forEach(function(key) {
				def = type[key];
				val = json[key];
				switch (def) {
					case Object:
						//	console.error('TODO: Support Object in edb.ObjectPopulator');
						if (val && gui.Type.isObject(val)) {
							type[key] = JSON.parse(JSON.stringify(val)); // {};
						} else {
							type[key] = null;
						}
						pure.push(key);
						break;
					case Array:
						if (val && Array.isArray(val)) {
							type[key] = JSON.parse(JSON.stringify(val)); // val.slice();
						} else {
							type[key] = null;
							// type[key] = []; !!!!!!!!!!!!!!
						}
						pure.push(key);
						break;
					default:
						if (isdefined(val)) {
							if (isdefined(def)) {
								if (iscomplex(def)) {
									if (isfunction(def)) {
										if (!isconstructor(def)) {
											def = def(val);
										}
										if (isconstructor(def)) {
											if (val !== null) {
												Def = def;
												types[key] = Def.from(json[key]);
											}
										} else {
											failconstructor(name, key);
										}
									} else {
										types[key] = edb.Type.cast(isdefined(val) ? val : def);
									}
								}
							} else {
								faildefined(name, key);
							}
						} else {
							if (isregular(key) && edb.Type.isConstructor(def)) {
								json[key] = null;
								types[key] = def;
							} else {
								if ((desc = lookupDescriptor(base, key))) {
									Object.defineProperty(json, key, desc);
								}
							}
						}
						break;
				}
			});
			gui.Object.nonmethods(json)
				.filter(function(key) {
					return pure.indexOf(key) === -1;
				})
				.forEach(function(key) {
					var def_ = json[key];
					if (isregular(key) && gui.Type.isComplex(def_)) {
						if (!types[key]) {
							types[key] = edb.Type.cast(def_);
						}
					}
				});
			return types;
		}
	};
})(gui.Type.isDefined, gui.Type.isComplex, gui.Type.isFunction, gui.Type.isConstructor);

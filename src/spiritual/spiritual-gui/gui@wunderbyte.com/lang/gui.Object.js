/**
 * Working with objects.
 */
gui.Object = {
	/**
	 * Object.create with default property descriptors.
	 * @see http://wiki.ecmascript.org/doku.php?id=strawman:define_properties_operator
	 * @param {object} proto
	 * @param {object} props
	 */
	create: function(proto, props) {
		var resolved = {};
		Object.keys(props).forEach(function(prop) {
			resolved[prop] = {
				value: props[prop],
				writable: true,
				enumerable: true,
				configurable: true
			};
		});
		return Object.create(proto, resolved);
	},

	/**
	 * Extend target with source properties *excluding* prototype stuff.
	 * Optional parameter 'loose' to skips properties already declared.
	 * TODO: bypass mixin?
	 * @param {object} target
	 * @param {object} source
	 * @param @optional {boolean} loose Skip properties already declared
	 * @returns {object}
	 */
	extend: function(target, source, loose) {
		var hiding = this._hiding;
		if (gui.Type.isObject(source)) {
			Object.keys(source).forEach(function(key) {
				if (!loose || !gui.Type.isDefined(target[key])) {
					var desc = Object.getOwnPropertyDescriptor(source, key);
					desc = hiding ? gui.Object._hide(desc) : desc;
					Object.defineProperty(target, key, desc);
				}
			}, this);
		} else {
			throw new TypeError('Expected object, got ' + gui.Type.of(source));
		}
		return target;
	},

	/**
	 * Extend target with source properties,
	 * skipping everything already declared.
	 * @param {object} target
	 * @param {object} source
	 * @returns {object}
	 */
	extendmissing: function(target, source) {
		return this.extend(target, source, true);
	},

	/**
	 * Copy object.
	 * @returns {object}
	 */
	copy: function(source) {
		try {
			return this.extend({}, source);
		} catch (exception) {
			throw new TypeError('Could not object-copy ' + gui.Type.of(source));
		}
	},

	/**
	 * Call function for each own key in object (exluding the prototype stuff)
	 * with key and value as arguments. Returns array of function call results.
	 * Function results that are `undefined` get's filtered out of this list.
	 * @param {object} object
	 * @param {function} func
	 * @param @optional {object} thisp
	 */
	each: function(object, func, thisp) {
		return Object.keys(object)
			.map(function(key) {
				return func.call(thisp, key, object[key]);
			})
			.filter(function(result) {
				return result !== undefined;
			});
	},

	/**
	 * Call function for all properties in object (including prototype stuff)
	 * with key and value as arguments. Returns array of function call results.
	 * @param {object} object
	 * @param {function} func
	 * @param @optional {object} thisp
	 */
	all: function(object, func, thisp) {
		var res = [];
		for (var key in object) {
			res.push(func.call(thisp, key, object[key]));
		}
		return res.filter(function(result) {
			return result !== undefined;
		});
	},

	/**
	 * Create new object by passing all property
	 * names and values through a resolver call.
	 * Eliminate values that map to `undefined`.
	 * @param {object} source
	 * @param {function} domap
	 * @param @optional {object} thisp
	 * @returns {object}
	 */
	map: function(source, domap, thisp) {
		var result = {},
			mapping;
		this.each(source, function(key, value) {
			mapping = domap.call(thisp, key, value);
			if (mapping !== undefined) {
				result[key] = mapping;
			}
		});
		return result;
	},

	/**
	 * Lookup object for string of type "my.ns.Thing" in given context or this window.
	 * @param {String} opath Object path eg. "my.ns.Thing"
	 * @param @optional {Window} context
	 * @returns {object}
	 */
	lookup: function(opath, context) {
		var result,
			struct = context || self;
		if (gui.Type.isString(opath)) {
			if (!opath.includes('.')) {
				result = struct[opath];
			} else {
				var parts = opath.split('.');
				parts.every(function(part) {
					struct = struct[part];
					return gui.Type.isDefined(struct);
				});
				result = struct;
			}
		} else {
			throw new TypeError('Expected string, got ' + gui.Type.of(opath));
		}
		return result;
	},

	/**
	 * Update property of object in given context based on string input.
	 * TODO: Rename "declare"
	 * @param {String} opath Object path eg. "my.ns.Thing.name"
	 * @param {object} value Property value eg. `"Johnson` or"` `[]`
	 * @param @optional {Window|object} context
	 * @returns {object}
	 */
	assert: function(opath, value, context) {
		var prop,
			struct = context || self;
		if (opath.includes('.')) {
			var parts = opath.split('.');
			prop = parts.pop();
			parts.forEach(function(part) {
				struct = struct[part] || (struct[part] = {});
			});
		} else {
			prop = opath;
		}
		if (struct) {
			struct[prop] = value;
		}
		return value;
	},

	/**
	 * List names of invocable methods *including* prototype stuff.
	 * @return {Array<String>}
	 */
	methods: function(object) {
		var name,
			value,
			desc,
			obj = object,
			result = [];
		for (name in object) {
			// make sure that we don't poke any getter type properties...
			while (!(desc = Object.getOwnPropertyDescriptor(obj, name))) {
				obj = Object.getPrototypeOf(obj);
			}
			if (typeof desc.value === 'function') {
				value = object[name];
				if (gui.Type.isMethod(value)) {
					result.push(name);
				}
			}
		}
		return result;
	},

	/**
	 * List names of invocable methods *excluding* prototype stuff.
	 * @return {Array<String>}
	 */
	ownmethods: function(object) {
		var that = this;
		return Object.keys(object)
			.filter(function(key) {
				if (that._isaccessor(object, key)) {
					return false;
				} else {
					return gui.Type.isMethod(object[key]);
				}
			})
			.map(function(key) {
				return key;
			});
	},

	/**
	 * List names of non-method properties *including* prototype stuff.
	 * @return {Array<String>}
	 */
	nonmethods: function(object) {
		var result = [];
		for (var def in object) {
			if (this._isaccessor(object, def)) {
				void 0;
			} else {
				var o = object[def];
				if (!gui.Type.isFunction(o)) {
					result.push(def);
				}
			}
		}
		return result;
	},

	/**
	 * Bind the "this" keyword for all public instance methods.
	 * Stuff descending from the prototype chain is ignored.
	 * TODO: does this belong here?
	 * @param {object} object
	 * @returns {object}
	 */
	bindall: function(object) {
		var methods = Array.prototype.slice.call(arguments).slice(1);
		if (!methods.length) {
			methods = gui.Object.ownmethods(object).filter(function(name) {
				return name[0] !== '_'; // exclude private methods
			});
		}
		methods.forEach(function(name) {
			object[name] = object[name].bind(object);
		});
		return object;
	},

	/**
	 * Sugar for creating non-enumerable function properties (methods).
	 * To be be used in combination with `gui.Object.extend` for effect.
	 * `mymethod : gui.Object.hidden ( function () {})'
	 * @param {function} method
	 * @return {function}
	 */
	hidden: function(method) {
		gui.Object._hiding = true;
		method.$hidden = true;
		return method;
	},

	// Private ...................................................................

	/**
	 * Hiding any methods from inspection?
	 * Otherwise economize a function call.
	 * @see {edb.Object#extend}
	 * @type {boolean}
	 */
	_hiding: false,

	/**
	 * Property is an accessor? In that case, we probably shouldn't access it here.
	 * @param {Object} object
	 * @param {string} key
	 * @returns {boolean}
	 */
	_isaccessor: function(object, key) {
		var desc = Object.getOwnPropertyDescriptor(object, key);
		return !!(desc && (desc.get || desc.set));
	},

	/**
	 * Modify method descriptor to hide from inspection.
	 * Do note that the method may still be called upon.
	 * @param {object} desc
	 * @returns {object}
	 */
	_hide: function(desc) {
		if (desc.value && gui.Type.isFunction(desc.value)) {
			if (desc.value.$hidden && desc.configurable) {
				desc.enumerable = false;
			}
		}
		return desc;
	}
};

/**
 * Working with properties.
 */
gui.Property = {
	/**
	 * Clone properties from source to target.
	 * @param {object} source
	 * @param {object} target
	 * @returns {object}
	 */
	extendall: function(source, target) {
		Object.keys(source).forEach(function(key) {
			this.extend(source, target, key);
		}, this);
		return target;
	},

	/**
	 * Copy property from source to target. Main feature is that it
	 * will be setup to a property accessor (getter/setter) provided:
	 *
	 * 1) The property value is an object
	 * 2) It has (only) one or both properties "getter" and "setter"
	 * 3) These are both functions
	 */
	extend: function(source, target, key) {
		var desc = Object.getOwnPropertyDescriptor(source, key);
		desc = this._accessor(target, key, desc);
		Object.defineProperty(target, key, desc);
		return target;
	},

	/**
	 * Provide sugar for non-enumerable propety descriptors.
	 * Omit "writable" since accessors must not define that.
	 * @param {object} desc
	 * @returns {object}
	 */
	nonenumerable: function(desc) {
		return gui.Object.extendmissing(
			{
				configurable: true,
				enumerable: false
			},
			desc
		);
	},

	/**
	 * Create getter/setter for object assuming enumerable and configurable.
	 * @param {object} object The property owner
	 * @param {string} key The property name
	 * @param {object} def An object with methods "get" and/or "set"
	 * @returns {object}
	 */
	accessor: function(object, key, def) {
		if (this._isaccessor(def)) {
			return Object.defineProperty(object, key, {
				enumerable: true,
				configurable: true,
				get: def.getter || this._NOGETTER,
				set: def.setter || this._NOSETTER
			});
		} else {
			throw new TypeError('Expected getter and/or setter method');
		}
	},

	// Private ...................................................................

	/**
	 * Object is getter-setter definition?
	 * @param {object} obj
	 * @returns {boolean}
	 */
	_isaccessor: function(obj) {
		return Object.keys(obj).every(function(key) {
			var is = false;
			switch (key) {
				case 'getter':
				case 'setter':
					is = gui.Type.isFunction(obj[key]);
					break;
			}
			return is;
		});
	},

	/**
	 * Copy single property to function prototype.
	 * @param {object} proto
	 * @param {String} key
	 * @param {object} desc
	 * @returns {object}
	 */
	_accessor: function(proto, key, desc) {
		var val = desc.value;
		if (gui.Type.isObject(val)) {
			if (val.getter || val.setter) {
				if (this._isactive(val)) {
					desc = this._activeaccessor(proto, key, val);
				}
			}
		}
		return desc;
	},

	/**
	 * Object is getter-setter definition?
	 * @param {object} obj
	 * @returns {boolean}
	 */
	_isactive: function(obj) {
		return Object.keys(obj).every(function(key) {
			var is = false;
			switch (key) {
				case 'getter':
				case 'setter':
					is = gui.Type.isFunction(obj[key]);
					break;
			}
			return is;
		});
	},

	/**
	 * Compute property descriptor for getter-setter
	 * type definition and assign it to the prototype.
	 * @param {object} proto
	 * @param {String} key
	 * @param {object} def
	 * @returns {defect}
	 */
	_activeaccessor: function(proto, key, def) {
		var desc;
		['getter', 'setter'].forEach(function(name, set) {
			while (proto && proto[key] && !gui.Type.isDefined(def[name])) {
				proto = Object.getPrototypeOf(proto);
				desc = Object.getOwnPropertyDescriptor(proto, key);
				if (desc) {
					def[name] = desc[set ? 'set' : 'get'];
				}
			}
		});
		return {
			enumerable: true,
			configurable: true,
			get: def.getter || this._NOGETTER,
			set: def.setter || this._NOSETTER
		};
	},

	/**
	 * Bad getter.
	 */
	_NOGETTER: function() {
		throw new Error('Getting a property that has only a setter');
	},

	/**
	 * Bad setter.
	 */
	_NOSETTER: function() {
		throw new Error('Setting a property that has only a getter');
	}
};

/**
 * Bind the "this" keyword for all public methods.
 */
gui.Object.bindall(gui.Property);

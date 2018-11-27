/**
 * Proxy all the things.
 */
edb.ObjectProxy = (function scoped() {
	/*
	 * Don't trigger object accessors
	 * while scanning them internally.
	 */
	var suspend = false;

	/**
	 * Create observable getter for key.
	 * @param {String} key
	 * @param {function} base
	 * @returns {function}
	 */
	function getter(key, base) {
		return function() {
			var result = base.apply(this);
			if (edb.$accessaware && !suspend) {
				edb.Object.$onaccess(this, key);
			}
			return result;
		};
	}

	/**
	 * Create observable setter for key.
	 * @param {String} key
	 * @param {function} base
	 * @returns {function}
	 */
	function setter(key, base) {
		return function(newval) {
			suspend = true;
			var oldval = this[key];
			base.apply(this, arguments);
			if ((newval = this[key]) !== oldval) {
				// TODO: somehow also check `target` for diff!
				edb.Object.$onchange(this, key, oldval, newval);
			}
			suspend = false;
		};
	}

	/**
	 * Since in this case we are not creating models of simple objects and
	 * arrays, we'll need to *clone* the data so that our state doesn't get
	 * entangled into something that another framework depends upon.
	 * @param {object|array} thing
	 * @returns {object|array}
	 */
	function deepclone(thing) {
		try {
			thing = JSON.parse(JSON.stringify(thing));
		} catch (exception) {
			console.error('Could not parse as JSON', exception.message, thing);
		}
		return thing;
	}

	return {
		// Public ...........................................................

		/**
		 * Simplistic proxy mechanism to dispatch broadcasts on getters and setters.
		 * @param {object} target The object whose properties are being intercepted.
		 * @param {edb.Object|edb.Array} handler The edb.Type instance that
		 *				intercepts the properties
		 */
		approximate: function(target, handler, types) {
			/*
			 * Transfer all methods to the handler.
			 */
			gui.Object.ownmethods(target).forEach(function(key) {
				handler[key] = target[key];
			});

			/*
			 * Clone the first level of properties to make sure we don't entangle the
			 * state of some other system that might still use it for other purposes.
			 * Note that we can't deep clone via JSON parse and stringify because the
			 * next level might still contain *methods* of interest, but that will
			 * again become the first level of any nested Types (so fixed by this).
			 * TODO: We don't need to copy the methods here, so let's not do that ...
			 * TODO: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
			 */
			target = gui.Object.copy(target);

			/*
			 * 1. Objects by default convert to edb.Object
			 * 2. Arrays by default convert to edb.Array
			 * 3. Simple properties get target accessors
			 *
			 * TODO: Setup now proxies array indexes,
			 * unsupport this or re-approximate on changes
			 *
			 * TODO: when resetting array, make sure that
			 * it becomes xx.MyArray (not plain edb.Array)
			 */
			gui.Object.nonmethods(target).forEach(function(key) {
				var desc = Object.getOwnPropertyDescriptor(target, key);
				if (desc.configurable) {
					Object.defineProperty(handler, key, {
						enumerable: desc.enumerable,
						configurable: desc.configurable,
						get: getter(key, function() {
							if (desc.get) {
								return desc.get.call(this);
							} else {
								var inst = types[key];
								if (inst && edb.Type.is(inst)) {
									return inst;
								} else {
									return target[key];
								}
							}
						}),
						set: setter(key, function(value) {
							var Type, type;
							if (desc.set) {
								desc.set.call(this, value);
							} else {
								if ((type = types[key])) {
									if (edb.Type.is(value)) {
										types[key] = value;
									} else {
										if (value === null) {
											types[key] = null; // NOW WE DON't KNOW THE TYPE NEXT TIME!
										} else {
											if (edb.Type.is(type)) {
												Type = type.constructor; // already instantiated
											} else {
												Type = type; // not yet instantiate
											}
											// Type = type.constructor; // TODO: filter function support!
											if (!Type.from) {
												console.error('Bad setup for "' + key + '"');
											}
											types[key] = Type.from(value);
										}
									}
									edb.Object.$onchange(handler, key, type, types[key]);
								} else {
									// TODO: Clean this up :/
									var oldval = target[key];
									Type = handler.constructor;
									var cast = Type.prototype[key];
									switch (
										cast // TODO: filter function support!
									) {
										case Object:
										case Array:
											if (gui.Type.isNull(value) || gui.Type.isComplex(value)) {
												target[key] = deepclone(value); // right?
												if (oldval !== value) {
													// because clone, this is now always true :/
													// not caught by the setter, let's refactor later
													edb.Object.$onchange(handler, key, oldval, value);
												}
											} else {
												throw new TypeError('Expected ' + cast);
											}
											break;
										default:
											target[key] = edb.Type.cast(value);
											break;
									}
								}
							}
						})
					});
				}
			});
		}
	};
})();

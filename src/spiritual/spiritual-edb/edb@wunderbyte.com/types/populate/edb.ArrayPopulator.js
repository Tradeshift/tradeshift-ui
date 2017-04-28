/**
 * Populate `edb.Array` instances in various tricky ways.
 * @using {gui.Type} Type
 */
edb.ArrayPopulator = (function using(Type) {
	/**
	 * Array was declared to contain lists (not objects)?
	 * @param {edb.Array} array
	 * @returns {boolean}
	 */
	function oflist(array) {
		return array.$of && array.$of.prototype.reverse;
	}

	/**
	 * Something is a list?
	 * @param {object} o
	 * @returns {boolean}
	 */
	function islist(o) {
		return Array.isArray(o) || edb.Array.is(o);
	}

	/**
	 * Used in function `guidedconvert`.
	 * @param {Constructor} edbType
	 * @param {Cbject} o
	 * @returns {edb.Type}
	 */
	function constructas(EdbType, o) {
		if (!gui.debug || edb.Type.isConstructor(EdbType)) {
			if (edb.Type.is(o)) {
				if (EdbType.is(o)) {
					return o;
				} else {
					fail(EdbType, o);
				}
			} else {
				return new EdbType(o);
			}
		} else {
			fail('edb.Type', EdbType);
		}
	}

	/**
	 * Used in function `guidedconvert`.
	 * @param {function} filter
	 * @param {object|edb.Type} o
	 * @returns {edb.Type}
	 */
	function filterfrom(filter, o) {
		var t = filter(o);
		if (Type.isConstructor(t)) {
			t = constructas(t, o);
		}
		// else { // if (edb.Type.is(t) || t === null)
		// TODO: Support $of simple object/array here!
		// TODO: At least make sure not `undefined`!
		// t = t;
		// }
		/*
		 else {
			fail(
				'edb.Type constructor or instance',
				gui.Type.of(t),
				'return null for nothing'
			);
		}
		*/
		return t;
	}

	/**
	 * Throw that TypeEror.
	 * @param {string|object} expected
	 * @param {string|object} received
	 * @param @optional {string} message
	 */
	function fail(expected, received, message) {
		throw new TypeError(
			'$of expected ' + expected + ', got ' + received + (message ? ' (' + message + ')' : '')
		);
	}

	/**
	 * Convert via constructor or via filter
	 * function which returns a constructor.
	 * @param {Array} args
	 * @param {edb.Array} array
	 * @returns {Array<edb.Type>}
	 */
	function guidedconvert(args, array) {
		return args.map(function(o) {
			if (o !== undefined) {
				if (Type.isConstructor(array.$of)) {
					o = constructas(array.$of, o);
				} else {
					o = filterfrom(function(x) {
						return array.$of(x);
					}, o);
				}
			}
			return o;
		});
	}

	/**
	 * Objects and arrays automatically converts
	 * to instances of {edb.Object} and {edb.Array}
	 * @param {Array} args
	 * @returns {Array}
	 */
	function autoconvert(args) {
		return args.map(function(o) {
			if (!edb.Type.is(o)) {
				switch (Type.of(o)) {
					case 'object':
						return new edb.Object(o);
					case 'array':
						return new edb.Array(o);
				}
			}
			return o;
		});
	}

	return {
		// Public ...........................................................

		/**
		 * Populate {edb.Array} from constructor arguments. This works like normal
		 * arrays, except for the scenario where 1) the content model of the array
		 * is NOT arrays (ie. not a dimensional array) and 2) the first argument IS
		 * an array OR an {edb.Array} in which case the first members of this list
		 * will populate into the array and the remaining arguments will be ignored.
		 * TODO: read something about http://www.2ality.com/2011/08/spreading.html
		 * @param {edb.Array}
		 * @param {Arguments} args
		 */
		populate: function(array, args) {
			var first = args[0];
			if (first) {
				if (!oflist(array) && islist(first)) {
					args = first;
				}
				Array.prototype.push.apply(array, this.convert(array, args));
			}
		},

		/**
		 * Convert arguments.
		 * @param {edb.Array} array
		 * @param {Arguments|array} args
		 * @returns {Array}
		 */
		convert: function(array, args) {
			args = gui.Array.from(args);
			if (!Type.isNull(array.$of)) {
				if (Type.isFunction(array.$of)) {
					return guidedconvert(args, array);
				} else {
					var type = Type.of(array.$of);
					throw new Error(array + ' cannot be $of ' + type);
				}
			} else {
				return autoconvert(args);
			}
		}
	};
})(gui.Type);

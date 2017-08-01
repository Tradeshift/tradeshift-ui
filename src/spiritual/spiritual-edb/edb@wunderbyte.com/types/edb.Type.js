/**
 * Conceptual superclass for {edb.Object} and {edb.Array}.
 * @using {gui.Combo#chained}
 */
edb.Type = (function using(chained) {
	return gui.Class.create(null, {
		/**
		 * Called after $onconstruct (by `gui.Class` convention).
		 */
		onconstruct: function() {},

		/**
		 * Called before $ondestruct. Cleanup the mess here.
		 */
		ondestruct: function() {},

		/**
		 * Output to context.
		 * @returns {edb.Type}
		 */
		output: chained(function() {
			edb.Output.$output(this);
		}),

		/**
		 * TODO: If this is even possible...
		 * TODO: In which case, also revokeGlobal
		 */
		outputGlobal: chained(function() {
			console.error('Not supported just yet: ' + this + '.outputGlobal()');
		}),

		/**
		 * Revoke output.
		 * TODO: Something similar on constructor (so static).
		 * TODO: Perhaps only on conctructor?
		 * @returns {edb.Type}
		 */
		revoke: chained(function() {
			edb.Output.$revoke(this);
		}),

		/**
		 * Garbage collect now, at least in theory.
		 * TODO: Synchronized types should allow time
		 * to sync this fact before they are destructed.
		 */
		dispose: chained(function() {
			edb.Type.$destruct(this);
		}),

		/**
		 * Serialize to abstract EDB tree. Unlike `toJSON`, this
		 * includes underscore and dollar prefixed properties.
		 * It also features the the object-properties of arrays.
		 * @param @optional {function} filter
		 * @param @optional {String|number} tabs
		 * @returns {String}
		 */
		serializeToString: function(filter, tabs) {
			return new edb.Serializer().serializeToString(this, filter, tabs);
		},

		// Privileged ................................................................

		/**
		 * Synchronization stuff ohoy. Matches the `$instanceid` of a `gui.Class`.
		 * @type {String}
		 */
		$originalid: null,

		/**
		 * Flag destructed so that we don't overkill.
		 * @type {boolean}
		 */
		$destructed: false,

		/**
		 * Called before `onconstruct`.
		 */
		$onconstruct: function() {},

		/**
		 * Called after `ondestruct`.
		 */
		$ondestruct: function() {
			// TODO: This functionality should be provided
			// by the states module (eg. not in the core).
			if (this.constructor.storage) {
				this.persist();
			}
		}
	});
})(gui.Combo.chained);

// Static ......................................................................

edb.Type.mixin(null, null, {
	/**
	 * Something is an instance of {edb.Object} or {edb.Array}?
	 * @param {object} o
	 * @returns {boolean}
	 */
	is: function(o) {
		return edb.Object.is(o) || edb.Array.is(o);
	},

	/**
	 * Something is a Type constructor?
	 * @param {object} o
	 * @returns {boolean}
	 */
	isConstructor: function(o) {
		return (
			gui.Type.isGuiClass(o) &&
			gui.Class.ancestorsAndSelf(o).some(function(C) {
				return C === edb.Object || C === edb.Array;
			})
		);
	},

	/**
	 * Lookup edb.Type constructor for argument (if not already an edb.Type).
	 * TODO: Confirm that it is actually an edb.Type thing...
	 * @param {Window|WorkerGlobalScope} arg
	 * @param {function|string} arg
	 * @returns {function}
	 */
	lookup: function(context, arg) {
		var type = null;
		switch (gui.Type.of(arg)) {
			case 'function':
				type = arg; // TODO: confirm
				break;
			case 'string':
				type = gui.Object.lookup(arg, context);
				break;
			case 'object':
				console.error(this + ': expected edb.Type constructor (not an object)');
				break;
		}
		if (!type) {
			throw new TypeError('The type "' + arg + '" does not exist');
		}
		return type;
	},

	/**
	 * @param {object} value
	 */
	cast: function fix(value) {
		if (gui.Type.isComplex(value) && !edb.Type.is(value)) {
			switch (gui.Type.of(value)) {
				case 'object':
					return edb.Object.from(value);
				case 'array':
					return edb.Array.from(value);
			}
		}
		return value;
	},

	/**
	 * Apply any future mixins to both {edb.Object} and {edb.Array}.
	 * @param {object} proto
	 * @param {object} recurring
	 * @param {object} statics
	 * @returns {edb.Type}
	 */
	mixin: function(protos, xstatics, statics) {
		[edb.Object, edb.Array].forEach(function(Type) {
			Type.mixin(protos, xstatics, statics);
		});
		return this;
	},

	// Privileged ................................................................

	/**
	 * TODO: Use {gui.MapList} !!!!!!!!!!!!!!!
	 * @param {edb.Object|edb.Array} type
	 * @param {edb.IChangeHandler} handler
	 * @returns {edb.Object|edb.Array}
	 */
	$observe: function(type, handler) {
		var id = type.$instanceid;
		var obs = this._observers;
		var handlers = obs[id] || (obs[id] = []);
		if (handlers.indexOf(handler) === -1) {
			handlers.push(handler);
		}
		return type;
	},

	/**
	 * @param {edb.Object|edb.Array} type
	 * @param {edb.IChangeHandler} handler
	 * @returns {edb.Object|edb.Array}
	 */
	$unobserve: function(type, handler) {
		var id = type.$instanceid;
		var obs = this._observers;
		var index,
			handlers = obs[id];
		if (handlers) {
			if ((index = handlers.indexOf(handler)) > -1) {
				if (gui.Array.remove(handlers, index) === 0) {
					delete obs[id];
				}
			}
		}
		return type;
	},

	/**
	 * Called by {edb.Output} when the output context shuts down
	 * (when the window unloads or the web worker is terminated).
	 */
	$destruct: function(type) {
		new edb.Crawler().crawl(type, {
			ontype: function(t) {
				if (!t.$destructed) {
					type.ondestruct();
					type.$ondestruct();
					type.$destructed = true;
					if (!gui.unloading) {
						gui.Garbage.$nukeallofit(type); // TODO: via `collect` when possible
					}
				}
			}
		});
	}
});

// Mixins ......................................................................

/**
 * Setup mixins for {edb.Object} and {edb.Array}.
 * @using {gui.Arguments.confirmed}
 */
(function using(confirmed) {
	var iomixins = {
		// input-output methods

		/**
		 * Instance of this Type has been output (in public context)?
		 * @returns {boolean}
		 */
		isOutput: function() {
			return edb.Output.$is(this);
		},

		/**
		 * @deprecated
		 */
		getOutput: function() {
			console.error('Deprecated API is deprecated: getOutput()');
		},

		/**
		 * @deprecated
		 */
		revokeOutput: function() {
			console.error('Deprecated API is deprecated: revokeOutput()');
		}
	};

	var spassermixins = {
		/**
		 * Create *new* instance from argument of fuzzy type.
		 * All nested models will also be instanced as *new*.
		 * @param {String|object|Array|edb.Object|edb.Array} json
		 * @return {edb.Object|edb.Array}
		 */
		from: gui.Arguments.confirmed('(string|object|array|null)')(function(json) {
			var Type = this;
			if (json) {
				if (edb.Type.is(json)) {
					json = new edb.Serializer().serializeToString(json);
				}
				if (gui.Type.isString(json)) {
					if (json.includes('$object') || json.includes('$array')) {
						json = new edb.Parser().parseFromString(json, null);
					}
				}
			}
			return new Type(json); // TODO: should `null` even do this?
		}),

		/**
		 * Create the `Type.output` object along with the Type.
		 * @overrides {gui.Class#extend}
		 */
		extend: function() {
			var C = gui.Class.extend.apply(this, arguments);
			C.output = new edb.Output(C); // TODO: make readonly!
			return C;
		}
	};

	/**
	 * Declare the fields on edb.Type.
	 */
	[iomixins, spassermixins].forEach(function(mixins) {
		gui.Object.each(mixins, function mixin(key, value) {
			edb.Type[key] = value;
		});
	});

	/**
	 * Create one-liner for mixin to subclass constructors recurring static fields.
	 * @returns {Map<String,String|function>}
	 */
	edb.Type.$staticmixins = function() {
		var mixins = {};
		[iomixins, spassermixins].forEach(function(set) {
			Object.keys(set).forEach(function(key) {
				mixins[key] = set[key];
			}, this);
		}, this);
		return mixins;
	};
})(gui.Arguments.confirmed);

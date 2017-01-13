(function(window) {
	'use strict';

/*
 * Namepace object.
 * @using {gui.Arguments.confirmed}
 */
	window.edb = gui.namespace('edb', (function using(confirmed) {
		return {

		/**
		 * Current version (injected during build process).
		 * @see https://www.npmjs.org/package/grunt-spiritual-build
		 * @type {string} (majorversion.minorversion.patchversion)
		 */
			version: '-1.0.0',

		/**
		 * Logging some debug messages? This can be flipped via meta tag:
		 * `<meta name="edb.debug" content="true"/>`
		 * @type {boolean}
		 */
			debug: false,

		/**
		 * While true, any inspection of an {edb.Objects} or {edb.Arrays}
		 * will be be followed by a synchronous broadcast message (below).
		 * @type {object}
		 */
			$accessaware: false,

		/**
		 * Broadcasts.
		 */
			BROADCAST_ACCESS: 'edb-broadcast-access',
			BROADCAST_CHANGE: 'edb-broadcast-change',
			BROADCAST_OUTPUT: 'edb-broadcast-output',
			BROADCAST_SCRIPT_INVOKE: 'edb-broadcast-script-invoke',

		/**
		 * Ticks.
		 */
			TICK_SCRIPT_UPDATE: 'edb-tick-script-update',
			TICK_COLLECT_INPUT: 'edb-tick-collect-input',
			TICK_PUBLISH_CHANGES: 'edb-tick-update-changes',

		/**
		 * @deprecated
		 */
			get: function() {
				console.error('Deprecated API is deprecated: edb.get()');
			}

		};
	}(gui.Arguments.confirmed)));

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
	}(gui.Combo.chained));

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
			return gui.Type.isGuiClass(o) &&
			gui.Class.ancestorsAndSelf(o).some(function(C) {
				return C === edb.Object || C === edb.Array;
			});
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
			var index, handlers = obs[id];
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
		var iomixins = { // input-output methods

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
		 * Create new instance from argument of fuzzy type.
		 * @param {String|object|Array|edb.Object|edb.Array} json
		 * @return {edb.Object|edb.Array}
		 */
			from: gui.Arguments.confirmed('(string|object|array|null)')(
			function(json) {
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
				return new Type(json);
			}
		),

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
	}(gui.Arguments.confirmed));

/**
 * edb.Object
 * @extends {edb.Type} at least in principle.
 * @using {gui.Arguments#confirmed}
 * @using {gui.Combo#chained}
 */
	edb.Object = (function using(confirmed, chained) {
		return gui.Class.create(Object.prototype, {

		/**
		 * Observe object.
		 * @param @optional {IChangeHandler} handler
		 * @returns {edb.Object}
		 */
			addObserver: confirmed('object|function')(chained(function(handler) {
				edb.Object.observe(this, handler);
			})),

		/**
		 * Unobserve object.
		 * @param @optional {IChangeHandler} handler
		 * @returns {edb.Object}
		 */
			removeObserver: confirmed('object|function')(chained(function(handler) {
				edb.Object.unobserve(this, handler);
			})),

		// Privileged ..............................................................

		/**
		 * Constructor.
		 * @overrides {edb.Type#onconstruct}
		 */
			$onconstruct: function(json) {
				edb.Type.prototype.$onconstruct.apply(this, arguments);
				switch (gui.Type.of(json)) {
					case 'object':
					case 'undefined':
					case 'null':
						var proxy = gui.Object.copy(json || {});
						var types = edb.ObjectPopulator.populate(proxy, this);
						edb.ObjectProxy.approximate(proxy, this, types);
						break;
					default:
						throw new TypeError(
						'Unexpected edb.Object constructor argument of type ' +
						gui.Type.of(json) + ': ' + String(json)
					);
				}
				this.onconstruct();
				if (this.oninit) {
					console.error('Deprecated API is deprecated: ' + this + '.oninit');
				}
			},

		/**
		 * Create clone of this object filtering out
		 * underscore and dollar prefixed properties.
		 * Recursively normalizing nested EDB types.
		 * TODO: WHITELIST stuff that *was* in JSON!
		 * TODO: Something about recursive structure...
		 * @returns {object}
		 */
			toJSON: function() {
				return gui.Object.map(this, function(key, value) {
					var c = key.charAt(0);
					if (c !== '$' && c !== '_') {
						if (edb.Type.is(value)) {
							return value.toJSON();
						}
						return value;
					}
				});
			}

		});
	}(gui.Arguments.confirmed, gui.Combo.chained));

/**
 * Mixin static methods. Recurring static members mixed in from {edb.Type}.
 */
	edb.Object.mixin(null, edb.Type.$staticmixins(), {

	/**
	 * Observe.
	 */
		observe: edb.Type.$observe,

	/**
	 * Unobserve.
	 */
		unobserve: edb.Type.$unobserve,

	/**
	 * Publishing change summaries async.
	 * TODO: clean this up...
	 * TODO: move to edb.Type (edb.Type.observe)
	 * @param {gui.Tick} tick
	 */
		ontick: function(tick) {
			var snapshot, changes, handlers, observers = this._observers;
			if (tick.type === edb.TICK_PUBLISH_CHANGES) {
				snapshot = gui.Object.copy(this._changes);
				this._changes = Object.create(null);
				gui.Object.each(snapshot, function(instanceid, propdef) {
					if ((handlers = observers[instanceid])) {
						changes = [];
						gui.Object.each(snapshot, function(id, props) {
							if (id === instanceid) {
								gui.Object.each(props, function(name, change) {
									changes.push(change);
								});
							}
						});
						handlers.forEach(function(handler) {
							handler.onchange(changes);
						});
					}
				});
			}
		},

	// Privileged static .........................................................

	/**
	 * Publish a notification on property accessors.
	 * This should be relevant during script render.
	 */
		$onaccess: function(object, name) {
			if (edb.$accessaware) {
				gui.Broadcast.dispatch(edb.BROADCAST_ACCESS, [
					object, name
				]);
			}
		},

	/**
	 * Register change summary for publication (in next tick).
	 * @param {edb.Object} object
	 * @param {String} name
	 * @param {object} oldval
	 * @param {object} newval
	 */
		$onchange: function(object, name, oldval, newval) {
			if (oldval !== newval) {
				var type = edb.ObjectChange.TYPE_UPDATE;
				var all = this._changes, id = object.$instanceid;
				var set = all[id] = all[id] || (all[id] = Object.create(null));
				set[name] = new edb.ObjectChange(object, name, type, oldval, newval);
				gui.Tick.dispatch(edb.TICK_PUBLISH_CHANGES);
			}
		},

	// Private static ............................................................

	/**
	 * Mapping instanceids to lists of observers.
	 * @type {Map<String,Array<edb.IChangeHandler>>}
	 */
		_observers: Object.create(null),

	/**
	 * Mapping instanceids to lists of changes.
	 * @type {Map<String,Array<edb.ObjectChange>>}
	 */
		_changes: Object.create(null)

	});

/*
 * Mixin methods and properties common to both {edb.Object} and {edb.Array}
 */
	(function setup() {
		gui.Tick.add(edb.TICK_PUBLISH_CHANGES, edb.Object);
		gui.Object.extendmissing(edb.Object.prototype, edb.Type.prototype);
	}());

/**
 * @using {Array.prototype}
 * @using {gui.Combo#chained}
 */
	(function using(proto, chained) {
	/**
	 * edb.Array
	 * @extends {edb.Type} (although not really)
	 */
		edb.Array = gui.Class.create(proto, {

		/**
		 * Push.
		 */
			push: function() {
				var idx = this.length;
				var add = convert(this, arguments);
				var res = proto.push.apply(this, add);
				if (observes(this)) {
					onchange(this, idx, null, add);
				}
				return res;
			},

		/**
		 * Pop.
		 */
			pop: function() {
				var idx = this.length - 1;
				var res = proto.pop.apply(this);
				if (observes(this) && idx >= 0) {
					onchange(this, idx, [res], null);
				}
				return res;
			},

		/**
		 * Shift.
		 */
			shift: function() {
				var res = proto.shift.apply(this);
				if (observes(this)) {
					onchange(this, 0, [res], null);
				}
				return res;
			},

		/**
		 * Unshift.
		 */
			unshift: function() {
				var add = convert(this, arguments);
				var res = proto.unshift.apply(this, add);
				if (observes(this)) {
					onchange(this, 0, null, add);
				}
				return res;
			},

		/**
		 * Splice.
		 */
			splice: function() {
				var arg = arguments;
				var idx = arg[0];
				var add = convert(this, [].slice.call(arg, 2));
				var fix = [idx, arg[1]].concat(add);
				var out = proto.splice.apply(this, fix);
				if (observes(this)) {
					onchange(this, idx, out, add);
				}
				return out;
			},

		/**
		 * Reverse.
		 */
			reverse: function() {
				if (observes(this)) {
					var out = this.toJSON();
					var add = proto.reverse.apply(out.slice());
					onchange(this, 0, out, add);
				}
				return proto.reverse.apply(this);
			},

		// Expandos ................................................................

		/**
		 * Just to illustrate that arrays may conveniently get their
		 * content assigned to some variable via the constructor arg.
		 * @param {Array<object>} members (edb.Types all newed up here)
		 */
			onconstruct: function(members) {},

		/**
		 * Observe array (both object properties and list mutations).
		 * @param @optional {IChangeHandler} handler
		 * @returns {edb.Array}
		 */
			addObserver: chained(function(handler) {
				edb.Object.observe(this, handler);
				edb.Array.observe(this, handler);
			}),

		/**
		 * Unobserve array.
		 * @param @optional {IChangeHandler} handler
		 * @returns {edb.Array}
		 */
			removeObserver: chained(function(handler) {
				edb.Object.unobserve(this, handler);
				edb.Array.unobserve(this, handler);
			}),

		/**
		 * The content type can be declared as:
		 *
		 * 1. An edb.Type constructor function (my.ns.MyType)
		 * 2. A filter function to accept JSON (for analysis)
		 *		and return an edb.Type constructor OR instance
		 * @type {function} Type constructor or filter function
		 */
			$of: null,

		/**
		 * Constructor.
		 * @overrides {edb.Type#onconstruct}
		 */
			$onconstruct: function() {
				var object, types;
				edb.Type.prototype.$onconstruct.apply(this, arguments);
				if (arguments.length) {
					object = arguments[0] ? arguments[0].$object || {} : {};
					types = edb.ObjectPopulator.populate(object, this);
					edb.ArrayPopulator.populate(this, arguments);
					edb.ObjectProxy.approximate(object, this, types);
				}
				this.onconstruct([].slice.call(this));
			},

		/**
		 * Get element at index. Use this in EDBML scripts instead of [length]
		 * notation, otherwise the template will not watch this array for changes!
		 * @param {number} index
		 * @returns {object}
		 */
			get: function(index) {
				if (edb.$accessaware) {
					edb.Array.$onaccess(this, index);
				}
				return this[index];
			},

		/**
		 * Get length. Use this in EDBML scripts instead of 'length',
		 * otherwise the template will not watch this array for changes!
		 * @returns {number}
		 */
			getLength: function(index) {
				if (edb.$accessaware) {
					edb.Array.$onaccess(this, index);
				}
				return this.length;
			},

		/*
		 * Stunt accessor for setting the `length`
		 * until proxies come to save us all.
		 * @type {number}
		 */
			setLength: function(length) {
				var out = [];
				while (this.length > length) {
					out.push(this.pop());
				}
				if (out.length) {
					onchange(this, this.length - 1, out);
				}
			},

		/**
		 * Create true array without expando properties, recursively
		 * normalizing nested EDB types. Returns the type of array we
		 * would typically transmit back to the server or something.
		 * @returns {Array}
		 */
			toJSON: function() {
				return Array.map(this, function(thing) {
					if (edb.Type.is(thing)) {
						return thing.toJSON();
					}
					return thing;
				});
			}

		});

	// Helpers ...................................................................

	/**
	 * Convert arguments.
	 * @param {edb.Array} array
	 * @param {Arguments} args
	 * @returns {Array}
	 */
		function convert(array, args) {
			return edb.ArrayPopulator.convert(array, args);
		}

	/**
	 * Shorthand.
	 * @param {edb.Array} array
	 * @param {number} index
	 * @param {Array} removed
	 * @param {Array} added
	 */
		function onchange(array, index, removed, added) {
			edb.Array.$onchange(array, index, removed, added);
		}

	/**
	 * Array is being observed?
	 * @param {edb.Array} array
	 * @returns {boolean}
	 */
		function observes(array) {
			var key = array.$instanceid;
			return !!edb.Array._observers[key];
		}
	}(Array.prototype, gui.Combo.chained));

/**
 * Mixin static methods. Recurring static members mixed in from {edb.Type}.
 */
	edb.Array.mixin(null, edb.Type.$staticmixins(), {

	/**
	 * Observe.
	 */
		observe: edb.Type.$observe,

	/**
	 * Unobserve.
	 */
		unobserve: edb.Type.$unobserve,

	/**
	 * Something is a subclass constructor of {edb.Array}?
	 * TODO: let's generalize this facility in {gui.Class}
	 */
		isConstructor: function(o) {
			return gui.Type.isConstructor(o) &&
			gui.Class.ancestorsAndSelf(o).indexOf(edb.Array) > -1;
		},

	/**
	 * Publishing change summaries async.
	 * @param {gui.Tick} tick
	 */
		ontick: function(tick) {
			var snapshot, handlers, observers = this._observers;
			if (tick.type === edb.TICK_PUBLISH_CHANGES) {
				snapshot = gui.Object.copy(this._changes);
				this._changes = Object.create(null);
				gui.Object.each(snapshot, function(instanceid, changes) {
					if ((handlers = observers[instanceid])) {
						handlers.forEach(function(handler) {
							handler.onchange(changes);
						});
					}
				});
			}
		},

	// Private static ............................................................

	/**
	 * Mapping instanceids to lists of observers.
	 * @type {Map<String,Array<edb.IChangeHandler>>}
	 */
		_observers: Object.create(null),

	/**
	 * Mapping instanceids to lists of changes.
	 * @type {Map<String,Array<edb.ArrayChange>>}
	 */
		_changes: Object.create(null),

	// Privileged static .........................................................

	/**
	 * TODO.
	 * @param {edb.Array} array
	 * @param {number} index
	 */
		$onaccess: function(array, index) {
			if (edb.$accessaware) {
				gui.Broadcast.dispatch(edb.BROADCAST_ACCESS, [array]);
			}
		},

	/**
	 * Register change summary for publication in next tick.
	 * TODO: http://stackoverflow.com/questions/11919065/sort-an-array-by-the-levenshtein-distance-with-best-performance-in-javascript
	 * @param {edb.Array} array
	 * @param {number} index
	 * @param {Array} removed
	 * @param {Array} added
	 */
		$onchange: function(array, index, removed, added) {
			var key = array.$instanceid;
			var all = this._changes;
			var set = all[key] || (all[key] = []);
			set.push(new edb.ArrayChange(array, index, removed, added));
			gui.Tick.dispatch(edb.TICK_PUBLISH_CHANGES);
		}

	});

/*
 * Overloading array methods.
 * @using {edb.Array.prototype}
 */
	(function using(proto) {
	/*
	 * Dispatch a getter broadcast before base function.
	 */
		var beforeaccess = gui.Combo.before(function() {
			if (edb.$accessaware) {
				edb.Array.$onaccess(this, -1);
			}
		});

	/**
	 * Decorate getter methods on prototype.
	 * @param {object} proto Prototype to decorate
	 * @param {Array<String>} methods List of method names
	 * @returns {object}
	 */
		function decorateAccess(proto, methods) {
			methods.forEach(function(method) {
				proto[method] = beforeaccess(proto[method]);
			});
		}

	/*
	 * Dispatch a broadcast whenever the list is inspected or traversed.
	 */
		decorateAccess(proto, [
			'filter',
			'forEach',
			'every',
			'map',
			'some',
			'indexOf',
			'lastIndexOf',
			'slice' // hm,
		// TODO: REDUCE!
		]);
	}(edb.Array.prototype));

/*
 * Mixin methods and properties common
 * to both {edb.Object} and {edb.Array}
 */
	(function setup() {
		gui.Tick.add(edb.TICK_PUBLISH_CHANGES, edb.Array);
		gui.Object.extendmissing(edb.Array.prototype, edb.Type.prototype);
	}());

// BACKUP ......................................................................

/**
 * Dispatch a setter broadcast after base
 * function by decorating setter methods on prototype.
 * @param {object} proto Prototype to decorate
 * @param {Array<String>} methods List of method names
 * @returns {object}
 *
var afterchange = gui.Combo.after ( function () {});
function decorateChange ( proto, methods ) {
	methods.forEach ( function ( method ) {
		proto [ method ] = afterchange ( proto [ method ]);
	});
}

// Dispatch a broadcast whenever the list changes content or structure.
decorateChange ( proto, [
	"push", // add
	"unshift", // add
	"splice", // add or remove
	"slice", // remove
	"pop", // remove
	"shift", // remove
	"reverse" // reversed (copies???????)
]);
*/

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
				if (isregular(key) && classes.every(function(o) {
					return o.prototype[key] === undefined;
				})) {
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
				Object.defineProperty(type, '$originalid', gui.Property.nonenumerable({
					value: id
				}));
			}
		}

	/**
	 * Fail me once.
	 * @param {String} name
	 * @param {String} key
	 */
		function faildefined(name, key) {
			throw new TypeError(
			name + ' declares "' + key + '" as something undefined'
		);
		}

	/**
	 * Fail me twice.
	 * @param {String} name
	 * @param {String} key
	 */
		function failconstructor(name, key) {
			throw new TypeError(
			name + ' "' + key + '" must resolve to a constructor'
		);
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

		return { // Public ...............................................................

		/**
		 * Populate object properties of type instance.
		 * @param {object} json
		 * @param {edb.Object|edb.Array} type
		 * @return {Map<String,edb.Object|edb.Array>} types
		 */
			populate: function(json, type) {
				var Def, def, val, desc, types = Object.create(null);
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
							type[key] = {};
							pure.push(key);
							break;
						case Array:
							if (val && Array.isArray(val)) {
								type[key] = val.slice();
							} else {
								type[key] = [];
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
								/*
								 * TODO: cleanup something here
								 */
									if (edb.Array.isConstructor(def)) {
										json[key] = [];
									} else {
										json[key] = null; // TODO: stay null somehow...
									}
									Def = def;
									types[key] = Def.from(json[key]);
								} else {
									if ((desc = lookupDescriptor(base, key))) {
										Object.defineProperty(json, key, desc);
									}
								}
							}
							break;
					}
				});
				gui.Object.nonmethods(json).filter(function(key) {
					return pure.indexOf(key) === -1;
				}).forEach(function(key) {
					var def = json[key];
					if (isregular(key) && gui.Type.isComplex(def)) {
						if (!types[key]) {
							types[key] = edb.Type.cast(def);
						}
					}
				});
				return types;
			}
		};
	})(
	gui.Type.isDefined,
	gui.Type.isComplex,
	gui.Type.isFunction,
	gui.Type.isConstructor
);

/**
 * Populate `edb.Array` instances in various tricky ways.
 */
	edb.ArrayPopulator = (function() {
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
	 * @param {constructor} Type
	 * @param {object} o
	 * @returns {edb.Type}
	 */
		function constructas(Type, o) {
			if (!gui.debug || edb.Type.isConstructor(Type)) {
				if (edb.Type.is(o)) {
					if (Type.is(o)) {
						return o;
					} else {
						fail(Type, o);
					}
				} else {
					return new Type(o);
				}
			} else {
				fail('edb.Type', Type);
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
			if (gui.Type.isConstructor(t)) {
				t = constructas(t, o);
			} else if (edb.Type.is(t) || t === null) {
				t = t;
			} else {
				fail(
				'edb.Type constructor or instance',
				gui.Type.of(t),
				'return null for nothing'
			);
			}
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
			'$of expected ' + expected + ', got ' + received +
			(message ? ' (' + message + ')' : '')
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
					if (gui.Type.isConstructor(array.$of)) {
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
					switch (gui.Type.of(o)) {
						case 'object':
							return new edb.Object(o);
						case 'array':
							return new edb.Array(o);
					}
				}
				return o;
			});
		}

		return { // Public ...........................................................

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
					Array.prototype.push.apply(array,
					this.convert(array, args)
				);
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
				if (!gui.Type.isNull(array.$of)) {
					if (gui.Type.isFunction(array.$of)) {
						return guidedconvert(args, array);
					} else {
						var type = gui.Type.of(array.$of);
						throw new Error(array + ' cannot be $of ' + type);
					}
				} else {
					return autoconvert(args);
				}
			}

		};
	}());

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
				if ((newval = this[key]) !== oldval) { // TODO: somehow also check `target` for diff!
					edb.Object.$onchange(this, key, oldval, newval);
				}
				suspend = false;
			};
		}

		return { // Public ...........................................................

		/**
		 * Simplistic proxy mechanism to dispatch broadcasts on getters and setters.
		 * @param {object} target The object whose properties are being intercepted.
		 * @param {edb.Object|edb.Array} handler The edb.Type instance that
		 *				intercepts the properties
		 */
			approximate: function(target, handler, types) {
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
									return types[key] || target[key];
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
											Type = type.constructor; // TODO: filter function support!
											types[key] = Type.from(value);
										}
									} else { // TODO: Clean this up :/
										var oldval = target[key];
										Type = handler.constructor;
										var cast = Type.prototype[key];
										switch (cast) { // TODO: filter function support!
											case Object:
											case Array:
												if (gui.Type.isNull(value) || gui.Type.isComplex(value)) {
													target[key] = value; // right?
													if (oldval !== value) {
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
				gui.Object.ownmethods(target).forEach(function(key) {
					handler[key] = target[key];
				});
			}
		};
	}());

/**
 * Micro change summary.
 */
	edb.Change = function() {};
	edb.Change.prototype = {

	/**
	 * Type that changed.
	 * @type {edb.Object|edb.Array}
	 */
		object: null,

	/**
	 * Update type.
	 * @type {String}
	 */
		type: null
	};

/**
 * edb.Object change summary.
 * @extends {edb.Change}
 * @param {edb.Object} object
 * @param {String} name
 * @param {String} type
 * @param {object} oldval
 * @param {object} newval
 */
	edb.ObjectChange = function(object, name, type, oldval, newval) {
		this.object = object;
		this.name = name;
		this.type = type;
		this.oldValue = oldval;
		this.newValue = newval;
	};

	edb.ObjectChange.prototype = gui.Object.create(edb.Change.prototype, {
		name: null,
		oldValue: undefined,
		newValue: undefined
	});

/**
 * We only support type "updated" until
 * native 'Object.observe' comes along.
 * @type {String}
 */
	edb.ObjectChange.TYPE_UPDATE = 'update';

/**
 * @see http://wiki.ecmascript.org/doku.php?id=harmony:observe#array.observe
 * @param {edb.Array} array
 */
	edb.ArrayChange = function(array, index, removed, added) {
		this.type = edb.ArrayChange.TYPE_SPLICE; // hardcoded for now
		this.object = array;
		this.index = index;
		this.removed = removed || [];
		this.added = added || [];
	};

	edb.ArrayChange.prototype = gui.Object.create(edb.Change.prototype, {

	/**
	 * Index of change.
	 * @type {}
	 */
		index: -1,

	/**
	 * List removed members.
	 * TODO: What should happen to them?
	 * @type {Array}
	 */
		removed: null,

	/**
	 * List added members.
	 * @type {Array}
	 */
		added: null

	});

/*
 * Update types. We'll stick to `splice` for now.
 */
	edb.ArrayChange.TYPE_SPLICE = 'splice';

/**
 * Given a `splice` change, compute the arguments required
 * to cause or reproduce the change using `array.splice()`.
 * @see http://mdn.io/splice
 */
	edb.ArrayChange.toSpliceParams = function(change) {
		if (change.type === edb.ArrayChange.TYPE_SPLICE) {
			var idx = change.index;
			var out = change.removed.length;
			var add = change.added;
			return [idx, out].concat(add);
		} else {
			throw new TypeError();
		}
	};

/**
 * Transmitting output to connected listeners.
 * @see {edb.Input} for related stuff
 * @using {gui.Combo.chained} chained
 */
	edb.Output = (function using(chained) {
		return gui.Class.create({

		/**
		 * Get (latest) output of Type.
		 * @returns {edb.Type}
		 */
			get: function() {
				var input = edb.Output.$get(this._type);
				return input ? input.data : null;
			},

		/**
		 * Revoke output of Type.
		 * @param {object} listener
		 * @returns {edb.Output}
		 */
			revoke: chained(function() {
				edb.Output.$revoke(this._type);
			}),

		/**
		 * Add output listener.
		 * @param {object} listener
		 * @returns {edb.Output}
		 */
			connect: chained(function(handler) {
				edb.Input.$connect(this._type, handler);
			}),

		/**
		 * Remove output listener.
		 * @param {object} listener
		 * @returns {edb.Output}
		 */
			disconnect: chained(function(handler) {
				edb.Input.$disconnect(this._type, handler);
			}),

		// Private .................................................................

		/**
		 * The Type we're dealing with here.
		 * @type {constuctor}
		 */
			_type: null,

		// Privileged ..............................................................

		/**
		 * Remember the type.
		 * @param {constructor} Type
		 */
			$onconstruct: function(Type) {
				this._type = Type;
			},

		// Deprecated ..............................................................

			add: function() {
				return this.connect.apply(this, arguments);
			},

			remove: function() {
				return this.disconnect.apply(this, arguments);
			}

		}, {}, { // Static privileged ................................................

		/**
		 * Output Type instance.
		 * @returns {constructor}
		 */
			$output: chained(function(type) {
				var input = this._makeinput(type.constructor, type);
				gui.Broadcast.dispatch(edb.BROADCAST_OUTPUT, input);
			// TODO: if and how to nuke existing output?
			}),

		/**
		 * Revoke type from output. Any subscribers to input of this type
		 * will now recieve an {edb.Input} with `null` as the data value.
		 * @param {constructor|edb.Type} type Accept instance or constructor
		 * @returns {constructor} (this constructor, not that constructor)
		 */
			$revoke: chained(function(type) {
				var Type = edb.Type.is(type) ? type.constructor : type;
				var nullinput = this._makeinput(Type, null);
				gui.Broadcast.dispatch(edb.BROADCAST_OUTPUT, nullinput);
				delete this._map[Type.$classid];
			// TODO: edb.Type.$destruct(type); // think about this...
			}),

		/**
		 * Instance of given Type has been output in public context?
		 * @param {constructor} Type
		 * @returns {boolean}
		 */
			$is: function(Type) {
				if (Type) {
					if (this._map) {
						var classid = Type.$classid;
						var typeobj = this._map[classid];
						return !!typeobj;
					}
					return false;
				} else {
					throw new TypeError('No such Type');
				}
			},

		/**
		 * Get output of given type. Note that this returns an {edb.Input}.
		 * @param {constructor} Type
		 * @returns {edb.Input}
		 */
			$get: function(Type) {
				if (Type) {
					if (this._map) {
						var classid = Type.$classid;
						var typeobj = this._map[classid];
						return typeobj ? new edb.Input(typeobj.constructor, typeobj) : null;
					} else {
						return null;
					}
				} else {
					throw new TypeError('No such Type');
				}
			},

		// Static private ..........................................................

		/**
		 * Mapping Type classname to Type instance.
		 * @type {Map<String,edb.Object|edb.Array>}
		 */
			_map: {},

		/**
		 * Configure Type instance for output.
		 * @param {function} Type constructor
		 * @param {edb.Object|edb.Array} type instance
		 * @returns {edb.Input}
		 */
			_makeinput: function(Type, type) {
				var classid = Type.$classid;
				this._map[classid] = type;
				return new edb.Input(Type, type);
			}

		});
	}(gui.Combo.chained));

/**
 * Connecting listeners to output transmissions.
 * @see {edb.Output} for related stuff
 * @using {gui.Combo#chained} chained
 * @using {gui.Combo#memoized} memoized
 * @using {gui.Interface} Interface
 * @using {gui.Type} GuiType
 * @using {gui.Class} GuiType
 */
	edb.Input = (function using(chained, memoized, Interface, GuiType, GuiClass) {
	/**
	 * Tracking input handlers (equivalent to "output listeners").
	 * @using {gui.MapList<string,Array<edb.Input.IInputHandler>>} handlers
	 */
		var handlers = new gui.MapList();

		return gui.Class.create({

		/**
		 * Input Type (function constructor)
		 * @type {function}
		 */
			type: null,

		/**
		 * Input instance (instance of this.Type)
		 * @type {object|edb.Type} data
		 */
			data: null,

		/**
		 * Mark as revoked.
		 * @type {boolean}
		 */
			revoked: false,

		/**
		 * Construction time again.
		 * @param {constructor} Type
		 * @param {edb.Object|edb.Array} type
		 */
			onconstruct: function(Type, type) {
				if (edb.Type.is(type) || type === null) {
					this.type = Type;
					this.data = type;
				} else {
					throw new TypeError(type + ' is not a Type instance');
				}
			}

		}, {}, { // Static ...........................................................

		/**
		 * Input handler interface.
		 */
			IInputHandler: {
				oninput: function(i) {},
				toString: function() {
					return '[interface InputHandler]';
				}
			},

		// Privileged static .......................................................

		/**
		 * Add input handler for Type(s).
		 * @param {constructor|Array<constructor>} Types
		 * @param {IInputHandler} handler
		 */
			$connect: chained(function(Types, handler) {
				Types = this.$breakdown(Types);
				if (Interface.validate(this.IInputHandler, handler)) {
					if (Types.every(this._check)) {
						this._add(Types, handler);
					}
				}
			}),

		/**
		 * Remove input handler for Type(s).
		 * @param {constructor|Array<constructor>} Types
		 * @param {IInputHandler} handler
		 */
			$disconnect: chained(function(Types, handler) {
				Types = this.$breakdown(Types);
				if (Interface.validate(this.IInputHandler, handler)) {
					if (Types.every(this._check)) {
						this._remove(Types, handler);
					}
				}
				return Types;
			}),

		/**
		 * Breakdown complicated argument into an
		 * array of one or more type constructors.
		 * @param {object} arg
		 * @returns {constructor|Array<constructor>|string|object}
		 */
			$breakdown: function(arg) {
				if (GuiType.isArray(arg)) {
					return this._breakarray(arg);
				} else {
					return this._breakother(arg);
				}
			},

		/**
		 * Handle output.
		 * @param {edb.Input} input
		 */
			$onoutput: function(input) {
				var Type, type = input.data;
				if (type === null) {
				// TODO: Figure out what to do with revoked output :/
				} else {
					handlers.each(function(classid, list) {
						Type = GuiClass.get(classid);
						if (type instanceof Type) {
							list.slice().forEach(function(handler) {
								handler.oninput(input);
							});
						}
					});
				}
			},

		/**
		 * Lookup identical or ancestor/descandant constructor.
		 * This will come in handy for the {edb.InputPlugin}.
		 * @param {constructor} target type constructor
		 * @param {Array<constructor>} types type constructors
		 * @param {boolean} up Lookup ancestor?
		 * @returns {constructor} edb.Type class
		 */
			$bestmatch: function(target, types, up) {
				return this._bestmatch(target.$classid, types.map(function(type) {
					return type.$classid;
				}), up);
			},

		/**
		 * Rate all types.
		 * @param {function} t
		 * @param {Array<function>} types
		 * @param {boolean} up Rate ancestor?
		 * @param {function} action
		 */
			$rateall: function(target, types, up, action) {
				types.forEach(function(type) {
					action(type, this.$rateone(
					up ? target : type, up ? type : target
				));
				}, this);
			},

		/**
		 * Rate single type. This will come in handy for the {edb.InputPlugin}.
		 * @type {constructor} target
		 * @type {constructor} type
		 * @returns {number} The degree of ancestral separation (-1 for no relation)
		 */
			$rateone: function(target, type) {
				return this._rateone(target.$classid, type.$classid);
			},

		// Private static ..........................................................

		/**
		 * Breakdown array.
		 * @param {Array<function|string|object>}
		 * @returns {Array<constructor>}
		 */
			_breakarray: function(array) {
				return array.map(function(o) {
					switch (GuiType.of(o)) {
						case 'function':
							return o;
						case 'string':
							return gui.Object.lookup(o);
						case 'object':
							console.error('Expected function. Got object.');
					}
				}, this);
			},

		/**
		 * Breakdown not array.
		 * @param {function|String|object} arg
		 * @returns {Array<constructor>}
		 */
			_breakother: function(arg) {
				switch (GuiType.of(arg)) {
					case 'function':
						return [arg];
					case 'string':
						return this._breakarray(arg.split(' '));
					case 'object':
						console.error('Expected function. Got object.');
				}
			},

		/**
		 * Add input handler for types.
		 * @param {Array<constructor>} Types
		 * @param {IInputHandler} handler
		 */
			_add: function(Types, handler) {
				Types.filter(function(Type) {
					return handlers.add(Type.$classid, handler);
				}).forEach(function(Type) {
					GuiClass.descendantsAndSelf(Type, function(T) {
						if (T.isOutput()) {
							var input = edb.Output.$get(Type);
							handler.oninput(input);
						}
					}, this);
				}, this);
			},

		/**
		 * Remove input handler for types.
		 * @param {Array<constructor>} Types
		 * @param {IInputHandler} handler
		 */
			_remove: function(Types, handler) {
				Types.forEach(function(Type) {
					handlers.remove(Type.$classid, handler);
				});
			},

		/**
		 * At least confirm that the Type exists.
		 * @param {constructor} Type
		 * @returns {boolean}
		 */
			_check: function(Type) {
				if (!GuiType.isDefined(Type)) {
					throw new TypeError('Could not register input for undefined Type');
				}
				return true;
			},

		/**
		 * Get identical or ancestor/descandant constructor
		 * by `$classid` and memoize the return value.
		 * @param {string} targetid
		 * @param {Array<string>} typeid
		 * @returns {constructor}
		 */
			_bestmatch: memoized(function(targetid, typeids, up) {
				var best = null,
					rating = Number.MAX_VALUE,
					target = gui.Class.get(targetid),
					types = typeids.map(function(id) {
						return gui.Class.get(id);
					});
				this.$rateall(target, types, up, function(type, rate) {
					if (rate > -1 && rate < rating) {
						rating = rate;
						best = type;
					}
				});
				return best;
			}),

		/**
		 * Rate the degree of separation between classes
		 * by `$classid` and memoize the return value.
		 * @param {string} targetid
		 * @param {string} typeid
		 * @returns {number}
		 */
			_rateone: memoized(function(targetid, typeid) {
				var target = gui.Class.get(targetid);
				var type = gui.Class.get(typeid);
				var r = 0,
					rating = -1,
					parent = target;
				if (target === type) {
					rating = 0;
				} else {
					while ((parent = gui.Class.parent(parent))) {
						r++;
						if (parent === type) {
							parent = null;
							rating = r;
						}
					}
				}
				return rating;
			}),

		// Deprecated ..............................................................

		/**
		 * @deprecated
		 */
			add: function() {
				console.error('Deprecated API is deprecated: edb.Input.add()');
			},

		/**
		 * @deprecated
		 */
			remove: function() {
				console.error('Deprecated API is deprecated: edb.Input.remove()');
			},

		/**
		 * Add input handler for type(s).
		 * @param {constructor|Array<constructor>} Types
		 * @param {IInputHandler} handler
		 */
			$add: function() {
				console.warn('Deprecated API is deprecated: edb.Input.$add(). Use edb.Input.$connect()');
				return this.$connect.apply(this, arguments);
			},

		/**
		 * Add input handler for type(s).
		 * @param {constructor|Array<constructor>} Types
		 * @param {IInputHandler} handler
		 */
			$remove: function() {
				console.warn('Deprecated API is deprecated: edb.Input.$remove(). Use edb.Input.$disconnect()');
				return this.$disconnect.apply(this, arguments);
			}

		});
	}(
	gui.Combo.chained,
	gui.Combo.memoized,
	gui.Interface,
	gui.Type,
	gui.Class)
);

/**
 * Monitor public output.
 */
	(function setup() {
		gui.Broadcast.add(edb.BROADCAST_OUTPUT, {
			onbroadcast: function(b) {
				edb.Input.$onoutput(b.data);
			}
		});
	}());

/**
 * Crawl structures descending.
 * TODO: Implement 'stop' directive
 */
	edb.Crawler = (function() {
		function Crawler() {}
		Crawler.prototype = {

		/**
		 *
		 */
			crawl: function(type, handler) {
				if (edb.Type.is(type)) {
					handle(type, handler);
					crawl(type, handler);
				} else {
					throw new TypeError();
				}
			}
		};

	/**
	 * Note to self: This also crawls array members (via index keys).
	 */
		function crawl(type, handler) {
			gui.Object.each(type, istype).forEach(
			function(type) {
				handle(type, handler);
				crawl(type, handler);
			}
		);
		}

		function istype(key, value) {
			if (edb.Type.is(value)) {
				return value;
			}
		}

		function handle(type, handler) {
			if (handler.ontype) {
				handler.ontype(type);
			}
			if (handler.onarray) {
				if (edb.Array.is(type)) {
					handler.onarray(type);
				}
			}
			if (handler.onobject) {
				if (edb.Object.is(type)) {
					handler.onobject(type);
				}
			}
		}

		return Crawler;
	}());

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
				$object: gui.Object.extend({
					$classname: type.$classname,
					$instanceid: type.$instanceid,
					$originalid: type.$originalid
				}, map)
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
	}());

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
					'that nothing is ever "' + name + '"\n' +
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
	}());

/**
 * Tracking EDB input. Note that the {edb.ScriptPlugin} is using this
 * plugin, so don't assume the existence of `this.spirit` around here.
 * (the ScriptPlugin residers over in the edbml module, if you wonder).
 * @extends {gui.TrackerPlugin}
 * @using {gui.Combo.chained} chained
 * @using {edb.Input} Input
 */
	edb.InputPlugin = (function using(chained, Input) {
		return gui.TrackerPlugin.extend({

		/**
		 * True when one of each expected input type has been collected.
		 * @type {boolean}
		 */
			done: true,

		/**
		 * Construction time.
		 * @overrides {gui.Tracker#onconstruct}
		 */
			onconstruct: function() {
				gui.TrackerPlugin.prototype.onconstruct.call(this);
				this._watches = [];
				this._matches = [];
				this._needing = [];
			},

		/**
		 * Destruction time.
		 */
			ondestruct: function() {
				gui.TrackerPlugin.prototype.ondestruct.call(this);
				this.remove(this._watches);
			},

		/**
		 * Connect to output of one or more Types.
		 * @param {edb.Type|String|Array<edb.Type|String>} arg
		 * @param @optional {IInputHandler} handler Defaults to this.spirit
		 * @param @optional {boolean} required
		 * @returns {edb.InputPlugin}
		 */
			connect: chained(function(arg, handler, required) {
				var Types = Input.$breakdown(arg);
				if (Types.length) {
					this.done = this.done && required === false;
					Types.forEach(function(Type) {
						this._addchecks(Type.$classid, [handler || this.spirit]);
						this._watches.push(Type);
						if (required) {
							this._needing.push(Type);
						}
					}, this);
					Input.$connect(Types, this);
				}
			}),

		/**
		 * Disconnect from output of one or more Types.
		 * TODO: Cleanup more stuff?
		 * @param {edb.Type|String|Array<edb.Type|String>} arg
		 * @param @optional {IInputHandler} handler Defaults to this.spirit
		 * @returns {gui.edb.InputPlugin}
		 */
			disconnect: chained(function(arg, handler) {
				var Types = Input.$breakdown(arg);
				if (Types.length) {
					Types.forEach(function(Type) {
						this._removechecks(Type.$classid, [handler || this.spirit]);
						gui.Array.remove(this._watches, Type);
						gui.Array.remove(this._needing, Type);
					}, this);
					Input.$disconnect(Types, this);
					this.done = this._done();
				}
			}),

		/**
		 * TODO: this
		 */
			one: function() {
				console.error('Not supported just yet: ' + this + '.one()');
			},

		/**
		 * Get Type instance for latest input of Type (or closest match).
		 * TODO: Safeguard somewhat
		 * @param {constructor} Type
		 * @returns {object}
		 */
			get: function(Type) {
				var types = this._matches.map(function(input) {
					return input.data.constructor;
				});
				var best = Input.$bestmatch(Type, types, false);
				var input = best ? this._matches.filter(function(input) {
					return input.type === best;
				}).shift() : null;
				return input ? input.data : null;
			},

		/**
		 * @implements {Input.IInputHandler}
		 * @param {edb.Input} input
		 */
			oninput: function(input) {
				this.$oninput(input);
			},

		/**
		 * Collect matching input.
		 * @param {Input} input
		 */
			match: function(input) {
				var needstesting = !this._matches.length;
				if (needstesting || this._matches.every(function(match) {
					return match.$instanceid !== input.$instanceid;
				})) {
					return this._maybeinput(input);
				}
				return false;
			},

		// Deprecated ..............................................................

		/**
		 * @deprecated
		 */
			add: function() {
				console.warn('Deprecated API is deprecated: input.add(). Use input.connect()');
				return this.connect.apply(this, arguments);
			},

		/**
		 * @deprecated
		 */
			remove: function() {
				console.warn('Deprecated API is deprecated: input.remove(). Use input.disconnect()');
				return this.disconnect.apply(this, arguments);
			},

		// Privileged ..............................................................

		/**
		 * Evaluate input.
		 * @param {Input} input
		 */
			$oninput: function(input) {
				if (input) {
					if (input.data === null) {
						this._mayberevoke(input);
						return false;
					} else {
						return this.match(input);
					}
				} else { // debugging...
					throw new TypeError('Bad input: ' + input + ' ' + (this.spirit || ''));
				}
			},

		// Private .................................................................

		/**
		 * Expecting instances of these types (or best match).
		 * @type {Array<constructor>}
		 */
			_watches: null,

		/**
		 * Latest (best) matches, one of each expected type.
		 * @type {Array<Input>}
		 */
			_matches: null,

		/**
		 * Listing strictly `required` types (or best match).
		 * @type {Array<constructor>}
		 */
			_needing: null,

		/**
		 * If input matches registered type, update handlers.
		 * @param {Input} input
		 */
			_maybeinput: function(input) {
				var best = Input.$bestmatch(input.type, this._watches, true);
				if (best) {
					this._updatematch(input, best);
					this.done = this._done();
					this._updatehandlers(input);
					return true;
				}
				return false;
			},

		/**
		 * Evaluate revoked output.
		 * @param {Input} input
		 */
			_mayberevoke: function(input) {
				var matches = this._matches;
				var watches = this._watches;
				var best = Input.$bestmatch(input.type, watches, true);
				if (best) {
					var oldinput = matches.filter(function(input) {
						return input.type === best;
					})[0];
					var index = matches.indexOf(oldinput);
					matches.splice(index, 1);
					this.done = this._done();
					if (!this.done) {
						input.revoked = true;
						this._updatehandlers(input);
					}
				}
			},

		/**
		 * Register match for type (remove old match if any).
		 * @param {Input} newinput
		 * @param {constructor} bestmatch
		 */
			_updatematch: function(newinput, bestmatch) {
				var matches = this._matches,
					oldindex = -1,
					oldrating = -1,
					newrating = Input.$rateone(newinput.type, bestmatch);
				matches.forEach(function oldbestmatch(match, i) {
					oldrating = Input.$rateone(match.type, bestmatch);
					if (oldrating > -1 && oldrating <= newrating) {
						oldindex = i;
					}
				});
				if (oldindex > -1) {
					matches[oldindex] = newinput;
				} else {
					matches.push(newinput);
				}
			},

		/**
		 * Update input handlers.
		 * @param {Input} input
		 */
			_updatehandlers: function(input) {
				gui.Class.ancestorsAndSelf(input.type, function(Type) {
					var list = this._trackedtypes[Type.$classid];
					if (list) {
						list.forEach(function(checks) {
							var handler = checks[0];
							handler.oninput(input);
						});
					}
				}, this);
			},

		/**
		 * All required inputs has been aquired?
		 * @returns {boolean}
		 */
			_done: function() {
				var needs = this._needing;
				var haves = this._matches;
				return needs.every(function(Type) {
					return haves.some(function(input) {
						return (input.data instanceof Type);
					});
				});
			},

		/**
		 * Cleanup when destructed.
		 * @param {String} type
		 * @param {Array<object>} checks
		 */
			_cleanup: function(classid, checks) {
				if (this._removechecks(classid, checks)) {
					var Type = gui.Class.get(classid);
					Input.$remove(Type, this);
				}
			}

		});
	}(gui.Combo.chained, edb.Input));

/*
 * Register module.
 */
	gui.module('edb@wunderbyte.com', {

	/*
	 * Register plugins for all spirits
	 * (if the GUI spirits are avilable).
	 */
		plugin: {
			input: edb.InputPlugin
		}

	});
}(self));

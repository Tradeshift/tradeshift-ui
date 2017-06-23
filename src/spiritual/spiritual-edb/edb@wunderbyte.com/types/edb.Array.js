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
})(Array.prototype, gui.Combo.chained);

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
		return gui.Type.isConstructor(o) && gui.Class.ancestorsAndSelf(o).indexOf(edb.Array) > -1;
	},

	/**
	 * Publishing change summaries async.
	 * @param {gui.Tick} tick
	 */
	ontick: function(tick) {
		var snapshot,
			handlers,
			observers = this._observers;
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
		var now = false; // edb.$criticalchange;
		set.push(new edb.ArrayChange(array, index, removed, added));
		gui.Tick.dispatch(edb.TICK_PUBLISH_CHANGES, now ? -1 : 0);
		// edb.$criticalchange = false;
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
	function decorateAccess(protoToDecorate, methods) {
		methods.forEach(function(method) {
			protoToDecorate[method] = beforeaccess(protoToDecorate[method]);
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
})(edb.Array.prototype);

/*
 * Mixin methods and properties common
 * to both {edb.Object} and {edb.Array}
 */
(function setup() {
	gui.Tick.add(edb.TICK_PUBLISH_CHANGES, edb.Array);
	gui.Object.extendmissing(edb.Array.prototype, edb.Type.prototype);
})();

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

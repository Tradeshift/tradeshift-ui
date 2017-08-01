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
		addObserver: confirmed('object|function')(
			chained(function(handler) {
				edb.Object.observe(this, handler);
			})
		),

		/**
		 * Unobserve object.
		 * @param @optional {IChangeHandler} handler
		 * @returns {edb.Object}
		 */
		removeObserver: confirmed('object|function')(
			chained(function(handler) {
				edb.Object.unobserve(this, handler);
			})
		),

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
							gui.Type.of(json) +
							': ' +
							String(json)
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
})(gui.Arguments.confirmed, gui.Combo.chained);

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
	 * TODO: Mishandlers should never occur, fix cause!
	 * TODO: move to edb.Type (edb.Type.observe)
	 * @param {gui.Tick} tick
	 */
	ontick: function(tick) {
		var observers = this._observers,
			exists;
		var snapshot, changes, handlers, mishandlers;
		if (tick.type === edb.TICK_PUBLISH_CHANGES) {
			snapshot = gui.Object.copy(this._changes);
			this._changes = Object.create(null);
			var changelings = []; // so much easier with Map and Set :/
			gui.Object.each(snapshot, function(instanceid, propdef) {
				if ((handlers = observers[instanceid])) {
					changes = [];
					mishandlers = [];
					gui.Object.each(propdef, function(name, change) {
						changes.push(change);
					});
					handlers
						.filter(function(handler) {
							if (!(exists = !handler.$destructed)) {
								mishandlers.push(handler);
							}
							return exists;
						})
						.forEach(function(handler) {
							if (!handler.__changes) {
								handler.__changes = [];
							}
							handler.__changes.push(changes);
							if (changelings.indexOf(handler) === -1) {
								changelings.push(handler);
							}
						});
					mishandlers.forEach(function(handler) {
						// symptom treatment!
						var index = handlers.indexOf(handler);
						gui.Array.remove(handlers, index);
					});
				}
			});
			changelings.forEach(function(handler) {
				var groups = handler.__changes;
				handler.onchange(
					groups.reduce(function(sum, changesToReduce) {
						return sum.concat(changesToReduce);
					}, [])
				);
				delete handler.__changes;
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
			gui.Broadcast.dispatch(edb.BROADCAST_ACCESS, [object, name]);
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
			var all = this._changes,
				id = object.$instanceid;
			var set = all[id] || (all[id] = Object.create(null));
			var now = false; // edb.$criticalchange;
			set[name] = new edb.ObjectChange(object, name, type, oldval, newval);
			gui.Tick.dispatch(edb.TICK_PUBLISH_CHANGES, now ? -1 : 0);
			// edb.$criticalchange = false;
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
})();

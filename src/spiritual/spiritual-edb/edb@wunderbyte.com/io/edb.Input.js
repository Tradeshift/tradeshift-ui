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

	return gui.Class.create(
		{
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
		},
		{},
		{
			// Static ...........................................................

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
				var Type,
					type = input.data;
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
				return this._bestmatch(
					target.$classid,
					types.map(function(type) {
						return type.$classid;
					}),
					up
				);
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
					action(type, this.$rateone(up ? target : type, up ? type : target));
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
					GuiClass.descendantsAndSelf(
						Type,
						function(T) {
							if (T.isOutput()) {
								var input = edb.Output.$get(Type);
								handler.oninput(input);
							}
						},
						this
					);
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
				console.error('Deprecated API is deprecated: edb.Input.$add(). Use edb.Input.$connect()');
				return this.$connect.apply(this, arguments);
			},

			/**
			 * Add input handler for type(s).
			 * @param {constructor|Array<constructor>} Types
			 * @param {IInputHandler} handler
			 */
			$remove: function() {
				console.error(
					'Deprecated API is deprecated: edb.Input.$remove(). Use edb.Input.$disconnect()'
				);
				return this.$disconnect.apply(this, arguments);
			}
		}
	);
})(gui.Combo.chained, gui.Combo.memoized, gui.Interface, gui.Type, gui.Class);

/**
 * Monitor public output.
 */
(function setup() {
	gui.Broadcast.add(edb.BROADCAST_OUTPUT, {
		onbroadcast: function(b) {
			edb.Input.$onoutput(b.data);
		}
	});
})();

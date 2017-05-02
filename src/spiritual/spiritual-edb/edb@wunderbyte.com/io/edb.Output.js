/**
 * Transmitting output to connected listeners.
 * @see {edb.Input} for related stuff
 * @using {gui.Combo.chained} chained
 */
edb.Output = (function using(chained) {
	return gui.Class.create(
		{
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
		},
		{},
		{
			// Static privileged ................................................

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
		}
	);
})(gui.Combo.chained);

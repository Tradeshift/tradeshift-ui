/**
 * Tracking broadcasts.
 * @extends {gui.TrackerPlugin}
 * @using {gui.Combo#chained}
 */
gui.BroadcastPlugin = (function using(chained, confirmed) {
	return gui.TrackerPlugin.extend({
		/**
		 * Add one or more broadcast handlers.
		 * @param {object} arg
		 * @param @optional {object} handler implements BroadcastListener (defaults to spirit)
		 * @returns {gui.BroadcastPlugin}
		 */
		add: confirmed('string|array')(
			chained(function(arg, handler) {
				handler = handler || this.spirit;
				var sig = this._global ? null : this._sig;
				gui.Array.make(arg).forEach(function(type) {
					if (this._addchecks(type, [handler, this._global])) {
						if (this._global) {
							gui.Broadcast.addGlobal(type, handler);
						} else {
							gui.Broadcast.add(type, handler, sig);
						}
					}
				}, this);
			})
		),

		/**
		 * Remove one or more broadcast handlers.
		 * @param {object} arg
		 * @param @optional {object} handler implements BroadcastListener (defaults to spirit)
		 * @returns {gui.BroadcastPlugin}
		 */
		remove: confirmed('string|array')(
			chained(function(arg, handler) {
				handler = handler || this.spirit;
				var sig = this._global ? null : this._sig;
				gui.Array.make(arg).forEach(function(type) {
					if (this._removechecks(type, [handler, this._global])) {
						if (this._global) {
							gui.Broadcast.removeGlobal(type, handler);
						} else {
							gui.Broadcast.remove(type, handler, sig);
						}
					}
				}, this);
			})
		),

		/**
		 * Dispatch type(s).
		 * @param {object} arg
		 * @param @optional {object} data
		 * @returns {gui.Broadcast}
		 */
		dispatch: confirmed('string|array')(function(arg, data) {
			var result = null;
			var global = this._global;
			var sig = global ? null : this._sig;
			this._global = false;
			gui.Array.make(arg).forEach(function(type) {
				gui.Broadcast.$target = this.spirit;
				if (global) {
					result = gui.Broadcast.dispatchGlobal(type, data);
				} else {
					result = gui.Broadcast.dispatch(type, data, sig);
				}
			}, this);
			return result;
		}),

		/**
		 * Add handlers for global broadcast(s).
		 * @param {object} arg
		 * @param @optional {object} handler implements BroadcastListener (defaults to spirit)
		 * @returns {gui.BroadcastPlugin}
		 */
		addGlobal: function(arg, handler) {
			return this._globalize(function() {
				return this.add(arg, handler);
			});
		},

		/**
		 * Add handlers for global broadcast(s).
		 * @param {object} arg
		 * @param @optional {object} handler implements BroadcastListener (defaults to spirit)
		 * @returns {gui.BroadcastPlugin}
		 */
		removeGlobal: function(arg, handler) {
			return this._globalize(function() {
				return this.remove(arg, handler);
			});
		},

		/**
		 * @param {boolean} on
		 * @param {object} arg
		 * @param @optional {object} handler implements BroadcastListener (defaults to spirit)
		 */
		shiftGlobal: function(on, arg, handler) {
			return this._globalize(function() {
				return this.shift(on, arg, handler);
			});
		},

		/**
		 * Dispatch type(s) globally.
		 * @param {object} arg
		 * @param @optional {object} data
		 * @returns {gui.Broadcast}
		 */
		dispatchGlobal: function(arg, data) {
			return this._globalize(function() {
				return this.dispatch(arg, data);
			});
		},

		// Private .................................................................

		/**
		 * Remove delegated handlers.
		 * @overwrites {gui.Tracker#_cleanup}
		 * @param {String} type
		 * @param {Array<object>} checks
		 */
		_cleanup: function(type, checks) {
			var handler = checks[0],
				global = checks[1];
			if (global) {
				gui.Broadcast.removeGlobal(type, handler);
			} else {
				gui.Broadcast.remove(type, handler, this._sig);
			}
		}
	});
})(gui.Combo.chained, gui.Arguments.confirmed);

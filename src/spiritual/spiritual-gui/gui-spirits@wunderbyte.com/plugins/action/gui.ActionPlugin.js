/**
 * ActionPlugin.
 * @extends {gui.TrackerPlugin}
 * TODO: 'one' and 'oneGlobal' methods
 * @using {gui.Arguments#confirmed}
 * @using {gui.Combo#chained}
 */
gui.ActionPlugin = (function using(confirmed, chained) {
	return gui.TrackerPlugin.extend({
		/**
		 * Free slot for spirit to define any single type of action to dispatch.
		 * @type {String}
		 */
		type: null,

		/**
		 * Free slot for spirit to define any single type of data to dispatch.
		 * @type {Object}
		 */
		data: null,

		/**
		 * Add one or more action handlers.
		 * @param {array|string} arg
		 * @param @optional {object|function} handler
		 * @returns {gui.ActionPlugin}
		 */
		add: confirmed('array|string', '(object|function)')(
			chained(function(arg, handler) {
				handler = handler || this.spirit;
				if (gui.Interface.validate(gui.Action.IActionHandler, handler)) {
					gui.Array.make(arg).forEach(function(type) {
						this._addchecks(type, [handler, this._global]);
					}, this);
				}
			})
		),

		/**
		 * Remove one or more action handlers.
		 * @param {object} arg
		 * @param @optional {object} handler
		 * @returns {gui.ActionPlugin}
		 */
		remove: confirmed('array|string', '(object|function)')(
			chained(function(arg, handler) {
				handler = handler || this.spirit;
				if (gui.Interface.validate(gui.Action.IActionHandler, handler)) {
					gui.Array.make(arg).forEach(function(type) {
						this._removechecks(type, [handler, this._global]);
					}, this);
				}
			})
		),

		/**
		 * Add global action handler(s).
		 * @param {object} arg
		 * @param @optional {object} handler
		 * @returns {gui.ActionPlugin}
		 */
		addGlobal: function(arg, handler) {
			return this._globalize(function() {
				return this.add(arg, handler);
			});
		},

		/**
		 * Remove global action handler(s).
		 * @param {object} arg
		 * @param @optional {object} handler
		 * @returns {gui.ActionPlugin}
		 */
		removeGlobal: function(arg, handler) {
			return this._globalize(function() {
				return this.remove(arg, handler);
			});
		},

		/**
		 * Dispatch type(s) ascending.
		 * @alias {gui.ActionPlugin#ascend}
		 * @param {string} type
		 * @param @optional {object} data
		 * @returns {gui.Action}
		 */
		dispatch: confirmed('string', '(*)')(function(type, data) {
			return gui.Action.dispatch(this.spirit, type, data);
		}),

		/**
		 * Dispatch type(s) ascending.
		 * @param {string} type
		 * @param @optional {object} data
		 * @returns {gui.Action}
		 */
		ascend: confirmed('string', '(*)')(function(type, data) {
			return gui.Action.ascend(this.spirit, type, data);
		}),

		/**
		 * Dispatch type(s) descending.
		 * @param {string} type
		 * @param @optional {object} data
		 * @returns {gui.Action}
		 */
		descend: confirmed('string', '(*)')(function(type, data) {
			return gui.Action.descend(this.spirit, type, data);
		}),

		/**
		 * Dispatch type(s) globally (ascending).
		 * @alias {gui.ActionPlugin#ascendGlobal}
		 * @param {string} type
		 * @param @optional {object} data
		 * @returns {gui.Action}
		 */
		dispatchGlobal: confirmed('string', '(*)')(function(type, data) {
			return gui.Action.dispatchGlobal(this.spirit, type, data);
		}),

		/**
		 * Dispatch type(s) globally ascending.
		 * @param {string} type
		 * @param @optional {object} data
		 * @returns {gui.Action}
		 */
		ascendGlobal: confirmed('string', '(*)')(function(type, data) {
			return gui.Action.ascendGlobal(this.spirit, type, data);
		}),

		/**
		 * Dispatch type(s) globally descending.
		 * @param {string} type
		 * @param @optional {object} data
		 * @returns {gui.Action}
		 */
		descendGlobal: confirmed('string', '(*)')(function(type, data) {
			return gui.Action.descendGlobal(this.spirit, type, data);
		}),

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
				this.removeGlobal(type, handler);
			} else {
				this.remove(type, handler);
			}
		},

		// Privileged ..............................................................

		/**
		 * Flip to a mode where the spirit will handle it's own action. Corner case
		 * scenario: IframeSpirit watches an action while relaying the same action
		 * from another document context.
		 * @type {boolean}
		 */
		$handleownaction: false,

		/**
		 * Handle action. If it matches listeners, the action will be
		 * delegated to the spirit. Called by crawler in `gui.Action`.
		 * @see {gui.Action#dispatch}
		 * @param {gui.Action} action
		 */
		$onaction: function(action) {
			var list = this._trackedtypes[action.type];
			if (list) {
				list.forEach(function(checks) {
					var handler = checks[0];
					var matches = checks[1] === action.global;
					var hacking = handler === this.spirit && this.$handleownaction;
					if (matches && (handler !== action.target || hacking)) {
						handler.onaction(action);
					}
				}, this);
			}
		}
	});
})(gui.Arguments.confirmed, gui.Combo.chained);

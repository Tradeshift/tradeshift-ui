/**
 * Tracking timed events.
 * TODO: Global timed events.
 * @extends {gui.TrackerPlugin}
 * @using {gui.Combo#chained}
 * @using {gui.Array} guiArray
 */
gui.TickPlugin = (function using(chained, guiArray) {
	return gui.TrackerPlugin.extend({
		/**
		 * Setup to clear timeouts when destructed.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this._timeouts = [];
		},

		/**
		 * Clear timeouts when destructed.
		 */
		ondestruct: function() {
			this.super.ondestruct();
			this._timeouts.forEach(function(id) {
				gui.Tick.cancelTime(id);
			});
		},

		/**
		 * Add one or more tick handlers.
		 * @param {string|Array<string>} types
		 * @param @optional {object} handler
		 * @param @optional {boolean} one Remove handler after on tick of this type?
		 * @returns {gui.TickPlugin}
		 */
		add: chained(function(types, handler, one) {
			if (!this.spirit.$destructed) {
				handler = handler || this.spirit;
				if (gui.Interface.validate(gui.ITickHandler, handler)) {
					guiArray.make(types).forEach(function(type) {
						if (this._addchecks(type, [handler, this._global])) {
							this._add(type, handler, false);
						}
					}, this);
				}
			}
		}),

		/**
		 * Remove one or more tick handlers.
		 * @param {string|Array<string>} types
		 * @param @optional {object} handler implements
		 *				ActionListener interface, defaults to spirit
		 * @returns {gui.TickPlugin}
		 */
		remove: chained(function(types, handler) {
			handler = handler || this.spirit;
			if (gui.Interface.validate(gui.ITickHandler, handler)) {
				guiArray.make(types).forEach(function(type) {
					if (this._removechecks(type, [handler, this._global])) {
						this._remove(type, handler);
					}
				}, this);
			}
		}),

		/**
		 * Add handler for single tick of given type(s).
		 * TODO: This on ALL trackers :)
		 * @param {string|Array<string>} types
		 * @param @optional {object} handler
		 * @returns {gui.TickPlugin}
		 */
		one: chained(function(types, handler) {
			this.add(types, handler, true);
		}),

		/**
		 * Execute action in next available tick.
		 * TODO: Support cancellation
		 * @param {function} action
		 * @param @optional {object|function} thisp
		 * @returns {gui.TickPlugin}
		 */
		next: chained(function(action, thisp) {
			gui.Tick.next(action, thisp || this.spirit);
		}),

		/**
		 * Execute action in next animation frame.
		 * @param {function} action
		 * @param @optional {object|function} thisp
		 * @returns {gui.TickPlugin}
		 * @returns {number}
		 */
		nextFrame: function(action, thisp) {
			return gui.Tick.nextFrame(action, thisp || this.spirit);
		},

		/**
		 * Cancel scheduled animation frame.
		 * @param {number} n
		 * @returns {gui.TickPlugin}
		 */
		cancelFrame: chained(function(n) {
			gui.Tick.cancelFrame(n);
		}),

		/**
		 * Schedule timeout.
		 * @param {function} action
		 * @param {number} time
		 * @param @optional {object|function} thisp
		 * @returns {number}
		 */
		time: function(action, time, thisp) {
			var id = gui.Tick.time(action, time, thisp || this.spirit);
			this._timeouts.push(id);
			return id;
		},

		/**
		 * Cancel scheduled timeout.
		 * @param {number} n
		 */
		cancelTime: chained(function(n) {
			gui.Tick.cancelTime(n);
		}),

		/**
		 * Shortcut to add and start timer
		 * @param {string} type
		 * @param {number} time
		 * @param @optional {object} handler
		 * @param @optional {boolean} one Remove handler after on tick of this type?
		 * @returns {gui.TickPlugin}
		 */
		addStart: chained(function(type, time, handler, one) {
			gui.Tick.add(type, handler, one).start(type, time);
		}),

		/**
		 * Start tick of type.
		 * @param {string} type
		 * @param {number} time
		 */
		start: chained(function(type, time) {
			gui.Tick.start(type, time);
		}),

		/**
		 * Stop tick of type. This will stop the tick for all
		 * listeners, so perhaps you're looking for `remove`?
		 * @param {string} type
		 */
		stop: chained(function(type) {
			gui.Tick.stop(type);
		}),

		/**
		 * Dispatch tick after given time.
		 * @param {String} type
		 * @param {number} time Milliseconds (zero is setImmediate)
		 * @returns {gui.Tick}
		 */
		dispatch: function(type, time) {
			return this._dispatch(type, time || 0);
		},

		// Private .................................................................

		/**
		 * Global mode?
		 * @type {boolean}
		 */
		_global: false,

		/**
		 * Tracking timeouts so we can cancel them.
		 * @type {Array<number>}
		 */
		_timeouts: null,

		/**
		 * Add handler.
		 * @param {string} type
		 * @param {object|function} handler
		 * @param {boolean} one
		 */
		_add: function(type, handler, one) {
			var sig = this.spirit.$contextid;
			if (one) {
				if (this._global) {
					gui.Tick.oneGlobal(type, handler);
				} else {
					gui.Tick.one(type, handler, sig);
				}
			} else {
				if (this._global) {
					gui.Tick.addGlobal(type, handler);
				} else {
					gui.Tick.add(type, handler, sig);
				}
			}
		},

		/**
		 * Remove handler.
		 * @param {String} type
		 * @param {object|function} handler
		 */
		_remove: function(type, handler) {
			var sig = this.spirit.$contextid;
			if (this._global) {
				gui.Tick.removeGlobal(type, handler);
			} else {
				gui.Tick.remove(type, handler, sig);
			}
		},

		/**
		 * Dispatch.
		 * @param {String} type
		 * @param @optional {number} time
		 */
		_dispatch: function(type, time) {
			var tick,
				sig = this.spirit.$contextid;
			if (this._global) {
				tick = gui.Tick.dispatchGlobal(type, time);
			} else {
				tick = gui.Tick.dispatch(type, time, sig);
			}
			return tick;
		},

		/**
		 * Remove delegated handlers.
		 * @overwrites {gui.Tracker#_cleanup}
		 * @param {String} type
		 * @param {Array<object>} checks
		 */
		_cleanup: function(type, checks) {
			var handler = checks[0];
			var bglobal = checks[1];
			if (this._remove(type, [handler])) {
				if (bglobal) {
					gui.Tick.removeGlobal(type, handler);
				} else {
					gui.Tick.remove(type, handler, this.$contextid);
				}
			}
		}
	});
})(gui.Combo.chained, gui.Array);

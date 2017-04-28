/**
 * Ticks are used for timed events.
 * TODO: Tick.push
 * @using {gui.Arguments#confirmed}
 */
(function using(confirmed) {
	/**
	 * @param {String} type
	 */
	gui.Tick = function(type) {
		this.type = type;
	};

	gui.Tick.prototype = {
		/**
		 * Tick type.
		 * @type {String}
		 */
		type: null,

		/**
		 * Identification.
		 * @returns {String}
		 */
		toString: function() {
			return '[object gui.Tick]';
		}
	};

	/**
	 * Let's not attempt to invoke any method that applies the `this` keyword
	 * to spirits (or plugins or models) that have been marked as destructed.
	 * TODO: We can in theory remove numerous manual checks for this now!
	 * @param {Object} thisp
	 * @returns {boolean}
	 */
	function safeapply(thisp) {
		if (thisp) {
			return thisp.$destructed === undefined || !thisp.$destructed;
		}
		return true;
	}

	// Static ....................................................................

	gui.Object.extend(gui.Tick, {
		/**
		 * Identification.
		 * @returns {String}
		 */
		toString: function() {
			return '[function gui.Tick]';
		},

		/**
		 * Add handler for tick.
		 * The `confirmed` stuff would cause a *random* error that might be
		 * related to minification, so we've simply disabled it for now :/
		 * UPDATE: We now believe that said random error is caused somehow
		 * by use of the `postMessage` trick to emulate `setImmediate`,
		 * because Angular uses this trick for rendering and the error only
		 * occurs while Angular is rendering (`setTimeout` will fix it)...
		 * TODO: Sig argument is deprecated...
		 * @param {object} type String or array of strings
		 * @param {object} handler
		 * @param @optional {boolean} one Remove handler after on tick of this type?
		 * @returns {function}
		 */
		add: function(type, handler, sig) {
			// confirmed("string|array", "object|function", "(string)")(
			return this._add(type, handler, false, sig || gui.$contextid);
		},

		/**
		 * Remove handler for tick.
		 * @param {object} type String or array of strings
		 * @param {object} handler
		 * @returns {function}
		 */
		remove: function(type, handler, sig) {
			// confirmed("string|array", "object|function", "(string)")(
			return this._remove(type, handler, sig || gui.$contextid);
		},

		/**
		 * Add auto-removing handler for tick.
		 * @param {object} type String or array of strings
		 * @param {object} handler
		 * @returns {function}
		 */
		one: function(type, handler, sig) {
			// confirmed("string|array", "object|function", "(string)")(
			return this._add(type, handler, true, sig || gui.$contextid);
		},

		/**
		 * Schedule action for next available execution stack.
		 * @TODO: deprecate setImmedate polyfix and do the fix here
		 * @param {function} action
		 * @param @optional {object} thisp
		 */
		next: function(action, thisp) {
			setImmediate(function() {
				if (safeapply(thisp)) {
					action.call(thisp);
				}
			});
		},

		/**
		 * Schedule action for next animation frame.
		 * @TODO: deprecate requestAnimationFrame polyfix and do the fix here
		 * @param {function} action
		 * @param @optional {object} thisp
		 * returns {number}
		 */
		nextFrame: function(action, thisp) {
			return requestAnimationFrame(function(timestamp) {
				if (safeapply(thisp)) {
					action.call(thisp, timestamp);
				}
			});
		},

		/**
		 * Cancel animation frame by index.
		 * @param {number} n
		 */
		cancelFrame: function(n) {
			cancelAnimationFrame(n);
		},

		/**
		 * Set a timeout.
		 * @param {function} action
		 * @param @optional {number} time Default to something like 4ms
		 * @param @optional {object} thisp
		 * returns {number}
		 */
		time: confirmed('function', '(number)', '(function|object)')(function(action, time, thisp) {
			return setTimeout(function() {
				if (safeapply(thisp)) {
					action.call(thisp);
				}
			}, time || 0);
		}),

		/**
		 * Cancel timeout by index.
		 * @param {number} n
		 */
		cancelTime: function(n) {
			clearTimeout(n);
		},

		/**
		 * Start repeated tick of given type.
		 * @param {string} type Tick type
		 * @param {ITickHandler} handler
		 * @param {number} time Time in milliseconds
		 * @returns {function}
		 */
		start: confirmed('string', 'number')(function(type, time) {
			var map = this._intervals;
			if (!map[type]) {
				var tick = new gui.Tick(type);
				map[type] = setInterval(
					function() {
						this._doit(tick);
					}.bind(this),
					time
				);
			}
		}),

		/**
		 * Stop repeated tick of given type.
		 * @param {String} type Tick type
		 * @returns {function}
		 */
		stop: confirmed('string')(function(type) {
			var map = this._intervals;
			var id = map[type];
			if (id) {
				clearInterval(id);
				delete map[type];
			}
		}),

		/**
		 * Dispatch tick now or in specified time. Omit time to
		 * dispatch now. Zero resolves to next available thread.
		 * @param {String} type
		 * @param @optional {number} time
		 * @returns {gui.Tick}
		 */
		dispatch: function(type, time, sig) {
			return this._dispatch(type, time, sig || gui.$contextid);
		},

		// Private static ..........................................................

		/**
		 * Comment goes here.
		 */
		_intervals: Object.create(null),

		/**
		 * Return of the comment.
		 */
		_tempname: {
			types: Object.create(null),
			handlers: Object.create(null)
		},

		/**
		 * Hello. There seems to be a *random* error where the handler get's passed
		 * along to this method wrapped in an array. It would happen *sometimes*
		 * in the test, but changing a `console.error` to `throw new Error` would
		 * make it go away (see "gui.Arguments.js"). This would however only fix
		 * the *tests*: We know of at least one production scenario where the
		 * bug persists, so we'll just unwrap the hander from the array manually.
		 * The bug could be related to minification, but we will probably never know.
		 */
		_add: function(type, handler, one, sig) {
			if (Array.isArray(handler)) {
				handler = handler[0]; // hacky workaround :/
			}
			if (gui.Type.isArray(type)) {
				type.forEach(function(t) {
					this._add(t, handler, one, sig);
				}, this);
			} else {
				var list, index;
				var map = this._tempname;
				list = map.handlers[type];
				if (!list) {
					list = map.handlers[type] = [];
				}
				index = list.indexOf(handler);
				if (index === -1) {
					index = list.push(handler) - 1;
				}
				/*
				 * @TODO
				 * Adding a property to an array will
				 * make it slower in Firefox. Fit it!
				 */
				if (one) {
					list._one = list._one || Object.create(null);
					list._one[index] = true;
				}
			}
			return this;
		},

		/**
		 * Hello.
		 */
		_remove: function(type, handler, sig) {
			if (gui.Type.isArray(type)) {
				type.forEach(function(t) {
					this._remove(t, handler, sig);
				}, this);
			} else {
				if (Array.isArray(handler)) {
					// The weird bug just happened!
					handler = handler[0]; // hacky workaround :/
				}
				var map = this._tempname;
				var list = map.handlers[type];
				if (list) {
					var index = list.indexOf(handler);
					if (index > -1) {
						gui.Array.remove(list, index);
						if (list.length === 0) {
							delete map.handlers[type];
						}
					}
				}
			}
			return this;
		},

		/**
		 * Dispatch tick sooner or later.
		 * @param {String} type
		 * @param @optional {number} time
		 * @param @optional {String} sig
		 */
		_dispatch: function(type, time, sig) {
			var map = this._tempname;
			var types = map.types;
			var tick = new gui.Tick(type);
			time = time || 0;
			if (!types[type]) {
				types[type] = true;
				var that = this;
				var id = null; // eslint-disable-line no-unused-vars
				var doit = function() {
					delete types[type];
					that._doit(tick);
				};
				if (!time) {
					id = setImmediate(doit);
				} else if (time > 0) {
					id = setTimeout(doit, time);
				} else {
					doit();
				}
			}
			return tick; // TODO: shouldn't it return the `id` so that it can cancel?
		},

		/**
		 * Tick now.
		 * @param {gui.Tick} tick
		 */
		_doit: function(tick) {
			var list = this._tempname.handlers[tick.type];
			if (list) {
				var mishandlers = [];
				list
					.filter(function(handler) {
						if (handler.$destructed) {
							mishandlers.push(handler);
							return false;
						}
						return true;
					})
					.forEach(function(handler) {
						handler.ontick(tick);
					});
				mishandlers.forEach(function(handler) {
					// symptom treatment!
					gui.Array.remove(list, list.indexOf(handler));
				});
			}
		}
	});
})(gui.Arguments.confirmed);

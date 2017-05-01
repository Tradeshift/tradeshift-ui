/**
 * Broadcast.
 * @using {gui.Arguments#confirmed}
 * @using {gui.Combo#chained}
 */
gui.Broadcast = (function using(confirmed, chained) {
	/**
	 * Under mysterious circumstances, Internet Explorer may evaluate this
	 * callback in a phantom lexical scope where `gui` is undefined, so
	 * we'll check that that `gui` exsists ang ignore the message otherwise.
	 * TODO: If this fails, surely it will fix with a `try-catch` statement.
	 */
	window.addEventListener('message', function onmessage(e) {
		if (window.gui && gui.Type && gui.Type.isString(e.data)) {
			if (e.data.startsWith('spiritual-broadcast:')) {
				gui.Broadcast.$maybeBroadcastGlobal(e.data);
			}
		}
	});

	return gui.Class.create(
		Object.prototype,
		{
			/**
			 * Broadcast target.
			 * @type {gui.Spirit}
			 */
			target: null,

			/**
			 * Broadcast type.
			 * @type {String}
			 */
			type: null,

			/**
			 * Broadcast data.
			 * @type {object}
			 */
			data: null,

			/**
			 * Global broadcast?
			 * @type {boolean}
			 */
			global: false,

			/**
			 * Signature of dispatching context.
			 * Unimportant for global broadcasts.
			 * @type {String}
			 */
			$contextid: null,

			/**
			 * Experimental...
			 * TODO: Still used?
			 * @type {Array<String>}
			 */
			$contextids: null,

			/**
			 * Constructor.
			 * @param {Map<String,object>} defs
			 */
			$onconstruct: function(defs) {
				gui.Object.extend(this, defs);
				this.$contextids = this.$contextids || [];
			}
		},
		{},
		{
			// Static ...........................................................

			/**
			 * Broadcast handler interface.
			 */
			IBroadcastHandler: {
				onbroadcast: function(b) {},
				toString: function() {
					return '[interface BroadcastHandler]';
				}
			},

			/**
			 * @type {gui.Spirit}
			 */
			$target: null,

			/**
			 * TODO: Ths can be deprecated now(?)
			 * Tracking global handlers (mapping broadcast types to list of handlers).
			 * @type {Map<String,<Array<object>>}
			 */
			_globals: Object.create(null),

			/**
			 * TODO: Ths can be deprecated now!
			 * Tracking local handlers (mapping gui.$contextids
			 * to broadcast types to list of handlers).
			 * @type {Map<String,Map<String,Array<object>>>}
			 */
			_locals: Object.create(null),

			/**
			 * mapcribe handler to message.
			 * @param {object} message String or array of strings
			 * @param {object} handler Implements `onbroadcast`
			 * @param @optional {String} sig
			 * @returns {function}
			 */
			add: chained(function(message, handler, sig) {
				this._add(message, handler, sig || gui.$contextid);
			}),

			/**
			 * Unmapcribe handler from broadcast.
			 * @param {object} message String or array of strings
			 * @param {object} handler
			 * @param @optional {String} sig
			 * @returns {function}
			 */
			remove: chained(function(message, handler, sig) {
				this._remove(message, handler, sig || gui.$contextid);
			}),

			/**
			 * mapcribe handler to message globally.
			 * @param {object} message String or array of strings
			 * @param {object} handler Implements `onbroadcast`
			 * @returns {function}
			 */
			addGlobal: chained(function(message, handler) {
				this._add(message, handler);
			}),

			/**
			 * Unmapcribe handler from global broadcast.
			 * @param {object} message String or array of strings
			 * @param {object} handler
			 * @returns {function}
			 */
			removeGlobal: chained(function(message, handler) {
				this._remove(message, handler);
			}),

			/**
			 * Publish broadcast in specific window scope (defaults to this window)
			 * TODO: queue for incoming dispatch (finish current message first).
			 * @param {Spirit} target
			 * @param {String} type
			 * @param {object} data
			 * @param {String} contextid
			 * @returns {gui.Broadcast}
			 */
			dispatch: function(type, data) {
				if (gui.Type.isString(type)) {
					return this._dispatch({
						type: type,
						data: data,
						global: false
					});
				} else {
					console.error(
						'The "target" argument (the first argument) of gui.Broadcast.dispatch is deprecated'
					);
					this.dispatch(arguments[1], arguments[2]);
				}
			},

			/**
			 * Dispatch broadcast in global scope (all windows).
			 * TODO: queue for incoming dispatch (finish current first).
			 * TODO: Handle remote domain iframes ;)
			 * @param {Spirit} target
			 * @param {String} type
			 * @param {object} data
			 * @returns {gui.Broadcast}
			 */
			dispatchGlobal: function(type, data) {
				if (gui.Type.isString(type)) {
					return this._dispatch({
						type: type,
						data: data,
						global: true,
						$contextid: gui.$contextid
					});
				} else {
					console.error(
						'The "target" argument (the first argument) of gui.Broadcast.dispatchGlobal is deprecated'
					);
					return this.dispatchGlobal(arguments[1], arguments[2]);
				}
			},

			/**
			 * Encode broadcast to be posted xdomain.
			 * @param {gui.Broacast} b
			 * @returns {String}
			 */
			stringify: function(b) {
				var prefix = 'spiritual-broadcast:';
				return (
					prefix +
					(function() {
						b.target = null;
						b.data = (function(d) {
							if (gui.Type.isComplex(d)) {
								if (gui.Type.isFunction(d.stringify)) {
									d = d.stringify();
								} else {
									try {
										JSON.stringify(d); // @TODO: think mcfly - how come not d = JSON.stringify????
									} catch (jsonexception) {
										d = null;
									}
								}
							}
							return d;
						})(b.data);
						return JSON.stringify(b);
					})()
				);
			},

			/**
			 * Decode broadcast posted from xdomain and return a broadcast-like object.
			 * @param {String} msg
			 * @returns {object}
			 */
			parse: function(msg) {
				var prefix = 'spiritual-broadcast:';
				if (msg.startsWith(prefix)) {
					return JSON.parse(msg.split(prefix)[1]);
				}
			},

			// Privileged static .......................................................

			/**
			 * Parse postmessage into broadcast in this window?
			 * Broadcasts propagate over-agressively, so perhaps
			 * the broadcast has already bypassed this context.
			 * @param {string} postmessage
			 */
			$maybeBroadcastGlobal: function(postmessage) {
				var b = gui.Broadcast.parse(postmessage);
				if (b.$contextids.indexOf(gui.$contextid) === -1) {
					gui.Broadcast._dispatch(b);
				}
			},

			// Private .................................................................

			/**
			 * Subscribe handler to message(s).
			 * @param {Array<string>|string} type
			 * @param {object|function} handler Implements `onbroadcast`
			 * @param @optional {String} sig
			 */
			_add: confirmed('array|string', 'object|function', '(string)')(function(type, handler, sig) {
				// var interfais = gui.Broadcast.IBroadcastHandler;
				// if (true || gui.Interface.validate(interfais, handler)) {
				if (gui.Type.isArray(type)) {
					type.forEach(function(t) {
						this._add(t, handler, sig);
					}, this);
				} else {
					var map;
					if (sig) {
						map = this._locals[sig];
						if (!map) {
							map = this._locals[sig] = Object.create(null);
						}
					} else {
						map = this._globals;
					}
					if (!map[type]) {
						map[type] = [];
					}
					var array = map[type];
					if (array.indexOf(handler) === -1) {
						array.push(handler);
					}
				}
				// }
			}),

			/**
			 * Hello.
			 * @param {object} message String or array of strings
			 * @param {object} handler
			 * @param @optional {String} sig
			 */
			_remove: function(message, handler, sig) {
				// var interfais = gui.Broadcast.IBroadcastHandler;
				// if (true || gui.Interface.validate(interfais, handler)) {
				if (gui.Type.isArray(message)) {
					message.forEach(function(msg) {
						this._remove(msg, handler, sig);
					}, this);
				} else {
					var index,
						array = (function(locals, globals) {
							if (sig) {
								if (locals[sig]) {
									return locals[sig][message];
								}
							} else {
								return globals[message];
							}
						})(this._locals, this._globals);
					if (array) {
						index = array.indexOf(handler);
						if (index > -1) {
							gui.Array.remove(array, index);
						}
					}
				}
				// }
			},

			/**
			 * Dispatch broadcast.
			 * @param {gui.Broadcast|Map<String,object>} b
			 */
			_dispatch: function(b) {
				var map = b.global ? this._globals : this._locals[gui.$contextid];
				if (gui.hasModule('gui-spirits@wunderbyte.com')) {
					if (!gui.spiritualized) {
						if (b.type !== gui.BROADCAST_WILL_SPIRITUALIZE) {
							// TODO: cache broadcast until spiritualized?
						}
					}
				}
				if (this.$target) {
					if (!b.global) {
						b.target = this.$target;
					}
					this.$target = null;
				}
				if (b instanceof gui.Broadcast === false) {
					b = new gui.Broadcast(b);
				}
				if (map) {
					var handlers = map[b.type];
					if (handlers) {
						handlers.slice().forEach(function(handler) {
							handler.onbroadcast(b);
						});
					}
				}
				if (b.global) {
					this._propagate(b);
				}
				return b;
			},

			/**
			 * Propagate broadcast xframe.
			 *
			 * 1. Propagate descending
			 * 2. Propagate ascending
			 * TODO: Don't post to universal domain "*"
			 * @param {gui.Broadcast} b
			 */
			_propagate: function(b) {
				var postmessage = (function stamp() {
					b.$contextids.push(gui.$contextid);
					return gui.Broadcast.stringify(b);
				})();
				this._propagateDown(postmessage);
				this._propagateUp(postmessage, b.type);
			},

			/**
			 * Propagate broadcast to sub documents.
			 * TODO: implement something similar to {gui.IframeSpirit._postbox}
			 * but without expecting the bundle gui-spirits@wunderbyte.com
			 * (it would in that case involve onload instead of onspiritualized)
			 * @param {string} postmessage
			 */
			_propagateDown: function(postmessage) {
				var iframes = document.querySelectorAll('iframe');
				Array.forEach(iframes, function(iframe) {
					iframe.contentWindow.postMessage(postmessage, '*');
				});
			},

			/**
			 * Propagate broadcast to parent document.
			 * @param {string} postmessage
			 */
			_propagateUp: function(postmessage) {
				if (window !== top) {
					parent.postMessage(postmessage, '*');
				}
			}
		}
	);
})(gui.Arguments.confirmed, gui.Combo.chained);

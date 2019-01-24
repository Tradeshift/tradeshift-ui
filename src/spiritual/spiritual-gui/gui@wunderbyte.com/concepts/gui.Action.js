/**
 * Spirit action.
 * @using {gui.Arguments#confirmed} confirmed
 * @using {gui.Combo#chained} chained
 */
gui.Action = (function using(confirmed, chained) {
	if (gui.hosted) {
		// relay actions from parent frame.

		/*
		 * Under mysterious circumstances, Internet Explorer may evaluate this
		 * callback in a phantom lexical scope where `gui` is undefined, so
		 * we'll check that that `gui` exsists ang ignore the message otherwise.
		 * TODO: If this fails, surely it will fix with a `try-catch` statement.
		 */
		addEventListener('message', function(e) {
			if (window.gui && gui.Type && gui.Type.isString(e.data)) {
				if (e.source === parent) {
					gui.Action.$maybeDescendGlobal(e.data);
				}
			}
		});
	}

	return gui.Class.create(
		Object.prototype,
		{
			/**
			 * From who or where the action was dispatched.
			 * @type {Node|gui.Spirit}
			 */
			target: null,

			/**
			 * Action type eg. "save-button-clicked".
			 * @type {String}
			 */
			type: null,

			/**
			 * Optional data of any type.
			 * This might be undefined.
			 * @type {object}
			 */
			data: null,

			/**
			 * Is travelling up or down? Matches "ascend" or "descend".
			 * @type {String}
			 */
			direction: null,

			/**
			 * Traverse iframe boundaries?
			 * @type {boolean}
			 */
			global: false,

			/**
			 * Is action consumed?
			 * TODO: rename 'consumed'
			 * @type {boolean}
			 */
			isConsumed: false,

			/**
			 * Is action cancelled?
			 * TODO: rename 'cancelled'
			 * @type {boolean}
			 */
			isCancelled: false,

			/**
			 * Spirit who (potentially) consumed the action.
			 * @type {gui.Spirit}
			 */
			consumer: null,

			/**
			 * Used when posting actions xdomain. Matches an iframespirit key.
			 * TODO: rename this to something else (now that action has $instanceid).
			 * @type {String}
			 */
			instanceid: null,

			/**
			 * Connstruct from JSON.
			 * @param {object} json
			 */
			onconstruct: function(json) {
				gui.Object.extend(this, json);
			},

			/**
			 * Block further ascend.
			 * @param @optional {gui.Spirit} consumer
			 */
			consume: function(consumer) {
				this.isConsumed = true;
				this.consumer = consumer;
			},

			/**
			 * Consume and cancel the event. Note that it is
			 * up to the dispatcher to honour cancellation.
			 * @param @optional {gui.Spirit} consumer
			 */
			cancel: function(consumer) {
				this.isCancelled = true;
				this.consume(consumer);
			}
		},
		{},
		{
			// Static ...........................................................

			DESCEND: 'descend',
			ASCEND: 'ascend',

			/**
			 * Action handler interface.
			 */
			IActionHandler: {
				onaction: function(a) {},
				toString: function() {
					return '[interface ActionHandler]';
				}
			},

			/**
			 * Don't use just yet! (pending WeakMaps)
			 * @param {string|Array<string>} type
			 * @param {object} handler Implements `onaction`
			 * @param @optional {String} sig
			 * @returns {constructor}
			 */
			add: confirmed('node', 'array|string', 'object|function')(
				chained(function(elm, type, handler) {
					this._listen(true, elm, type, handler, false);
				})
			),

			/**
			 * Don't use just yet! (pending WeakMaps)
			 * @param {string|Array<string>} type
			 * @param {object} handler
			 * @param @optional {String} sig
			 * @returns {constructor}
			 */
			remove: confirmed('node', 'array|string', 'object|function')(
				chained(function(node, type, handler) {
					this._listen(false, node, type, handler, false);
				})
			),

			/**
			 * Don't use just yet! (pending WeakMaps)
			 * @param {string|Array<string>} type
			 * @param {object} handler Implements `onaction`
			 * @returns {constructor}
			 */
			addGlobal: confirmed('node', 'array|string', 'object|function')(
				chained(function(node, type, handler) {
					this._listen(true, node, type, handler, true);
				})
			),

			/**
			 * Don't use just yet! (pending WeakMaps)
			 * @param {string|Array<string>} type
			 * @param {object} handler
			 * @returns {constructor}
			 */
			removeGlobal: confirmed('node', 'array|string', 'object|function')(
				chained(function(node, type, handler) {
					this._listen(false, node, type, handler, true);
				})
			),

			/**
			 *
			 */
			dispatch: function(target, type, data) {
				return this.ascend(target, type, data);
			},

			/**
			 *
			 */
			ascend: function(target, type, data) {
				return this._dispatch(target, type, data, gui.Action.ASCEND, false);
			},

			/**
			 *
			 */
			descend: function(target, type, data) {
				return this._dispatch(target, type, data, gui.Action.DESCEND, false);
			},

			/**
			 *
			 */
			dispatchGlobal: function(target, type, data) {
				return this.ascendGlobal(target, type, data);
			},

			/**
			 *
			 */
			ascendGlobal: function(target, type, data) {
				return this._dispatch(target, type, data, gui.Action.ASCEND, true);
			},

			/**
			 *
			 */
			descendGlobal: function(target, type, data) {
				return this._dispatch(target, type, data, gui.Action.DESCEND, true);
			},

			/**
			 * Encode action to be posted xdomain.
			 * @param {gui.Action} a
			 * @param @optional {String} key Associates dispatching document
			 *				to the hosting iframespirit (ascending action scenario)
			 * @returns {String}
			 */
			stringify: function(a, key) {
				var prefix = 'spiritual-action:';
				return (
					prefix +
					(function() {
						a.target = null;
						a.data = (function(d) {
							if (gui.Type.isComplex(d)) {
								if (gui.Type.isFunction(d.stringify)) {
									d = d.stringify();
								} else {
									try {
										JSON.stringify(d);
									} catch (jsonexception) {
										d = null;
									}
								}
							}
							return d;
						})(a.data);
						a.instanceid = key || null;
						return JSON.stringify(a);
					})()
				);
			},

			/**
			 * Parse string to {gui.Action}.
			 * @param {string} msg
			 * @returns {gui.Action}
			 */
			parse: function(msg) {
				var prefix = 'spiritual-action:';
				if (msg.startsWith(prefix)) {
					return new gui.Action(JSON.parse(msg.split(prefix)[1]));
				}
				return null;
			},

			// Privileged static .......................................................

			/**
			 * Parse postmessage from parent into descending action in this window?
			 * @param {string} postmessage
			 */
			$maybeDescendGlobal: function(postmessage) {
				var data = postmessage,
					action,
					root,
					handlers;
				if (gui.Type.isString(data) && data.startsWith('spiritual-action:')) {
					action = gui.Action.parse(data);
					if (action.direction === gui.Action.DESCEND) {
						// Hotfix for actions in nospirit scenario
						// TODO: rething this pending WeakMaps...
						if ((handlers = this._globals[action.type])) {
							handlers.slice().forEach(function(handler) {
								handler.onaction(action);
							});
						}
						if (gui.hasModule('gui-spirits@wunderbyte.com')) {
							gui.ready(function onspiritualized() {
								if ((root = gui.get('html'))) {
									root.action.$handleownaction = true;
									root.action.descendGlobal(action.type, action.data);
								}
							});
						}
					}
				}
			},

			// Private static ..........................................................

			/**
			 *
			 */
			_globals: {},

			/**
			 *
			 */
			_locals: {},

			/**
			 *
			 */
			_listen: function(add, node, type, handler, global) {
				if (node.nodeType === Node.DOCUMENT_NODE) {
					var map = global ? this._globals : this._locals;
					var handlers = map[type];
					var ok = gui.Action.IActionHandler;
					if (gui.Interface.validate(ok, handler)) {
						gui.Array.make(type).forEach(function(t) {
							if (add) {
								if (!handlers) {
									handlers = map[type] = [];
								}
								if (handlers.indexOf(handler) === -1) {
									handlers.push(handler);
								}
							} else if (handlers) {
								if (gui.Array.remove(handlers, handler) === 0) {
									delete map[type];
								}
							}
						});
					}
				} else {
					// elements support pending WeakMap
					throw new TypeError('Document node expected');
				}
			},

			/**
			 * Dispatch action. The dispatching spirit will not `onaction()` its own action.
			 * TODO: Measure performance against https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
			 * TODO: Class-like thing to carry all these scoped methods...
			 * TODO: support custom `gui.Action` as an argument
			 * TODO: common ancestor class for action, broadcast etc?
			 * @param {gui.Spirit|Element} target
			 * @param {String} type
			 * @param @optional {object} data
			 * @param @optional {String} direction
			 * @param @optional {boolean} global
			 * @returns {gui.Action}
			 */
			_dispatch: function dispatch(target, type, data, direction, global) {
				// TODO: encapsulate this
				var action = new gui.Action({
					target: target,
					type: type,
					data: data,
					direction: direction || gui.Action.ASCEND,
					global: global || false
				});

				var crawler = new gui.Crawler(gui.CRAWLER_ACTION);
				crawler.global = action.global || false;
				crawler[action.direction](target, {
					/*
					 * Evaluate action for spirit.
					 * @param {gui.Spirit} spirit
					 */
					handleSpirit: function(spirit) {
						var directive = gui.Crawler.CONTINUE;
						if (spirit.action.contains(type)) {
							spirit.action.$onaction(action);
							if (action.isConsumed) {
								directive = gui.Crawler.STOP;
								action.consumer = spirit;
							}
						}
						return directive;
					},

					/*
					 * Teleport action across domains.
					 * @see {gui.IframeSpirit}
					 * @param {Window} win Remote window
					 * @param {String} uri target origin
					 * @param {String} key Spiritkey of xdomain IframeSpirit (who will relay the action)
					 */
					transcend: function(win, uri, key) {
						var msg = gui.Action.stringify(action, key);
						win.postMessage(msg, '*'); // uri
					}
				});
				return action;
			}
		}
	);
})(gui.Arguments.confirmed, gui.Combo.chained);

/**
 * The spirit guide crawls the document while channeling
 * spirits into DOM elements that matches CSS selectors.
 * @using {gui.Assistant} Assistant
 * @using {gui.Type} Type
 * @using {gui.Array} Array
 * @using {gui.Broadcast} Broadcast
 * @using {gui.DOMPlugin} DOMPlugin
 * @using {gui.Tick} Tick
 * @using gui.Crawler} Crawler
 */
gui.Guide = (function using(
	Assistant,
	Type,
	guiArray,
	Broadcast,
	DOMPlugin,
	Spirit,
	Tick,
	Crawler
) {
	/**
	 * Tracking spirits inside and outside the DOM.
	 * Spirits not in the DOM are scheduled to die.
	 */
	var documentspirits = {
		incoming: [], // spirits just entered the DOM (some milliseconds ago)
		inside: Object.create(null), // spirits positioned in page DOM ("entered" and "attached")
		outside: Object.create(null) // spirits removed from page DOM (currently "detached")
	};

	return {
		/**
		 * Identification.
		 * @returns {String}
		 */
		toString: function() {
			return '[object gui.Guide]';
		},

		/**
		 * Suspend spiritualization and materialization during operation.
		 * If the operation is async, use `suspend()` and later `resume()`.
		 * @param {function} operation - This is assumed synchronous!
		 * @param @optional {object} thisp
		 * @returns {*|this}
		 */
		suspend: function(operation, thisp) {
			this._suspended = true;
			if (operation) {
				var res = operation.call(thisp);
				this._suspended = false;
				return res;
			}
			return this;
		},

		/**
		 * Resume spiritualization and materialization.
		 * @returns {this}
		 */
		resume: function() {
			this._suspended = false;
			return this;
		},

		// Privileged ..............................................................

		/**
		 * Release the spirits and proclaim the document spiritualized.
		 */
		$startGuiding: function() {
			gui.$stop('- idle time ...');
			this._startGuiding();
			Broadcast.dispatch(gui.BROADCAST_WILL_SPIRITUALIZE);
			gui.$measure(
				'- spiritualize initially',
				function() {
					this._spiritualizeinitially();
					gui.$stop('boostrap everything');
				},
				this
			);
			Broadcast.dispatch(gui.BROADCAST_DID_SPIRITUALIZE);
		},

		/**
		 * Associate element to new spirit instance.
		 * Offloading this to assistant while we
		 * figure out who should handle this stuff.
		 * @param {Element} elm
		 * @param {constructor} Spirit
		 * @returns {Spirit}
		 */
		$possess: function(elm, newSpirit) {
			return Assistant.$possess(elm, newSpirit);
		},

		/**
		 * Possess element and descendants.
		 * TODO: Jump any detached spirit if matching id (and `jump` is set to true)
		 * @param {Element} target
		 */
		$spiritualize: function(target) {
			target = Type.isSpirit(target) ? target.element : target;
			this._maybespiritualize(target, false, false);
		},

		/**
		 * Possess descendants.
		 * @param {Element|gui.Spirit} target
		 */
		$spiritualizeSub: function(target) {
			this._maybespiritualize(target, true, false);
		},

		/**
		 * Possess one element non-crawling.
		 * @param {Element|gui.Spirit} target
		 */
		$spiritualizeOne: function(target) {
			this._maybespiritualize(target, false, true);
		},

		/**
		 * Dispell spirits from element and descendants.
		 * @param {Element|gui.Spirit} target
		 * @param @optional {boolean} webkithack (not an official thing!)
		 */
		$materialize: function(target, webkithack) {
			this._maybematerialize(target, false, false, webkithack);
		},

		/**
		 * Dispell spirits for descendants.
		 * @param {Element|gui.Spirit} target
		 */
		$materializeSub: function(target) {
			this._maybematerialize(target, true, false);
		},

		/**
		 * Dispell one spirit non-crawling.
		 * @param {Element|gui.Spirit} target
		 */
		$materializeOne: function(target) {
			this._maybematerialize(target, false, true);
		},

		/**
		 * Invoke ondetach for element spirit and descendants spirits.
		 * TODO: This sequence should probably be revisited at some point.
		 * TODO: TODO: Support NodeList and DocumentFragment as argument.
		 * @param {Element|gui.Spirit} target
		 * @param @optional {boolean} skip If true, only detach the children
		 */
		$detach: function(target, skip) {
			this._maybedetach(target, !!skip);
		},

		/*
		 * Stop tracking the spirit.
		 * TODO: Figure out if `null` is recommended for dereferencing nowadays.
		 * @param {gui.Spirit} spirit
		 */
		$forget: function(spirit) {
			var spirits = documentspirits;
			var key = spirit.$instanceid;
			delete spirits.inside[key];
			delete spirits.outside[key];
			this._stoptracking(spirit);
		},

		/**
		 * Channel spirits to CSS selectors.
		 */
		$channel: function() {
			switch (Type.of(arguments[0])) {
				case 'string':
					this._channelOne.apply(this, arguments);
					break;
				case 'array':
					this._channelAll.apply(this, arguments);
					break;
			}
		},

		/**
		 * Has channels?
		 * @returns {boolean}
		 */
		$hasChannels: function() {
			return this._channels && this._channels.length;
		},

		/**
		 * Get channels (read only).
		 * @type {Array<Array<String,function>>}
		 */
		$getChannels: function() {
			return this._channels.slice();
		},

		/**
		 * Log channels to console.
		 * TODO: create {gui.Developer}
		 */
		$debug: function() {
			console.log(
				this._channels.reduce(function(log, channel) {
					return log + '\n\n' + channel[0] + ' : ' + channel[1];
				}, location.href)
			);
		},

		/**
		 * Register spirit inside the document.
		 * Evaluate new arrivals after 4 millisec.
		 * @param {gui.Spirit} spirit
		 */
		$inside: function(spirit) {
			var spirits = documentspirits;
			var key = spirit.$instanceid;
			if (!spirits.inside[key]) {
				if (spirits.outside[key]) {
					delete spirits.outside[key];
				}
				spirits.inside[key] = spirit;
				spirits.incoming.push(spirit);
				Tick.dispatch(gui.$TICK_INSIDE, 4);
			}
		},

		/**
		 * Register spirit outside document. This schedules the spirit
		 * for destruction unless reinserted somewhere else (and soon).
		 * @param {Spirit} spirit
		 */
		$outside: function(spirit) {
			var spirits = documentspirits;
			var key = spirit.$instanceid;
			if (!spirits.outside[key]) {
				if (spirits.inside[key]) {
					delete spirits.inside[key];
					this._stoptracking(spirit);
				}
				spirits.outside[key] = spirit;
				Tick.dispatch(gui.$TICK_OUTSIDE, 0);
			}
		},

		/**
		 * Invoked by {gui.Spiritual} some milliseconds after
		 * all spirits have been attached to the page DOM.
		 * @param {Array<gui.Spirit>} spirits
		 */
		$goasync: function(spirits) {
			spirits.forEach(function(spirit) {
				Spirit.$async(spirit);
			});
		},

		/**
		 * Get spirit by `$instanceid`.
		 * Please go via `gui.get(id)`.
		 * @param {string} key
		 * @returns {gui.Spirit}
		 */
		$getSpiritById: function(key) {
			return documentspirits.inside[key] || null;
		},

		// Private .................................................................

		/**
		 *
		 */
		_arrivals: Object.create(null),

		/**
		 * Lisitng CSS selectors associated to Spirit constructors.
		 * Order is important: First spirit to match selector is it.
		 * @type {Array<Array<String,function>>}
		 */
		_channels: [],

		/**
		 * Some kind of temp fix.
		 * @type {Array<object>}
		 */
		_todochannels: null,

		/**
		 * Ignore DOM mutations?
		 * @type {boolean}
		 */
		_suspended: false,

		/**
		 * Setup to handle spirits entering and leaving the DOM.
		 * Flush channelings that were bufffered during bootup.
		 */
		_startGuiding: function() {
			var ticks = [gui.$TICK_INSIDE, gui.$TICK_OUTSIDE];
			gui.Tick.add(ticks, {
				ontick: function(tick) {
					if (tick.type === ticks[0]) {
						gui.Guide._updateincoming();
					} else {
						gui.Guide._updateoutside();
					}
				}
			});
			if (this._todochannels) {
				this._channelAll(this._todochannels);
				this._todochannels = null;
			}
		},

		/**
		 * 1. Always spiritualize the HTML element {gui.DocumentSpirit}.
		 * 2. Robot mode: Overload native DOM methods
		 * 3. Robot mode: Monitor DOM for unhandled mutations (WebKit)
		 * 4. Robot mode: Spiritualize everything
		 * 5. (make sure that `onready` is called on the root spirit last)
		 * @param {Window} win
		 * @param {Document} doc
		 */
		_spiritualizeinitially: function() {
			var root = document.documentElement;
			gui.DOMChanger.init();
			this.$spiritualizeOne(root);
			if (gui.mode === gui.MODE_ROBOT) {
				gui.DOMChanger.change();
				if (!gui.Client.hasAttributesOnPrototype) {
					gui.DOMObserver.observe();
				}
				this.$spiritualizeSub(root);
			}
			Spirit.$ready(gui.get(root));
		},

		/**
		 * Continue with spiritualize/materialize of given node? The 'webkithack'
		 * relates to the problem with Safari (and old Chrome) where removed nodes
		 * get detected asynchronously and is therefore NOT embedded when we run.
		 * @param {Node} node
		 * @param @optional {boolean} webkithack (sometimes true on nodes removed)
		 * @returns {boolean}
		 */
		_handles: function(node, webkithack) {
			return (
				node && Type.isElement(node) && !this._suspended && (webkithack || DOMPlugin.embedded(node))
			);
		},

		/**
		 * Collect non-destructed spirits from element and descendants.
		 * @param {Node} node
		 * @param @optional {boolean} skip Skip start element
		 * @returns {Array<gui.Spirit>}
		 */
		_collect: function(node, skip, id) {
			var list = [];
			new Crawler(id).descend(node, {
				handleSpirit: function(spirit) {
					if (skip && spirit.element === node) {
						// nothing
					} else if (!spirit.life.destructed) {
						list.push(spirit);
					}
				}
			});
			return list;
		},

		/**
		 * Spiritualize node perhaps.
		 * @param {Node|gui.Spirit} node
		 * @param {boolean} skip Skip the element?
		 * @param {boolean} one Skip the subtree?
		 */
		_maybespiritualize: function(node, skip, one) {
			node = Type.isSpirit(node) ? node.element : node;
			node = Type.isDocument(node) ? node.documentElement : node;
			if (this._handles(node)) {
				this._spiritualize(node, skip, one);
			}
		},

		/**
		 * Evaluate spirits for element and subtree.
		 *
		 * - Construct spirits in document order
		 * - Fire life cycle events except `ready` in document order
		 * - Fire `ready` in reverse document order (innermost first)
		 *
		 * @param {Element} element
		 * @param {boolean} skip Skip the element?
		 * @param {boolean} one Skip the subtree?
		 */
		_spiritualize: function(elm, skip, one) {
			var spirits,
				channels = this._channels;
			skip = false; // until DOM setters can finally replace Mutation Observers
			spirits = Assistant.$detectspirits(elm, skip, one, channels);
			this._sequence(spirits);
		},

		/**
		 * Call `onconfigure`, `onenter`, `onattach` and 'onreflex' in document
		 * order. Finally call `onready` in reverse document order (bottoms up).
		 * @param {Array<gui.Spirit>} spirits
		 */
		_sequence: (function generatefuntion() {
			var root = gui.DocumentSpirit;
			function configure(spirit) {
				if (!spirit.life.configured) {
					Spirit.$configure(spirit);
				}
				return spirit;
			}
			function enter(spirit) {
				if (!spirit.life.entered) {
					Spirit.$enter(spirit);
				}
				return spirit;
			}
			function attach(spirit) {
				// TODO: This check should not be needed, probably a bug in the detach sequence or something :/
				if (!spirit.life.attached) {
					Spirit.$attach(spirit);
				}
				return spirit;
			}
			function ready(spirit) {
				if (!spirit.life.ready && !root.is(spirit)) {
					Spirit.$ready(spirit);
				}
			}
			return function(spirits) {
				spirits
					.map(configure)
					.map(enter)
					.map(attach)
					.reverse()
					.forEach(ready);
			};
		})(),

		/**
		 * Destruct spirits from element and subtree. Using a two-phased destruction sequence
		 * to minimize the risk of plugins invoking already destructed plugins during destruct.
		 * @param {Node|gui.Spirit} node
		 * @param {boolean} skip Skip the element?
		 * @param {boolean} one Skip the subtree?
		 * @param {boolean} force
		 * @param @optional {boolean} webkithack (not an official thing)
		 */
		_maybematerialize: function(node, skip, one, force, webkithack) {
			node = Type.isSpirit(node) ? node.element : node;
			node = Type.isDocument(node) ? node.documentElement : node;
			if (force || this._handles(node, webkithack)) {
				this._materialize(node, skip, one);
			}
		},

		/**
		 * Nuke spirits in reverse document order. This to allow an ascending {gui.Action} to escape
		 * from the subtree of a spirit that decides to remove itself from the DOM during destruction.
		 * TODO: 'one' appears to be unsupported here???
		 * @param {Element} element
		 * @param {boolean} skip Skip the element?
		 * @param {boolean} one Skip the subtree?
		 */
		_materialize: function(element, skip, one) {
			this._collect(element, skip, gui.CRAWLER_MATERIALIZE)
				.reverse()
				.filter(function(spirit) {
					if (spirit.life.attached && !spirit.life.destructed) {
						Spirit.$destruct(spirit);
						return true; // @TODO: handle 'one' arg!
					}
					return false;
				})
				.forEach(function(spirit) {
					Spirit.$dispose(spirit);
				});
		},

		/**
		 * @param {Element|gui.Spirit} element
		 * @param {boolean} skip
		 */
		_maybedetach: function(element, skip) {
			element = Type.isSpirit(element) ? element.element : element;
			if (this._handles(element)) {
				this._collect(element, skip, gui.CRAWLER_DETACH).forEach(function(spirit) {
					Spirit.$detach(spirit);
				});
			}
		},

		/**
		 * Channel spirits to CSS selectors.
		 * @param {String} select CSS selector
		 * @param {function|String} klass Constructor or name
		 */
		_channelOne: function(select, klass) {
			var spirit,
				booting = !!this._todochannels;
			if (gui.initialized) {
				spirit = typeof klass === 'string' ? gui.Object.lookup(klass) : klass;
				if (!gui.debug || Type.isSpiritConstructor(spirit)) {
					if (booting) {
						this._channels.unshift([select, spirit]);
					} else {
						this._channels.push([select, spirit]);
					}
				} else {
					console.error('Bad spirit for selector "' + select + '": ' + spirit);
				}
			} else {
				// wait for method ready to invoke.
				this._todochannels = this._todochannels || [];
				this._todochannels.push([select, klass]);
			}
		},

		/**
		 * TODO: the 'reverse()' should really not be done here, but in
		 * the condition above, however, that screws it up, huge disaster
		 * and something must be done about it !!!!!!!!!!!!!!!!!!!!!!!!!!
		 */
		_channelAll: function(channels) {
			if (gui.initialized) {
				channels.forEach(function(c) {
					this._channelOne(c[0], c[1]);
				}, this);
			} else {
				this._todochannels = this._todochannels || [];
				this._todochannels = this._todochannels.concat(channels.reverse());
			}
		},

		/**
		 * Some attempt to unreference the spirit.
		 * @param {gui.Spirit} spirit
		 */
		_stoptracking: function(spirit) {
			var incoming = documentspirits.incoming;
			if (incoming.length) {
				var i = incoming.indexOf(spirit);
				if (i > -1) {
					guiArray.remove(incoming, i);
				}
			}
		},

		/**
		 * Update incoming spirits.
		 */
		_updateincoming: function() {
			gui.Guide.$goasync(documentspirits.incoming);
			documentspirits.incoming = [];
		},

		/**
		 * Update spirits not in the DOM.
		 */
		_updateoutside: function() {
			var outside = documentspirits.outside;
			var spirits = gui.Object.each(outside, function(key, spirit) {
				return spirit;
			});
			/*
			 * TODO: make sure that this happens onexit (but not here)
			spirits.forEach ( function ( spirit ) {
				Spirit.$exit ( spirit );
			});
			*/
			spirits.forEach(function(spirit) {
				Spirit.$destruct(spirit);
			});
			spirits.forEach(function(spirit) {
				Spirit.$dispose(spirit);
			});
			documentspirits.outside = Object.create(null);
		}
	};
})(
	gui.Assistant,
	gui.Type,
	gui.Array,
	gui.Broadcast,
	gui.DOMPlugin,
	gui.Spirit,
	gui.Tick,
	gui.Crawler
);

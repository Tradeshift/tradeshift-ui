/* global gui:true */

/**
 * Extend `gui` to support spirits.
 */
gui = gui.Object.extend(
	gui,
	{
		/**
		 * Robot mode: Automatically spiritualize and
		 * materialize by overriding native DOM methods.
		 * @type {string}
		 */
		MODE_ROBOT: 'robot',

		/**
		 * Human mode: Spiritualize and materialize at own risk.
		 * @type {string}
		 */
		MODE_HUMAN: 'human',

		/**
		 * Funny mode: Spiritualize manually, materialize automatically.
		 * TODO: Remove all traces of this. It is not funny.
		 * @type {string}
		 */
		MODE_FUNNY: 'funny',

		// broadcasts
		BROADCAST_WILL_SPIRITUALIZE: 'gui-broadcast-will-spiritualize',
		BROADCAST_DID_SPIRITUALIZE: 'gui-broadcast-did-spiritualize',

		// actions
		ACTION_DOC_ONSPIRITUALIZED: 'gui-action-document-spiritualized',

		// framework-internal stuff (most should eventually dollarprefix!)
		$ACTION_XFRAME_VISIBILITY: 'gui-action-xframe-visibility',

		// lifecycle events (all spirits)
		LIFE_CONSTRUCT: 'gui-life-construct',
		LIFE_CONFIGURE: 'gui-life-configure',
		LIFE_ENTER: 'gui-life-enter',
		LIFE_ATTACH: 'gui-life-attach',
		LIFE_READY: 'gui-life-ready',
		LIFE_DETACH: 'gui-life-detach',
		LIFE_EXIT: 'gui-life-exit',
		LIFE_ASYNC: 'gui-life-async',
		LIFE_DESTRUCT: 'gui-life-destruct',
		LIFE_VISIBLE: 'gui-life-visible',
		LIFE_INVISIBLE: 'gui-life-invisible',
		LIFE_RENDER: 'gui-life-render', // belongs to edb.module really...

		// ifecycle events (some spirits)
		LIFE_IFRAME_CONSTRUCT: 'gui-life-iframe-construct',
		LIFE_IFRAME_DOMCONTENT: 'gui-life-iframe-domcontent',
		LIFE_IFRAME_SPIRITUALIZED: 'gui-life-iframe-spiritualized',
		LIFE_IFRAME_ONLOAD: 'gui-life-iframe-onload',
		LIFE_IFRAME_ONHASH: 'gui-life-iframe-onhash',
		LIFE_IFRAME_UNLOAD: 'gui-life-iframe-unload',

		// tick types (timed events)
		$TICK_INSIDE: 'gui-tick-spirits-inside',
		$TICK_OUTSIDE: 'gui-tick-spirits-outside',

		// crawler identification strings
		CRAWLER_SPIRITUALIZE: 'gui-crawler-spiritualize',
		CRAWLER_MATERIALIZE: 'gui-crawler-materialize',
		CRAWLER_DETACH: 'gui-crawler-detach',
		CRAWLER_DISPOSE: 'gui-crawler-dispose', // TODO: what is this?
		CRAWLER_ACTION: 'gui-crawler-action',
		CRAWLER_VISIBLE: 'gui-crawler-visible', // TODO: move to plugin
		CRAWLER_INVISIBLE: 'gui-crawler-invisible', // TODO: move to plugin
		CRAWLER_REFLEX: 'gui-crawler-reflex',

		/**
		 * CSS classnames
		 */
		CLASS_NOSPIRITS: 'gui-nospirits', // declare spirit-free zone (performance)
		CLASS_INVISIBLE: '_gui-invisible',
		CLASS_HIDDEN: '_gui-hidden',

		/**
		 * Spirit management mode. Matches 'robot' or 'human' (or 'funny' perhaps).
		 * @type {String}
		 */
		mode: 'robot',

		/**
		 * Automatically run on DOMContentLoaded?
		 * @TODO: rename this to something
		 * @type {boolean}
		 */
		autostrap: true,

		/**
		 * Delay boostrap by some milliseconds as a "catch all" for
		 * frameworks that do something to the DOM without exposing
		 * lifecycle events that tell us *when* it's done (Angular).
		 * @type {number}
		 */
		bootstrapdelay: -1,

		/**
		 * True (only) while initial spiritualization is in progress.
		 * @type {boolean}
		 */
		spiritualizing: false,

		/**
		 * Flipped by the {gui.Guide} after initial spiritualization
		 * @type {boolean}
		 */
		spiritualized: false,

		/**
		 * Magic attributes to trigger spirit association and configuration.
		 * By default we support 'gui' but you may prefer to use 'data-gui'.
		 * @type {Array<string>}
		 */
		attributes: null,

		/**
		 * Boostrap Spiritual. Unless `autostrap` is set to `false`, this
		 * happens automatically at `DOMContentLoaded`. You can nudge the
		 * `boostrapdelay` to accomodate for cornercase framework behavior,
		 * ie. allow Angular to parse the DOM for template elements first
		 * (this to avoid HTML from initialized spirits in the tempaltes!).
		 */
		bootstrap: function() {
			gui.bootstrap = function notagain() {};
			var delay = gui.bootstrapdelay;
			gui.Client.$init();
			function start() {
				gui.spiritualizing = true;
				gui.Guide.$startGuiding();
				gui.spiritualizing = false;
				gui._nowready();
			}
			if (delay > -1) {
				setTimeout(start, delay);
			} else {
				start();
			}
		},

		/**
		 * Possess element and descendants.
		 * TODO: Jump detached spirit if matching id (!)
		 * @param {Element} target
		 */
		spiritualize: function(target) {
			gui.Guide.$spiritualize(target || document);
		},

		/**
		 * Possess descendants.
		 * @param {Element|gui.Spirit} target
		 */
		spiritualizeSub: function(target) {
			gui.Guide.$spiritualizeSub(target || document);
		},

		/**
		 * Possess one element non-crawling.
		 * @param {Element|gui.Spirit} target
		 */
		spiritualizeOne: function(target) {
			gui.Guide.$spiritualizeOne(target || document);
		},

		/**
		 * Dispell spirits from element and descendants.
		 * @param {Element|gui.Spirit} target
		 * @param @optional {boolean} webkithack (not an official thing!)
		 */
		materialize: function(target, webkithack) {
			gui.Guide.$materialize(target || document, webkithack);
		},

		/**
		 * Dispell spirits for descendants.
		 * @param {Element|gui.Spirit} target
		 */
		materializeSub: function(target) {
			gui.Guide.$materializeSub(target || document);
		},

		/**
		 * Dispell one spirit non-crawling.
		 * @param {Element|gui.Spirit} target
		 */
		materializeOne: function(target) {
			gui.Guide.$materializeOne(target || document);
		},

		/**
		 * Don't materialize and spiritualize during given operation.
		 * If the operation is async, use `suspend()` and `resume()`.
		 * @param {funtion} [operation] Assumed synchronous!
		 * @param {Object} [thisp]
		 */
		suspend: function(operation, thisp) {
			if (arguments.length) {
				return gui.DOMObserver.suspend(function() {
					return gui.Guide.suspend(operation, thisp);
				});
			} else {
				gui.DOMObserver.suspend();
				gui.Guide.suspend();
			}
		},

		/**
		 * Resume spiritualization and materialization.
		 */
		resume: function() {
			gui.DOMObserver.resume();
			gui.Guide.resume();
		},

		/**
		 * Get spirit for fuzzy argument.
		 * TODO: Perhaps delegate this to {gui.DOMPlugin}?
		 * @param {String|Element} arg
		 * @param @optional {function} callback
		 * @param @optional {object} thisp
		 * @returns {gui.Spirit}
		 */
		get: function(arg, callback, thisp) {
			var spirit;
			if (arguments.length === 1) {
				if (this.spiritualizing || this.spiritualized) {
					spirit = this._getspirit(arg);
				} else if (window.console && console.warn && console.error) {
					var message = this._guigetmessage();
					if (location.hostname === 'localhost') {
						console.error(message); // stacktrace version
					} else {
						console.warn(message);
					}
				}
			} else {
				var elm = this._getelement(arg);
				this._getmanaged(elm, callback, thisp);
			}
			return spirit || null;
		},

		/**
		 * @TODO
		 */
		getAll: function(arg) {
			console.error('TODO: gui.getAll');
		},

		/**
		 * Channel spirits to CSS selectors.
		 * TODO: explain args
		 */
		channel: function() {
			gui.Guide.$channel.apply(gui.Guide, arguments);
		},

		/**
		 * Has channels?
		 * TODO: rebrand as 'channelings'
		 * @returns {boolean}
		 */
		hasChannels: function() {
			return gui.Guide.$hasChannels();
		},

		/**
		 * Get channels (read only).
		 * TODO: rebrand as 'channelings'
		 * @type {Array<Array<String,function>>}
		 */
		getChannels: function() {
			return gui.Guide.$getChannels();
		},

		/**
		 * Do something when everything is spiritualized (synchronously after
		 * DOMContentLoaded). Or if that's already too late, just do it now.
		 * TODO: support `onready` object handler
		 * @overwrites {gui#ready} A stub implementation
		 * @param @optional {function} action
		 * @param @optional {object} thisp
		 * @returns {boolean} True when ready already
		 */
		ready: function(action, thisp) {
			var is = this.spiritualized;
			if (arguments.length) {
				if (is) {
					action.call(thisp);
				} else {
					this._readycallbacks = this._readycallbacks || [];
					this._readycallbacks.push(function() {
						action.call(thisp);
					});
				}
			}
			return is;
		},

		// Privileged ..............................................................

		/**
		 * Called on `Spirit.onready()` to eval callbacks accumulated
		 * via `ts.ui.get(elm, callback)` (used in an async scenario).
		 * @param {Element} elm
		 */
		$getnow: function(elm) {
			var list = this._managedgetters;
			if (list.length) {
				var entries = [];
				this._managedgetters = list.filter(function(entry) {
					if (entry[0] === elm) {
						entries.push(entry);
						return false;
					}
					return true;
				});
				entries.forEach(function(entry) {
					var elm = entry[0];
					var fun = entry[1];
					var dat = entry[2];
					if (fun) {
						fun.call(dat, elm.spirit);
					}
				});
			}
		},

		// Private .................................................................

		/**
		 * Callbacks to trigger when the document is (initially) spiritualized.
		 * @type {Array<function>}
		 */
		_readycallbacks: null,

		/**
		 * Used to resolve async `ts.ui.get(elm, callback)`
		 * @type {Array<Array<Element|Function|Object>>}
		 */
		_managedgetters: [],

		/**
		 * If the spirit is ready, we'll just call that callback straight away.
		 * Otherwise monitor the element until the spirit is ready. This element
		 * will never be garbage collected unless at some point it gets a spirit :/
		 * @param {Element} elm
		 * @param {Function} callback
		 * @param {Object} thisp
		 */
		_getmanaged: function(elm, callback, thisp) {
			var list = this._managedgetters;
			if (elm) {
				if (elm.spirit) {
					callback.call(thisp, elm.spirit);
				} else {
					list.push([elm, callback, thisp]);
				}
			}
		},

		/**
		 * Setup a broadcast listener to bootstrap Spiritual
		 * after any other potential framework initialization.
		 * @returns {gui.Namespace} myself
		 */
		_initialize: function() {
			this.attributes = ['gui'];
			gui.Broadcast.add(gui.BROADCAST_TODOM, {
				onbroadcast: function() {
					if (gui.autostrap) {
						gui.bootstrap();
					}
				}
			});
			return this;
		},

		/**
		 * Initial spirits are ready.
		 * Run accumulated callbacks.
		 */
		_nowready: function() {
			this.spiritualized = true;
			var list = this._readycallbacks;
			if (list) {
				while (list.length) {
					list.shift()();
				}
				this._readycallbacks = null;
			}
		},

		/**
		 * Get spirit for fuzzy argument.
		 * @param {String|Element} arg
		 * @returns {gui.Spirit}
		 */
		_getspirit: function(arg) {
			if (gui.Type.isString(arg) && gui.KeyMaster.isKey(arg)) {
				return gui.Guide.$getSpiritById(arg);
			} else {
				var elm = this._getelement(arg);
				return elm ? elm.spirit : null;
			}
		},

		/**
		 * Get element for fuzzy argument.
		 * @param {String|Element} arg
		 * @returns {Element}
		 */
		_getelement: function(arg) {
			var elm = null,
				doc = document;
			if (gui.Type.isString(arg)) {
				arg = arg.trim();
				try {
					elm = arg.match(/[^a-zA-Z\d]/)
						? doc.querySelector(arg) // lookup selector in document
						: doc.getElementById(arg) || doc.querySelector(arg); // lookup by ID in document // lookup by tagname in document
				} catch (badselector) {
					console.warn(badselector.message, arg);
				}
			} else if (gui.Type.isElement(arg)) {
				elm = arg;
			}
			return elm;
		},

		/**
		 * TODO: Support custom namespace to replace `gui` here.
		 * @returns {string}
		 */
		_guigetmessage: function() {
			return [
				"ts.ui.get() failed because we're not initialized just yet.",
				'You can supply a callback function as the second argument',
				'or you can wrap your existing code in ts.ui.ready(mycallback).'
			].join(' ');
		}
	}._initialize()
);

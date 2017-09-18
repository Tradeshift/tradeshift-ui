/**
 * Create the primordial namespace.
 * @using {ts.gui.Namespace} Namespace
 * @using {Object} Timer
 */
window.gui = (function using(Namespace, Timer) {
	return new Namespace('gui', {
		/**
		 * Export as `gui.Namespace`.
		 * @type {constructor}
		 */
		Namespace: Namespace,

		/**
		 * TODO: Current version (should be injected during build process).
		 * @see https://www.npmjs.org/package/grunt-spiritual-build
		 * @type {string} (majorversion.minorversion.patchversion)
		 */
		version: '<%= version %>',

		/**
		 * Flag general debug mode.
		 * @type {boolean}
		 */
		debug: false,

		/**
		 * @TODO: This ain't up to date no more...
		 * @TODO: leave the URL alone a see if we can postMessage these things just in time...
		 * The {gui.IframeSpirit} will stamp this querystring parameter into any URL it loads.
		 * The value of the parameter matches the iframespirits '$contextid'. Value becomes the
		 * '$contextid' of the local 'gui' object (a {gui.Spiritual} instance). This establishes
		 * a relation between iframe and hosted document that can be used for xdomain stuff.
		 * @type {string}
		 */
		PARAM_CONTEXTID: 'gui-contextid',
		PARAM_XHOST: 'gui-xhost',

		/*
		 * Local broadcasts
		 */
		BROADCAST_TODOM: 'gui-broadcast-todom',
		BROADCAST_ONDOM: 'gui-broadcast-ondom',
		BROADCAST_TOLOAD: 'gui-broadcast-toload',
		BROADCAST_ONLOAD: 'gui-broadcast-onload',
		BROADCAST_TOUNLOAD: 'gui-broadcast-tounload',
		BROADCAST_ONUNLOAD: 'gui-broadcast-unload',
		BROADCAST_WILL_UNLOAD: 'gui-broadcast-will-unload', // deprecated

		/**
		 * Global broadcasts (TODO: stamp GLOBAL in there)
		 * TODO: harmonize some naming with action types
		 */
		BROADCAST_MOUSECLICK: 'gui-broadcast-mouseevent-click',
		BROADCAST_MOUSEMOVE: 'gui-broadcast-mouseevent-mousemove',
		BROADCAST_MOUSEDOWN: 'gui-broadcast-mouseevent-mousedown',
		BROADCAST_MOUSEUP: 'gui-broadcast-mouseevent-mouseup',
		BROADCAST_SCROLL: 'gui-broadcast-window-scroll',
		BROADCAST_RESIZE: 'gui-broadcast-window-resize', // should at least be local
		BROADCAST_RESIZE_END: 'gui-broadcast-window-resize-end',
		BROADCAST_POPSTATE: 'gui-broadcast-window-popstate',
		BROADCAST_HASHCHANGE: 'gui-broadcast-window-hashchange',
		BROADCAST_ORIENTATIONCHANGE: 'gui-broadcast-orientationchange',
		BROADCAST_TWEEN: 'gui-broadcast-tween',

		/**
		 * Global actions
		 */
		ACTION_DOC_ONDOMCONTENT: 'gui-action-document-domcontent',
		ACTION_DOC_ONLOAD: 'gui-action-document-onload',
		ACTION_DOC_ONHASH: 'gui-action-document-onhash',
		ACTION_DOC_UNLOAD: 'gui-action-document-unload',

		/**
		 * Timeout in milliseconds before we decide that user is finished resizing the window.
		 */
		TIMEOUT_RESIZE_END: 250,

		/**
		 * Device orientation.
		 * TODO: Get this out of here, create gui.Device or something
		 */
		orientation: 0,
		ORIENTATION_PORTRAIT: 0,
		ORIENTATION_LANDSCAPE: 1,

		/**
		 * Uniquely identifies this instance of `gui` knowing
		 * that other instances may exist in iframes.
		 * @type {String}
		 */
		$contextid: null,

		/**
		 * Usually the window object. Occasionally a web worker scope.
		 * TODO: Figure out if it's safe to deprecate this nowadays
		 * @type {GlobalScope}
		 */
		context: window,

		/**
		 * The {gui.Document} knows more about this whole browser environment.
		 * @type {gui.Document}
		 */
		document: null,

		/**
		 * Running inside an iframe?
		 * @type {boolean}
		 */
		hosted: false,

		/**
		 * Cross domain origin of containing iframe if:
		 *
		 * 1. We are loaded inside a {gui.IframeSpirit}
		 * 2. Containing document is on an external host
		 * @type {String} eg. `http://parenthost.com:8888`
		 */
		xhost: '*', // hardcoded for now!

		/**
		 * Flipped by the {gui.Guide}. TODO: Don't rely on that guy here!
		 * @type {boolean}
		 */
		initialized: false,

		/**
		 * Window is unloading?
		 * @type {boolean}
		 */
		unloading: false,

		/**
		 * Do something before the spirits get here.
		 * if that's already too late, just do it now.
		 * @param @optional {function} action
		 * @param @optional {object} thisp
		 * @returns {boolean} True when ready already
		 */
		init: function(action, thisp) {
			var is = this.initialized;
			if (arguments.length) {
				if (is) {
					action.call(thisp);
				} else {
					this._initcallbacks = this._initcallbacks || [];
					this._initcallbacks.push(function() {
						if (gui.debug) {
							try {
								action.call(thisp);
							} catch (exception) {
								console.error(action.toString());
								throw exception;
							}
						} else {
							action.call(thisp);
						}
					});
				}
			}
			return is;
		},

		/**
		 * The `ready` method get's expanded in
		 * core-spirits@wunderbyte.com (it runs
		 * when spirits are all ready) but for
		 * now we'll just alias it to `init`.
		 * @param @optional {function} action
		 * @param @optional {object} thisp
		 * @returns {boolean} True when ready already
		 */
		ready: function(action, thisp) {
			return this.init(action, thisp);
		},

		/**
		 * Register module.
		 * @param {String} name
		 * @param {object} module
		 * @returns {gui.Module}
		 */
		module: function(name, module) {
			var Module;
			if (gui.Type.isString(name) && name.length) {
				Module = gui.Module.extend(name, module || {});
				module = gui.Module.$register(new Module(name));
				return module;
			} else {
				throw new Error('Module needs an identity token');
			}
		},

		/**
		 * Has module registered?
		 * @param {String} name Module name
		 * @returns {boolean}
		 */
		hasModule: function(name) {
			return gui.Module.$hasModule(name);
		},

		/**
		 * List registered namespaces.
		 * TODO: Move to {gui.Namespace}
		 * @returns {Array<string>}
		 */
		namespaces: function() {
			return Namespace.namespaces.map(function(ns) {
				return ns.$ns;
			});
		},

		/**
		 * TODO: Something about this.
		 * TODO: Move to {gui.Namespace}
		 */
		spacenames: function() {
			Namespace.namespaces.forEach(function(ns) {
				ns.spacename();
			});
		},

		/**
		 * Declare namespace. Optionally add members.
		 * @param {String} ns
		 * @param {Map<String,object>} members
		 * @returns {gui.Namespace}
		 */
		namespace: function(ns, members) {
			var no;
			if (gui.Type.isString(ns)) {
				no = gui.Object.lookup(ns);
				no = new gui.Namespace(ns);
				no = gui.Object.assert(ns, no);
			} else {
				throw new TypeError('Expected a namespace string');
			}
			return gui.Object.extend(no, members || {});
		},

		/**
		 * Broadcast something globally. Events will be wrapped in an EventSummary.
		 * @param {String} message gui.BROADCAST_MOUSECLICK or similar
		 * @param @optional {object} arg This could well be a MouseEvent
		 */
		broadcastGlobal: function(msg, arg) {
			if (gui.Type.isEvent(arg)) {
				arg = new gui.EventSummary(arg);
			}
			gui.Broadcast.dispatchGlobal(msg, arg);
		},

		// Private .................................................................

		/**
		 * @type {Array<function>}
		 */
		_initcallbacks: null,

		/**
		 * Invoked at parse time (so right now).
		 */
		_exist: function() {
			this.hosted = window !== parent;
			this.$contextid =
				'key' +
				Math.random()
					.toString()
					.slice(2, 11);
			if (this.hosted) {
				// TODO: get rid of this stuff!
				this.xhost = '*';
			}
			return this;
		},

		// Privileged ..............................................................

		/**
		 * Initialize all the things that did 'gui.init(callback)' during boot.
		 * Called on 'DOMContentLoaded' by the {gui.Document}.
		 */
		$initialize: function() {
			this.spacenames(); // TODO: get this out of here
			this.initialized = true;
			var list = this._initcallbacks;
			if (list) {
				while (list.length) {
					list.shift()();
				}
				this._initcallbacks = null;
			}
		},

		/**
		 * Instigate shutdown procedure. This usually happens on `window.unload` but
		 * may have to be invoked manually in Chrome packaged apps (pending a fix for
		 * https://code.google.com/p/chromium/issues/detail?id=167824).
		 * Called by the {gui.Document} on 'window.unload'
		 * @see {gui.Document._onunload}
		 */
		$shutdown: function() {
			this.unloading = true;
		},

		/**
		 * Start measurement.
		 * @param {string} string
		 */
		$mark: function(string) {
			Timer.mark(string);
		},

		/**
		 * Stop measurement.
		 * @param {string} string
		 * @returns {PerformanceMeasure}
		 */
		$stop: function(string) {
			return Timer.stop(string);
		},

		/**
		 * Conduct measurement of given action.
		 * @param {string} string
		 * @param {Function} action
		 * @param @optional {Object} thisp
		 * Note: Returns the result of calling that action (not the timing info).
		 */
		$measure: function(string, action, thisp) {
			this.$mark(string);
			var res = action.call(thisp);
			this.$stop(string);
			return res;
		},

		/**
		 * Get all measurements. Note: This always returns an array, maybe empty.
		 * @returns {Array|Array<PerformanceMeasure>}
		 */
		$measurements: function() {
			return Timer.measurements() || [];
		}
	})._exist();
})(
	(function() {
		// ad hoc namespace mechanism ..................................

		/**
		 * When the first namespace `gui` has been instantiated,
		 * this will become exposed publically as `gui.Namespace`.
		 * TODO: Let's remember to check for namespace collions!
		 * @param {string} ns
		 * @param @optional {object} members
		 */
		function Namespace(ns, members) {
			Namespace.namespaces.push(this);
			this.$ns = ns;
			if (members) {
				Object.keys(members).forEach(function(key) {
					Object.defineProperty(this, key, Object.getOwnPropertyDescriptor(members, key));
				}, this);
			}
		}

		Namespace.namespaces = [];
		Namespace.prototype = {
			/**
			 * Namespace string.
			 * @type {String}
			 */
			$ns: null,

			/**
			 * Identification.
			 * @returns {String}
			 */
			toString: function() {
				return '[namespace ' + this.$ns + ']';
			},

			/**
			 * Compute classnames for class-type members.
			 * @returns {gui.Namespace}
			 */
			spacename: function() {
				this._spacename(this, this.$ns);
				return this;
			},

			/**
			 * Name members recursively.
			 * @param {object|function} o
			 * @param {String} name
			 */
			_spacename: function(o, name) {
				gui.Object.each(
					o,
					function(key, value) {
						if (key !== '$superclass' && gui.Type.isConstructor(value)) {
							if (value.$classname === gui.Class.ANONYMOUS) {
								Object.defineProperty(value, '$classname', {
									value: name + '.' + key,
									enumerable: true,
									writable: false
								});
								this._spacename(value, name + '.' + key);
							}
						}
					},
					this
				);
			}
		};

		return Namespace;
	})(),
	/*
	 * Ad hoc timing device to investigate the timing of all the things.
	 * TODO: check out `performance.setResourceTimingBufferSize(10000);`
	 * @param {boolean} native Supporting `window.performance` natively?
	 * @param {boolean} enabled Timing enabled (in dev mode and on Docs)?
	 * @returns {object}
	 */
	(function Timer(native, enabled) {
		var sets = {}; // for polyfilling
		var list = []; // for polyfilling

		/**
		 * Insert item chronologically correct (for polyfilling).
		 * @param {object} item
		 * @returns {object}
		 */
		function push(item) {
			var low = 0;
			var high = list.length;
			var mid;
			while (low < high) {
				mid = (low + high) >>> 1;
				if (list[mid].startTime < item.startTime) {
					low = mid + 1;
				} else {
					high = mid;
				}
			}
			list.splice(low, 0, item);
			return item;
		}

		return {
			/**
			 * Begin measurement.
			 * @param {string} key
			 * @returns {Timer}
			 */
			mark: function(key) {
				if (enabled) {
					if (native) {
						performance.mark('mark ' + key);
					} else {
						sets['$' + key] = Date.now();
					}
				}
				return this;
			},

			/**
			 * End measurement.
			 * @param {string} key
			 * @returns {object}
			 */
			stop: function(key) {
				if (enabled) {
					if (native) {
						performance.mark('stop ' + key);
						performance.measure(key, 'mark ' + key, 'stop ' + key);
						var entries = performance.getEntriesByName(key);
						return entries[entries.length - 1];
					} else {
						var init = sets['$' + key];
						return push({
							startTime: init,
							name: key,
							duration: Date.now() - init,
							itemType: 'measure'
						});
					}
				}
			},

			/**
			 * Get all measurements.
			 * @returns {Array<Object>}
			 */
			measurements: function() {
				if (enabled) {
					if (native) {
						return performance.getEntriesByType('measure');
					} else {
						return list.slice();
					}
				}
			}
		};
	})(
		!!(
			window.performance &&
			performance.mark &&
			performance.measure &&
			performance.getEntriesByName &&
			performance.getEntriesByType
		),
		!!(location.port === '10114' || location.host === 'ui.tradeshift.com')
	)
);

/*
 * Start the measurements.
 * TODO: These kinds of "saga" measurements into seperate script files!
 */
gui.$mark('boostrap everything');
gui.$mark('- parse spiritual');

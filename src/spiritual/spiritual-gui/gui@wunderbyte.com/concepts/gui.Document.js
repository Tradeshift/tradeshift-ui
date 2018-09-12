/**
 * Document lifecycle manager.
 * TODO: Support custom implementation?
 */
gui.Document = (function() {
	/**
	 * Dispatch global action to hosting document (if any).
	 * This will most likely get picked up by the containing
	 * {gui.IframeSpirit} so that it knows what's going on.
	 * @param {string} type
	 * @param @optional {object} data
	 */
	function doaction(type, data) {
		if (gui.hosted) {
			gui.Action.ascendGlobal(document, type, data);
		}
	}

	/**
	 * Dispatch one or more (local) broadcasts.
	 */
	function dobrodcast(/* ...types */) {
		gui.Array.make(arguments).forEach(function(type) {
			gui.Broadcast.dispatch(type);
		});
	}

	/**
	 * If the window width is zero, we assume that this iframe was
	 * either just created (and there is this bug in WebKit) or that
	 * the iframe is `display:none`. This would need to be accounted
	 * for in *all* spirits that measure width, height, display state
	 * and so on, so we will simply not run until iframe gets shown.
	 * Note that this may delay spiritualization to happen *async*
	 * sometimes after the `DOMContentLoaded` event has fired.
	 */
	function islayoutready() {
		return window.innerWidth > 0;
	}

	/*
	 * Create the class already.
	 */
	return gui.Class.create(Object.prototype, {
		/**
		 * Setup loads of event listeners.
		 */
		onconstruct: function() {
			var that = this,
				add = function(target, events, capture) {
					events.split(' ').forEach(function(type) {
						target.addEventListener(type, that, capture);
					});
				};
			add(document, 'visibilitychange');
			add(document, 'click mousedown mouseup', true);
			add(window, 'hashchange resize');
			if (!gui.hosted) {
				add(window, 'orientationchange');
			}
			if (!(window.chrome && chrome.app && chrome.runtime)) {
				add(window, 'unload');
			}
			/*
			 * Setup to support async loading (via `script.defer` or similar)
			 */
			if (document.readyState === 'loading') {
				add(document, 'DOMContentLoaded');
				add(window, 'load');
			} else {
				setImmediate(
					function parseTheRestOfTheScript() {
						this._ondom();
						if (document.readyState === 'interactive') {
							add(window, 'load');
						} else {
							this._onload();
						}
					}.bind(this)
				);
			}
		},

		/**
		 * Handle event.
		 * @param {Event} e
		 */
		handleEvent: function(e) {
			switch (e.type) {
				case 'click':
				case 'mousedown':
				case 'mouseup':
					this._onmouseevent(e);
					break;
				case 'orientationchange':
					this._onrotate();
					break;
				case 'resize':
					this._onresize();
					break;
				case 'DOMContentLoaded':
					this._ondom();
					break;
				case 'load':
					this._onload();
					break;
				case 'unload':
					this._onunload();
					break;
				case 'hashchange':
					this._onhashchange();
					break;
				case 'visibilitychange':
					this._onvisibilitychange(!document.hidden);
					break;
			}
		},

		// Private .................................................................

		/**
		 * Window loaded?
		 * @type {boolean}
		 */
		_loaded: false,

		/**
		 * DOMContentLoaded?
		 * @type {boolean}
		 */
		_domloaded: true,

		/**
		 * Resize-end timeout id.
		 * @type {number}
		 */
		_timeout: -1,

		/**
		 * TODO: broadcast from here to trigger the {gui.Guide}
		 *
		 * 1. Name all namespace members (toString methods and such)
		 * 2. Resolve META tags that may configure namespaces properties
		 * 3. Dispatch `DOMContentLoaded` action to hosting document
		 * 4. Broadcast 'DOMContentLoaded' status in two discrete steps
		 */
		_ondom: function() {
			this._domloaded = true;
			gui.$initialize();
			this._configure(gui.namespaces());
			(function onlayoutready() {
				if (islayoutready()) {
					doaction(gui.ACTION_DOC_ONDOMCONTENT, location.href);
					dobrodcast(
						gui.BROADCAST_TODOM, // intercepted in gui.extensions.js (if bundled)
						gui.BROADCAST_ONDOM // at this point we are finally ready
					);
				} else {
					setTimeout(onlayoutready); // wait for this iframe to be displayed...
				}
			})();
		},

		/**
		 * Dispatch `load` event to hosting document.
		 */
		_onload: function() {
			this._loaded = true;
			dobrodcast(gui.BROADCAST_TOLOAD, gui.BROADCAST_ONLOAD);
			doaction(gui.ACTION_DOC_ONLOAD, location.href);
		},

		/**
		 * Dispatch `unload` event to hosting document.
		 * TODO: https://developer.mozilla.org/en-US/docs/Using_Firefox_1.5_caching
		 */
		_onunload: function() {
			this._unloaded = true;
			gui.$shutdown();
			dobrodcast(gui.BROADCAST_TOUNLOAD, gui.BROADCAST_ONUNLOAD);
			doaction(gui.ACTION_DOC_UNLOAD, location.href);
		},

		/**
		 * Dispatch `hashchange` status to hosting document.
		 */
		_onhashchange: function() {
			doaction(gui.ACTION_DOC_ONHASH, location.hash);
		},

		/**
		 * Dispatch global broadcasts on selected mouse events
		 * (close that menu when the user clicks that iframe).
		 * @param {Event} e
		 */
		_onmouseevent: function(e) {
			gui.broadcastGlobal(
				{
					click: gui.BROADCAST_MOUSECLICK,
					mousedown: gui.BROADCAST_MOUSEDOWN,
					mouseup: gui.BROADCAST_MOUSEUP
				}[e.type],
				gui.$contextid
			);
		},

		/**
		 * Intensive resize procedures should subscribe
		 * to the resize-end message as broadcasted here.
		 */
		_onresize: function() {
			clearTimeout(this._timeout);
			this._timeout = setTimeout(function() {
				gui.Broadcast.dispatch(gui.BROADCAST_RESIZE_END);
			}, gui.TIMEOUT_RESIZE_END);
		},

		/**
		 * Device orientation changed.
		 * TODO: Make this local to all iframes (not just topframe)
		 * TODO: gui.Device of some sorts?
		 */
		_onrotate: function() {
			if (!gui.hosted) {
				gui.orientation = window.innerWidth > window.innerHeight ? 1 : 0;
				gui.broadcastGlobal(gui.BROADCAST_ORIENTATIONCHANGE, gui.orientation);
			}
		},

		/**
		 * Reflex all whenever the user comes back from other tab excursions.
		 * TODO: Figure out if nested iframes can even see this stuff and
		 * create something like `reflexGlobal` in case they really can't.
		 * @param {boolean} hidden
		 */
		_onvisibilitychange: function(visible) {
			gui.ready(function newchromeexception() {
				var root = gui.get(document.documentElement);
				if (visible && root) {
					root.reflex();
				}
			});
		},

		/**
		 * Resolve metatags that appear to
		 * configure stuff in namespaces.
		 * @param {Array<string>} spaces
		 */
		_configure: function(spaces) {
			var prop,
				def,
				metas = document.querySelectorAll('meta[name]');
			Array.forEach(metas, function(meta) {
				prop = meta.getAttribute('name');
				spaces.forEach(function(ns) {
					if (prop.startsWith(ns + '.')) {
						def = gui.Object.lookup(prop);
						if (gui.Type.isDefined(def)) {
							gui.Object.assert(prop, gui.Type.cast(meta.getAttribute('content')));
						} else {
							console.error('No definition for "' + prop + '"');
						}
					}
				});
			});
		}
	});
})();

/**
 * Here we go.
 */
gui.document = new gui.Document();

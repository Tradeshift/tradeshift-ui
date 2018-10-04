/**
 * Base constructor for all spirits.
 * TODO: Implement `dispose` method.
 */
gui.Spirit = gui.Class.create(
	Object.prototype,
	{
		/**
		 * Spirit element.
		 * @type {Element}
		 */
		element: null,

		/**
		 * Containing document (don't use).
		 * @deprecated
		 * @type {Document}
		 */
		document: document,

		/**
		 * Containing window (don't use).
		 * @deprecated
		 * @type {Window}
		 */
		window: window,

		/**
		 * Identification.
		 * @returns {String}
		 */
		toString: function() {
			return '[object gui.Spirit]';
		},

		/**
		 * Exorcise spirit from element.
		 * TODO: This whole thing with 'dispose' for all {gui.Class} things
		 */
		exorcise: function() {
			if (!this.life.destructed) {
				gui.Spirit.$destruct(this); // API user should cleanup here
				gui.Spirit.$dispose(this); // everything is destroyed here
			}
		},

		// Sync lifecycle ............................................................

		/**
		 * You can safely overload or overwrite methods in the lifecycle section,
		 * but you should always leave it to the {gui.Guide} to invoke them.
		 * Make sure to always call `this.super.method()` unless you really mean it.
		 */

		/**
		 * `onconstruct` gets called when the spirit is newed up. Spirit
		 * element may not be positioned in the document DOM at this point.
		 */
		onconstruct: function() {},

		/**
		 * `onconfigure` gets callen immediately after construction. This
		 * instructs the spirit to parse configuration attributes in markup.
		 * TODO: Rename to `onconfig`
		 * @see {gui.ConfigPlugin}
		 */
		onconfigure: function() {},

		/**
		 * `onenter` gets called when the spirit element is first
		 * encountered in the page DOM. This is only called once in
		 * the lifecycle of a spirit (unlike `attach`, see below).
		 */
		onenter: function() {},

		/**
		 * `onattach` gets called whenever
		 *
		 * 1. The spirit element is attached to the document DOM by some guy
		 * 2. The element is already in DOM when the page loads and the spirit
		 *		gets injected by the framework
		 */
		onattach: function() {},

		/**
		 * `onready` gets called (only once) when all descendant spirits
		 * are attached and ready. From a DOM tree perspective, this fires
		 * in reverse order, innermost first.
		 */
		onready: function() {},

		/**
		 * Experimental and not even supported.
		 */
		oninit: function() {},

		/**
		 * `ondetach` gets called whenever the spirit element is about to
		 * be detached from the DOM tree. Unless the element is appended
		 * somewhere else, this will schedule the spirit for destruction.
		 */
		ondetach: function() {},

		/**
		 * `onexit` gets called if the spirit element has been *manually* detached
		 * and not re-attached in the same execution stack. Spirit is not positioned
		 * in the document DOM at this point.
		 */
		onexit: function() {},

		/**
		 * Invoked when spirit is about to be destroyed. Code your last wishes here.
		 * Spirit element may not be positioned in the document DOM at this point.
		 * @TODO: This method currently is NOT CALLED during window.unload, in
		 * that case we skip directly to {gui.GreatSpirit}. Would be nice if the
		 * spirit could eg. save stuff to localstorage at this point...
		 */
		ondestruct: function() {},

		// Async lifecycle ...........................................................

		/**
		 * Invoked some milliseconds after `onattach` to give the browser a repaint
		 * break. TODO: Should be evaluated after 'appendChild' to another position.
		 */
		onasync: function() {},

		// Handlers ..................................................................

		/**
		 * Handle crawler (tell me more)
		 * @param {gui.Crawler} crawler
		 * @returns {number}
		 */
		oncrawler: function(crawler) {},

		// Layout ....................................................................

		/**
		 * Add-hoc reflex mechanism.
		 * @param @optional {function} action
		 * @param @optional {object} thisp
		 */
		reflex: function(action, thisp) {
			if (action) {
				action.apply(thisp);
			}
			new gui.Crawler(gui.CRAWLER_REFLEX).descend(this, {
				handleSpirit: function(spirit) {
					spirit.onflex();
				}
			});
		},

		/**
		 *
		 */
		onflex: function() {},

		// Privileged ................................................................

		/**
		 * Unique key for this spirit instance.
		 * @TODO: Uppercase to imply read-only.
		 * @type {String}
		 */
		$instanceid: null,

		/**
		 * Matches the property `$contextid` of the local `gui` object.
		 * TODO: rename this property
		 * TODO: perhapse deprecate?
		 * TODO: really just deprecate!
		 * @type {String}
		 */
		$contextid: null,

		/**
		 * Don't try anything funny.
		 * @type {boolean}
		 */
		$destructed: false,

		/**
		 * Secret constructor invoked before `onconstruct`.
		 * @param {Element} elm
		 */
		$onconstruct: function(elm) {
			this.$contextid = gui.$contextid;
			this.element = elm;
			this.document = document; // TODO: deprecate
			this.window = window; // TODO: deprecate
			gui.Spirit.$construct(this);
		},

		/**
		 * Secret destructor invvoked after `ondestruct`.
		 */
		$ondestruct: function() {},

		/**
		 * Plug in the plugins. Lazy plugins will be newed up when needed.
		 *
		 * - {gui.LifePlugin} first
		 * - {gui.ConfigPlugin} second
		 * - bonus plugins galore
		 *
		 * @TODO: To preserve order, refactor plugins stack from object to array
		 */
		$pluginplugins: function() {
			var Plugin,
				plugins = this.constructor.$plugins;
			this.life = new gui.LifePlugin(this);
			this.config = new gui.ConfigPlugin(this);
			Object.keys(plugins)
				.filter(function(prefix) {
					return prefix !== 'life' && prefix !== 'config';
				})
				.sort()
				.forEach(function(prefix) {
					Plugin = plugins[prefix];
					if ((this.life.plugins[prefix] = !Plugin.lazy)) {
						gui.Plugin.$assign(this, prefix, new Plugin(this));
					} else {
						gui.Plugin.$prepare(this, prefix, Plugin);
					}
				}, this);
		},

		/**
		 * In debug mode, stamp the spirit constructor name onto the spirit element.
		 * Square brackets indicate that the `gui` attribute was added by this method.
		 * @param {boolean} constructing
		 */
		$debug: function(constructing) {
			if (gui.debug) {
				var val,
					elm = this.element;
				var fix = gui.attributes[0]; // by default using `gui`
				if (constructing) {
					if (
						gui.attributes.every(function(f) {
							return !elm.hasAttribute(f);
						})
					) {
						val = '[' + this.constructor.$classname + ']';
						elm.setAttribute(fix, val);
					}
				} else {
					val = elm.getAttribute(fix);
					if (val && val.startsWith('[')) {
						elm.removeAttribute(fix);
					}
				}
			}
		}
	},
	{
		// Xstatic (copied onto subclass constructors) ............................

		/**
		 * Portal spirit into iframes via the `gui.portal` method?
		 * @see {ui#portal}
		 * @type {boolean}
		 */
		portals: true,

		/**
		 * Create DOM element and associate gui.Spirit instance.
		 * @param @optional {Document} doc
		 * @returns {gui.Spirit}
		 */
		summon: function(doc) {
			return this.possess((doc || document).createElement('div'));
		},

		/**
		 * Associate gui.Spirit instance to DOM element.
		 * @param {Element} element
		 * @returns {gui.Spirit}
		 */
		possess: function(element) {
			return gui.Guide.$possess(element, this);
		},

		/**
		 * Extend with plugins.
		 * @TODO: move all this to {gui.Class}
		 * @TODO: validate that user isn't declaring non-primitives on the prototype
		 * @param {object} extension
		 * @param {object} recurring
		 * @param {object} statics
		 * @returns {gui.Spirit}
		 */
		extend: function() {
			var C = gui.Class.extend.apply(this, arguments);
			C.$plugins = gui.Object.copy(this.$plugins);
			return C;
		},

		/**
		 * Assign plugin to prefix, checking for naming collision. Prepared for
		 * a scenario where spirits may have been declared before plugins load.
		 * TODO: Stamp the plugin on the prototype instead, if at all possible.
		 * @param {String} prefix "att", "dom", "action", "event" etc
		 * @param {function} plugin Constructor for plugin
		 * @param @optional {boolean} override Disable collision detection
		 * @returns {ts.gui.Spirit}
		 */
		plugin: function(prefix, plugin, override) {
			var plugins = this.$plugins;
			var proto = this.prototype;
			if (!proto.hasOwnProperty(prefix) || proto.prefix === null || override) {
				if (!plugins[prefix] || override) {
					plugins[prefix] = plugin;
					proto.prefix = null;
					gui.Class.children(this, function(child) {
						child.plugin(prefix, plugin, override); // recursing to descendants
					});
				}
			} else {
				console.error('Plugin naming crash in ' + this + ': ' + prefix);
			}
			return this;
		},

		// Privileged ................................................................

		/**
		 * Mapping plugin prefix to plugin constructor.
		 * @type {Map<String,function>}
		 */
		$plugins: Object.create(null)
	},
	{
		// Static privileged ......................................................

		/**
		 * Spirit construct gets called by the secret constructor `$onconstruct`.
		 * @param {gui.Spirit} spirit
		 */
		$construct: function(spirit) {
			spirit.$pluginplugins();
			spirit.$debug(true);
			spirit.life.constructed = true;
			spirit.onconstruct();
			spirit.life.dispatch(gui.LIFE_CONSTRUCT);
		},

		/**
		 * Spirit configure.
		 * @param {gui.Spirit} spirit
		 */
		$configure: function(spirit) {
			spirit.config.configureall();
			spirit.life.configured = true;
			spirit.onconfigure();
			spirit.life.dispatch(gui.LIFE_CONFIGURE);
		},

		/**
		 * Spirit enter.
		 * @param {gui.Spirit} spirit
		 */
		$enter: function(spirit) {
			gui.Guide.$inside(spirit);
			spirit.life.entered = true;
			spirit.onenter();
			spirit.life.dispatch(gui.LIFE_ENTER);
		},

		/**
		 * Spirit attach.
		 * @param {gui.Spirit} spirit
		 */
		$attach: function(spirit) {
			gui.Guide.$inside(spirit);
			spirit.life.attached = true;
			spirit.life.detached = false;
			spirit.onattach();
			spirit.life.dispatch(gui.LIFE_ATTACH);
		},

		/**
		 * Spirit ready.
		 * @param {gui.Spirit} spirit
		 */
		$ready: function(spirit) {
			spirit.life.ready = true;
			spirit.onready();
			spirit.life.dispatch(gui.LIFE_READY);
			gui.$getnow(spirit.element);
		},

		/**
		 * Spirit detach.
		 * @param {gui.Spirit} spirit
		 */
		$detach: function(spirit) {
			gui.Guide.$outside(spirit);
			spirit.life.attached = false;
			spirit.life.detached = true;
			spirit.life.visible = false; // TODO: remove this!
			spirit.life.dispatch(gui.LIFE_DETACH);
			spirit.life.dispatch(gui.LIFE_INVISIBLE); // ... and this!
			spirit.ondetach();
		},

		/**
		 * Spirit exit.
		 * @param {gui.Spirit} spirit
		 */
		$exit: function(spirit) {
			spirit.life.exited = true;
			spirit.life.dispatch(gui.LIFE_EXIT);
			spirit.onexit();
		},

		/**
		 * Spirit async.
		 * @TODO: This should be evaluated after `appendChild` to another position.
		 * @param {gui.Spirit} spirit
		 */
		$async: function(spirit) {
			spirit.life.async = true;
			spirit.onasync(); // TODO: life cycle stuff goes here
			spirit.life.dispatch(gui.LIFE_ASYNC);
		},

		/**
		 * Spirit destruct.
		 * @param {gui.Spirit} spirit
		 */
		$destruct: function(spirit) {
			spirit.$debug(false);
			spirit.life.destructed = true;
			spirit.life.dispatch(gui.LIFE_DESTRUCT);
			spirit.ondestruct();
		},

		/**
		 * Spirit dispose. This calls the secret destructor `$ondestruct`.
		 * @see {gui.Spirit#$ondestruct}
		 * @param {gui.Spirit} spirit
		 */
		$dispose: function(spirit) {
			spirit.$ondestruct();
			spirit.$destructed = true;
			gui.Guide.$forget(spirit);
			gui.Garbage.$collect(spirit);
		},

		/**
		 * TODO: Init that spirit (work in progress)
		 * TODO: wait and done methods to support this
		 * @param {gui.Spirit} spirit
		 */
		$oninit: function(spirit) {
			spirit.life.initialized = true;
			spirit.life.dispatch('life-initialized');
			spirit.oninit();
		}
	}
);

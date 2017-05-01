/**
 * Base constructor for all plugins.
 * TODO: "context" should be required in constructor (sandbox scenario)
 */
gui.Plugin = gui.Class.create(
	Object.prototype,
	{
		/**
		 * The {gui.Class} for whom the plugin is plugged into.
		 * @type {gui.Spirit|gui.Plugin|edb.Object|edb.Array}
		 */
		client: null,

		/**
		 * If client is a spirit, this property is it.
		 * TODO: Move to gui-spirits@wunderbyte.com
		 * @type {gui.Spirit}
		 */
		spirit: null,

		/**
		 * Plugins may be designed to work without an associated spirit.
		 * In that case, an external entity might need to define this.
		 * @type {Global} Typically identical to `window`
		 */
		context: null,

		/**
		 * Construct
		 */
		onconstruct: function() {},

		/**
		 * Destruct.
		 */
		ondestruct: function() {},

		/**
		 * Implements DOM2 EventListener (native event handling).
		 * We forwards the event to method 'onevent' IF that has
		 * been specified on the plugin.
		 * TODO: move to $protected area
		 * @param {Event} e
		 */
		handleEvent: function(e) {
			if (gui.Type.isFunction(this.onevent)) {
				this.onevent(e);
			}
		},

		// Privileged ................................................................

		/**
		 * Flag destructed status.
		 * TODO: Move this to {gui.Class}
		 */
		$destructed: false,

		/**
		 * Secret constructor. Called before `onconstruct`.
		 * @param {gui.Spirit} spirit
		 */
		$onconstruct: function(client) {
			this.client = client;
			if (gui.hasModule('gui-spirits@wunderbyte.com')) {
				if (client instanceof gui.Spirit) {
					this.spirit = client || null;
					this.context = window; // otherwise web worker scenario, maybe deprecate
				}
			}
			this.onconstruct();
		},

		/**
		 * Secret destructor. Called after `ondestruct`.
		 */
		$ondestruct: function() {}
	},
	{
		// Xstatic ................................................................

		/**
		 * Construct only when requested?
		 * @type {boolean}
		 */
		lazy: true
	},
	{
		// Static .................................................................

		/**
		 * Lazy plugins are newed up only when needed. We'll create an
		 * accessor for the prefix that will instantiate the plugin and
		 * create a new accesor to return it. To detect if a plugin
		 * has been instantiated, check with {gui.LifePlugin#plugins}.
		 * That's a hashmap that maps plugin prefixes to a boolean status.
		 * @param {gui.Spirit} spirit
		 * @param {String} prefix
		 * @param {function} Plugin
		 */
		$prepare: function(spirit, prefix, Plugin) {
			Object.defineProperty(spirit, prefix, {
				enumerable: true,
				configurable: true,
				get: function() {
					var plugin = new Plugin(this);
					this.life.plugins[prefix] = true;
					gui.Plugin.$assign(spirit, prefix, plugin);
					return plugin;
				}
			});
		},

		/**
		 * Assign plugin to prefix in such a clever way
		 * that it cannot accidentally be overwritten.
		 * TODO: Importantly handle 'force' parameter when overriding a plugin!
		 * @param {gui.Spirit} spirit
		 * @param {String} prefix
		 * @param {gui.Plugin} plugin
		 */
		$assign: function(spirit, prefix, plugin) {
			Object.defineProperty(spirit, prefix, {
				enumerable: true,
				configurable: true,
				get: function() {
					return plugin;
				},
				set: function() {
					throw new Error(
						'The property name "' +
							prefix +
							'" is reserved for the ' +
							plugin.$classname +
							' and cannot be redefined.' // note about 'force'!
					);
				}
			});
		}
	}
);

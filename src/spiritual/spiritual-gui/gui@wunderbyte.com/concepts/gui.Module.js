/**
 * Module base. Unknown to many, new
 * modules will be a subclass of this.
 */
gui.Module = gui.Class.create(
	Object.prototype,
	{
		/**
		 * Called immediately. Other modules may not be parsed yet.
		 * TODO: Migrate to 'onrun' in the long run.
		 * @return {Window} context
		 */
		oncontextinitialize: function() {},

		/**
		 * Called immediately. Other modules may not be parsed yet.
		 * @type {function}
		 */
		onrun: function() {},

		/**
		 * Called on DOMContentLoaded.
		 * @type {function}
		 */
		ondom: function() {},

		/**
		 * Called on load.
		 * @type {function}
		 */
		onload: function() {},

		/**
		 * Called on unload.
		 * @type {function}
		 */
		onunload: function() {},

		// Privileged ................................................................

		/**
		 * Module identity token.
		 * @type {string}
		 */
		$modname: null,

		/**
		 * Secret constructor.
		 * @param {string} name
		 */
		$onconstruct: function(name) {
			this.$modname = name;
			this.toString = function() {
				return '[module ' + name + ']';
			};
		}
	},
	{},
	{
		// Static .............................................................

		/**
		 * Register module, although please use 'gui.module()' to do so.
		 * TODO: deprecate oncontextinitialize!
		 * @param {gui.Module} module
		 * @returns {gui.Module}
		 */
		$register: function(module) {
			var name = module.$modname;
			if (!this.$hasModule(name)) {
				this._modules.push(module);
				if (gui.Type.isFunction(module.oncontextinitialize)) {
					module.oncontextinitialize(window);
				}
				if (gui.Type.isFunction(module.onrun)) {
					module.onrun();
				}
			} else {
				throw new Error(name + ' loaded twice?');
			}
			return module;
		},

		/**
		 * Module registered by name?
		 * @param {string} name
		 * @returns {boolean}
		 */
		$hasModule: function(name) {
			return this._modules.some(function(module) {
				return module.$modname === name;
			});
		},

		/**
		 * Collecting modules.
		 * @type {Array<gui.Module>}
		 */
		_modules: []
	}
);

/**
 * Hookup modules to document lifecycle.
 * @param {Array<gui.Module>} modules
 */
(function hookup(modules) {
	gui.Object.each(
		{
			ondom: gui.BROADCAST_TODOM,
			onload: gui.BROADCAST_TOLOAD,
			onunload: gui.BROADCAST_TOUNLOAD
		},
		function associate(action, broadcast) {
			gui.Broadcast.add(broadcast, {
				onbroadcast: function() {
					modules.forEach(function(module) {
						module[action]();
					});
				}
			});
		}
	);
})(gui.Module._modules);

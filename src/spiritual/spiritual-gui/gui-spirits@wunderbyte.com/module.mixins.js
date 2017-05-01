/**
 * Support spirits.
 */
gui.Module.mixin(
	{
		/**
		 * Plugins for all spirits.
		 * @type {Map<String,gui.Plugin>}
		 *
		 plugin: null,
		 
		 /**
		 * Mixins for all spirits.
		 * @type {Map<String,function>}
		 *
		 mixin: null,
		 
		 /**
		 * Channeling spirits to CSS selectors.
		 * @type {Map<Array<Array<String,gui.Spirit>>}
		 *
		 channel: null,
		 */

		/**
		 * Called before spirits kick in.
		 * @return {Window} context
		 */
		onbeforespiritualize: function() {},

		/**
		 * Called after spirits kicked in.
		 * @return {Window} context
		 */
		onafterspiritualize: function() {},

		// Privileged ................................................................

		/**
		 * Secret constructor.
		 *
		 * 1. Extend {gui.Spirit} with mixins
		 * 2. Channel spirits to CSS selectors
		 * 3. Assign plugins to all {gui.Spirit}
		 * @overwrites {gui.Module.$onconstruct}
		 */
		$onconstruct: function(name) {
			this.$modname = name;
			gui.Module.$init(this);
			this.toString = function() {
				return '[module ' + name + ']';
			};
		}
	},
	{},
	{
		// Static .............................................................

		/**
		 * @param {gui.Module} module
		 */
		$init: function(module) {
			if (gui.Type.isObject(module.mixin)) {
				gui.Spirit.mixin(module.mixin);
			}
			if (gui.Type.isArray(module.channel)) {
				gui.channel(module.channel);
			}
			if (gui.Type.isObject(module.plugin)) {
				gui.Object.each(module.plugin, function(prefix, Plugin) {
					if (gui.Type.isDefined(Plugin)) {
						gui.Spirit.plugin(prefix, Plugin);
					} else {
						// TODO: move check into gui.Spirit.plugin
						console.error('Undefined plugin for prefix: ' + prefix);
					}
				});
			}
		}
	}
);

/**
 * @param {Array<gui.Module>} modules
 */
(function catchup(modules) {
	modules.forEach(gui.Module.$init);
})(gui.Module._modules);

/**
 * Hookup modules to spirits lifecycle.
 * Broadcasts dispatched by {gui.Guide}.
 * @param {Array<gui.Module>} modules
 */
(function hookup(modules) {
	gui.Object.each(
		{
			onbeforespiritualize: gui.BROADCAST_WILL_SPIRITUALIZE,
			onafterspiritualize: gui.BROADCAST_DID_SPIRITUALIZE
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

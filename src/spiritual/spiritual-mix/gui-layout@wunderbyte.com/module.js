/**
 * It's the layout module.
 */
gui.module("gui-layout@wunderbyte.com", {

	/**
	 * Assign plugins to prefixes for all {gui.Spirit}.
	 */
	plugin: {
		"tween": gui.TweenPlugin,
		"transition": gui.TransitionPlugin,
		"visibility": gui.VisibilityPlugin
	},

	/**
	 * Methods added to {gui.Spirit.prototype}
	 */
	mixin: {

		/**
		 * Handle tween.
		 * @param {gui.Tween}
		 */
		ontween: function(tween) {},

		/**
		 * Handle transiton end.
		 * @param {gui.TransitionEnd} transition
		 */
		ontransition: function(transition) {},

		/**
		 * Handle visibility.
		 */
		onvisible: function() {},

		/**
		 * Handle invisibility.
		 */
		oninvisible: function() {}
	}

});

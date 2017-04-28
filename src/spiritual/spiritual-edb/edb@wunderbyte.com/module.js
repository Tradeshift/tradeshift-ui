/*
 * Register module.
 */
gui.module('edb@wunderbyte.com', {
	/*
	 * Register plugins for all spirits
	 * (if the GUI spirits are avilable).
	 */
	plugin: {
		input: edb.InputPlugin
	},

	/**
	 * Register method for all spirits.
	 * (if the GUI spirits are avilable).
	 */
	mixin: {
		/**
		 * Do `typeinstance.output()` to trigger this method.
		 * The `input.data` property points to `typeinstance`
		 * @param {edb.Input} input
		 */
		oninput: function(input) {
			// do something with input.data...
		}
	}
});

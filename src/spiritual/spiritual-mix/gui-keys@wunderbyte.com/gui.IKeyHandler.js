/**
 * Interface KeyHandler
 */
gui.IKeyHandler = {
	/**
	 * Identification.
	 * @returns {String}
	 */
	toString: function() {
		return '[object IKeyHandler]';
	},

	/**
	 * Handle key
	 * @param {gui.Key} key
	 */
	onkey: function(key) {}
};

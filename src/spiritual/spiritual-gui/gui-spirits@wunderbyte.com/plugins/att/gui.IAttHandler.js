/**
 * Interface AttHandler.
 */
gui.IAttHandler = {
	/**
	 * Identification.
	 * @returns {String}
	 */
	toString: function() {
		return '[object IAttHandler]';
	},

	/**
	 * Handle attribute update.
	 * @param {gui.Action} action
	 */
	onatt: function(att) {}
};

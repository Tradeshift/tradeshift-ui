/**
 * Interface EventHandler.
 *
 */
gui.IEventHandler = {
	/**
	 * Identification.
	 * @returns {String}
	 */
	toString: function() {
		return '[object IEventHandler]';
	},

	/**
	 * Native DOM interface. We'll forward the event to the method `onevent`.
	 * @see http://www.w3.org/TR/DOM-Level-3-Events/#interface-EventListener
	 * @param {Event} e
	 */
	handleEvent: function(e) {},

	/**
	 * Conforms to other Spiritual event handlers.
	 * @param {Event} e
	 */
	onevent: function(e) {}
};

/**
 * Spirit of the HTML element.
 * @extends {gui.Spirit}
 */
gui.DocumentSpirit = gui.Spirit.extend({
	/**
	 * Get ready.
	 * TODO: think more about late loading (module loading) scenario
	 * TODO: let's go _waiting only if parent is a Spiritual document
	 */
	onready: function() {
		this.super.onready();
		this.action.dispatchGlobal(gui.ACTION_DOC_ONSPIRITUALIZED);
		this.broadcast.add(gui.BROADCAST_RESIZE_END);
	},

	/**
	 * Handle broadcast.
	 * @param {gui.Broadcast} b
	 */
	onbroadcast: function(b) {
		this.super.onbroadcast(b);
		if (b.type === gui.BROADCAST_RESIZE_END) {
			this.reflex();
		}
	},

	// Private ...................................................................

	/**
	 * Flipped on window.onload
	 * @type {boolean}
	 */
	_loaded: false,

	/**
	 * Waiting for hosting {gui.IframeSpirit} to relay visibility status?
	 * @type {boolean}
	 */
	_waiting: false,

	/**
	 * Timeout before we broadcast window resize ended.
	 * This timeout cancels itself on each resize event.
	 * @type {number}
	 */
	_timeout: null
});

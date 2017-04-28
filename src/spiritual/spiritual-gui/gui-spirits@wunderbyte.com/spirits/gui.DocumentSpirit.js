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
		if ((this.waiting = gui.hosted)) {
			// TODO: get rid of this :(
			this.action.addGlobal(gui.$ACTION_XFRAME_VISIBILITY);
		}
		this.action.dispatchGlobal(gui.ACTION_DOC_ONSPIRITUALIZED);
		this.broadcast.add(gui.BROADCAST_RESIZE_END);
	},

	/**
	 * Handle action.
	 * TODO: Completely remove this xframe visibility stuff!
	 * @param {gui.Action} a
	 */
	onaction: function(a) {
		this.super.onaction(a);
		this.action.$handleownaction = false;
		switch (a.type) {
			case gui.$ACTION_XFRAME_VISIBILITY:
				this._waiting = false;
				if (gui.hasModule('gui-layout@wunderbyte.com')) {
					// TODO: - fix
					if (a.data === true) {
						this.visibility.on();
					} else {
						this.visibility.off();
					}
				}
				a.consume();
				break;
		}
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

	/**
	 * Don't crawl for visibility inside iframed documents until
	 * hosting {gui.IframeSpirit} has reported visibility status.
	 * @param {gui.Crawler} crawler
	 */
	oncrawler: function(crawler) {
		var dir = this.super.oncrawler(crawler);
		if (dir === gui.Crawler.CONTINUE) {
			switch (crawler.type) {
				case gui.CRAWLER_VISIBLE:
				case gui.CRAWLER_INVISIBLE:
					if (this._waiting) {
						dir = gui.Crawler.STOP;
					}
					break;
			}
		}
		return dir;
	},

	/**
	 * Relay visibility from ancestor frame (match iframe visibility).
	 */
	onvisible: function() {
		this.css.remove(gui.CLASS_INVISIBLE);
		this.super.onvisible();
	},

	/**
	 * Relay visibility from ancestor frame (match iframe visibility).
	 */
	oninvisible: function() {
		this.css.add(gui.CLASS_INVISIBLE);
		this.super.oninvisible();
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

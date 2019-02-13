/**
 * Manager of iframes.
 * TODO(jmo@): This file is not used in app iframes, but still needs to be
 * subclassed by both top.js and sub.js, so we're stashing it here for now.
 */
ts.ui.MainFrameSpirit = ts.ui.Spirit.extend({
	/**
	 * True while loading our new app.
	 * Two iframes exist at this point.
	 * @type {boolean}
	 */
	loading: false,

	/**
	 * Configure much.
	 */
	onconfigure: function() {
		this.super.onconfigure();
		this.event.add('message', window);
		this.css.add(ts.ui.CLASS_MAINFRAME);
		this.action
			.add([
				ts.ui.ACTION_FRAME_ONDOM,
				ts.ui.ACTION_FRAME_ONLOAD,
				ts.ui.ACTION_FRAME_ONHASH,
				ts.ui.ACTION_FRAME_UNLOAD
			])
			.addGlobal(ts.ui.ACTION_GLOBAL_DOCUMENT_TITLE);

		// we're using the `ts-mainframe` class in the apps window now...
		this.css.remove('ts-mainframe').add('ts-mainframe-renamed');
	},

	/**
	 * Handle actions, making sure that actions from
	 * an unloading app doesn't reach the top window.
	 * @param {gui.Action} a
	 */
	onaction: function(a) {
		var target = a.target,
			newframe = this._newframe;
		this.super.onaction(a);
		switch (a.type) {
			case ts.ui.ACTION_GLOBAL_DOCUMENT_TITLE:
				if (target !== newframe) {
					a.consume();
				}
				break;
			case ts.ui.ACTION_FRAME_ONDOM:
				if (target === newframe) {
					this._prepareonload();
				} else {
					a.consume();
				}
				break;
			case ts.ui.ACTION_FRAME_ONLOAD:
				a.consume(); // using ONDOM for now...
				break;
			case ts.ui.ACTION_FRAME_ONHASH:
				if (target !== newframe) {
					a.consume();
				}
				break;
			case ts.ui.ACTION_FRAME_UNLOAD:
				if (target === newframe) {
					this._loading(true);
					this._unload();
				} else {
					a.consume();
				}
				break;
		}
	},

	/**
	 * Handle event.
	 * @param {Event} e
	 */
	onevent: function(e) {
		this.super.onevent(e);
		if (e.type === 'message') {
			if (this._newframe && e.source === this._newframe.contentWindow) {
				switch (e.data) {
					case ts.ui.MESSAGE_BUSY:
						console.error('TODO: implement mechanism for delaying _onload()');
						break;
					case ts.ui.MESSAGE_DONE:
						this._prepareonload();
						break;
				}
			}
		}
	},

	/**
	 * Load something.
	 * @param {String} href
	 * @returns {boolean} True when something completely new gets loaded
	 */
	load: function(href) {
		if (href !== this._href) {
			this._href = href;
			this._loading(true);
			return this._load(this._href);
		}
		return false;
	},

	// Private ...................................................................

	/**
	 * Allow the UI to stabilize before we show it.
	 * @type {number} Timeout in milliseconds
	 */
	_COSMETIC_TIMEOUT: 10,

	/**
	 * @type {String}
	 */
	_href: null,

	/**
	 * Currently hosted URL path excluding the hash.
	 * @type {String}
	 */
	_path: null,

	/**
	 * Current or next iframe.
	 * @type {ts.ui.FrameSpirit}
	 */
	_newframe: null,

	/**
	 * Old iframe. Soon dead.
	 * @type {ts.ui.FrameSpirit}
	 */
	_oldframe: null,

	/**
	 * Prepare do declare everything loaded when
	 *
	 * 1. the 'onload' event fires on the iframe
	 * 2. the iframe does postmessage 'ts-ready'
	 */
	_prepareonload: function() {
		var time = this._COSMETIC_TIMEOUT;
		this.tick.time(function() {
			this._onload();
		}, time);
	},

	/**
	 * Create new iframe. We listen for the `DOMContentLoaded`
	 * event to fire before we show the app, perhaps something
	 * more elaborate should be implemented at some point
	 * (like a message dispatched manually from the iframe).
	 * @return {ts.ui.FrameSpirit}
	 */
	_createframe: function() {
		var Frame = this._frameimplementation();
		var frame = Frame.summon();
		return this._showframe(frame, false);
	},

	/**
	 * So that subclass may overwrite it. Eh.
	 * @returns {constructor}
	 */
	_frameimplementation: function() {
		return ts.ui.FrameSpirit;
	},

	/**
	 * Start loading.
	 * @param {String} href
	 * @returns {boolean} True when something completely new gets loaded
	 */
	_load: function(href) {
		var cuts = href.split('#');
		var path = cuts[0];
		if (path !== this._path) {
			this._loadnew(href);
			this._path = path;
			return true;
		} else {
			this._sameold(href);
			return false;
		}
	},

	/**
	 * Load new iframe, prepare to nuke old iframe (if any).
	 * @param {String} href
	 */
	_loadnew: function(href) {
		this._switchframes();
		this._newframe.load(href).then(function onload() {
			this.dom.append(this._newframe);
		}, this);
	},

	/**
	 * Update location hash inside the current iframe (this._newframe).
	 * @param {string} hash
	 */
	_sameold: function(hash) {
		this._newframe.load(hash).then(function() {
			this._loading(false);
		}, this);
	},

	/**
	 * Create new `this._newframe` and mark current frame as oldframe.
	 * The frames will not *visibly* toggle until newframe is loaded.
	 */
	_switchframes: function() {
		var oldframe = (this._oldframe = this._newframe);
		this._newframe = this._createframe();
		if (oldframe) {
			oldframe.action.descendGlobal(ts.ui.ACTION_GLOBAL_TERMINATE);
		}
	},

	/**
	 * Content page done loading.
	 */
	_onload: function() {
		this._loading(false);
		this._toggle();
	},

	/**
	 * Content page unloading. If the user is refreshing the
	 * iframe via contextmenu or something, this will look
	 * a lot better if we hide the frame while reloading.
	 */
	_unload: function() {
		this._showframe(this._newframe, false);
	},

	/**
	 * Show new frame and nuke the old.
	 */
	_toggle: function() {
		var oldframe;
		this._showframe(this._newframe, true);
		if ((oldframe = this._oldframe)) {
			this._oldframe = null;
			this._showframe(oldframe, false);
			this._cleanup(oldframe);
		}
		this._newframe.action.descendGlobal(ts.ui.ACTION_GLOBAL_COMPLETED);
	},

	/**
	 * Mark shebang as loading or done.
	 * Cosmetically allow batch loading
	 * to ride along a single busy/done,
	 * prevents cursor-style flickering.
	 * @param {boolean} is
	 */
	_loading: function(is) {
		this.loading = is;
		var classn = ts.ui.CLASS_READY;
		if (is) {
			this.css.remove(classn);
		} else {
			gui.Tick.time(
				function() {
					this.css.add(classn);
				},
				100,
				this
			);
		}
	},

	/**
	 * Show or hide the frame.
	 * @param {ts.ui.FrameSpirit} frame
	 * @param {boolean} show
	 * @returns {ts.ui.FrameSpirit}
	 */
	_showframe: function(frame, show) {
		if (show) {
			frame.css.visibility = '';
			frame.visibility.on();
		} else {
			frame.css.visibility = 'hidden';
			frame.visibility.off();
		}
		return frame;
	},

	/**
	 * Nuke old frame.
	 * @param {ts.ui.FrameSpirit} oldframe
	 * TODO (jmo@): IE9 goes "attempt to handle destructed
	 * spirit..." on dom.remove();.
	 */
	_cleanup: function(oldframe) {
		if (gui.Client.isExplorer9) {
			(function iehotfix() {
				var iframe = oldframe.element;
				gui.materialize(iframe);
				iframe.parentNode.removeChild(iframe);
			})();
		} else {
			oldframe.dom.remove();
		}
	}
});

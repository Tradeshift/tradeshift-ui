/**
 * Note: Just because this happens to be the last loaded module (in Spiritual).
 */
gui.$stop('- parse spiritual');

/**
 * Keys module.
 * @TODO http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents
 * @TODO http://dev.opera.com/articles/view/functional-key-handling-in-opera-tv-store-applications/
 */
gui.KeysModule = gui.module('gui-keys@wunderbyte.com', {
	/*
	 * Plugins (for all spirits).
	 * @TODO: combo
	 */
	plugin: {
		key: gui.KeyPlugin
	},

	/*
	 * Mixins (for all spirits).
	 */
	mixin: {
		/**
		 * Handle key.
		 * @param {gui.Key} key
		 * @implements {gui.IKeyHandler}
		 */
		onkey: function(key) {}
	},

	/**
	 * Context init.
	 * @param {Window} context
	 */
	oncontextinitialize: function(context) {
		this._keymap = Object.create(null);
		['keydown', 'keypress', 'keyup'].forEach(function(type) {
			context.document.addEventListener(type, this, false);
		}, this);
	},

	/**
	 * Handle event.
	 * @param {KeyEvent} e
	 */
	handleEvent: function(e) {
		this._modifiers(e);
		this._oldschool(e);
		/*
		if ( gui.Type.isDefined ( e.repeat )) { // bypass DOM3 for now
			this._newschool ( e );
		} else {
			this._oldschool ( e );
		}
		*/
	},

	// Private ..........................................................

	/**
	 * Mapping keycodes to characters between keydown and keypress event.
	 * @type {Map<number,String>}
	 */
	_keymap: null,

	/*
	 * Snapshot latest broadcast to prevent
	 * doubles in mysterious Gecko cornercase.
	 * @type {String}
	 */
	_snapshot: null,

	/**
	 * DOM3 style events. Skipped for now since Opera 12 appears
	 * to fire all events repeatedly while key pressed, that correct?
	 * Also, event.repeat is always false, that doesn't make sense...
	 * @param {Event} e
	 */
	_newschool: function(e) {},

	/**
	 * Conan the Barbarian style events.
	 * At least they suck in a known way.
	 * @param {Event} e
	 */
	_oldschool: function(e) {
		var n = e.keyCode,
			c = this._keymap[n];
		var id = e.currentTarget.defaultView.gui.$contextid;
		switch (e.type) {
			case 'keydown':
				if (c === undefined) {
					this._keycode = n;
					this._keymap[n] = null;
					this._keymap[n] = String.fromCharCode(e.which).toLowerCase();
					gui.Tick.next(function() {
						c = this._keymap[n];
						this._maybebroadcast(true, null, c, n, id);
						this._keycode = null;
					}, this);
				}
				break;
			case 'keypress':
				if (this._keycode) {
					c = this._keychar(e.keyCode, e.charCode, e.which);
					this._keymap[this._keycode] = c;
				}
				break;
			case 'keyup':
				if (c !== undefined) {
					this._maybebroadcast(false, null, c, n, id);
					delete this._keymap[n];
				}
				break;
		}
	},

	/**
	 * Doh! We would at one point broadcast every keystroke to support cross-frame
	 * keyboard shortcuts (which is still a future project), but then we realized
	 * that we had really build a cross-frame keylogger and now we only broadcast
	 * special keys such as UP, DOWN, LEFT, RIGHT, ENTER and ESCAPE and so on.
	 * If needed, we could probably (safely) broadcast key combos such as `Shift+S`.
	 * @see https://w3c.github.io/uievents/#fixed-virtual-key-codes
	 * @param {boolean} down
	 * @param {String} key Newschool ABORTED FOR NOW
	 * @param {String} c (char) Bothschool
	 * @param {number} code Oldschool
	 * @param {String} sig Contextkey
	 */
	_maybebroadcast: function(down, key, c, code, sig) {
		switch (code) {
			case 8: // Backspace
			case 9: // Tab
			case 13: // Enter
			case 16: // Shift
			case 17: // Control
			case 18: // Alt
			case 20: // CapsLock
			case 27: // Escape
			case 32: // Space
			case 33: // PageUp
			case 34: // PageDown
			case 35: // End
			case 36: // Home
			case 37: // ArrowLeft
			case 38: // ArrowUp
			case 39: // ArrowRight
			case 40: // ArrowDown
			case 46: // Delete
				this._broadcast(down, key, c, code, sig);
				break;
		}
	},

	/**
	 * Broadcast key details globally. Details reduced to a boolean 'down' and a 'type'
	 * string to represent typed character (eg "b") or special key (eg "Shift" or "Alt").
	 * Note that the SPACE character is broadcasted as the multi-letter type "Space" (TODO!)
	 * @TODO what other pseudospecial keys are mapped to typed characters (like SPACE)?
	 * @param {boolean} down
	 * @param {String} key Newschool ABORTED FOR NOW
	 * @param {String} c (char) Bothschool
	 * @param {number} code Oldschool
	 * @param {String} sig Contextkey
	 */
	_broadcast: function(down, key, c, code, sig) {
		var type, msg, arg;
		type = gui.Key.$key[code] || c;
		type = type === ' ' ? gui.Key.SPACE : type;
		msg = gui.BROADCAST_KEYEVENT;
		arg = {
			down: down,
			type: type
		};
		/*
		 * Never broadcast same message twice. Fixes something about Firefox
		 * registering multiple keystrokes on certain chars (notably the 's').
		 */
		var snapshot = JSON.stringify(arg);
		if (snapshot !== this._snapshot) {
			gui.Broadcast.dispatch(msg, arg, sig); // do we want this?
			gui.Broadcast.dispatchGlobal(msg, arg);
			this._snapshot = snapshot;
		}
	},

	/**
	 * Update key modifiers state.
	 * @TODO Cross platform abstractions "accelDown" and "accessDown"
	 * @param {KeyEvent} e
	 */
	_modifiers: function(e) {
		gui.Key.ctrlDown = e.ctrlKey;
		gui.Key.shiftDown = e.shiftKey;
		gui.Key.altDown = e.altKey;
		gui.Key.metaDown = e.metaKey;
	},

	/**
	 * Get character for event details on keypress only.
	 * Returns null for special keys such as arrows etc.
	 * http://javascript.info/tutorial/keyboard-events
	 * @param {number} n
	 * @param {number} c
	 * @param {number} which
	 * @return {String}
	 */
	_keychar: function(n, c, which) {
		if (which === null || which === undefined) {
			return String.fromCharCode(n); // IE (below 9 or what?)
		} else if (which !== 0 && c) {
			// c != 0
			return String.fromCharCode(which); // the rest
		}
		return null;
	}
});

/*
 * Register broadcast type.
 */
gui.BROADCAST_KEYEVENT = 'gui-broadcast-keyevent';

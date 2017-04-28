/**
 * Key event summary.
 * @TODO check out http://mozilla.pettay.fi/moztests/events/browser-keyCodes.htm
 * @param {boolean} down
 * @param {number} n KeyCode
 * @param {number} c Character
 * @param {boolean} g Global?
 */
gui.Key = function Key(down, type, isglobal) {
	this.down = down;
	this.type = type;
	this.global = isglobal;
};

gui.Key.prototype = {
	/**
	 * Key down? Otherwise up.
	 * @type {boolean}
	 */
	down: false,

	/**
	 * Reducing 'key', 'char' and potentially 'keyCode' to a single string. If
	 * the string length is greater than one, we are dealing with a special key.
	 * @TODO: Note about the SPACE character - how exactly should we handle it?
	 * @type {[type]}
	 */
	type: null,

	/**
	 * Global key?
	 * @TODO Deprecate this?
	 * @type {boolean}
	 */
	global: false
};

// Static .........................................................................................

/**
 * Key modifiers.
 * @TODO: platform specific variations "accelDown" and "accessDown" (get a Mac and figure this out)
 * @TODO Update from http://askubuntu.com/questions/19558/what-are-the-meta-super-and-hyper-keys
 */
(function keymodifiers() {
	gui.Object.each(
		{
			shiftDown: false, // The Shift key.
			ctrlDown: false, // The Control key.
			altDown: false, // The Alt key. On the Macintosh, this is the Option key
			metaDown: false, // The Meta key. On the Macintosh, this is the Command key.
			accelDown: false, // The key used for keyboard shortcuts on the user's platform. Usually, this would be the value you would use.
			accessDown: false // The access key for activating menus and other elements. On Windows, this is the Alt key, used in conjuction with an element's accesskey.
		},
		function(key, value) {
			gui.Key[key] = value;
		}
	);
})();

/**
 * Mapping DOM0 key codes to DOM3 key values. Note that keycodes aren't used on an API level.
 * @see http://www.w3.org/TR/DOM-Level-3-Events/#key-values
 */
(function keymappings() {
	gui.Key.$key = gui.Object.extend(
		{
			// navigation

			33: 'PageUp',
			34: 'PageDown',
			38: 'Up',
			40: 'Down',
			37: 'Left',
			39: 'Right',

			// modifiers

			18: 'Alt',
			17: 'Control',
			16: 'Shift',
			32: 'Space',

			// extras

			27: 'Esc',
			13: 'Enter'
		},
		Object.create(null)
	);
})();

/*
"Alt"
"AltGraph"
"CapsLock"
"Control"
"Fn"
"FnLock"
"Meta"
"Process"
"NumLock"
"Shift"
"SymbolLock"
"OS"
"Compose"
*/

/**
 * Create constant 'gui.Key.DOWN' to alias the string "Down" for those who prefer such a syntax.
 * @TODO Compute appropriate translation of pascal-case to underscores.
 */
(function keyconstants() {
	gui.Object.each(gui.Key.$key, function(key, value) {
		gui.Key[value.toUpperCase()] = value;
	});
})();

/**
 * These key codes "do not usually change" with keyboard layouts.
 * @TODO Read http://www.w3.org/TR/DOM-Level-3-Events/#key-values
 * @TODO http://www.w3.org/TR/DOM-Level-3-Events/#fixed-virtual-key-codes
 * @TODO http://www.w3.org/TR/DOM-Level-3-Events/#key-values-list
 *
( function keyconstants () {
	gui.Object.each ({
		BACKSPACE :	8,
		TAB	: 9,
		ENTER	: 13,
		SHIFT	: 16,
		CONTROL	: 17,
		ALT	: 18,
		CAPSLOCK : 20,
		ESCAPE : 27,
		SPACE	: 32,
		PAGE_UP	: 33,
		PAGE_DOWN	: 34,
		END	: 35,
		HOME : 36,
		LEFT : 37,
		UP : 38,
		RIGHT : 39,
		DOWN : 40,
		DELETE : 46
	}, function ( key, value ) {
		gui.Key [ key ] = value;
	});
}());
*/

/**
 * These codes are somewhat likely to match a US or European keyboard,
 * but they are not listed in "do not usually change" section above.
 *
( function questionablekeys () {
	gui.Object.each ({
		PLUS: 187,
		MINUS: 189,
		NUMPLUS: 107,
		NUMMINUS: 109
	}, function ( key, value ) {
		gui.Key [ key ] = value;
	});
}());
*/

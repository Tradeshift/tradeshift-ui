/**
 * Spiritualizing documents by overloading DOM methods.
 */
gui.DOMChanger = {
	/**
	 * Declare `spirit` as a fundamental property of things.
	 * @param {Window} win
	 */
	init: function() {
		var proto = Element.prototype;
		if (gui.Type.isDefined(proto.spirit)) {
			throw new Error('Spiritual loaded twice?');
		} else {
			proto.spirit = null; // defineProperty fails in iOS5
		}
	},

	/**
	 * Extend native DOM methods in given window scope.
	 * Wonder what happens now with SVG in Explorer?
	 */
	change: function() {
		var combos = gui.DOMCombos;
		this._changeelement(gui.Client.isExplorer ? HTMLElement : Element, combos);
		this._changefragment(DocumentFragment, this._fragmethods(combos));
	},

	// Private ...................................................................

	/**
	 * Fundamentally change all elements.
	 * @param {constructor} Elm
	 * @param {Map} combos
	 */
	_changeelement: function(Elm, combos) {
		this._change(Elm.prototype, combos);
	},

	/**
	 * Fundamentally change all document fragments. When jQuery moves elements
	 * around, it places them in an intermediary document fragment (by default).
	 * @param {constructor} Frag
	 * @param {Map} combosubset
	 */
	_changefragment: function(Frag, combosubset) {
		this._change(Frag.prototype, combosubset);
	},

	/**
	 * Isolate methods that are relevant for document fragments.
	 * @param {Map} combos
	 * @returns {Map}
	 */
	_fragmethods: function(combos) {
		var frag = document.createDocumentFragment();
		return gui.Object.map(combos, function fragmentmethod(key, value) {
			if (frag[key]) {
				return value;
			}
		});
	},

	/**
	 * Overloading prototype methods (and properties in OK browsers).
	 * @param {object} proto
	 * @param {Map<String,function>} combos
	 */
	_change: function(proto, combos) {
		var root = document.documentElement;
		var isok = gui.Client.hasAttributesOnPrototype;
		gui.Object.each(
			combos,
			function(name, combo) {
				this._docombo(proto, name, combo, root, isok);
			},
			this
		);
	},

	/**
	 * Overload methods and setters.
	 * @param {object} proto
	 * @param {String} name
	 * @param {function} combo
	 * @param {Element} root
	 * @param {boolean} ok
	 */
	_docombo: function(proto, name, combo, root, ok) {
		if (this._ismethod(name)) {
			this._domethod(proto, name, combo);
		} else if (ok) {
			this._doaccessor(proto, name, combo);
		} else {
			// Safari and old Chrome relies on the {gui.DOMObserver}
		}
	},

	/**
	 * Is method? (non-crashing Firefox version, probably not crashing no more)
	 * @returns {boolean}
	 */
	_ismethod: function(name) {
		switch (name) {
			case 'remove':
			case 'append':
			case 'appendChild':
			case 'removeChild':
			case 'insertBefore':
			case 'replaceChild':
			case 'setAttribute':
			case 'removeAttribute':
			case 'insertAdjacentHTML':
			case 'insertAdjacentElement':
				return true;
		}
		return false;
	},

	/**
	 * Overload DOM method. Same procedure for all browsers, except we abort
	 * for some (DOM4) methods that are supported in the particular browser.
	 * @param {object} proto
	 * @param {String} name
	 * @param {function} combo
	 */
	_domethod: function(proto, name, combo) {
		var base = proto[name];
		if (base) {
			proto[name] = combo(function() {
				return base.apply(this, arguments);
			});
		}
	},

	/**
	 * Overload property setter for modern browsers except Safari.
	 * @param {object} proto
	 * @param {String} name
	 * @param {function} combo
	 * @param {boolean} once
	 * @param @optional @internal {boolean} once
	 */
	_doaccessor: function(proto, name, combo, once) {
		if (name === 'alt') {
			// alt doesn't exist on Element.prototype nor HTMLElement.prototype
			proto = HTMLImageElement.prototype;
		}

		var base = Object.getOwnPropertyDescriptor(proto, name);
		if (base) {
			Object.defineProperty(proto, name, {
				configurable: true,
				get: function() {
					return base.get.call(this);
				},
				set: combo(function(value) {
					base.set.call(this, value);
				})
			});
		} else if (!once) {
			// textContent hotfix (is on different prototype)
			this._doaccessor(Node.prototype, name, combo, true);
		}
	}
};

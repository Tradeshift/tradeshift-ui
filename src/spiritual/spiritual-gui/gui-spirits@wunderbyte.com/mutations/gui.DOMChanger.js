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
		if (this._isoldgecko()) {
			this._changeoldgecko(combos);
		} else {
			this._change(Elm.prototype, combos);
		}
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
		return gui.Object.map(combos,
			function fragmentmethod(key, value) {
				if (frag[key]) {
					return value;
				}
			}
		);
	},

	/**
	 * Overloading prototype methods (and properties in OK browsers).
	 * @param {object} proto
	 * @param {Window} win
	 * @param {Map<String,function} combos
	 */
	_change: function(proto, combos) {
		var root = document.documentElement;
		var isok = gui.Client.hasAttributesOnPrototype;
		gui.Object.each(combos, function(name, combo) {
			this._docombo(proto, name, combo, root, isok);
		}, this);
	},

	/**
	 * Old versions of Firefox ignore extending of Element.prototype,
	 * we must step down the prototype chain and extend individually.
	 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=618379
	 */
	_changeoldgecko: function(combos) {
		var did = [];
		this._tags().forEach(function(tag) {
			var e = document.createElement(tag);
			var p = e.constructor.prototype;
			if (p !== Object.prototype) { // excluding object and embed tags
				if (did.indexOf(p) === -1) {
					this._change(p, combos);
					did.push(p); // some elements share the same prototype
				}
			}
		}, this);
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
		} else {
			this._doaccessor(proto, name, combo);
			if (gui.Client.isGecko) {
				this._dogeckoaccesor(proto, name, combo, root);
			} else if (ok) {
				this._doaccessor(proto, name, combo);
			} else {
				// Safari and old Chrome relies on the {gui.DOMObserver}
			}
		}
	},

	/**
	 * Is method? (non-crashing Firefox version)
	 * @returns {boolean}
	 */
	_ismethod: function(name) {
		switch (name) {
			case 'appendChild':
			case 'removeChild':
			case 'insertBefore':
			case 'replaceChild':
			case 'setAttribute':
			case 'removeAttribute':
			case 'insertAdjacentHTML':
			case 'remove':
				return true;
		}
		return false;
	},

	/**
	 * Overload DOM method (same for all browsers).
	 * @param {object} proto
	 * @param {String} name
	 * @param {function} combo
	 */
	_domethod: function(proto, name, combo) {
		var base = proto[name];
		proto[name] = combo(function() {
			return base.apply(this, arguments);
		});
	},

	/**
	 * Overload property setter for modern browsers except Safari.
	 * @param {object} proto
	 * @param {String} name
	 * @param {function} combo
	 * @param {Element} root
	 * @param @optional @internal {boolean} once
	 */
	_doaccessor: function(proto, name, combo, once) {
		var base = Object.getOwnPropertyDescriptor(proto, name);
		if (gui.Client.isExplorer9 && name === 'className') {
			return; // TODO: This condition goes into {gui.DOMCombos} somehow
		}
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
		} else if (!once) { // textContent hotfix (is on different prototype)
			this._doaccessor(Node.prototype, name, combo, true);
		}
	},

	/**
	 * New Firefox can do it the standard way and they will
	 * probably remove the non-standard way at some point.
	 * @param {object} proto
	 * @param {String} name
	 * @param {function} combo
	 * @param {Element} root
	 */
	_dogeckoaccesor: function(proto, name, combo, root) {
		if (this._isoldgecko()) {
			this._dolegacyaccessor(proto, name, combo, root);
		} else {
			this._doaccessor(proto, name, combo);
		}
	},

	/**
	 * Symbol was enabled in Firefox 36 and we'll
	 * just declare anything before this as old.
	 * @returns {boolean}
	 */
	_isoldgecko: function() {
		return gui.Client.isGecko && !(window.Symbol && Symbol.for);
	},

	/**
	 * Overload property setter for old Firefox (as in TS integration tests!).
	 * @param {object} proto
	 * @param {String} name
	 * @param {function} combo
	 * @param {Element} root
	 */
	_dolegacyaccessor: function(proto, name, combo, root) {
		var getter = root.__lookupGetter__(name);
		var setter = root.__lookupSetter__(name);
		if (getter) { // firefox 20 needs a getter for this to work
			proto.__defineGetter__(name, function() {
				return getter.apply(this, arguments);
			});
			proto.__defineSetter__(name, combo(function() {
				setter.apply(this, arguments);
			}));
		} else { // textContent hotfix
			this._doaccessor(Node.prototype, name, combo, root);
		}
	},

	/**
	 * Old Firefox has to traverse the constructor of all elements.
	 * Object and embed tags excluded because the constructor of
	 * these elements appear to be identical to `Object.prototype`.
	 * @returns {Array<string>}
	 */
	_tags: function tags() {
		return ('a abbr address area article aside audio b base bdi bdo blockquote ' +
			'body br button canvas caption cite code col colgroup command datalist dd del ' +
			'details device dfn div dl dt em fieldset figcaption figure footer form ' +
			'h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd keygen ' +
			'label legend li link main map menu meta meter nav noscript ol optgroup option ' +
			'output p param pre progress q rp rt ruby s samp script section select small ' +
			'source span strong style submark summary sup table tbody td textarea tfoot ' +
			'th thead time title tr track ul unknown var video wbr').split(' ');
	}

};

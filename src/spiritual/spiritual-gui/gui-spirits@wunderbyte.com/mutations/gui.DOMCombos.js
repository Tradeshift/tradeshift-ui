/**
 * DOM decoration time.
 * TODO: Standard DOM exceptions (at our level) for missing arguments and so on.
 * TODO: DOM4 methods
 * @using {gui.Combo.before} beforeype
 * @using {gui.Combo.after} after
 * @using {gui.Combo.around} around
 * @using {gui.Combo.provided} provided
 * @using {gui.Type} Type
 * @using {gui.Array} Array
 * @using {gui.DOMPlugin} DOMPlugin
 */
gui.DOMCombos = (function using(before, after, around, provided, Type, guiArray, DOMPlugin) {
	/**
	 * Is `this` embedded in document? If `this` is a document
	 * fragment, we'll look at those other arguments instead.
	 * @returns {boolean}
	 */
	var ifEmbedded = provided(function(newnode, oldnode) {
		if (Type.isDocumentFragment(this)) {
			return DOMPlugin.embedded(this) ||
				(newnode && DOMPlugin.embedded(newnode)) ||
				(oldnode && DOMPlugin.embedded(oldnode));
		} else {
			return DOMPlugin.embedded(this);
		}
	});

	/**
	 * Element has spirit?
	 * @returns {boolean}
	 */
	var ifSpirit = provided(function() {
		var spirit = gui.get(this);
		return spirit && !spirit.$destructed;
	});

	/**
	 * Spiritualize node plus subtree.
	 * @param {Node} node
	 */
	var spiritualizeAfter = around(function(action, node) {
		var contents = [node];
		if (Type.isDocumentFragment(node)) {
			contents = guiArray.from(node.childNodes);
		}
		action();
		contents.forEach(function(n) {
			gui.spiritualize(n); // TODO: Simply support NodeList and DocFrag here!
		});
	});

	/**
	 * There should never *really* be any document fragments here,
	 * but we will support that just in case it's possible somehow.
	 * @param {Node} node
	 */
	function detach(node) {
		var contents = [node];
		if (Type.isDocumentFragment(node)) {
			contents = guiArray.from(node.childNodes);
		}
		contents.forEach(function(n) {
			gui.Guide.$detach(n); // TODO: Simply support NodeList and DocFrag here!
		});
	}

	/**
	 * Detach node plus subtree.
	 * @param {Node} node
	 */
	var detachBefore = before(function(node) {
		detach(node || this);
	});

	/**
	 * Detach subtree (only).
	 */
	var detachSubBefore = before(function() {
		var childrenonly = true;
		gui.Guide.$detach(this, childrenonly);
	});

	/**
	 * Detach old node plus subtree.
	 * @param {Node} newnode
	 * @param {Node} oldnode
	 */
	var detachOldBefore = before(function(newnode, oldnode) {
		detach(oldnode);
	});

	/**
	 * Spirit-aware setAttribute.
	 * @param {string} name
	 * @param {string} value
	 */
	var setAttBefore = before(function(name, value) {
		gui.get(this).att.set(name, value);
	});

	/**
	 * Spirit-aware removeAttribute.
	 * TODO: use the post combo?
	 * @param {string} name
	 */
	var delAttBefore = before(function(name) {
		gui.get(this).att.del(name);
	});

	/*
	 * Spirit-aware className. Convert js-property change to DOM attribute change
	 * so that attribute listeners can pick it up. Note that this voids the
	 * base `className` call, so let's hope other frameworks don't attempt to
	 * override the native accessor. Note that this doesn't work in IE9,
	 * so other workarounds are needed (Mutation Events in {gui.AttPlugin}).
	 * @param {string} name
	 */
	var setClassBefore = before(function(name) { // eslint-disable-line no-unused-vars
		gui.get(this).att.set('class', name);
	});

	/**
	 * Disable DOM mutation observers while doing action.
	 * @param {function} action
	 */
	var suspending = around(function(action) {
		if (gui.DOMObserver.observes) {
			return gui.DOMObserver.suspend(function() {
				return action();
			});
		} else {
			return action();
		}
	});

	/**
	 * Spiritualize subtree of `this`
	 */
	var spiritualizeSubAfter = after(function() {
		gui.spiritualizeSub(this);
	});

	/**
	 * outerHTML special: Materialize `this` and erect a reference to the parent
	 * so that `this` (and all the children) can be spiritualized in next step.
	 */
	var parent = null; // TODO: unref this at some point
	var materializeThisBefore = before(function() {
		parent = this.parentNode;
		gui.materialize(this);
	});

	/**
	 * Attach parent.
	 */
	var spiritualizeParentAfter = after(function() {
		gui.spiritualize(parent);
	});

	/**
	 * Spiritualize adjecant.
	 * @param {string} position
	 *		 beforebegin: Before the element itself
	 *		 afterbegin: Just inside the element, before its first child
	 *		 beforeend: Just inside the element, after its last child
	 *		 afterend: After the element itself
	 * @param {string} html
	 */
	var spiritualizeAdjacentAfter = after(function(position, html) {
		switch (position) {
			case 'beforebegin':
				console.warn('TODO: Spiritualize previous siblings');
				break;
			case 'afterbegin':
				console.warn('TODO: Spiritualize first children');
				break;
			case 'beforeend':
				console.warn('TODO: Spiritualize last children');
				break;
			case 'afterend':
				console.warn('TODO: Spiritualize following children');
				break;
		}
	});

	/**
	 * Abstract HTMLDocument might adopt DOM combos :/
	 * @returns {boolean}
	 */
	var ifEnabled = provided(function() {
		return !!(this.ownerDocument.defaultView);
	});

	/**
	 * Used to *not* invokle the base function (method or accessor).
	 * Note that this doesn't return anything, so bear that in mind.
	 */
	var voidbase = function() {}; // eslint-disable-line no-unused-vars

	/**
	 * Sugar for combo readability.
	 * @param {function} action
	 * @returns {function}
	 */
	var otherwise = function(action) {
		return action;
	};

	return { // Public ...........................................................

		appendChild: function(base) {
			return (
				ifEnabled(
					ifEmbedded(detachBefore(spiritualizeAfter(suspending(base))),
					otherwise(base)),
				otherwise(base))
			);
		},
		insertBefore: function(base) {
			return (
				ifEnabled(
					ifEmbedded(detachBefore(spiritualizeAfter(suspending(base))),
					otherwise(base)),
				otherwise(base))
			);
		},
		replaceChild: function(base) { // TODO: detach instead
			return (
				ifEnabled(
					ifEmbedded(detachOldBefore(spiritualizeAfter(suspending(base))),
					otherwise(base)),
				otherwise(base))
			);
		},
		insertAdjacentHTML: function(base) {
			return (
				ifEnabled(
					ifEmbedded(spiritualizeAdjacentAfter(suspending(base))),
					otherwise(base)),
				otherwise(base)
			);
		},
		removeChild: function(base) {
			return (
				ifEnabled(
					ifEmbedded(detachBefore(suspending(base)),
					otherwise(base)),
				otherwise(base))
			);
		},
		remove: function(base) {
			return (
				ifEnabled(
					ifEmbedded(detachBefore(suspending(base)),
					otherwise(base)),
				otherwise(base))
			);
		},
		setAttribute: function(base) {
			return (
				ifEnabled(
					ifEmbedded(
						ifSpirit(setAttBefore(base),
						otherwise(base)),
					otherwise(base)),
				otherwise(base))
			);
		},
		removeAttribute: function(base) {
			return (
				ifEnabled(
					ifEmbedded(
						ifSpirit(delAttBefore(base),
						otherwise(base)),
					otherwise(base)),
				otherwise(base))
			);
		},
		innerHTML: function(base) {
			return (
				ifEnabled(
					ifEmbedded(detachSubBefore(spiritualizeSubAfter(suspending(base))),
					otherwise(base)),
				otherwise(base))
			);
		},
		outerHTML: function(base) {
			return (
				ifEnabled(
					ifEmbedded(materializeThisBefore(detachBefore(spiritualizeParentAfter(suspending(base)))),
					otherwise(base)),
				otherwise(base))
			);
		},
		textContent: function(base) {
			return (
				ifEnabled(
					ifEmbedded(detachSubBefore(suspending(base)),
					otherwise(base)),
				otherwise(base))
			);
		}
		/*
		 * If we should need to create observers for the class attribute that
		 * would also work when updated via the JavaScript `className` property,
		 * we'll need to enable this, but we don't need that for the moment.
		 * Note also the IE9 can't do this and will need an `onpropertychange`
		 * handler be setup somewhere in the {gui.AttPlugin}. Something like
		 * this should also be setup to intercept `disabled` and `id` and such.
		 * @see {gui.AttPlugin}
		 *
		className: function(base) {
			return (
				ifEmbedded(ifSpirit(setClassBefore(voidbase)),
					otherwise(base)
				)
			);
		}
		*/
	};
}(
	gui.Combo.before,
	gui.Combo.after,
	gui.Combo.around,
	gui.Combo.provided,
	gui.Type,
	gui.Array,
	gui.DOMPlugin
));

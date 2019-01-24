/**
 * DOM decoration time.
 * TODO: Standard DOM exceptions (at our level) for missing arguments and so on.
 * TODO: DOM4 methods
 *       http://mdn.io/ChildNode/before
 *       http://mdn.io/ChildNode/after
 *       http://mdn.io/ParentNode/append
 * @using {gui.Combo.before} befor
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
			return (
				DOMPlugin.embedded(this) ||
				(newnode && DOMPlugin.embedded(newnode)) ||
				(oldnode && DOMPlugin.embedded(oldnode))
			);
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

	/**
	 * Spirit-aware setAttribute('alt', value).
	 * @param {string} name
	 * @param {string} value
	 */
	var setAltBefore = before(function(value) {
		gui.get(this).att.set('alt', value);
	});

	/**
	 * Hostile framework setting the `className` property with little or no
	 * concern about the Spirits *internally* managed classnames. Fortunately,
	 * we have the classnames backed up and ready to be reapplied.
	 */
	var persistClassesAfter = after(function(name) {
		gui.get(this).css.$persist();
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
	 * Spiritualize adjacent.
	 * TODO: Index elements *before* so that we only spiritualize *new* elements
	 * @param {string} position
	 *		 beforebegin: Before the element itself
	 *		 afterbegin: Just inside the element, before its first child
	 *		 beforeend: Just inside the element, after its last child
	 *		 afterend: After the element itself
	 * @param {string} html
	 */
	var spiritualizeAdjacentAfter = after(function(position, html) {
		var elm = this,
			elms = [];
		switch (position.toLowerCase()) {
			case 'beforebegin':
				while ((elm = elm.previousElementSibling)) {
					elms.push(elm);
				}
				break;
			case 'afterbegin':
			case 'beforeend':
				elm = this.firstElementChild;
				while (elm) {
					elms.push(elm);
					elm = elm.nextElementSibling;
				}
				break;
			case 'afterend':
				while ((elm = elm.nextElementSibling)) {
					elms.push(elm);
				}
				break;
		}
		elms.forEach(function(next) {
			if (!gui.get(next)) {
				gui.spiritualize(next);
			}
		});
	});

	/**
	 * Spiritualize adjacent element.
	 */
	var spiritualizeAdjacentElementAfter = after(function(position, element) {
		gui.spiritualize(element);
	});

	/**
	 * Abstract HTMLDocument might adopt DOM combos :/
	 * @returns {boolean}
	 */
	var ifEnabled = provided(function() {
		return !!this.ownerDocument.defaultView;
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

	return {
		// Public ...........................................................

		append: function(base) {
			return ifEnabled(
				ifEmbedded(detachBefore(spiritualizeAfter(suspending(base))), otherwise(base)),
				otherwise(base)
			);
		},
		appendChild: function(base) {
			return ifEnabled(
				ifEmbedded(detachBefore(spiritualizeAfter(suspending(base))), otherwise(base)),
				otherwise(base)
			);
		},
		insertBefore: function(base) {
			return ifEnabled(
				ifEmbedded(detachBefore(spiritualizeAfter(suspending(base))), otherwise(base)),
				otherwise(base)
			);
		},
		replaceChild: function(base) {
			return ifEnabled(
				ifEmbedded(detachOldBefore(spiritualizeAfter(suspending(base))), otherwise(base)),
				otherwise(base)
			);
		},
		// not applied in Safari 10 (fallback mutation observers) :/
		insertAdjacentHTML: function(base) {
			return ifEnabled(
				ifEmbedded(spiritualizeAdjacentAfter(suspending(base)), otherwise(base)),
				otherwise(base)
			);
		},
		// not applied in Safari 10 (fallback mutation observers) :/
		insertAdjacentElement: function(base) {
			return ifEnabled(
				ifEmbedded(spiritualizeAdjacentElementAfter(suspending(base)), otherwise(base)),
				otherwise(base)
			);
		},
		removeChild: function(base) {
			return ifEnabled(
				ifEmbedded(detachBefore(suspending(base)), otherwise(base)),
				otherwise(base)
			);
		},
		remove: function(base) {
			return ifEnabled(
				ifEmbedded(detachBefore(suspending(base)), otherwise(base)),
				otherwise(base)
			);
		},
		setAttribute: function(base) {
			return ifEnabled(
				ifSpirit(persistClassesAfter(setAttBefore(base)), otherwise(base)),
				otherwise(base)
			);
		},
		removeAttribute: function(base) {
			return ifEnabled(
				ifSpirit(persistClassesAfter(delAttBefore(base)), otherwise(base)),
				otherwise(base)
			);
		},
		innerHTML: function(base) {
			return ifEnabled(
				ifEmbedded(detachSubBefore(spiritualizeSubAfter(suspending(base))), otherwise(base)),
				otherwise(base)
			);
		},
		outerHTML: function(base) {
			return ifEnabled(
				ifEmbedded(
					materializeThisBefore(detachBefore(spiritualizeParentAfter(suspending(base)))),
					otherwise(base)
				),
				otherwise(base)
			);
		},
		textContent: function(base) {
			return ifEnabled(
				ifEmbedded(detachSubBefore(suspending(base)), otherwise(base)),
				otherwise(base)
			);
		},
		alt: function(base) {
			return ifEnabled(
				ifEmbedded(setAltBefore(suspending(base)), otherwise(base)),
				otherwise(base)
			);
		},
		className: function(base) {
			return ifEnabled(ifSpirit(persistClassesAfter(base), otherwise(base)), otherwise(base));
		}
	};
})(
	gui.Combo.before,
	gui.Combo.after,
	gui.Combo.around,
	gui.Combo.provided,
	gui.Type,
	gui.Array,
	gui.DOMPlugin
);

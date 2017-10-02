/**
 * DOM query and manipulation.
 * @extends {gui.Plugin}
 * TODO: add `prependTo` method
 * TODO: https://github.com/whatwg/dom/commit/8fa7ac749d1b612504184aad2c20808a1785b370
 * @using {gui.Combo#chained}
 * @using {gui.Guide}
 * @using {gui.DOMObserver}
 */
gui.DOMPlugin = (function using(chained, guide, observer) {
	return gui.Plugin.extend(
		{
			/**
			 * Set or get element id.
			 * @param @optional {String} id
			 * @returns {String|gui.DOMPlugin}
			 */
			id: chained(function(id) {
				if (id) {
					this.spirit.element.id = id;
				} else {
					return this.spirit.element.id || null;
				}
			}),

			/**
			 * Get or set element title (tooltip).
			 * @param @optional {String} title
			 * @returns {String|gui.DOMPlugin}
			 */
			title: chained(function(title) {
				var element = this.spirit.element;
				if (gui.Type.isDefined(title)) {
					element.title = title || '';
				} else {
					return element.title;
				}
			}),

			/**
			 * Get or set element markup.
			 * @param @optional {String} html
			 * @param @optional {String} position
			 * @returns {String|gui.DOMPlugin}
			 */
			html: chained(function(html, position) {
				return gui.DOMPlugin.html(this.spirit.element, html, position);
			}),

			/**
			 * Get or set element outer markup.
			 * @param @optional {String} html
			 * @returns {String|gui.DOMPlugin}
			 */
			outerHtml: chained(function(html) {
				return gui.DOMPlugin.outerHtml(this.spirit.element, html);
			}),

			/**
			 * Get or set element textContent.
			 * @param @optional {String} text
			 * @returns {String|gui.DOMPlugin}
			 */
			text: chained(function(text) {
				return gui.DOMPlugin.text(this.spirit.element, text);
			}),

			/**
			 * Empty spirit subtree.
			 * @returns {this}
			 */
			empty: chained(function() {
				this.html('');
			}),

			/**
			 * Hide spirit element and mark as invisible.
			 * Adds the `._gui-hidden` classname.
			 * @returns {this}
			 */
			hide: chained(function() {
				if (!this.spirit.css.contains(gui.CLASS_HIDDEN)) {
					this.spirit.css.add(gui.CLASS_HIDDEN);
					if (gui.hasModule('gui-layout@wunderbyte.com')) {
						// TODO: - fix
						if (this.spirit.visibility) {
							// some kind of Selenium corner case
							this.spirit.visibility.off();
						}
					}
				}
			}),

			/**
			 * Show spirit element and mark as visible.
			 * Removes the `._gui-hidden` classname.
			 * @returns {this}
			 */
			show: chained(function() {
				if (this.spirit.css.contains(gui.CLASS_HIDDEN)) {
					this.spirit.css.remove(gui.CLASS_HIDDEN);
					if (gui.hasModule('gui-layout@wunderbyte.com')) {
						if (this.spirit.visibility) {
							// some kind of Selenium corner case
							this.spirit.visibility.on();
						}
					}
				}
			}),

			/**
			 * Get spirit element tagname (identicased with HTML).
			 * @returns {String}
			 */
			tag: function() {
				return this.spirit.element.localName;
			},

			/**
			 * Is positioned in page DOM? Otherwise plausible
			 * createElement or documentFragment scenario.
			 * @returns {boolean}
			 */
			embedded: function() {
				return gui.DOMPlugin.embedded(this.spirit.element);
			},

			/**
			 * Removing this spirit from it's parent container. Note that this will
			 * schedule destruction of the spirit unless it gets reinserted somewhere.
			 * Also note that this method is called on the spirit, not on the parent.
			 * @returns {object} Returns the argument
			 */
			remove: function() {
				var parent = this.spirit.element.parentNode;
				if (parent) {
					parent.removeChild(this.spirit.element);
				}
			},

			/**
			 * Clone spirit element.
			 * @return {Element}
			 */
			clone: function() {
				return this.spirit.element.cloneNode(true);
			},

			/**
			 * Get ordinal index of element.
			 * TODO: Support 'of-same-type' or something
			 * @returns {number}
			 */
			ordinal: function() {
				return gui.DOMPlugin.ordinal(this.spirit.element);
			},

			/**
			 * Compare the DOM position of this spirit against something else.
			 * @see http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition
			 * @param {Element|gui.Spirit} other
			 * @returns {number}
			 */
			compare: function(other) {
				return gui.DOMPlugin.compare(this.spirit.element, other);
			},

			/**
			 * Contains other node or spirit?
			 * @param {Node|gui.Spirit} other
			 * @returns {boolean}
			 */
			contains: function(other) {
				return gui.DOMPlugin.contains(this.spirit.element, other);
			},

			/**
			 * Contained by other node or spirit?
			 * @param {Node|gui.Spirit} other
			 * @returns {boolean}
			 */
			containedBy: function(other) {
				return gui.DOMPlugin.contains(other, this.spirit.element);
			},

			/**
			 * Parse HTML to DOM node.
			 * @param {string} html
			 * @returns {Node}
			 */
			parseToNode: function(html) {
				return gui.DOMPlugin.parseToNode(html);
			},

			/**
			 * Parse HTML to array of DOM node(s).
			 * @param {string} html
			 * @returns {Node}
			 */
			parseToNodes: function(html) {
				return gui.DOMPlugin.parseToNodes(html);
			}
		},
		{},
		{
			// Static ...........................................................

			/**
			 * Spiritual-aware innerHTML (WebKit first aid).
			 * @param {Element} elm
			 * @param @optional {String} html
			 * @param @optional {String} pos
			 */
			html: function(elm, html, pos) {
				if (gui.Type.isString(html)) {
					if (pos) {
						return elm.insertAdjacentHTML(pos, html);
					} else {
						if (gui.mode === gui.MODE_ROBOT) {
							gui.materializeSub(elm);
							gui.suspend(function() {
								elm.innerHTML = html;
							});
							gui.spiritualizeSub(elm);
						} else {
							elm.innerHTML = html;
						}
					}
				} else {
					return elm.innerHTML;
				}
			},

			/**
			 * Spiritual-aware outerHTML (WebKit first aid).
			 * TODO: deprecate and support "replace" value for position?
			 * TODO: can outerHTML carry multiple root-nodes?
			 * @param {Element} elm
			 * @param @optional {String} html
			 */
			outerHtml: function(elm, html) {
				if (gui.Type.isString(html)) {
					if (gui.mode === gui.MODE_ROBOT) {
						gui.materialize(elm);
						gui.suspend(function() {
							elm.outerHTML = html;
						});
						gui.spiritualize(elm);
					} else {
						elm.outerHTML = html;
					}
				} else {
					return elm.outerHTML;
				}
			},

			/**
			 * Spiritual-aware textContent (WebKit first aid).
			 * @param {Element} elm
			 * @param @optional {String} html
			 * @param @optional {String} position
			 */
			text: function(elm, text) {
				var guide_ = gui.Guide;
				if (gui.Type.isString(text)) {
					if (gui.mode === gui.MODE_ROBOT) {
						guide_.materializeSub(elm);
						gui.suspend(function() {
							elm.textContent = text;
						});
					} else {
						elm.textContent = text;
					}
				} else {
					return elm.textContent;
				}
			},

			/**
			 * Get ordinal position of element within container.
			 * @param {Element} element
			 * @returns {number}
			 */
			ordinal: function(element) {
				var result = 0;
				var parent = element.parentNode;
				if (parent) {
					var node = parent.firstElementChild;
					while (node) {
						if (node === element) {
							break;
						} else {
							node = node.nextElementSibling;
							result++;
						}
					}
				}
				return result;
			},

			/**
			 * Compare document position of two nodes.
			 * @see http://mdn.io/compareDocumentPosition
			 * @param {Node|gui.Spirit} node1
			 * @param {Node|gui.Spirit} node2
			 * @returns {number}
			 */
			compare: function(node1, node2) {
				node1 = node1 instanceof gui.Spirit ? node1.element : node1;
				node2 = node2 instanceof gui.Spirit ? node2.element : node2;
				return node1.compareDocumentPosition(node2);
			},

			/**
			 * Node contains other node?
			 * @param {Node|gui.Spirit} node
			 * @param {Node|gui.Spirit} othernode
			 * @returns {boolean}
			 */
			contains: function(node, othernode) {
				var check = Node.DOCUMENT_POSITION_CONTAINS + Node.DOCUMENT_POSITION_PRECEDING;
				return this.compare(othernode, node) === check;
			},

			/**
			 * Other node is a following sibling to node?
			 * @param {Node|gui.Spirit} node
			 * @param {Node|gui.Spirit} othernode
			 * @returns {boolean}
			 */
			follows: function(node, othernode) {
				return this.compare(othernode, node) === Node.DOCUMENT_POSITION_FOLLOWING;
			},

			/**
			 * Other node is a preceding sibling to node?
			 * @param {Node|gui.Spirit} node
			 * @param {Node|gui.Spirit} othernode
			 * @returns {boolean}
			 */
			precedes: function(node, othernode) {
				return this.compare(othernode, node) === Node.DOCUMENT_POSITION_PRECEDING;
			},

			/**
			 * Is node positioned in page DOM?
			 * TODO: can a check for `this.element.ownerDocument.defaultView` do this?
			 * @param {Element|gui.Spirit} node
			 * @returns {boolean}
			 */
			embedded: function(node) {
				node = node instanceof gui.Spirit ? node.element : node;
				return this.contains(node.ownerDocument, node);
			},

			/**
			 * Remove from list all nodes that are contained by others.
			 * @param {Array<Element|gui.Spirit>} nodes
			 * @returns {Array<Element|gui.Spirit>}
			 */
			group: function(nodes) {
				var node,
					groups = [];
				function containedby(target, others) {
					return others.some(function(other) {
						return gui.DOMPlugin.contains(other, target);
					});
				}
				while ((node = nodes.pop())) {
					if (!containedby(node, nodes)) {
						groups.push(node);
					}
				}
				return groups;
			},

			/**
			 * Get first element that matches a selector.
			 * Optional type argument filters to spirit of type.
			 * @param {Node} node
			 * @param {String} selector
			 * @param @optional {function} type
			 * @returns {Element|gui.Spirit}
			 */
			q: function(node, selector, type) {
				var result = null;
				return this._qualify(node, selector)(function(node_, selector_) {
					if (type) {
						result = this.qall(node_, selector_, type)[0] || null;
					} else {
						try {
							result = node_.querySelector(selector_);
						} catch (exception) {
							console.error('Dysfunctional selector: ' + selector_);
							throw exception;
						}
					}
					return result;
				});
			},

			/**
			 * Get list of all elements that matches a selector.
			 * Optional type argument filters to spirits of type.
			 * Method always returns a (potentially empty) array.
			 * @param {Node} node
			 * @param {String} selector
			 * @param @optional {function} type
			 * @returns {Array<Element|gui.Spirit>}
			 */
			qall: function(node, selector, type) {
				var result = [];
				return this._qualify(node, selector)(function(node_, selector_) {
					result = gui.Array.from(node_.querySelectorAll(selector_));
					if (type) {
						result = result
							.filter(function(el) {
								return el.spirit && el.spirit instanceof type;
							})
							.map(function(el) {
								return el.spirit;
							});
					}
					return result;
				});
			},

			/**
			 * Get first element in document that matches a selector.
			 * Optional type argument filters to spirit of type.
			 * @param {String} selector
			 * @param @optional {function} type
			 * @returns {Element|gui.Spirit}
			 */
			qdoc: function(selector, type) {
				return this.q(document, selector, type);
			},

			/**
			 * Get list of all elements in document that matches a selector.
			 * Optional type argument filters to spirits of type.
			 * Method always returns a (potentially empty) array.
			 * @param {String} selector
			 * @param @optional {function} type
			 * @returns {Array<Element|gui.Spirit>}
			 */
			qdocall: function(selector, type) {
				return this.qall(document, selector, type);
			},

			// Private static .........................................................

			/**
			 * Support direct children selection using proprietary 'this' keyword
			 * by temporarily assigning the element an ID and modifying the query.
			 * @param {Node} node
			 * @param {String} selector
			 * @param {function} action
			 * @returns {object}
			 */
			_qualify: function(node, selector, action) {
				var hadid = true,
					orig = node,
					id,
					regexp = this._thiskeyword;
				if (node.nodeType === Node.ELEMENT_NODE) {
					if (regexp.test(selector)) {
						hadid = node.id;
						id = node.id = node.id || gui.KeyMaster.generateKey();
						selector = selector.replace(regexp, '#' + id);
						node = node.ownerDocument;
					}
				}
				return function(action_) {
					var res = action_.call(gui.DOMPlugin, node, selector);
					if (orig && !hadid) {
						orig.id = '';
					}
					return res;
				};
			},

			/**
			 * Match custom 'this' keyword in CSS selector. You can start
			 * selector expressions with "this>*" to find immediate child
			 * TODO: skip 'this' and support simply ">*" and "+*" instead.
			 * UPDATE: This should now be called `:scope` according to the spec!
			 * @see http://dev.w3.org/2006/webapi/selectors-api2/
			 * @type {RegExp}
			 */
			_thiskeyword: /^this|,this/g // TODO: ((^|,)\s*):scope/g
		}
	);
})(gui.Combo.chained, gui.Guide, gui.DOMObserver);

/**
 * Bind the "this" keyword for all static methods.
 */
gui.Object.bindall(gui.DOMPlugin);

/**
 * DOM query methods accept a CSS selector and an optional spirit constructor
 * as arguments. They return a spirit, an element or an array of either.
 */
gui.DOMPlugin.mixin(
	gui.Object.map(
		{
			/**
			 * Get first descendant element matching selector. Optional type argument returns
			 * spirit for first element to be associated to spirit of this type. Note that
			 * this may not be the first element to match the selector. Also note that type
			 * performs slower than betting on <code>this.dom.q ( "tagname" ).spirit</code>
			 * @param {String} selector
			 * @param @optional {function} type Spirit constructor (eg. gui.Spirit)
			 * @returns {Element|gui.Spirit}
			 */
			q: function(selector, type) {
				return gui.DOMPlugin.q(this.spirit.element, selector, type);
			},

			/**
			 * Get list of all descendant elements that matches a selector. Optional type
			 * arguments returns instead all associated spirits to match the given type.
			 * @param {String} selector
			 * @param @optional {function} type Spirit constructor
			 * @returns {Array<Element|gui.Spirit>}
			 */
			qall: function(selector, type) {
				return gui.DOMPlugin.qall(this.spirit.element, selector, type);
			},

			/**
			 * Same as q, but scoped from the document root. Use wisely.
			 * @param {String} selector
			 * @param @optional {function} type Spirit constructor
			 * returns {Element|gui.Spirit}
			 */
			qdoc: function(selector, type) {
				return gui.DOMPlugin.qdoc(selector, type);
			},

			/**
			 * Same as qall, but scoped from the document root. Use wisely.
			 * @param {String} selector
			 * @param @optional {function} type Spirit constructor
			 * @returns {Array<Element|gui.Spirit>}
			 */
			qdocall: function(selector, type) {
				return gui.DOMPlugin.qdocall(selector, type);
			}
		},
		function(name, base) {
			return function() {
				var selector = arguments[0],
					type = arguments[1];
				if (gui.Type.isString(selector)) {
					if (arguments.length === 1 || gui.Type.isFunction(type)) {
						return base.apply(this, arguments);
					} else {
						type = gui.Type.of(type);
						throw new TypeError(
							'Unknown spirit for query: ' + name + '(' + selector + ',' + type + ')'
						);
					}
				} else {
					throw new TypeError('Bad selector for query: ' + name + '(' + selector + ')');
				}
			};
		}
	)
);

/**
 * DOM navigation methods accept an optional spirit constructor as
 * argument. They return a spirit, an element or an array of either.
 */
gui.DOMPlugin.mixin(
	gui.Object.map(
		{
			/**
			 * Next element or next spirit of given type.
			 * @param @optional {constructor} type Spirit constructor
			 * @returns {Element|gui.Spirit}
			 */
			next: function(type) {
				var result = null,
					spirit = null,
					el = this.spirit.element;
				if (type) {
					while ((el = el.nextElementSibling) !== null) {
						spirit = el.spirit;
						if (spirit !== null && spirit instanceof type) {
							result = spirit;
							break;
						}
					}
				} else {
					result = el.nextElementSibling;
				}
				return result;
			},

			/**
			 * Previous element or previous spirit of given type.
			 * @param @optional {constructor} type Spirit constructor
			 * @returns {Element|gui.Spirit}
			 */
			previous: function(type) {
				var result = null,
					spirit = null,
					el = this.spirit.element;
				if (type) {
					while ((el = el.previousElementSibling) !== null) {
						spirit = el.spirit;
						if (spirit !== null && spirit instanceof type) {
							result = spirit;
							break;
						}
					}
				} else {
					result = el.previousElementSibling;
				}
				return result;
			},

			/**
			 * First element or first spirit of type.
			 * @param @optional {constructor} type Spirit constructor
			 * @returns {Element|gui.Spirit}
			 */
			first: function(type) {
				var result = null,
					spirit = null,
					el = this.spirit.element.firstElementChild;
				if (type) {
					while (result === null && el !== null) {
						spirit = el.spirit;
						if (spirit !== null && spirit instanceof type) {
							result = spirit;
						}
						el = el.nextElementSibling;
					}
				} else {
					result = el;
				}
				return result;
			},

			/**
			 * Last element or last spirit of type.
			 * @param @optional {constructor} type Spirit constructor
			 * @returns {Element|gui.Spirit}
			 */
			last: function(type) {
				var result = null,
					spirit = null,
					el = this.spirit.element.lastElementChild;
				if (type) {
					while (result === null && el !== null) {
						spirit = el.spirit;
						if (spirit !== null && spirit instanceof type) {
							result = spirit;
						}
						el = el.previoustElementSibling;
					}
				} else {
					result = el;
				}
				return result;
			},

			/**
			 * Parent parent or parent spirit of type.
			 * @param @optional {constructor} type Spirit constructor
			 * @returns {Element|gui.Spirit}
			 */
			parent: function(type) {
				var result = this.spirit.element.parentNode;
				if (result && type) {
					var spirit = result.spirit;
					if (spirit && spirit instanceof type) {
						result = spirit;
					} else {
						result = null;
					}
				}
				return result;
			},

			/**
			 * Child element or child spirit of type.
			 * @param @optional {constructor} type Spirit constructor
			 * @returns {Element|gui.Spirit}
			 */
			child: function(type) {
				var result = this.spirit.element.firstElementChild;
				if (result && type) {
					result = this.children(type)[0] || null;
				}
				return result;
			},

			/**
			 * Children elements or children spirits of type.
			 * TODO: just use this.element.children :)
			 * @param @optional {constructor} type Spirit constructor
			 * @returns {Array<Element|gui.Spirit>}
			 */
			children: function(type) {
				var result = gui.Array.from(this.spirit.element.children);
				if (type) {
					result = result
						.filter(function(elm) {
							return elm.spirit && elm.spirit instanceof type;
						})
						.map(function(elm) {
							return elm.spirit;
						});
				}
				return result;
			},

			/**
			 * First ancestor element (parent!) or first ancestor spirit of type.
			 * @param @optional {constructor} type Spirit constructor
			 * @returns {Element|gui.Spirit}
			 */
			ancestor: function(type) {
				var result = this.parent();
				if (type) {
					result = null;
					new gui.Crawler().ascend(this.parent(), {
						handleSpirit: function(spirit) {
							if (spirit instanceof type) {
								result = spirit;
								return gui.Crawler.STOP;
							}
						}
					});
				}
				return result;
			},

			/**
			 * First ancestor elements or ancestor spirits of type.
			 * @param @optional {constructor} type Spirit constructor
			 * @returns {Array<Element|gui.Spirit>}
			 */
			ancestors: function(type) {
				var result = [];
				var crawler = new gui.Crawler();
				if (type) {
					crawler.ascend(this.parent(), {
						handleSpirit: function(spirit) {
							if (spirit instanceof type) {
								result.push(spirit);
							}
						}
					});
				} else {
					crawler.ascend(this.parent(), {
						handleElement: function(el) {
							result.push(el);
						}
					});
				}
				return result;
			},

			/**
			 * First descendant element (first child!) first descendant spirit of type.
			 * @param @optional {constructor} type Spirit constructor
			 * @returns {Element|gui.Spirit}
			 */
			descendant: function(type) {
				var result = this.child();
				var me = this.spirit.element;
				if (type) {
					new gui.Crawler().descend(me, {
						handleSpirit: function(spirit) {
							if (spirit instanceof type) {
								if (spirit.element !== me) {
									result = spirit;
									return gui.Crawler.STOP;
								}
							}
						}
					});
				}
				return result;
			},

			/**
			 * All descendant elements or all descendant spirits of type.
			 * @param @optional {constructor} type Spirit constructor
			 * @returns {Array<Element|gui.Spirit>}
			 */
			descendants: function(type) {
				var result = [];
				var me = this.spirit.element;
				new gui.Crawler().descend(me, {
					handleElement: function(element) {
						if (!type && element !== me) {
							result.push(element);
						}
					},
					handleSpirit: function(spirit) {
						if (type && spirit instanceof type) {
							if (spirit.element !== me) {
								result.push(spirit);
							}
						}
					}
				});
				return result;
			},

			/**
			 * Get following sibling elements or spirits of type.
			 * @param @optional {constructor} type Spirit constructor
			 * @returns {Array<element|gui.Spirit>}
			 */
			following: function(type) {
				var result = [],
					spirit,
					el = this.spirit.element;
				while ((el = el.nextElementSibling)) {
					if (type) {
						if ((spirit = el.spirit) && spirit instanceof type) {
							result.push(spirit);
						}
					} else {
						result.push(el);
					}
				}
				return result;
			},

			/**
			 * Get preceding sibling elements or spirits of type.
			 * @param @optional {constructor} type Spirit constructor
			 * @returns {Array<element|gui.Spirit>}
			 */
			preceding: function(type) {
				var result = [],
					spirit,
					el = this.spirit.element;
				while ((el = el.previousElementSibling)) {
					if (type) {
						if ((spirit = el.spirit) && spirit instanceof type) {
							result.push(spirit);
						}
					} else {
						result.push(el);
					}
				}
				return result;
			},

			/**
			 * Get sibling elements or spirits of type.
			 * @param @optional {constructor} type Spirit constructor
			 * @returns {Array<element|gui.Spirit>}
			 */
			siblings: function(type) {
				return this.preceding(type).concat(this.following(type));
			}
		},
		function map(name, base) {
			return function(Type) {
				if (!gui.Type.isDefined(Type) || gui.Type.isFunction(Type)) {
					return base.apply(this, arguments);
				} else {
					throw new TypeError('Unknown spirit for query: ' + name + '(' + gui.Type.of(Type) + ')');
				}
			};
		}
	)
);

(function scoped() {
	/**
	 * @TODO fancy insertions
	 */
	gui.DOMPlugin.mixin({
		/**
		 * Append spirit (element) to another spirit or element.
		 * @param {object} thing
		 * @returns {this} or what?
		 */
		appendTo: function(thing) {
			var elm = this.spirit.element;
			if (gui.Type.isSpirit(thing)) {
				thing.dom.append(elm);
			} else if (gui.Type.isElement(thing)) {
				thing.appendChild(elm);
			}
			return this; // or what?
		},

		/**
		 * Prepend spirit (element) to another spirit or element (as the first child).
		 * @param {object} thing
		 * @returns {this} or what?
		 */
		prependTo: function(thing) {
			var elm = this.spirit.element;
			if (gui.Type.isSpirit(thing)) {
				thing.dom.prepend(elm);
			} else if (gui.Type.isElement(thing)) {
				thing.insertBefore(elm, thing.firstChild);
			}
			return this; // or what?
		},

		/**
		 * Insert spirit (element) before another spirit or element
		 * @param {object} thing
		 * @returns {this} or what?
		 */
		insertBefore: function(thing) {
			var elm = this.spirit.element;
			if (gui.Type.isSpirit(thing)) {
				thing.dom.before(elm);
			} else if (gui.Type.isElement(thing)) {
				thing.parentNode.insertBefore(elm, thing);
			}
			return this; // or what?
		},

		/**
		 * Insert spirit (element) after another spirit or element
		 * @param {object} thing
		 * @returns {this} or what?
		 */
		insertAfter: function(thing) {
			var elm = this.spirit.element;
			if (gui.Type.isSpirit(thing)) {
				thing.dom.after(elm);
			} else if (gui.Type.isElement(thing)) {
				thing.parentNode.insertBefore(elm.nextSibling, thing);
			}
			return this; // or what?
		},

		/**
		 * Parse HTML to DOM node.
		 * @param {string} html
		 * @param @optional {Document} targetdoc
		 * @returns {Node}
		 */
		parseToNode: function(html, targetdoc) {
			return gui.HTMLParser.parseToNode(html, targetdoc);
		},

		/**
		 * Parse HTML to array of DOM node(s).
		 * @param {string} html
		 * @param @optional {Document} targetdoc
		 * @returns {Array<Node>}
		 */
		parseToNodes: function(html, targetdoc) {
			return gui.HTMLParser.parseToNodes(html, targetdoc);
		}
	});
})();

/**
 * DOM insertion methods accept one argument: one spirit OR one element OR an array of either or both.
 * The input argument is returned as given. This allows for the following one-liner to be constructed:
 * this.something = this.dom.append ( gui.SomeThingSpirit.summon ( this.document )); // imagine 15 more
 * TODO: Go for compliance with DOM4 method matches (something about textnoding string arguments)
 */

(function scoped() {
	gui.DOMPlugin.mixin(
		gui.Object.map(
			{
				/**
				 * Append spirit OR element OR array of either.
				 * @param {object} things Complicated argument
				 * @returns {object} Returns the argument
				 */
				append: function(things) {
					var els = things,
						element = this.spirit.element;
					els.forEach(function(el) {
						element.appendChild(el);
					});
				},

				/**
				 * Prepend spirit OR element OR array of either.
				 * @param {object} things Complicated argument
				 * @returns {object} Returns the argument
				 */
				prepend: function(things) {
					var els = things,
						element = this.spirit.element,
						first = element.firstChild;
					els.reverse().forEach(function(el) {
						element.insertBefore(el, first);
					});
				},

				/**
				 * Insert spirit OR element OR array of either before this spirit.
				 * @param {object} things Complicated argument
				 * @returns {object} Returns the argument
				 */
				before: function(things) {
					var els = things,
						target = this.spirit.element,
						parent = target.parentNode;
					els.reverse().forEach(function(el) {
						parent.insertBefore(el, target);
					});
				},

				/**
				 * Insert spirit OR element OR array of either after this spirit.
				 * @param {object} things Complicated argument
				 * @returns {object} Returns the argument
				 */
				after: function(things) {
					var els = things,
						target = this.spirit.element,
						parent = target.parentNode;
					els.forEach(function(el) {
						parent.insertBefore(el, target.nextSibling);
					});
				},

				/**
				 * Replace the spirit with something else. This may nuke the spirit.
				 * Note that this method is called on the spirit, not on the parent.
				 * @param {object} things Complicated argument.
				 * @returns {object} Returns the argument
				 */
				replace: function(things) {
					this.after(things);
					this.remove();
				}
			},
			function map(name, base) {
				/*
			 * 1. Convert arguments to array of one or more elements
			 * 2. Confirm array of elements (exception supressed pending IE9 issue)
			 * 3. Invoke the base
			 * 4. Return the input
			 * TODO: DocumentFragment and friends
			 * @param {String} name
			 * @param {function} base
			 */
				return function(things) {
					var elms = Array.map(gui.Array.make(things), function(thing) {
						return thing && thing instanceof gui.Spirit ? thing.element : thing;
					}).filter(function(thing) {
						// TODO: IE9 may sometimes for some reason throw an array in here :/ must investigate!!!
						return thing && gui.Type.isNumber(thing.nodeType); // first check added for FF which now may fail as well :/
					});
					if (elms.length) {
						base.call(this, elms);
					}
					return things;
				};
			}
		)
	);
})();

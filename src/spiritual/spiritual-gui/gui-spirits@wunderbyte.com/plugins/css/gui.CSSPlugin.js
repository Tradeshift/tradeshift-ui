/**
 * Spirit styling studio.
 * @extends {gui.Plugin}
 * @using {gui.Array} GuiArray
 * @using {gui.Combo#chained}
 * @using {gui.Arguments#confirmed}
 */
gui.CSSPlugin = (function using(GuiArray, chained, confirmed) {
	/**
	 * Get the persistable classlist (or create it just-in-time).
	 * @param {Element} element - Perhaps the user has only provided this element
	 * @param {Spirit} spirit - But internally we use this (for technical reasons)
	 */
	function getset(element, spirit) {
		if ((spirit = spirit || element.spirit)) {
			return spirit.css._classset || (spirit.css._classset = new Set());
		}
	}

	/**
	 * Restore all missing classnames.
	 * @param {Element} element
	 * @param {Set<string>} set
	 */
	function setset(element, set) {
		if (set) {
			var css = element.classList;
			set.forEach(function(name) {
				if (!css.contains(name)) {
					css.add(name);
				}
			});
		}
	}

	return gui.Plugin.extend(
		{
			/**
			 * Add classname(s).
			 * @param {string|Array<string>} name
			 * @returns {gui.CSSPlugin}
			 */
			add: confirmed('string|array')(
				chained(function(name) {
					gui.CSSPlugin.add(this.spirit.element, name, this.spirit);
				})
			),

			/**
			 * Remove classname(s).
			 * @param {String} name
			 * @returns {gui.CSSPlugin}
			 */
			remove: confirmed('string|array')(
				chained(function(name) {
					gui.CSSPlugin.remove(this.spirit.element, name, this.spirit);
				})
			),

			/**
			 * Toggle classname(s).
			 * @param {String} name
			 * @returns {gui.CSSPlugin}
			 */
			toggle: confirmed('string|array')(
				chained(function(name) {
					gui.CSSPlugin.toggle(this.spirit.element, name, this.spirit);
				})
			),

			/**
			 * Add or remove classname(s) according to first argument.
			 * @param {boolean|object} on
			 * @param {String} name
			 * @returns {gui.CSSPlugin}
			 */
			shift: confirmed('*', 'string|array')(
				chained(function(on, name) {
					var spi = this.spirit;
					var elm = this.spirit.element;
					GuiArray.make(name).forEach(function(n) {
						gui.CSSPlugin.shift(elm, on, n, spi);
					});
				})
			),

			/**
			 * Contains classname?
			 * @param {String} name
			 * @returns {boolean}
			 */
			contains: confirmed('string')(function(name) {
				return gui.CSSPlugin.contains(this.spirit.element, name);
			}),

			/**
			 * Set single element.style.
			 * @param {String} prop
			 * @param {String} val
			 * @returns {gui.CSSPlugin}
			 */
			set: chained(function(prop, val) {
				gui.CSSPlugin.set(this.spirit.element, prop, val);
			}),

			/**
			 * Set multiple styles via key value map.
			 * @param {Map<String,String>} map
			 * @returns {gui.CSSPlugin}
			 */
			style: chained(function(map) {
				gui.CSSPlugin.style(this.spirit.element, map);
			}),

			/**
			 * Get single element.style; see also compute method.
			 * @param {String} prop
			 * @returns {String}
			 */
			get: function(prop) {
				return gui.CSSPlugin.get(this.spirit.element, prop);
			},

			/**
			 * Compute runtime style.
			 * @param {String} prop
			 * @returns {String}
			 */
			compute: function(prop) {
				return gui.CSSPlugin.compute(this.spirit.element, prop);
			},

			/**
			 * Get or set (full) className.
			 * @param @optional {String} name
			 * @returns {String|gui.CSSPlugin}
			 */
			name: chained(function(name) {
				var result = this.spirit.element.className;
				if (arguments.length) {
					result = this.spirit;
					this._suspended = true;
					this.spirit.element.className = '';
					this._suspended = false;
					this.add(name);
				}
				return result;
			}),

			/**
			 * Spirit element mathes selector?
			 * @TODO: move to gui.DOMPlugin!
			 * @param {String} selector
			 * @returns {boolean}
			 */
			matches: function(selector) {
				return gui.CSSPlugin.matches(this.spirit.element, selector);
			},

			// Privileged ............................................................

			/**
			 * Compare "persisted" classnames to the current, actual classnames
			 * and restore the ones that are missing (actually persisting them).
			 */
			$persist: function() {
				if (!this._suspended) {
					setset(this.spirit.element, this._classset);
				}
			},

			// Private ...............................................................

			/**
			 * Tracking assigned classnames so that they can be persisted properly.
			 * @type {Set<string>}
			 */
			_classset: null
		},
		{},
		{
			// Static ................................................................

			/**
			 * classList.add
			 * @param {Element} element
			 * @param {String} names
			 * @param {Spirit} [spirit] (not accessible via `element` during newup!)
			 * @returns {function}
			 */
			add: chained(function(element, name, spirit) {
				var set = getset(element, spirit);
				GuiArray.make(name).forEach(function(n) {
					element.classList.add(n);
					if (set) {
						set.add(n);
					}
				});
			}),

			/**
			 * classList.remove
			 * @param {Element} element
			 * @param {String} name
			 * @param {Spirit} [spirit]
			 * @returns {function}
			 */
			remove: chained(function(element, name, spirit) {
				var set = getset(element, spirit);
				GuiArray.make(name).forEach(function(n) {
					element.classList.remove(n);
					if (set) {
						set.delete(n);
					}
				});
			}),

			/**
			 * classList.toggle
			 * @param {Element} element
			 * @param {String} name
			 * @param {Spirit} [spirit]
			 * @returns {function}
			 */
			toggle: chained(function(element, name, spirit) {
				GuiArray.make(name).forEach(function(n) {
					if (element.classList.contains(n)) {
						this.remove(element, n, spirit);
					} else {
						this.add(element, n, spirit);
					}
				});
			}),

			/**
			 * Add or remove classname according to second argument.
			 * TODO: for consistancy, the boolean arg must go first!
			 * @param {Element} element
			 * @param {truthy} on
			 * @param {String} name
			 * @param {Spirit} [spirit]
			 * @returns {function}
			 */
			shift: chained(function(element, on, name, spirit) {
				if (on) {
					// coerce to boolean
					this.add(element, name, spirit);
				} else {
					this.remove(element, name, spirit);
				}
			}),

			/**
			 * classList.contains
			 * @param {Element} element
			 * @param {String} name
			 * @returns {boolean}
			 */
			contains: function(element, name) {
				return element.classList.contains(name);
			},

			/**
			 * Set single CSS property. Use style() for multiple properties.
			 * TODO: also automate shorthands such as "10px 20px 10px 20px"
			 * @param {Element}
			 * @param {String} prop
			 * @returns {function}
			 */
			set: chained(function(element, prop, value) {
				value = this._shorthand(prop, value);
				if (prop === 'float') {
					prop = 'cssFloat';
				} else {
					value = this._jsvalue(value);
					prop = this._jsproperty(prop);
				}
				element.style[prop] = value;
			}),

			/**
			 * TODO: Get element.style property; if this has been set.
			 * Not to be confused with compute() for computedStyle!!!
			 * @param {Element}
			 * @param {String} prop
			 * @returns {String}
			 */
			get: function(element, prop) {
				prop = this._jsproperty(prop);
				return this._jsvalue(element.style[prop]);
			},

			/**
			 * Set multiple element.style properties via hashmap. Note that
			 * this method returns the element (ie. it is not chainable).
			 * @param {Element|gui.Spirit} thing Spirit or element.
			 * @param {Map<String,String>} styles
			 * @returns {Element|gui.Spirit}
			 */
			style: function(thing, styles) {
				var element = thing instanceof gui.Spirit ? thing.element : thing;
				gui.Object.each(
					styles,
					function(prop, value) {
						this.set(element, prop, value);
					},
					this
				);
				return thing;
			},

			/**
			 * Compute runtime style.
			 * @param {Element|gui.Spirit} thing
			 * @param {String} prop
			 * @returns {String}
			 */
			compute: function(thing, prop) {
				var element = thing instanceof gui.Spirit ? thing.element : thing;
				prop = this._standardcase(this._jsproperty(prop));
				return window.getComputedStyle(element, null).getPropertyValue(prop);
			},

			/**
			 * Node matches CSS selector?
			 * @param {Node} node
			 * @param {String} selector
			 * @returns {boolean}
			 */
			matches: function(node, selector) {
				var matches = false;
				try {
					// TODO: Something about trycatch not being JIT compatible?
					matches = node[this._matchmethod](selector);
				} catch (dysfunction) {
					console.error('Invalid selector: "' + selector + '"');
					throw dysfunction;
				}
				return matches;
			},

			// Private static ........................................................

			/**
			 * Temporarily suspending the whole "persist" mechanism?
			 * @type {boolean}
			 */
			_suspended: false,

			/**
			 * Non-matching vendors removed after first run. First entry
			 * gets to stay since it represents the unprefixed property.
			 * @type {Array<String>}
			 */
			_vendors: ['', '-webkit-', '-moz-', '-ms-', '-o-'],

			/**
			 * Resolve shorthands for value.
			 * @param {string} prop
			 * @param {number|string} value
			 * @returns {string}
			 */
			_shorthand: function(prop, value) {
				var short;
				switch (
					gui.Type.of(value) // not much of a difference (just yet)
				) {
					case 'number':
						if ((short = this._numbershorthands[prop])) {
							value = short.replace('@', value);
						}
						break;
					case 'string':
						if ((short = this._stringshorthands[prop])) {
							value = short.replace('@', value);
						}
						break;
				}
				return String(value);
			},

			/**
			 * CamelCase string.
			 * @param {String} string
			 * @returns {String}
			 */
			_camelcase: function(string) {
				return string.replace(/-([a-z])/gi, function(all, letter) {
					return letter.toUpperCase();
				});
			},

			/**
			 * standard-css-notate CamelCased string.
			 * @param {String} string
			 * @returns {String}
			 */
			_standardcase: function(string) {
				return string.replace(/[A-Z]/g, function(all, letter) {
					return '-' + string.charAt(letter).toLowerCase();
				});
			},

			/**
			 * Normalize declaration property for use in element.style scenario.
			 * @param {String} prop
			 * @returns {String}
			 */
			_jsproperty: function(prop) {
				var vendors = this._vendors,
					fixt = prop;
				var element = document.documentElement;
				prop = String(prop);
				if (prop.startsWith('-beta-')) {
					vendors.every(function(vendor) {
						var test = this._camelcase(prop.replace('-beta-', vendor));
						if (element.style[test] !== undefined) {
							fixt = test;
							return false;
						}
						return true;
					}, this);
				} else {
					fixt = this._camelcase(fixt);
				}
				return fixt;
			},

			/**
			 * Normalize declaration value for use in element.style scenario.
			 * @param {String} value
			 * @returns {String}
			 */
			_jsvalue: function(value) {
				var vendors = this._vendors;
				var element = document.documentElement;
				value = String(value);
				if (value && value.includes('-beta-')) {
					var parts = [];
					value.split(', ').forEach(function(part) {
						if ((part = part.trim()).startsWith('-beta-')) {
							vendors.every(function(vendor) {
								var test = this._camelcase(part.replace('-beta-', vendor));
								if (element.style[test] !== undefined) {
									parts.push(part.replace('-beta-', vendor));
									return false;
								}
								return true;
							}, this);
						} else {
							parts.push(part);
						}
					}, this);
					value = parts.join(',');
				}
				return value;
			},

			/**
			 * Normalize declaration property for use in CSS text.
			 * @param {String} prop
			 * @returns {String}
			 */
			_cssproperty: function(prop) {
				return this._standardcase(this._jsproperty(prop));
			},

			/**
			 * Normalize declaration value for use in CSS text.
			 * @param {String} prop
			 * @returns {String}
			 */
			_cssvalue: function(value) {
				return this._standardcase(this._jsvalue(value));
			},

			/**
			 * Number shorthands will autosuffix properties that require units
			 * in support of the syntax: this.css.width = 300 (no method call)
			 * TODO: add more properties
			 * TODO: getters as well as setters
			 * @type {Map<String,String>
			 */
			_numbershorthands: {
				top: '@px',
				right: '@px',
				bottom: '@px',
				left: '@px',
				width: '@px',
				height: '@px',
				maxWidth: '@px',
				maxHeight: '@px',
				minWidth: '@px',
				minHeight: '@px',
				textIndent: '@px',
				margin: '@px',
				marginTop: '@px',
				marginRight: '@px',
				marginBottom: '@px',
				marginLeft: '@px',
				padding: '@px',
				paddingTop: '@px',
				paddingRight: '@px',
				paddingBottom: '@px',
				paddingLeft: '@px',
				fontWeight: '@',
				opacity: '@',
				zIndex: '@'
			},

			/**
			 *
			 */
			_stringshorthands: {
				backgroundImage: 'url("@")',
				position: '@',
				display: '@',
				visibility: '@'
			},

			/**
			 * Lookup vendors "matchesSelector" method.
			 * @type {String}
			 */
			_matchmethod: (function() {
				var match = null,
					root = document.documentElement;
				[
					'mozMatchesSelector',
					'webkitMatchesSelector',
					'msMatchesSelector',
					'oMatchesSelector',
					'matchesSelector'
				].every(function(method) {
					if (gui.Type.isDefined(root[method])) {
						match = method;
					}
					return match === null;
				});
				return match;
			})()
		}
	);
})(gui.Array, gui.Combo.chained, gui.Arguments.confirmed);

/**
 * Generate shorthand getters/setters for top|left|width|height etc.
 * @using {constructor} plugin
 */
(function using(Plugin) {
	function getset(prop) {
		Object.defineProperty(Plugin.prototype, prop, {
			enumerable: true,
			configurable: true,
			get: function get() {
				if (this.spirit) {
					return parseInt(this.get(prop), 10);
				}
			},
			set: function set(val) {
				this.set(prop, val);
			}
		});
	}
	[Plugin._numbershorthands, Plugin._stringshorthands].forEach(function(shorts) {
		for (var prop in shorts) {
			if (shorts.hasOwnProperty(prop)) {
				getset(prop);
			}
		}
	});
})(gui.CSSPlugin);

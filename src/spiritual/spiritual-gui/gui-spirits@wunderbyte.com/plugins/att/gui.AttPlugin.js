/**
 * Manipulate DOM attributes and observe attribute changes.
 * @extends {gui.TrackerPlugin}
 * @using {gui.Arguments#confirmed}
 * @using {gui.Combo#chained}
 * @using {gui.Client} Client
 */
gui.AttPlugin = (function using(confirmed, chained, Client) {
	return gui.TrackerPlugin.extend(
		{
			/**
			 * Get single element attribute cast to an inferred type.
			 * @param {String} att
			 * @returns {String|number|boolean} Autoconverted
			 */
			get: function(name) {
				return gui.AttPlugin.get(this.spirit.element, name);
			},

			/**
			 * Set single element attribute (use null to remove).
			 * @param {String} name
			 * @param {String|number|boolean} value
			 * @returns {gui.AttPlugin}
			 */
			set: chained(function(name, value) {
				if (!this.$suspended) {
					gui.AttPlugin.set(this.spirit.element, name, value);
				}
			}),

			/**
			 * Element has attribute?
			 * @param {String|number|boolean} att
			 * @returns {boolean}
			 */
			has: function(name) {
				return gui.AttPlugin.has(this.spirit.element, name);
			},

			/**
			 * Remove element attribute.
			 * @TODO: Rename "remove" ???
			 * @param {String} att
			 * @returns {gui.AttPlugin}
			 */
			del: chained(function(name) {
				if (!this.$suspended) {
					gui.AttPlugin.del(this.spirit.element, name);
				}
			}),

			/**
			 * Collect attributes as an array (of DOMAttributes).
			 * @returns {Array<Attr>}
			 */
			all: function() {
				return gui.AttPlugin.all(this.spirit.element);
			},

			/**
			 * Set attribute or remove the attribute alltogether.
			 * @param {boolean} on
			 * @param {string} name
			 * @param {string|number|boolean} value
			 * @returns {gui.AttPlugin}
			 */
			shift: confirmed('boolean', 'string')(
				chained(function(on, name, value) {
					if (on) {
						if (value !== undefined) {
							this.set(name, value);
						} else {
							throw new TypeError('Missing value for "' + name + '"');
						}
					} else {
						this.del(name);
					}
				})
			),

			/**
			 * Get all attributes as hashmap type object.
			 * Values are converted to an inferred type.
			 * @returns {Map<String,String>}
			 */
			getmap: function() {
				return gui.AttPlugin.getmap(this.spirit.element);
			},

			/**
			 * Invoke multiple attributes update via hashmap
			 * argument. Use null value to remove an attribute.
			 * @param {Map<String,String>}
			 */
			setmap: function(map) {
				gui.AttPlugin.setmap(this.spirit.element, map);
			},

			/**
			 * Add one or more attribute listeners.
			 * @param {array|string} arg
			 * @param @optional {object|function} handler
			 * @returns {gui.AttPlugin}
			 */
			add: confirmed('array|string', '(object|function)')(
				chained(function(arg, handler) {
					handler = handler || this.spirit;
					if (gui.Interface.validate(gui.IAttHandler, handler)) {
						gui.Array.make(arg).forEach(function(type) {
							if (this._addchecks(type, [handler])) {
								this._onadd(type);
							}
						}, this);
					}
				})
			),

			/**
			 * Remove one or more attribute listeners.
			 * @param {object} arg
			 * @param @optional {object} handler
			 * @returns {gui.AttPlugin}
			 */
			remove: confirmed('array|string', '(object|function)')(
				chained(function(arg, handler) {
					handler = handler || this.spirit;
					if (gui.Interface.validate(gui.IAttHandler, handler)) {
						gui.Array.make(arg).forEach(function(type) {
							this._removechecks(type, [handler]);
						}, this);
					}
				})
			),

			// Privileged ..............................................................

			/**
			 * Attribute updates disabled?
			 * @type {boolean}
			 */
			$suspended: false,

			/**
			 * Suspend attribute updates for the duration of the
			 * action. This to prevent endless attribute updates.
			 * @param {function} action
			 * @retruns {object}
			 */
			$suspend: function(action) {
				this.$suspended = true;
				var res = action();
				this.$suspended = false;
				return res;
			},

			/**
			 * Trigger potential handlers for attribute update.
			 * @param {String} name
			 * @param {String} value
			 */
			$onatt: function(name, value) {
				var list, att, handler, trigger;
				var triggers = !gui.attributes.every(function(prefix) {
					if ((trigger = name.startsWith(prefix))) {
						this.spirit.config.configureone(name, value);
					}
					return !trigger;
				}, this);
				if (!triggers && (list = this._trackedtypes[name])) {
					att = new gui.Att(name, value);
					list.forEach(function(checks) {
						handler = checks[0];
						handler.onatt(att);
					}, this);
				}
			},

			// Private .................................................................

			/**
			 * Resolve attribute listeners immediately when added.
			 * @param {String} name
			 */
			_onadd: function(name) {
				if (this.has(name)) {
					var value = this.get(name);
					if (name.startsWith(gui.ConfigPlugin.PREFIX)) {
						this.spirit.config.configureone(name, value);
					} else {
						this.$onatt(name, value);
					}
				}
			}
		},
		{},
		{
			// Static ...........................................................

			/**
			 * Get single element attribute cast to an inferred type.
			 * @param {Element} elm
			 * @param {String} name
			 * @returns {object} String, boolean or number
			 */
			get: function(elm, name) {
				switch (name) {
					case 'disabled':
					case 'readonly':
					case 'required':
					case 'autofocus':
						return elm.spirit.att.has(elm, name);
				}
				return gui.Type.cast(elm.getAttribute(name));
			},

			/**
			 * Set single element attribute (use null to remove).
			 * @param {Element} elm
			 * @param {String} name
			 * @param {String} value
			 * @param @optional @internal {boolean} $hotfix
			 * @returns {function}
			 */
			set: chained(function(elm, name, value, $hotfix) {
				var spirit = elm.spirit;
				var change = false;
				if (this._ischecked(elm, name)) {
					// checkbox or radio?
					change = elm.checked !== value;
					elm.checked = String(value) === 'false' ? false : value !== null;
					if (change) {
						spirit.att.$onatt(name, value);
					}
				} else if (this._isvalue(elm, name)) {
					change = elm.value !== String(value);
					if (change) {
						elm.value = String(value);
						spirit.att.$onatt(name, value);
					}
				} else if (name === 'required') {
					elm.required = !!value;
				} else if (name === 'readonly') {
					elm.readOnly = !!value;
				} else if (name === 'disabled') {
					elm.disabled = !!value;
				} else if (name === 'autofocus') {
					elm.autofocus = !!value;
				} else if (value === null) {
					this.del(elm, name);
				} else {
					value = String(value);
					if (elm.getAttribute(name) !== value) {
						if (spirit) {
							spirit.att.$suspend(function() {
								elm.setAttribute(name, value);
							});
							spirit.att.$onatt(name, value);
						} else {
							elm.setAttribute(name, value);
						}
					}
				}
			}),

			/**
			 * @returns {boolean}
			 */
			_ischecked: function(elm, name) {
				return elm.type && elm.checked !== undefined && name === 'checked';
			},

			/**
			 * @returns {boolean}
			 */
			_isvalue: function(elm, name) {
				return elm.value !== undefined && name === 'value';
			},

			/**
			 * Element has attribute?
			 * @param {Element} elm
			 * @param {String} name
			 * @returns {boolean}
			 */
			has: function(elm, name) {
				return elm.hasAttribute(name);
			},

			/**
			 * Remove element attribute.
			 * @param {Element} elm
			 * @param {String} att
			 * @returns {function}
			 */
			del: chained(function(elm, name) {
				var spirit = elm.spirit;
				if (this._ischecked(elm, name)) {
					elm.checked = false;
				} else if (this._isvalue(elm, name)) {
					elm.value = ''; // or what?
				} else {
					if (spirit) {
						spirit.att.$suspend(function() {
							elm.removeAttribute(name);
						});
						if (!spirit.config.configureone(name, null)) {
							spirit.att.$onatt(name, null);
						}
					} else {
						elm.removeAttribute(name);
					}
				}
			}),

			/**
			 * Collect attributes as an array (of DOMAttributes).
			 * @param {Element} elm
			 * @returns {Array<Attr>}
			 */
			all: function(elm) {
				return gui.Array.from(elm.attributes);
			},

			/**
			 * Get all attributes as hashmap type object.
			 * Values are converted to an inferred type.
			 * @param {Element} elm
			 * @returns {Map<String,String>}
			 */
			getmap: function(elm) {
				var map = Object.create(null);
				this.all(elm).forEach(function(att) {
					map[att.name] = gui.Type.cast(att.value);
				});
				return map;
			},

			/**
			 * Invoke multiple attributes update via hashmap
			 * argument. Use null value to remove an attribute.
			 * @param {Element} elm
			 * @param {Map<String,String>}
			 * @returns {function}
			 */
			setmap: chained(function(elm, map) {
				gui.Object.each(
					map,
					function(name, value) {
						this.set(elm, name, value);
					},
					this
				);
			})
		}
	);
})(gui.Arguments.confirmed, gui.Combo.chained, gui.Client);

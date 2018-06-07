/**
 * Configures a spirit by attribute parsing.
 * TODO: Evaluate properties onconfigure; evaluate methods later.
 * @extends {gui.Plugin}
 */
gui.ConfigPlugin = gui.Plugin.extend(
	{
		/**
		 * Invoked by the {gui.Spirit} once all plugins have been plugged in.
		 *
		 * - Simple properties (booleans etc) will run at {gui.Spirit#onconfigure}
		 * - Methods calls of any kind will be invoked at {gui.Spirit#onready}
		 *
		 * TODO: Simple props with no setter does nothing when updated now.
		 * Perhaps it would be possible to somehow configure those *first*?
		 * TODO: Figure out what the TODO above is supposed to mean
		 */
		configureall: function() {
			var atts = this.spirit.element.attributes;
			Array.forEach(
				atts,
				function(att) {
					this.configureone(att.name, att.value);
				},
				this
			);
		},

		/**
		 * Evaluate method updates at {gui.Spirit#onready}.
		 * @param {gui.Life} l
		 */
		onlife: function(l) {
			var update;
			if (l.type === gui.LIFE_READY) {
				while ((update = this._onready.shift())) {
					update.action();
				}
			}
		},

		/**
		 * Setup configuration (if applicable) after an attribute update.
		 * This should probably only ever be invoked by the {gui.AttPlugin}.
		 * @param {string} name
		 * @param {string} value
		 */
		configureone: function(name, value) {
			var hit,
				gux = this.spirit.window.gui;
			var dot = gui.ConfigPlugin.SEPARATOR;
			gux.attributes.every(function(fix) {
				if ((hit = name.startsWith(fix + dot))) {
					this._evaluate(name, value, fix, dot);
				}
				return !hit;
			}, this);
		},

		// Private ...................................................................

		/**
		 * Collecting method-type updates during spirit initialization.
		 * @type {Array<function>}
		 */
		_onready: null,

		/**
		 * Evaluate single attribute in search for "gui." prefix.
		 * The string value will be autocast to an inferred type.
		 * "false" becomes a boolean while "23" becomes a number.
		 * @param {string} name
		 * @param {string} value
		 * @param {string} fix
		 * @param {string} dot
		 */
		_evaluate: function(name, value, fix, dot) {
			var originame = name,
				struct = this.spirit,
				success = true,
				prop = null,
				cuts = null;
			name = prop = name.split(fix + dot)[1];
			if (name.indexOf(dot) > -1) {
				cuts = name.split(dot);
				cuts.forEach(function(cut, i) {
					if (gui.Type.isDefined(struct)) {
						if (i < cuts.length - 1) {
							struct = struct[cut];
						} else {
							prop = cut;
						}
					} else {
						success = false;
					}
				});
			}
			// Note that a "getter" must not returned `undefined` here!
			if (success && gui.Type.isDefined(struct[prop])) {
				this._schedule(struct, prop, this._revaluate(value, originame));
			} else {
				console.error('No definition for "' + name + '" in ' + this.spirit.toString());
			}
		},

		/**
		 * Schedule update. Simple properties (strings, booleans, numbers) will be
		 * updated during `onconfigure` while methods will be invoked at `onready`.
		 * @param {object} struct What to update
		 * @param {string} prop Property or method name
		 * @param {object} value Property value or method argument
		 */
		_schedule: function(struct, prop, value) {
			if (gui.Type.isFunction(struct[prop])) {
				if (this.spirit.life.ready) {
					struct[prop](value);
				} else {
					this.spirit.life.add(gui.LIFE_READY, this);
					if (this._onready) {
						this._onready.reduce(function(x, o, i) {
							return o.struct === struct && o.prop === prop ? i : x;
						}, -1);
					} else {
						this._onready = [];
					}
					this._onready.push({
						struct: struct,
						prop: prop,
						action: function() {
							struct[prop](value);
						}
					});
				}
			} else {
				struct[prop] = value;
			}
		},

		/**
		 * Typecast the value.
		 * TODO: Move the EDB hack into EDBML module somehow.
		 * @param {object} value
		 * @returns {object}
		 */
		_revaluate: function(value, name) {
			if (gui.Type.isString(value)) {
				if (this._ispoke(value, name)) {
					value = window.edbml.$get(gui.KeyMaster.extractKey(value)[0]);
				} else {
					value = gui.Type.cast(value);
					if (gui.Type.isString(value)) {
						value = gui.ConfigPlugin.jsonvaluate(value);
					}
				}
			}
			return value;
		},

		/**
		 * @param {*} value
		 * @param {string} name
		 * @returns {boolean}
		 */
		_ispoke: function(value, name) {
			return (
				gui.hasModule('edbml@wunderbyte.com') &&
				name.startsWith('data-ts.') &&
				gui.KeyMaster.isKey(value)
			);
		}
	},
	{
		// Static .................................................................

		/**
		 * Run on spirit startup (don't wait for implementation to require it).
		 * @type {boolean}
		 */
		lazy: false,

		/**
		 * Use dots to separate object-path style attributes.
		 * Isolated so that you can overwrite it if you like.
		 * @type {string}
		 */
		SEPARATOR: '.',

		/**
		 * Parse JSON accounting for potentially invalid JSON with no quotes on keys.
		 * We'll attempt to assume valid JSON first, just in case that regexp is bad.
		 * @param {string} json
		 * @returns {object}
		 */
		jsonify: function(json) {
			var UNQUOTED = /(['"])?([a-zA-Z0-9_\$]+)(['"])?\s*:/g;
			try {
				return JSON.parse(json);
			} catch (x1) {
				try {
					json = json.replace(UNQUOTED, '"$2":');
					return JSON.parse(json);
				} catch (x2) {
					console.error(x2);
					console.warn(json);
				}
			}
		},

		/**
		 * @deprecated
		 * This doesn't work with proper CSP settings, but it 
		 * should always be remembered as the better hack.
 		 * @param {string} json
 		 * @returns {object}
 		 */
		deprecated_jsonify: (function(div) {
			return function UNSAFE_HACK(json) {
				div.setAttribute('onclick', 'this.json = ' + json);
				div.click();
				return div.json;
			};
		})(document.createElement('div')),

		/**
		 * JSONArray or JSONObject scrambled with encodeURIComponent?
		 * If so, let's decode and parse this into an array or object.
		 * @param {string} value
		 * @returns {Array|Object>}
		 */
		jsonvaluate: function(value) {
			if (
				[['%5B', '%5D'], ['%7B', '%7D']].some(function isencoded(tokens) {
					return value.startsWith(tokens[0]) && value.endsWith(tokens[1]);
				})
			) {
				value = decodeURIComponent(value);
				value = gui.ConfigPlugin.jsonify(value);
			}
			return value;
		}
	}
);

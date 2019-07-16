/**
 * Corporate base spirit.
 * @extends {gui.Spirit}
 * @using {gui.Type} Type
 * @using {gui.Array} GuiArray
 * @using {gui.Arguments#confirmed} confirmed
 * @using {gui.Combo#chained} chained
 */
ts.ui.Spirit = (function using(Type, GuiArray, confirmed, chained) {
	return gui.Spirit.extend(
		{
			/**
			 * Setup.
			 */
			onconstruct: function() {
				this.super.onconstruct();
				this._configureclassnames(this.css);
			},

			/**
			 * Show or hide cover with spinner and optional message.
			 * Support triggering via attribute `data-ts.busy="arg"`
			 * The setTimeout is for async call for catched, the cover
			 * won't be dismissed
			 * @param {string|boolean} arg
			 * @returns {this}
			 */
			busy: chained(function(arg) {
				var self = this;
				setTimeout(function() {
					var cover = self._childcover();
					if (arg === false || arg === '') {
						if (--self._busycount === 0) {
							cover.fadeOut(); // the fadeOut callback is not working when open a new tab in the browser.
							setTimeout(function() {
								cover
									.opaque(false)
									.blocking(false)
									.stop();
							}, 10);
						} else if (self._busycount < 0) {
							self._busycount = 0;
						}
					} else {
						if (++self._busycount === 1) {
							cover.spin(arg);
							cover.fadeIn();
						}
					}
				}, 10);
			}),

			/**
			 * @returns {this}
			 */
			done: chained(function() {
				this.busy(false);
			}),

			/**
			 * Change message.
			 * @param @optional {string} message
			 * @returns {this}
			 */
			spinnerMessage: chained(function(message) {
				if (this._cover) {
					this._cover.spin(message);
				}
			}),

			/**
			 * Show or hide the blocking cover with optional message.
			 * Support triggering via attribute `data-ts.busy="arg"`
			 * @returns {this}
			 */
			blocking: function(arg) {
				if (!arguments.length || !!arg) {
					this._childcover()
						.opaque(true)
						.blocking(true);
					this.busy.apply(this, arguments);
				} else {
					this.done();
				}
			},

			// Private ...............................................................

			/**
			 * Local cover.
			 * @type {ts.ui.CoverSpirit}
			 */
			_cover: null,

			/**
			 * Counting busy bees.
			 * @type {boolean}
			 */
			_busycount: 0,

			/**
			 * The spirit can have a model associated. This usually
			 * implies that the spirit was generated via API calls.
			 * @type {ts.ui.Model}
			 */
			_model: null,

			/**
			 * This spirit was somehow generated via API calls?
			 * In other words, it's not a simple DHTML widget.
			 * @return {boolean}
			 */
			_ismodelled: function() {
				return this._model !== null;
			},

			/**
			 * If this spirit has explicit channeling, attach list of CSS classnames.
			 * @param {gui.CSSPlugin} css
			 */
			_configureclassnames: function(css) {
				var cssnames = this.constructor.$cssnames;
				if (cssnames) {
					this.css.add(cssnames);
				}
			},

			/**
			 * Invoke that function with optional arguments *only if* it's defined.
			 * If the `action` argument is a string, we'll compile it to a function.
			 * Note that the `this` keyword will in either case point to this spirit.
			 * TODO: Support multiple args
			 * @param {string|function} action
			 * @returns {boolan} True if the action was called
			 */
			_maybeinvoke: function(action, arg) {
				if (action) {
					var args = [];
					if (arguments.length > 1) {
						args.push(arg);
					}
					if (Type.isString(action)) {
						action = new Function(action);
					}
					action.apply(this, args);
				}
				return !!action;
			},

			/**
			 * Get or create the local cover. The spirit should be
			 * position `relative` or `absolute` for this to work.
			 * @returns {ts.ui.CoverSpirit}
			 */
			_childcover: function() {
				if (this._cover) {
					return this._cover;
				}
				var Cover = ts.ui.CoverSpirit;
				this._cover = this.dom.child(Cover) || this.dom.append(Cover.summon());
				return this._cover;
			},

			// Privileged ............................................................

			/**
			 * Overwrites the default debugging (in Spiritual core).
			 * 1. Stamp constructor name unto element (for debugging)
			 * @param {boolean} construct
			 * @overwrites {gui.Spirit.$debug}
			 */
			$debug: function(construct) {
				if (construct) {
					this.att.set('data-ts-spirit', this.$classname);
				} else {
					this.att.del('data-ts-spirit');
				}
			}
		},
		{
			// Xstatic ...............................................................

			/**
			 * Current localization.
			 * @type {Object<string, string>}
			 */
			localization: null,

			/**
			 * New localization.
			 * TODO: Refactor all localization to use this method.
			 * @param {Object<string, string>
			 */
			localize: chained(function(arg) {
				var current = this.localization;
				if (arguments.length) {
					switch (gui.Type.of(arg)) {
						case 'object':
							var newlocale = arg;
							if (
								!current ||
								Object.keys(current).every(function(key) {
									var has = newlocale.hasOwnProperty(key);
									if (!has) {
										console.error('Missing translations for ' + key);
									}
									return has;
								})
							) {
								this.localization = newlocale;
							}
							break;
						case 'string':
							var key = arg;
							if (current && current.hasOwnProperty(key)) {
								return current[key];
							} else {
								console.error('Missing translations for ' + key);
							}
							break;
					}
				} else {
					return current;
				}
			})
		},
		{
			// Static ................................................................

			/**
			 * Spirit name as refered to in the documentation
			 * and also as used in the `data-ts` attribute.
			 * This only applies to spirits with a channeling.
			 * @type {string}
			 */
			$nicename: null,

			/**
			 * Spirit CSS classname. This gets autocomputed
			 * on startup over in the file called "ts.ui.js".
			 * This only applies to spirits with a channeling.
			 * @type {string}
			 */
			$cssname: null,

			/**
			 * Inherit CSS classnames via JS class hierarchy
			 * Still only applies to spirits with a channeling.
			 * @type {string}
			 */
			$cssnames: null,

			/**
			 * Create method to get or set the model associated to a spirit,
			 * (just to make sure that the API remains somewhat consistant).
			 * A model is instantiated if the getter is called before setter!
			 * TODO: The (generated) method should be prefixed with a `$` dollar.
			 * @param {constructor|string} Model eg. ts.ui.ToolBarModel
			 * @param {function|string} edbml eg. ts.ui.ToolBarSpirit.edbml
			 * @param @optional {function}
			 * @returns {function} Optionally do something with that model
			 */
			createModelMethod: confirmed('function', 'function|string', '(function)')(function(
				Model,
				edbml,
				handle
			) {
				handle =
					handle ||
					function(model) {
						return model;
					};
				return function modelmethod(opt_json) {
					var model = opt_json;
					if (model) {
						if (opt_json !== this._model) {
							model = Model.is(model) ? model : new Model(opt_json);
							this._model = model;
							this.script.load(edbml);
							this.script.input(model);
						}
					} else {
						model = this._model || modelmethod.call(this, {});
					}
					return handle.call(this, model) || model;
				};
			})
		}
	);
})(gui.Type, gui.Array, gui.Arguments.confirmed, gui.Combo.chained);

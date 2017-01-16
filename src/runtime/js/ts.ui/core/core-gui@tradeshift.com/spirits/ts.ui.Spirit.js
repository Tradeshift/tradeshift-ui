/**
 * Corporate base spirit.
 * @extends {gui.Spirit}
 * @using {gui.Type} Type
 * @using {gui.Array} GuiArray
 * @using {gui.Arguments#confirmed} confirmed
 */
ts.ui.Spirit = (function using(Type, GuiArray, confirmed) {
	return gui.Spirit.extend({

		/**
		 * Setup.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this._confirmattributes(gui.debug);
			this._configureclassnames(this.css);
		},

		// Private .................................................................

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
		 * Validate that the `gui` attribute is not used around here.
		 * For TS spirits, we'll be using the `ts` attribute instead.
		 * @param {boolean} debug
		 */
		_confirmattributes: function(debug) {
			if (debug && this.att.all().some(function(att) {
				return att.name === 'gui' || att.name.startsWith('gui.');
			})) {
				console.warn(
					'The "gui" attribute should not used. Use the "ts" ' +
					'attribute to configure the ' + this.$classname
				);
			}
		},

		/**
		 * If this spirit has explicit channeling, attach list of CSS classnames.
		 * TODO: MVC frameworks might assume control of the classname :/
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

		// Privileged ..............................................................

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
	}, { // Xstatic ..............................................................

	}, { // Static ...............................................................

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
		createModelMethod: confirmed('function', 'function|string', '(function)')(
			function(Model, edbml, handle) {
				handle = handle || function(model) {
					return model;
				};
				return function modelmethod(opt_json) {
					var model = opt_json;
					if (model) {
						if (opt_json !== this._model) {
							if (!Model.is(model)) {
								model = new Model(opt_json);
							}
							this._model = model;
							if (!this.script.loaded) {
								this.script.load(edbml);
							}
							this.script.input(model);
						}
					} else {
						model = this._model || modelmethod.call(this, {});
					}
					return handle.call(this, model) || model;
				};
			}
		)

	});
}(gui.Type, gui.Array, gui.Arguments.confirmed));

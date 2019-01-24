/**
 * Spirit of the search.
 * @using {ts.ui.ButtonSpirit} ButtonSpirit
 * @using {gui.CSSPlugin} CSSPlugin
 * @using {gui.Type} Type
 * @using {gui.Combo.chained} chained
 */
ts.ui.SearchSpirit = (function using(ButtonSpirit, CSSPlugin, Type, chained) {
	/*
	 * We'll make the spirit interface identical to the model interface so
	 * that we can use them interchangeably whenever one makes more sense.
	 */
	var methodnames = ['onsearch', 'onidle', 'onfocus', 'onblur'];

	return ts.ui.Spirit.extend({
		/**
		 * Setup. If no model is assigned via standard configuration
		 * (framework-internal usecase), we'll create the default model.
		 */
		onconfigure: function() {
			this.super.onconfigure();
			this.event.add('click').add('focus blur', this.element, this, true);
			if (!this._model) {
				this.model(this._defaultmodel());
			}
		},

		/**
		 * Handle event.
		 * @param {Event} e
		 */
		onevent: function(e) {
			this.super.onevent(e);
			switch (e.type) {
				case 'focus':
				case 'blur':
					this._isfocused = e.type === 'focus';
					this.css.shift(this._isfocused, 'ts-focus');
					this._update(this._model);
					break;
				case 'click':
					var button = ButtonSpirit.getButton(e.target);
					if (button && CSSPlugin.contains(button, 'ts-button-clear')) {
						this.dom.q('.ts-input').blur(); // IE dysfunction
						this.tick.time(function() {
							this._clear(this._model);
						}, 25);
					}
					break;
			}
		},

		/**
		 * Assign or change the model (the API user is not supposed to do this!).
		 * @param {ts.ui.SearchModel} model
		 */
		model: function(model) {
			if (model !== this._model) {
				// TODO(jmo@): edbml.$get should fix this: https://github.com/wunderbyte/spiritual-edbml/issues/14
				if (this._model) {
					this._model.removeObserver(this);
				}
				this._model = model;
				model.addObserver(this);
				if (!this.script.loaded) {
					this.script.load(ts.ui.SearchSpirit.edbml);
				}
				this.script.input(model);
				this._update(this._model);
			}
		},

		/**
		 * Handle model changes.
		 * @param {Array<edb.Change>} changes
		 */
		onchange: function(changes) {
			this.super.onchange(changes);
			var model = this._model;
			changes.forEach(function(c) {
				if (c.object === model) {
					switch (c.name) {
						case 'value':
							this._update(model);
							break;
						case 'flex':
							// perhaps do something here?
							break;
					}
				}
			}, this);
		},

		// API .....................................................................

		/**
		 * @type {string}
		 */
		value: {
			getter: function() {
				return this._model.value;
			},
			setter: function(value) {
				this._model.value = value;
			}
		},

		/**
		 * @type {number}
		 */
		idletime: {
			getter: function() {
				return this._model.idletime;
			},
			setter: function(value) {
				this._model.idletime = value;
			}
		},

		/**
		 * Open for implementation: Called when the user presses ENTER
		 * (noting that this only works for the default-created model).
		 * @param {string} value
		 */
		onsearch: function(value) {},

		/**
		 * Open for implementation: Called when the user pauses typing.
		 * @param {string} value
		 */
		onidle: function(value) {},

		/**
		 * Open for implementation: Called when the search field is focused.
		 */
		onfocus: function() {},

		/**
		 * Open for implementation: Called when the search field gets blurred.
		 */
		onblur: function() {},

		/**
		 * Focus the search field.
		 * @returns {ts.ui.SearchSpirit}
		 */
		focus: chained(function() {
			this._model.focus();
		}),

		/**
		 * Blur the search field.
		 * @returns {ts.ui.SearchSpirit}
		 */
		blur: chained(function() {
			this._model.blur();
		}),

		/**
		 * The `info` string acts as a title (tooltip) when
		 * collapsed and as an input placeholder when expanded.
		 * @param @optional {string} text
		 * @returns {string|ts.ui.SearchSpirit}
		 */
		info: chained(function(text) {
			if (arguments.length) {
				this._model.info = text;
			} else {
				return this._model.info;
			}
		}),

		/**
		 * Search now!
		 * @returns {this}
		 */
		search: chained(function() {
			this._model.search();
		}),

		// Private .................................................................

		/**
		 * The model goes here.
		 * @type {ts.ui.SearchModel}
		 */
		_model: null,

		/**
		 * Create the default model. We'll attempt to make the
		 * spirit interface identical to the model interface.
		 * @returns {ts.ui.SearchModel}
		 */
		_defaultmodel: function() {
			var spirit = this,
				model = new ts.ui.SearchModel();
			methodnames.forEach(function(method) {
				model[method] = function() {
					if (Type.isFunction(spirit[method])) {
						spirit[method].apply(spirit, arguments);
					}
				};
			});
			return model;
		},

		/**
		 * Generally update things.
		 * @param {ts.ui.SearchModel} model
		 */
		_update: function(model) {
			if (model.flex) {
				this.css.add('ts-searching');
			} else {
				var emptiness = !model.value;
				var searching = model.value || this._isfocused;
				var isalready = this.css.contains('ts-searching');
				this.css.shift(emptiness, 'ts-empty').shift(searching, 'ts-searching');
				if (this.css.contains('ts-searching') !== isalready) {
					this.action.dispatch('ts-action-search', !isalready);
				}
			}
		},

		/**
		 * Clear the search.
		 * @param {ts.ui.SearchModel} model
		 */
		_clear: function(model) {
			if (!model.flex) {
				// hack for the ToolBar here...
				this.action.dispatch('ts-action-search', false);
				this.css.remove('ts-searching');
			}
			model.removeObserver(this);
			model.clear();
			this.css.add('ts-empty');
			this.css.remove('ts-focus');
			this.tick.time(function reset() {
				model.addObserver(this);
			});
		}
	});
})(ts.ui.ButtonSpirit, gui.CSSPlugin, gui.Type, gui.Combo.chained);

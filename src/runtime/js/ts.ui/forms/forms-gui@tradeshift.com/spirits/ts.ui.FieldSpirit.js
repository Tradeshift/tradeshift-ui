/**
 * Spirit of the form element (textarea, checkbox, input, select).
 * @extends {ts.ui.Spirit}
 * @using {gui.Combo.chained} chained
 */
ts.ui.FieldSpirit = (function using(chained) {
	return ts.ui.Spirit.extend(
		{
			/**
			 * Attach to the DOM.
			 */
			onattach: function() {
				this.super.onattach();
				this.tick.addStart(ts.ui.FieldSpirit.TICK_SYNC, ts.ui.FieldSpirit.TICK_TIME, this);
				this.event.add('focus blur');
				this.css.add(ts.ui.CLASS_FIELD);
				this.$updatestyling();
			},

			/**
			 * Account for strange Angular quantum effects.
			 */
			onasync: function() {
				this.super.onasync();
				this.$updatestyling();
			},

			/**
			 * Handle event.
			 * @param {Event} e
			 */
			onevent: function(e) {
				this.super.onevent(e);
				var model = this._model;
				switch (e.type) {
					case 'focus':
						if (model) {
							model.focused = true;
						}
						break;
					case 'blur':
						if (model) {
							model.focused = false;
						}
						break;
				}
			},

			/**
			 * Handle tick.
			 * @param {gui.Tick} t
			 */
			ontick: function(t) {
				this.super.ontick(t);
				if (t.type === ts.ui.FieldSpirit.TICK_SYNC) {
					this.$updatestyling();
				}
			},

			// Privileged ..............................................................

			/**
			 * Style the form.
			 * @see {ts.ui.LabelSpirit#ontick}
			 */
			$updatestyling: function() {
				var required = this.att.has('required');
				var disabled = this.att.has('disabled');
				var readonly = this.att.has('readonly');
				this._label(function(label) {
					label.$fieldlabel();
					label.$required(required);
					label.$disabled(disabled);
					if (!this.css.contains(ts.ui.CLASS_FAKE)) {
						if (!this.css.contains(ts.ui.CLASS_NOLOCK)) {
							label.$readonly(readonly);
						}
					}
				});
			},

			/**
			 * Focus the field.
			 * @returns {ts.ui.FieldSpirit}
			 */
			focus: chained(function() {
				this.element.focus();
			}),

			/**
			 * Blur the field.
			 * @returns {ts.ui.FieldSpirit}
			 */
			blur: chained(function() {
				this.element.blur();
			}),

			// Private .................................................................

			/**
			 * Potential model going on.
			 * @type {ts.ui.Model}
			 */
			_model: null,

			/**
			 * Invoked when 'value' property gets updated on the spirit (not the element!)
			 * This method can be used for validation and type-coercion in sub-types.
			 * @param {string} value
			 * @returns {string}
			 */
			_evaluated: function(value) {
				return String(value);
			},

			/**
			 * Has containing LABEL? If so, run the optional callback action.
			 * @param @optional {function} Takes the {ts.ui.LabelSpirit} as argument.
			 */
			_label: function(action) {
				var label, result;
				if (!this.$destructed && this.dom.embedded()) {
					if ((label = this.dom.parent(ts.ui.LabelSpirit))) {
						if (action) {
							result = action.call(this, label);
						}
					}
				}
				return result;
			},

			/**
			 * Has containing fieldset? If so, run the optional callback action.
			 * @param @optional {function} Takes the {ts.ui.FieldSetSpirit} as argument.
			 */
			_fieldset: function(action) {
				var fieldset, result;
				this._label(function(label) {
					if ((fieldset = label.dom.parent(ts.ui.FieldSetSpirit))) {
						if (action) {
							result = action.call(this, fieldset);
						}
					}
				});
				return result;
			}
		},
		{
			// Static .................................................................

			/**
			 * The `value` property of form fields cannot be observed for changes,
			 * so we start a periodic tick to perform this kind of syncrhonization.
			 * We do it in a way so that there's only a single setInterval involved.
			 * We also code it so that any delay is only visual (formdata remains sync).
			 * TODO(jmo@): Hook into Page Visibility API if the browser doesn't already.
			 */
			TICK_SYNC: 'ts-tick-forms-sync',
			TICK_TIME: gui.Client.isTouchDevice ? 1000 : 500
		}
	);
})(gui.Combo.chained);

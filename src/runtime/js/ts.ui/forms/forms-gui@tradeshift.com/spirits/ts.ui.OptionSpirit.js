/**
 * Spirit of the input type=checkbox|radio.
 * @extends {ts.ui.FieldSpirit}
 */
ts.ui.OptionSpirit = ts.ui.FieldSpirit.extend({
	/**
	 * Validate much.
	 */
	onconfigure: function() {
		this.super.onconfigure();
		this._confirmbasic(this.element.localName, this.element.type);
	},

	/**
	 * Attach to the DOM.
	 */
	onattach: function() {
		this.super.onattach();
		this.css.add(ts.ui.CLASS_OPTION);
	},

	// Privileged ................................................................

	/**
	 * Style the form.
	 */
	$updatestyling: function() {
		this.super.$updatestyling();
		var type = this.element.type;
		this._label(function(label) {
			label.$option(type);
		});
		this._fieldset(function(fieldset) {
			fieldset.$options(type);
			if (type === 'radio') {
				fieldset.$disabled(this.att.has('disabled'));
			}
		});
	},

	// Private ...................................................................

	/**
	 * Confirm that you're not doing it wrong.
	 * TODO: handle this via some advanced superclass boilerplate.
	 * @param {string} name
	 * @param {string} type
	 */
	_confirmbasic: function(name, type) {
		if (gui.debug) {
			if (name !== 'input') {
				throw new Error(this + ' must attach to an input field', this.element);
			} else if (type !== 'checkbox' && type !== 'radio') {
				throw new Error(this + ' must attach to a checkbox or radio', this.element);
			}
		}
	}
});

/**
 * Spirit of the input type=text and textarea.
 * @extends {ts.ui.InputSpirit}
 */
ts.ui.TextInputSpirit = ts.ui.InputSpirit.extend({
	/**
	 * Attach to the DOM.
	 */
	onattach: function() {
		this.super.onattach();
		this.css.add(ts.ui.CLASS_TEXT);
	},

	// Privileged ................................................................

	/**
	 * Style the form.
	 */
	$updatestyling: function() {
		this.super.$updatestyling();
		this._label(function(label) {
			label.$textlabel();
		});
	}
});

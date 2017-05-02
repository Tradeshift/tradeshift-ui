/**
 * Spirit of the `SPAN` that contains the label text. If this label text is
 * enclosed in a conditional, Angular might insert this `SPAN` at a random
 * point in time, so the applied CSS classname is best managed by this spirit.
 * (it would be even better to deprecate the need for a special classname,
 * but that fixes some cross-browser problems with `text-overflow: ellipsis`).
 * @extends {ts.ui.Spirit}
 */
ts.ui.LabelTextSpirit = (function() {
	/**
	 * Attempt to apply the classname to the containing label and if not found,
	 * attempt to apply the class the containing fieldset (for option groups).
	 * @param {ts.ui.Spirit} spirit
	 * @param {boolean} on
	 */
	function classname(spirit, on) {
		var label, fieldset;
		if ((label = spirit.dom.parent(ts.ui.LabelSpirit))) {
			label.$haslabel(on);
		} else if ((fieldset = spirit.dom.parent(ts.ui.FieldSetSpirit))) {
			fieldset.$haslabel(on);
		}
	}

	return ts.ui.Spirit.extend({
		/**
		 * Attach the special classname.
		 */
		onattach: function() {
			this.super.onattach();
			classname(this, true);
		},

		/**
		 * Detach the special classname.
		 */
		ondetach: function() {
			this.super.ondetach();
			classname(this, false);
		}
	});
})();

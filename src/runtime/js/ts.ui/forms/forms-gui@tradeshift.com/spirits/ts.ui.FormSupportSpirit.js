/**
 * Performs just-in-time channeling of spirits for complex selectors. These
 * selectors come with a performance hit, but they make forms easy to author.
 * Note: In V4, sometimes `ts-form` class is found on `fieldset` and random
 * elements, that's why we can't rely on the FormSpirit to do this thing.
 * @see {ts.ui.FormSpirit}
 * @see {ts.ui.FieldSetSpirit}
 * @see {ts.ui.LabelSpirit}
 */
ts.ui.FormSupportSpirit = (function() {
	return ts.ui.Spirit.extend({
		onconstruct: function() {
			this.super.onconstruct();
			var module = ts.ui.FormsModule;
			var enable = !this.css.contains(ts.ui.CLASS_OPTIMIZED);
			module.channelComplexSelectors(enable);
		}
	});
})();

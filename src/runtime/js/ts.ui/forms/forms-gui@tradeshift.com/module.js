/**
 * Forms GUI module.
 */
ts.ui.FormsModule = gui.module('forms-gui@tradeshift.com', {
	/**
	 * Channeling spirits to CSS selectors.
	 */
	channel: [
		['[data-ts=Form]', ts.ui.FormSpirit],
		['[data-ts=FieldSet]', ts.ui.FieldSetSpirit],
		['[data-ts=Label]', ts.ui.LabelSpirit],
		['[data-ts=Switch]', ts.ui.SwitchSpirit],
		['[data-ts=Option]', ts.ui.OptionSpirit],
		['[data-ts=Input]', ts.ui.TextInputSpirit],
		['[data-ts=DateInput]', ts.ui.DateInputSpirit],
		['[data-ts=TextArea]', ts.ui.TextAreaSpirit],
		['[data-ts=Select]', ts.ui.SelectSpirit],
		['[data-ts=Search]', ts.ui.SearchSpirit],
		['[data-ts=AutoComplete]', ts.ui.AutocompleteInputSpirit],
		['[data-ts=Calendar]', ts.ui.CalendarSpirit], // does not belong here...

		// needed because of illegal usage in V4 :(
		['fieldset.ts-form', ts.ui.FieldSetSpirit],
		['label.ts-form', ts.ui.LabelSpirit],

		// these are really "private" spirits created by
		// other spirits, but we need to assign them here
		// because otherwise they will not be recognized
		// when Angular (sadly) has parsed them into the
		// templates, which in itself is a tragic problem.
		// @see {ts.ui.DateInputSpirit}
		// @see {ts.ui.SelectSpirit}
		['[data-ts=FakeDateInput]', ts.ui.FakeDateInputSpirit],
		['[data-ts=FakeSelectInput]', ts.ui.FakeSelectInputSpirit]
	],

	/**
	 * Channeling spirits to complex CSS selectors at considerable performance
	 * penalty; this will however make the forms markup much easier to author.
	 * This method is called when the first {ts.ui.FormSpirit} is encountered.
	 * @see {ts.ui.FormSpirit#onconstruct}
	 * @param {boolean} enabled
	 */
	channelComplexSelectors: function(enabled) {
		if (enabled && !this._channeled) {
			this._channeled = true;
			gui.channel([
				['.ts-form fieldset', ts.ui.FieldSetSpirit],
				['.ts-form label', ts.ui.LabelSpirit],
				['.ts-form span', ts.ui.LabelTextSpirit],
				['.ts-form input[type=date]', ts.ui.DateInputSpirit],
				['.ts-form span + input[type=checkbox]', ts.ui.SwitchSpirit],
				['.ts-form input[type=checkbox], .ts-form input[type=radio]', ts.ui.OptionSpirit],
				['.ts-form input + input', ts.ui.Spirit], // FakeElements in V4 ignored
				['.ts-form input', ts.ui.TextInputSpirit],
				['.ts-form textarea', ts.ui.TextAreaSpirit],
				['.ts-form select', ts.ui.SelectSpirit]
			]);
		}
	},

	// Private ...................................................................

	/**
	 * Complex selectors have been channeled?
	 * @type {boolean}
	 */
	_channeled: false
});

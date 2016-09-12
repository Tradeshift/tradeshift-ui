/**
 * Forms GUI module.
 * TODO: rename {ts.ui.FieldSetSpirit} to something less generic
 */
gui.module('forms-gui@tradeshift.com', {

	/**
	 * Channeling spirits to CSS selectors. 
	 * TODO (jmo@): The {ts.ui.FormSpirit} should maybe channel markup structure 
	 * selectors (which may be expensive) only when first encountered in the DOM.
	 * These spirits should in that case be channeled *last* so that they don't 
	 * take priority of user-defined channels (if required).
	 * @see {ts.ui.FormSpirit#onconstruct}
	 */
	channel: [

		// OLD
		['[ts-form]', ts.ui.FormSpirit],
		['[ts-group]', ts.ui.FieldSetSpirit],
		['[ts-label]', ts.ui.LabelSpirit],
		['[ts-switch]', ts.ui.SwitchSpirit],
		['[ts-option]', ts.ui.OptionSpirit],
		['[ts-input]', ts.ui.TextInputSpirit],
		['[ts-dateinput]', ts.ui.DateInputSpirit],
		['[ts-textarea]', ts.ui.TextAreaSpirit],
		['[ts-select]', ts.ui.SelectSpirit],
		['[ts-search]', ts.ui.SearchSpirit],
		['[ts-autocomplete]', ts.ui.AutocompleteInputSpirit],
		['[ts-calendar]', ts.ui.CalendarSpirit],
		['[ts-fakedateinput]', ts.ui.FakeDateInputSpirit],
		['[ts-fakeselectinput]', ts.ui.FakeSelectInputSpirit],
		
		// NEW
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
		
		// these are really "private" spirits created by 
		// other spirits, but we need to assign them here 
		// because otherwise they will not be recognized 
		// when Angular (sadly) has parsed them into the 
		// templates, which in itself is a tragic problem.
		// @see {ts.ui.DateInputSpirit}
		// @see {ts.ui.SelectSpirit}
		['[data-ts=FakeDateInput]', ts.ui.FakeDateInputSpirit],
		['[data-ts=FakeSelectInput]', ts.ui.FakeSelectInputSpirit],

		// markup structure channeling
		['.ts-form fieldset', ts.ui.FieldSetSpirit],
		['.ts-form label', ts.ui.LabelSpirit],
		['.ts-form input[type=date]', ts.ui.DateInputSpirit],
		['.ts-form span + input[type=checkbox]', ts.ui.SwitchSpirit],
		['.ts-form input[type=checkbox], .ts-form input[type=radio]', ts.ui.OptionSpirit],
		['.ts-form input', ts.ui.TextInputSpirit],
		['.ts-form textarea', ts.ui.TextAreaSpirit],
		['.ts-form select', ts.ui.SelectSpirit]
	]

});

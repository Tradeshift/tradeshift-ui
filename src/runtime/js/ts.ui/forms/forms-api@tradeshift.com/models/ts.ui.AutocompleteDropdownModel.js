/**
 * Autocomplete Dropdown Model
 */
ts.ui.AutocompleteDropdownModel = (function using() {
	return ts.ui.Model.extend({
		/**
		 * Friendly name
		 */
		item: 'autocompletedropdown',

		/**
		 * List of all possible items
		 * @type {Array.<{key: String, value: String}>}
		 */
		autocompleteList: null,

		/**
		 * Filter string in the input
		 * @type {String}
		 */
		filter: '',

		/**
		 * List of items shown currently.
		 * TODO: Is this used and/or updated?
		 * @type {Array.<{key: String, value: String}>}
		 */
		filteredAutocompleteList: null,

		/**
		 * Initialize.
		 */
		onconstruct: function() {
			this.super.onconstruct();
			this.autocompleteList = [];
			this.filteredAutocompleteList = [];
		},

		/**
		 * Filter the list based on the filter string
		 * @param {String} filter
		 * @returns {Array.<{key: String, value: String}>} filtered list of items
		 */
		onfilter: function(filter) {
			var filteredAutocompleteList = [];
			if (this.autocompleteList) {
				var idx = -1;
				var length = this.autocompleteList.length;
				while (++idx < length) {
					var item = this.autocompleteList[idx];
					if (item.value.indexOf(filter) !== -1) {
						filteredAutocompleteList.push(item);
					}
				}
			}
			return filteredAutocompleteList;
		},

		/**
		 * On selecting an item, the value will be put into the original input field
		 * @param {{key: String, value: String}} item
		 * @returns {String} value to put in the input field
		 */
		onselect: function(item) {
			return item.value;
		}
	});
})();

/**
 * API.
 */
ts.ui.CompanyCard = {
	/**
	 * @param {object|array} arg
	 */
	render: function(arg) {},

	/**
	 * Get card by GUID.
	 * @param {string} id
	 */
	get: function(id) {},

	/**
	 * Connection types (array index matches the number in JSON).
	 * @type {Array<Array<string, string>>}
	 */
	connectionTypes: [
		['Your company', 'ts-icon-network'],
		['Request sent', 'ts-icon-network'],
		['Connected', 'ts-icon-network'],
		['Registration in progress', 'ts-icon-network'],
		['In your Google Contacts', 'ts-icon-network'],
		['Via email only', 'ts-icon-network']
	],

	/**
	 * Industry types.
	 * @type {Array<string>}
	 */
	industryTypes: [
		'Airline',
		'Corporation',
		'Educational Organization',
		'Government Organization',
		'Local Business',
		'NGO',
		'Software & IT',
		'Performing Group',
		'Sports Team'
	],

	/**
	 * Company sizes.
	 * @type {Array<string>}
	 */
	companySizes: ['1', '1–10', '1–100', '100–249', '250-500', '500-1000']
};

// Implementation ..............................................................

/**
 * @using {gui.Array}
 * @using {gui.Object}
 */
(function using(GuiArray, GuiObject) {
	var collection = null;

	GuiObject.extend(ts.ui.CompanyCard, {
		/**
		 * Render cards for argument.
		 * @param {object|array} arg
		 */
		render: function(arg) {
			var objects;
			if (arguments.length) {
				objects = GuiArray.make(arg);
				if (collection) {
					objects.forEach(function(o) {
						collection.push(o);
					});
				} else {
					collection = new ts.ui.CompanyCardCollection(objects);
					collection.output();
				}
			} else {
				// return collection?
			}
		},

		/**
		 * Get card by GUID.
		 * @param {string} guid
		 */
		get: function(id) {
			return collection ? collection.get(id) : null;
		}
	});
})(gui.Array, gui.Object);

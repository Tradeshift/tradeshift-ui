/**
 * Advanced collection of form items.
 * @extends {ts.ui.Collection}
 */
ts.ui.FormItemCollection = ts.ui.Collection.extend(
	{
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'formitems'
	},
	{
		// Static .................................................................

		/**
		 * Allowed content models.
		 * @see {ts.ui.Collection.#$of}
		 * @see {ts.ui.Model#item}
		 * @type {Map<string,constructor>}
		 */
		allow: ['text', 'input', 'textarea', 'select']
	}
);

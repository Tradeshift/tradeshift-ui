/**
 * Advanced collection of dialog items.
 * @extends {ts.ui.Collection}
 */
ts.ui.DialogItemCollection = ts.ui.Collection.extend(
	{
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'dialogitems'
	},
	{
		// Static .................................................................

		/**
		 * Allowed content models.
		 * @see {ts.ui.Collection.#$of}
		 * @see {ts.ui.Model#item}
		 * @type {Map<string,constructor>}
		 */
		allow: ['text', 'form', 'menu']
	}
);

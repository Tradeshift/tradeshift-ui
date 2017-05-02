/**
 * Menu item collection.
 * @extends {ts.ui.Collection}
 */
ts.ui.ItemCollection = ts.ui.Collection.extend(
	{
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'items'
	},
	{
		// Static .................................................................

		assume: 'item'
	}
);

/**
 * For performance reasons, the table rows are (now) simple arrays instead of
 * models but we'll keep this file around to document the relevant properies.
 * @extends {ts.ui.Model}
 */
ts.ui.TableRowModel = (function using() {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'tablerow',

		/**
		 * Row is visible (not hidden by a search or something)?
		 * @type {boolean}
		 */
		visible: true,

		/**
		 * Row is new?
		 * @type {boolean}
		 */
		new: false,

		/**
		 * Row is selectable? (only works when the table is selectable)
		 * @type {boolean}
		 */
		selectable: true,

		/**
		 * Row is selected?
		 * @type {boolean}
		 */
		selected: false,

		/**
		 * This is really just the common classname of the cells in this row.
		 * @type {string}
		 */
		type: '',

		/**
		 * We can gain some performance by declaring cell members a simple objects.
		 * This means that we don't have a "model" for cell members, but we can
		 * say that the members are objects with a`text` and `value`. The value
		 * can be strings or numbers or anything really.
		 * @type {Array}
		 */
		cells: Array
	});
})();

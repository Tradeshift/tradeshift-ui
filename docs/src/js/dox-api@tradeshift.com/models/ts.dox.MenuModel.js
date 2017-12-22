/**
 * Menu model.
 * @extends {ts.dox.ItemModel}
 */
ts.dox.MenuModel = ts.dox.ItemModel.extend({
	/**
	 * Search query, yes.
	 * @type {string}
	 */
	searchquery: null,

	/**
	 * Current version (of the framework).
	 * @type {string}
	 */
	version: null,

	/**
	 * All versions.
	 * @type {Array<string>}
	 */
	versions: Array,

	/**
	 * Convert search results (list of objects)
	 * into models so that they are EDBML aware.
	 * @type {ts.ui.Collection<ts.ui.Model>}
	 */
	searchresults: ts.ui.Collection.extend({
		$of: ts.ui.Model.extend({
			selected: false
		})
	})
});

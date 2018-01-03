ts.ui.TagListModel = (function() {
	return ts.ui.Model.extend({
		/**
		 * Friendly name.
		 * @type {string}
		 */
		item: 'taglist',

		/**
		 * Buttons.
		 * @type {ts.ui.TagCollection<ts.ui.TagModel>}
		 */
		items: ts.ui.TagCollection,

		/**
		 * Bounce model to HTML.
		 * @return {string}
		 */
		render: function() {
			return ts.ui.tags.edbml(this);
		}
	});
})();
